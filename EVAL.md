# RAG Pipeline Evaluation (COVIDIntel AI)

## 1. The Golden Set
The golden set consists of 20 realistic medical queries, simulating how a clinician or patient would actually ask questions about COVID-19 (e.g., "What should I do if a pregnant patient tests positive?", not "List the pregnancy guidelines").

**Labelling Scheme:**
I used a binary relevance labeling scheme mapped to specific document filenames and broad conceptual chunks rather than exact character offsets. This makes the labels robust against chunk size or overlap changes. If a chunk contains the direct answer or crucial context, it is labeled `1`, otherwise `0`.

**Unanswerable Queries:**
Included 2 queries deliberately missing from the corpus: 
1. "What is the efficacy of the new 2026 mRNA vaccine variant?"
2. "How do COVID-19 rates compare to H5N1 avian flu this season?"
These test the system's ability to abstain rather than hallucinate.

*(The golden set is stored locally in `assets/golden_set.json`)*

## 2. Full Results Table

| Configuration | Precision@5 | Recall@5 | MRR | nDCG@5 | Latency (s) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Baseline (Dense Only)** | 0.42 | 0.58 | 0.61 | 0.54 | 0.85 |
| **2. Hybrid (BM25 + Dense + RRF)** | 0.55 | 0.76 | 0.79 | 0.71 | 0.92 |
| **3. Hybrid + Query Rewrite** | 0.51 | 0.78 | 0.72 | 0.68 | 2.15 |
| **4. Hybrid + Reranker (Cross-Encoder)** | **0.82** | **0.95** | **0.91** | **0.89** | 1.85 |

## 3. Baseline Failure Diagnosis

The three worst queries under the Dense Retriever Baseline:

1. **Query:** "mis-c symptoms in toddlers"
   * **Failure:** Returned generic documents about adult COVID symptoms and Kawasaki disease. 
   * **Diagnosis:** "MIS-C" is an exact-match acronym. Dense embeddings smoothed over the specific acronym and retrieved conceptually similar but factually incorrect adult symptom documents. 

2. **Query:** "how long should I isolate after my fever breaks?"
   * **Failure:** Returned documents defining what a fever is and historical quarantine mandates from 2020.
   * **Diagnosis:** The dense retriever matched on "isolate" and "fever" heavily, pulling outdated guidelines. The lack of precise keyword matching (BM25) caused it to miss the specific CDC isolation timeline chunk.

3. **Query:** "is Paxlovid safe with statins"
   * **Failure:** Failed to retrieve the contraindications table.
   * **Diagnosis:** The chunk containing the contraindication table was highly dense with medical jargon. The dense embedding of the short user query didn't align well in the vector space with the highly technical tabular text.

## 4. Shipping Decision

**What I am shipping:** Configuration #4 (`Hybrid + Reranker`).
**Reasoning:** 
* **The Wins:** Moving from Dense-only to Hybrid immediately solved the exact-match acronym problems (like MIS-C). However, the real game-changer was the Voyage Cross-Encoder Reranker. It boosted Precision@5 from 0.55 to 0.82. In a clinical context, precision is paramount—we cannot afford to feed the LLM irrelevant medical chunks.
* **What I dropped:** Query Rewriting (Config #3).
* **Why:** Query rewriting added over 1.2 seconds of latency per query (due to the extra LLM call) and actually *decreased* Precision and MRR. The LLM tended to over-expand the queries, adding generic medical terms that polluted the retrieval pool and confused the Hybrid search. It wasn't worth the latency or the cost.

## 5. Limitation of Evaluation

**Binary Relevance is Flawed for Medical Contexts.**
My evaluation assumes a chunk is either entirely relevant (1) or irrelevant (0). However, in reality, a chunk might contain *part* of an answer (e.g., the dosage for Paxlovid, but not the side effects), or it might be tangentially helpful. Binary nDCG doesn't capture the nuance of "highly relevant" vs "marginally relevant," which is critical when evaluating a Clinical RAG system.
