import os
import glob
from dotenv import load_dotenv

load_dotenv()
import io
import json
import math
import time
import random
import voyageai
from pypdf import PdfReader
from qdrant_client import QdrantClient, models
from groq import Groq
from rank_bm25 import BM25Okapi

# Directories
DOCS_DIR = os.path.join(os.path.dirname(__file__), "docs")
ASSETS_DIR = os.path.join(os.path.dirname(__file__), "assets")
COLLECTION = "covid_intel_docs"

try:
    os.makedirs(DOCS_DIR, exist_ok=True)
    os.makedirs(ASSETS_DIR, exist_ok=True)
except OSError:
    # Vercel Serverless environment has a read-only file system (except /tmp)
    # We ignore this error on startup so the function doesn't crash with FUNCTION_INVOCATION_FAILED.
    pass

# State
SETTINGS = {
    "chunk_size": 45,
    "chunk_overlap": 10,
    "top_k": 5,
    "embed_model": "voyage-3.5",
    "rerank_model": "rerank-2",
    "temperature": 0.0,
    "max_tokens": 1024,
    "gen_model": os.getenv("GROQ_GEN_MODEL", "llama-3.1-8b-instant")
}

ANALYTICS = {
    "total_queries": 0,
    "sum_precision": 0.0,
    "sum_recall": 0.0,
    "sum_mrr": 0.0,
    "sum_ndcg": 0.0,
    "sum_latency": 0.0
}

_next_id = 0
_corpus = []  
_bm25 = None  

SYSTEM_PROMPT = """You are COVIDIntel AI, an intelligent COVID-19 Clinical Assistant.
Your primary role is to answer user queries accurately based ONLY on the provided medical documentation.
1. SOURCE RESTRICTION: Base your answers ONLY on the retrieved context. Do not use outside knowledge.
2. CITATION REQUIREMENT: Use inline citations [1], [2] corresponding to the document chunk numbers.
3. HANDLING MISSING INFORMATION: If the answer is not in the context, clearly state: "I cannot find the answer to this question in the provided project documents."
4. TONE: Professional, objective, and clear medical tone.
5. FORMATTING: Use markdown extensively. Use bullet points for lists, and bold text for emphasis.
"""

voyage = voyageai.Client(api_key=os.getenv("VOYAGE_API_KEY"))
rerank_voyage = voyageai.Client(api_key=os.getenv("VOYAGE_RERANK_API_KEY") or os.getenv("VOYAGE_API_KEY"))
groq = Groq(api_key=os.getenv("GROQ_API_KEY"))
qdrant = QdrantClient(":memory:")

# ---------- State Management ----------
def update_analytics(p, r, m, n, latency):
    ANALYTICS["total_queries"] += 1
    ANALYTICS["sum_precision"] += p
    ANALYTICS["sum_recall"] += r
    ANALYTICS["sum_mrr"] += m
    ANALYTICS["sum_ndcg"] += n
    ANALYTICS["sum_latency"] += latency

def get_analytics():
    t = ANALYTICS["total_queries"]
    if t == 0:
        return {
            "avg_precision": 0, "avg_recall": 0, "avg_mrr": 0, "avg_ndcg": 0, "avg_latency": 0,
            "docs_count": len(set(c["source"] for c in _corpus)),
            "chunks_count": len(_corpus),
            "embed_model": SETTINGS["embed_model"],
            "retriever": "Hybrid Search",
            "reranker": "Cross Encoder Reranker"
        }
    return {
        "avg_precision": ANALYTICS["sum_precision"]/t,
        "avg_recall": ANALYTICS["sum_recall"]/t,
        "avg_mrr": ANALYTICS["sum_mrr"]/t,
        "avg_ndcg": ANALYTICS["sum_ndcg"]/t,
        "avg_latency": ANALYTICS["sum_latency"]/t,
        "docs_count": len(set(c["source"] for c in _corpus)),
        "chunks_count": len(_corpus),
        "embed_model": SETTINGS["embed_model"],
        "retriever": "Hybrid Search",
        "reranker": "Cross Encoder Reranker"
    }

def update_settings(new_settings):
    global SETTINGS
    for k, v in new_settings.items():
        if k in SETTINGS:
            SETTINGS[k] = v
    return SETTINGS

# ---------- Document Management ----------
def chunk_text(text, source, size, overlap):
    words = text.split()
    if not words: return []
    chunks, start, step = [], 0, max(1, size - overlap)
    while start < len(words):
        piece = " ".join(words[start:start + size]).strip()
        if piece:
            chunks.append({"text": piece, "source": source})
        start += step
    return chunks

def extract_text(filename, file_bytes):
    if filename.lower().endswith(".pdf"):
        reader = PdfReader(io.BytesIO(file_bytes))
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    return file_bytes.decode("utf-8", errors="ignore")

def update_bm25():
    global _bm25
    if not _corpus:
        _bm25 = None
        return
    tokenized_corpus = [c["text"].lower().split() for c in _corpus]
    _bm25 = BM25Okapi(tokenized_corpus)

def _embed_and_upsert(chunks):
    if not chunks: return
    texts = [c["text"] for c in chunks]
    resp = voyage.embed(texts, model=SETTINGS["embed_model"], input_type="document")
    dense_vectors = resp.embeddings
    
    if not qdrant.collection_exists(COLLECTION):
        dim = len(dense_vectors[0])
        qdrant.create_collection(
            collection_name=COLLECTION,
            vectors_config={"dense": models.VectorParams(size=dim, distance=models.Distance.COSINE)},
        )

    points = [
        models.PointStruct(
            id=c["id"],
            vector={"dense": dvec},
            payload={"text": c["text"], "source": c["source"], "id": c["id"]},
        )
        for c, dvec in zip(chunks, dense_vectors)
    ]
    qdrant.upsert(collection_name=COLLECTION, points=points)

def build_index():
    global _next_id, _corpus
    _corpus = []
    paths = sorted(glob.glob(os.path.join(DOCS_DIR, "*.*")))
    chunks = []
    size = SETTINGS["chunk_size"]
    overlap = SETTINGS["chunk_overlap"]
    
    for path in paths:
        if not path.endswith((".txt", ".md", ".pdf", ".docx")): continue
        source = os.path.basename(path)
        with open(path, "rb") as f:
            text = extract_text(source, f.read())
        chunks.extend(chunk_text(text, source, size=size, overlap=overlap))
        
    _next_id = 0
    for c in chunks:
        c["id"] = _next_id
        _corpus.append(c)
        _next_id += 1
        
    if qdrant.collection_exists(COLLECTION):
        qdrant.delete_collection(COLLECTION)
        
    _embed_and_upsert(chunks)
    update_bm25()
    return len(chunks)

def add_document(filename, file_bytes):
    global _next_id, _corpus
    size = SETTINGS["chunk_size"]
    overlap = SETTINGS["chunk_overlap"]
    
    path = os.path.join(DOCS_DIR, filename)
    with open(path, "wb") as f:
        f.write(file_bytes)
        
    text = extract_text(filename, file_bytes)
    new_chunks = chunk_text(text, filename, size=size, overlap=overlap)
    for c in new_chunks:
        c["id"] = _next_id
        _corpus.append(c)
        _next_id += 1
        
    _embed_and_upsert(new_chunks)
    update_bm25()
    return len(new_chunks)

def delete_document(filename):
    global _corpus
    path = os.path.join(DOCS_DIR, filename)
    if os.path.exists(path):
        os.remove(path)
    # Easiest way to safely update in-memory state is full rebuild
    build_index()

def get_documents():
    docs = {}
    for c in _corpus:
        s = c["source"]
        docs[s] = docs.get(s, 0) + 1
    return [{"name": k, "chunks": v} for k, v in docs.items()]

# ---------- Evaluation ----------
def evaluate_relevance_llm(query, texts):
    if not texts: return []
    prompt = (
        "Evaluate whether each chunk contains information that helps answer the query. "
        'Output ONLY a JSON object in this exact format: {"relevance": [1, 0, ...]} '
        "where 1 means relevant, 0 means not relevant. The array length must equal the number of chunks."
    )
    chunks_text = "\n\n".join([f"Chunk {i}:\n{t}" for i, t in enumerate(texts)])
    user_msg = f"Query: {query}\n\nChunks:\n{chunks_text}"
    
    try:
        time.sleep(random.uniform(0.1, 0.5))
        resp = groq.chat.completions.create(
            model=SETTINGS["gen_model"],
            temperature=0,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": user_msg},
            ],
        )
        data = json.loads(resp.choices[0].message.content)
        return data.get("relevance", [0]*len(texts))
    except Exception as e:
        print(f"Eval error: {e}")
        return [0]*len(texts)

def evaluate_metrics(query, retrieved_ids, retrieved_texts, k):
    golden_path = os.path.join(ASSETS_DIR, "golden_set.json")
    expected = None
    
    if os.path.exists(golden_path):
        try:
            with open(golden_path, "r") as f:
                golden_set = json.load(f)
            for entry in golden_set:
                if entry.get("query", "").strip().lower() == query.strip().lower():
                    expected = set(entry.get("expected_chunks", []))
                    break
        except: pass

    top_k_ids = retrieved_ids[:k]
    
    if expected is not None:
        relevances = [1 if cid in expected else 0 for cid in top_k_ids]
        total_rel = len(expected)
    else:
        relevances = evaluate_relevance_llm(query, retrieved_texts[:k])
        if len(relevances) < k:
            relevances += [0] * (k - len(relevances))
        else:
            relevances = relevances[:k]
        total_rel = sum(relevances)

    precision = sum(relevances) / k if k > 0 else 0
    recall = sum(relevances) / total_rel if total_rel > 0 else 0
    
    mrr = 0.0
    for i, r in enumerate(relevances):
        if r == 1:
            mrr = 1.0 / (i + 1)
            break
            
    dcg = sum((2**r - 1) / math.log2(i + 2) for i, r in enumerate(relevances))
    
    if expected is not None:
        ideal_rel = sorted([1]*len(expected) + [0]*(k - len(expected)), reverse=True)[:k]
    else:
        ideal_rel = sorted(relevances, reverse=True)[:k]
        
    idcg = sum((2**r - 1) / math.log2(i + 2) for i, r in enumerate(ideal_rel))
    ndcg = dcg / idcg if idcg > 0 else 0
    
    return precision, recall, mrr, ndcg

# ---------- Pipeline ----------
def retrieve_dense(query, k):
    if not qdrant.collection_exists(COLLECTION): return []
    try:
        qvec = voyage.embed([query], model=SETTINGS["embed_model"], input_type="query").embeddings[0]
        hits = qdrant.query_points(
            collection_name=COLLECTION, query=qvec, using="dense",
            limit=k, with_payload=True,
        ).points
        return [{"id": h.payload["id"], "score": h.score, "source": h.payload["source"], "text": h.payload["text"]} for h in hits]
    except Exception as e:
        print(f"Dense retrieve error: {e}")
        return []

def retrieve_sparse(query, k):
    if not _bm25 or not _corpus: return []
    tokenized_query = query.lower().split()
    scores = _bm25.get_scores(tokenized_query)
    top_indices = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)[:k]
    return [{"id": _corpus[i]["id"], "score": scores[i], "source": _corpus[i]["source"], "text": _corpus[i]["text"]} for i in top_indices]

def consultation_pipeline(query, stream_yield):
    start = time.time()
    k = SETTINGS["top_k"]
    
    # 1. Hybrid Search
    dense_hits = retrieve_dense(query, k=k*2)
    sparse_hits = retrieve_sparse(query, k=k*2)
    
    # 2. Reciprocal Rank Fusion
    rrf_scores = {}
    chunk_map = {}
    for rank, h in enumerate(dense_hits):
        cid = h["id"]
        rrf_scores[cid] = rrf_scores.get(cid, 0.0) + 1.0 / (60 + rank + 1)
        chunk_map[cid] = h
    for rank, h in enumerate(sparse_hits):
        cid = h["id"]
        rrf_scores[cid] = rrf_scores.get(cid, 0.0) + 1.0 / (60 + rank + 1)
        chunk_map[cid] = h
        
    sorted_cids = sorted(rrf_scores.keys(), key=lambda cid: rrf_scores[cid], reverse=True)[:k*2]
    hits_hybrid = [chunk_map[cid] for cid in sorted_cids]
    
    # 3. Cross Encoder Reranker
    if hits_hybrid:
        texts = [h["text"] for h in hits_hybrid]
        try:
            rerank_resp = rerank_voyage.rerank(query, texts, model=SETTINGS["rerank_model"], top_k=k)
            hits = [hits_hybrid[r.index] for r in rerank_resp.results]
        except Exception as e:
            print(f"Rerank error: {e}")
            hits = hits_hybrid[:k]
    else:
        hits = []

    # 4. Generate Answer via Streaming
    if not hits:
        yield "I cannot find the answer to this question in the provided project documents. (No documents have been indexed yet)."
        latency = time.time() - start
        update_analytics(0, 0, 0, 0, latency)
        yield json.dumps({"type": "metrics", "metrics": {"precision": 0, "recall": 0, "mrr": 0, "ndcg": 0}, "latency": f"{latency:.2f}s", "chunks": []})
        return

    context = "\n".join(f"[{i + 1}] (source: {h['source']}) {h['text']}" for i, h in enumerate(hits))
    user_msg = f"---\nRETRIEVED CONTEXT:\n{context}\n---\n\nUSER QUESTION: \n{query}\n\nresponse:\n"
    
    time.sleep(random.uniform(0.1, 0.5))
    try:
        stream = groq.chat.completions.create(
            model=SETTINGS["gen_model"],
            temperature=SETTINGS["temperature"],
            max_tokens=SETTINGS["max_tokens"],
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_msg},
            ],
            stream=True
        )
        for chunk in stream:
            if chunk.choices[0].delta.content is not None:
                yield chunk.choices[0].delta.content
    except Exception as e:
        yield f"\n\n**Error generating answer:** {e}"

    # 5. Calculate Metrics
    latency = time.time() - start
    p, r, m, n = evaluate_metrics(query, [h["id"] for h in hits], [h["text"] for h in hits], k)
    update_analytics(p, r, m, n, latency)
    
    # 6. Yield final payload
    payload = {
        "type": "metrics",
        "metrics": {"precision": p, "recall": r, "mrr": m, "ndcg": n},
        "latency": f"{latency:.2f}s",
        "chunks": [{"text": h["text"], "source": h["source"]} for h in hits]
    }
    yield "\n\n__JSON_PAYLOAD__" + json.dumps(payload)

# ---------- Mr. Judge Evaluation ----------
JUDGE_PROMPT = """You are an impartial AI Judge.
Evaluate the Generated Answer using ONLY the Retrieved Context.

Rules:
* Never use your own knowledge.
* Never guess missing facts.
* Ignore writing style.
* Ignore grammar.
* Ignore answer length.
* Ignore formatting.
* Only determine whether the Generated Answer is supported by the Retrieved Context.
* If information is missing from the context, mark it as Unsupported.
* If the answer contains facts not present in the context, treat them as hallucinations.

Perform the following steps:
1. Break the Generated Answer into factual claims.
2. Verify every claim against the Retrieved Context.
3. Count Supported Claims.
4. Count Unsupported Claims.
5. Calculate Faithfulness = Supported Claims / Total Claims * 100

Return ONLY JSON in this exact format:
{
  "judge_label": "Good" | "Hallucinated" | "Irrelevant" | "Refused",
  "faithfulness_score": 95,
  "supported_claims": 19,
  "unsupported_claims": 1,
  "hallucinations": [
    "Unsupported claim 1"
  ],
  "reason": "Short explanation"
}"""

def evaluate_with_judge(query, reference_answer=""):
    k = SETTINGS["top_k"]
    # 1. Retrieve
    dense_hits = retrieve_dense(query, k=k*2)
    sparse_hits = retrieve_sparse(query, k=k*2)
    
    rrf_scores = {}
    chunk_map = {}
    for rank, h in enumerate(dense_hits):
        cid = h["id"]
        rrf_scores[cid] = rrf_scores.get(cid, 0.0) + 1.0 / (60 + rank + 1)
        chunk_map[cid] = h
    for rank, h in enumerate(sparse_hits):
        cid = h["id"]
        rrf_scores[cid] = rrf_scores.get(cid, 0.0) + 1.0 / (60 + rank + 1)
        chunk_map[cid] = h
        
    sorted_cids = sorted(rrf_scores.keys(), key=lambda cid: rrf_scores[cid], reverse=True)[:k*2]
    hits_hybrid = [chunk_map[cid] for cid in sorted_cids]
    
    if hits_hybrid:
        texts = [h["text"] for h in hits_hybrid]
        try:
            rerank_resp = rerank_voyage.rerank(query, texts, model=SETTINGS["rerank_model"], top_k=k)
            hits = [hits_hybrid[r.index] for r in rerank_resp.results]
        except Exception as e:
            print(f"Rerank error: {e}")
            hits = hits_hybrid[:k]
    else:
        hits = []

    context_str = "\n".join(f"[{i + 1}] {h['text']}" for i, h in enumerate(hits))

    if not hits:
        generated_answer = "I cannot find the answer to this question in the provided project documents."
    else:
        user_msg = f"---\nRETRIEVED CONTEXT:\n{context_str}\n---\n\nUSER QUESTION: \n{query}\n\nresponse:\n"
        try:
            resp = groq.chat.completions.create(
                model=SETTINGS["gen_model"],
                temperature=0,
                max_tokens=SETTINGS["max_tokens"],
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_msg},
                ]
            )
            generated_answer = resp.choices[0].message.content
        except Exception as e:
            generated_answer = f"Error generating answer: {e}"

    judge_user_msg = f"Retrieved Context:\n{context_str}\n\nGenerated Answer:\n{generated_answer}"

    try:
        judge_resp = groq.chat.completions.create(
            model=SETTINGS["gen_model"],
            temperature=0,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": JUDGE_PROMPT},
                {"role": "user", "content": judge_user_msg},
            ]
        )
        judge_result = json.loads(judge_resp.choices[0].message.content)
    except Exception as e:
        judge_result = {
            "judge_label": "Refused",
            "faithfulness_score": 0,
            "supported_claims": 0,
            "unsupported_claims": 0,
            "hallucinations": [],
            "reason": f"Evaluation failed: {str(e)}"
        }

    return {
        "query": query,
        "retrieved_context": context_str,
        "generated_answer": generated_answer,
        "golden_answer": reference_answer,
        "judge_evaluation": judge_result
    }
