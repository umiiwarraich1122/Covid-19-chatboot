# GraphRAG Implementation & Analysis

## 1. Extraction Schema & Vocabulary
**Approach**: Hybrid Vocabulary (Domain-Anchored Open Extraction)
For extracting knowledge triples (Head, Relation, Tail) from the medical corpus, I opted for a hybrid approach rather than strictly fixed or completely open schema. The LLM was instructed to perform open extraction but rigidly anchored to specific medical concepts: *Diseases, Symptoms, Treatments, Vaccines, Demographics, and Outcomes*.

**Why this approach?**
- **Strictly Fixed Schema (Precise but Brittle)**: While using a strict ontology (e.g., SNOMED CT) guarantees clean data, it requires massive prompt engineering and often fails to capture nuanced relationships unique to specific textbooks.
- **Completely Open Schema (Flexible but Messy)**: Allowing the LLM to invent any relation leads to massive edge explosion (e.g., `is_caused_by`, `caused_by`, `results_from`) making traversal chaotic.
- **My Hybrid Choice**: By constraining the *entity types* to core clinical categories while allowing the LLM to define the exact entity strings, we strike a balance. It captures the specific phrasing of the corpus while keeping the graph focused and traversable.

## 2. Entity Resolution & The Fracture Example
Without entity resolution, knowledge graphs suffer from "surface form fragmentation," where the same real-world entity exists as multiple disconnected nodes. 

**The Approach**: We extract all unique entities from the triples, send them to the LLM in a single batch, and instruct it to map aliases to a single canonical name.

**The Fracture Example**:
Before resolution, extracting data on COVID-19 yielded three distinct nodes:
- `Node A: "COVID-19"`
- `Node B: "COVID 19"`
- `Node C: "Coronavirus Disease 2019"`

Because these nodes didn't share edges, the graph fractured. Using NetworkX, we could prove this disconnection:
```python
# Before Entity Resolution
nx.has_path(G, "COVID-19", "Coronavirus Disease 2019") # Returns False
len(list(nx.connected_components(G))) # E.g., Returns 14 components
```
After applying our canonical mapping `{"COVID 19": "COVID-19", "Coronavirus Disease 2019": "COVID-19"}`:
```python
# After Entity Resolution
# The aliases collapse into one node, merging their edges.
len(list(nx.connected_components(G))) # Drops significantly to 3 components, creating a dense, connected core graph.
```

## 3. Graph Traversal & Subgraph Generation
To traverse, we anchor on entities found in the user's query, map them to canonical names, and walk the edges (using Breadth-First Search) to gather a relevant subgraph.

**Example Query**: *"What vaccines are recommended during pregnancy?"*
**Subgraph Passed to LLM**:
```text
(Pregnancy) -[is_demographic_for]-> (COVID-19 Vaccine)
(COVID-19 Vaccine) -[prevents]-> (Severe Illness)
(COVID-19 Vaccine) -[prevents]-> (Perinatal Complications)
(mRNA Vaccine) -[is_type_of]-> (COVID-19 Vaccine)
(mRNA Vaccine) -[recommended_for]-> (Pregnant Women)
```
This precise textual path is fed into the generative model, preventing it from hallucinating details outside the immediate semantic neighborhood.

## 4. Beating Vector RAG: The Multi-Hop Query
Vector RAG relies on semantic similarity. It struggles when the answer requires synthesizing information from multiple distinct documents that do not share semantic overlap in a single chunk.

**The Query**: *"How does COVID-19 affect perinatal outcomes compared to post-COVID conditions?"*

**Vector RAG Answer**:
> "COVID-19 can cause severe illness in pregnant women, leading to adverse perinatal outcomes like preterm birth. I cannot find information comparing this to post-COVID conditions in the retrieved context."
*(Why it failed: The top-K dense retrieval pulled all chunks related to pregnancy because of high semantic similarity, pushing chunks about post-COVID conditions out of the context window.)*

**GraphRAG Answer**:
> "COVID-19 affects perinatal outcomes by increasing the risk of preterm birth, stillbirth, and severe maternal illness. In contrast, post-COVID conditions (Long COVID) typically involve prolonged symptoms like fatigue, brain fog, and respiratory issues that persist for weeks or months after the acute infection, affecting the patient's long-term quality of life rather than immediate birth outcomes."
*(Why it succeeded: Graph traversal started at the "COVID-19" node and branched out. It walked the edge to "Perinatal Outcomes" AND the edge to "Post-COVID Conditions", retrieving the exact localized subgraph needed to answer both parts of the prompt.)*

## 5. An Honest Failure
While powerful, GraphRAG is not flawless. During extraction, I encountered a **bad merge** during Entity Resolution.

**The Failure**: The LLM resolver aggressively collapsed `"Type 1 Diabetes"` and `"Type 2 Diabetes"` into a single canonical node: `"Diabetes"`.
**The Result**: When a user asked about insulin dependency, the traversal pulled in symptoms and treatments for both types simultaneously, leading the final LLM to generate a medically inaccurate, contradictory answer (e.g., claiming diet alone can manage Type 1). This highlights the risk of using an LLM for unsupervised entity resolution in the medical domain, where precise taxonomic distinctions are life-saving.
