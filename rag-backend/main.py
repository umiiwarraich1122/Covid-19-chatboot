import asyncio
from fastapi import FastAPI, UploadFile, File, Form, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import rag
import graphrag
import os

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

class JudgeRequest(BaseModel):
    query: str
    reference_answer: str = ""

@app.on_event("startup")
async def startup_event():
    # Build index on startup
    rag.build_index()

@app.post("/chat")
async def chat(req: ChatRequest):
    # We yield strings. StreamingResponse expects an async generator or a generator.
    # Since rag.consultation_pipeline is a synchronous generator that blocks (it uses voyage.embed, qdrant, groq),
    # we should ideally wrap it so it doesn't block the event loop, but for streaming FastAPI can run sync generators in a threadpool natively!
    return StreamingResponse(rag.consultation_pipeline(req.message, stream_yield=True), media_type="text/event-stream")

@app.post("/documents")
async def upload_document(file: UploadFile = File(...)):
    contents = await file.read()
    chunks_added = await asyncio.to_thread(rag.add_document, file.filename, contents)
    return {"message": f"Successfully added {file.filename} ({chunks_added} chunks)."}

@app.get("/documents")
async def get_documents():
    return {"documents": rag.get_documents()}

@app.delete("/documents/{filename}")
async def delete_document(filename: str):
    rag.delete_document(filename)
    return {"message": f"Deleted {filename}."}

@app.get("/analytics")
async def get_analytics():
    return rag.get_analytics()

@app.get("/evaluations")
async def get_evaluations():
    return {"evaluations": rag.get_evaluations()}

@app.get("/settings")
async def get_settings():
    return rag.SETTINGS

class SettingsUpdate(BaseModel):
    chunk_size: int = None
    chunk_overlap: int = None
    top_k: int = None
    temperature: float = None
    max_tokens: int = None

@app.post("/settings")
async def update_settings(settings: dict):
    updated = rag.update_settings(settings)
    # If chunk settings changed, rebuild index
    if "chunk_size" in settings or "chunk_overlap" in settings:
        rag.build_index()
    return updated

@app.post("/judge")
async def evaluate_judge(req: JudgeRequest):
    return rag.evaluate_with_judge(req.query, req.reference_answer)

# ---------- GraphRAG Endpoints ----------

class ExtractRequest(BaseModel):
    documents: list[str]

@app.get("/graphrag/status")
async def graphrag_status():
    return {
        "triples_count": len(graphrag.STATE["triples"]),
        "nodes_count": len(graphrag.STATE["graph_data"]["nodes"]),
        "edges_count": len(graphrag.STATE["graph_data"]["links"]),
    }

@app.post("/graphrag/extract")
def graphrag_extract(req: ExtractRequest):
    count = graphrag.extract_triples_for_documents(req.documents)
    return {"message": f"Extracted {count} triples", "triples": graphrag.STATE["triples"]}

@app.post("/graphrag/reset")
def graphrag_reset():
    graphrag.reset_state()
    return {"message": "GraphRAG state reset"}

@app.post("/graphrag/resolve")
def graphrag_resolve():
    mappings = graphrag.resolve_entities()
    return {"message": "Entities resolved", "mappings": mappings}

@app.post("/graphrag/build")
def graphrag_build():
    stats = graphrag.build_graph()
    return stats

class TraverseRequest(BaseModel):
    query: str

@app.post("/graphrag/traverse")
def graphrag_traverse(req: TraverseRequest):
    subgraph = graphrag.traverse_graph(req.query)
    return subgraph

class AnswerRequest(BaseModel):
    query: str
    path_text: str

@app.post("/graphrag/answer")
def graphrag_answer(req: AnswerRequest):
    answer = graphrag.generate_graphrag_answer(req.query, req.path_text)
    return {"answer": answer}

@app.post("/graphrag/compare")
def graphrag_compare(req: TraverseRequest):
    # Vector RAG
    vector_hits = rag.retrieve_dense(req.query, k=5)
    vector_context = "\\n".join([h["text"] for h in vector_hits])
    vector_prompt = f"---\\nRETRIEVED CONTEXT:\\n{vector_context}\\n---\\n\\nUSER QUESTION: \\n{req.query}"
    try:
        vr = graphrag.groq.chat.completions.create(
            model=rag.SETTINGS["gen_model"],
            temperature=0,
            messages=[{"role": "system", "content": rag.SYSTEM_PROMPT}, {"role": "user", "content": vector_prompt}]
        )
        vector_answer = vr.choices[0].message.content
    except Exception as e:
        vector_answer = str(e)
        
    # GraphRAG
    subgraph = graphrag.traverse_graph(req.query)
    graph_answer = graphrag.generate_graphrag_answer(req.query, subgraph["path_text"])
    
    return {
        "vector_chunks": vector_hits,
        "vector_answer": vector_answer,
        "graph_subgraph": subgraph,
        "graph_answer": graph_answer
    }

@app.get("/graphrag/export")
async def graphrag_export():
    return graphrag.export_data()

# ---------- Global Search & Router Endpoints ----------

@app.post("/global/louvain")
def global_louvain():
    return graphrag.detect_communities()

@app.get("/global/communities")
def get_communities():
    return graphrag.STATE.get("communities", [])

@app.post("/global/communities/{c_id}/name")
def update_community_name(c_id: int, payload: dict):
    success = graphrag.update_community_name(c_id, payload.get("name"))
    return {"success": success}

@app.post("/global/reports")
def global_reports():
    return graphrag.generate_community_reports()

@app.get("/global/reports")
def get_global_reports():
    return graphrag.STATE.get("reports", [])

class GlobalSearchRequest(BaseModel):
    query: str

@app.post("/global/search")
def run_global_search(req: GlobalSearchRequest):
    return graphrag.global_search(req.query)

class RouteRequest(BaseModel):
    query: str

@app.post("/global/route")
def route_query_endpoint(req: RouteRequest):
    return graphrag.route_query(req.query)

class TestRouterRequest(BaseModel):
    test_cases: list[dict]

@app.post("/global/test-router")
def run_test_router(req: TestRouterRequest):
    return graphrag.test_router(req.test_cases)

@app.get("/global/analytics")
def get_global_analytics():
    return graphrag.get_analytics()