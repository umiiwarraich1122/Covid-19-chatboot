# Evaluation Data

## Overview
The **Evaluation Data** module forms the foundation of our Retrieval-Augmented Generation (RAG) Evaluation Pipeline. It introduces a comprehensive "Golden Test Set" to benchmark and assess the performance of the chatbot. This module acts as the definitive source of truth, ensuring that every retrieval and generation step can be measured against verified human labels and expected context.

## Features
* **Golden Test Set Creation**: Curated datasets specifically designed for medical RAG evaluation.
* **Persona Tracking**: Test queries organized by user persona (e.g., Patient, Clinical, Caregiver) to evaluate tone and accuracy.
* **Ground Truth Linking**: Direct associations between queries and their Ground Truth Documents.
* **Human Labeling**: Manual labels (Good, Hallucinated, Irrelevant, Refused) attached to each record for reliable baseline metrics.
* **Expected Context Validation**: Defines the exact context chunks that the retriever *should* fetch.
* **Golden Answer Reference**: A perfect, manually verified answer against which the LLM's generated answer is compared.

## Workflow

1. **Input**: A curated dataset of user queries is prepared along with their target personas and expected document references.
2. **Processing**: The queries are processed to determine the *Golden Answer* and *Expected Retrieved Context*.
3. **Evaluation**: Each record is manually reviewed and assigned a *Human Label* representing the quality of the response.
4. **Output**: A structured JSON Evaluation Dataset is produced, serving as the benchmark for all subsequent evaluation modules.

## User Interface
* **Layout**: A clean, modular interface integrated seamlessly into the RAG Dashboard sidebar.
* **Dashboard**: Provides high-level insights into dataset size, persona distribution, and human label metrics.
* **Tables**: A comprehensive, searchable, and sortable table displaying all Golden Test Set records.
* **Cards**: Summary cards displaying evaluation groupings and performance metrics.
* **Glassmorphism UI**: Uses a modern frosted-glass aesthetic with soft borders, deep shadows, and subtle background blurring for a premium experience.

## Technologies Used
* React
* Tailwind CSS
* Lucide React
* JSON
* Markdown

## Folder Structure
```text
/src
  /components
    EvaluationModal.jsx  # The main UI component
  /data
    evaluation_data.json # The Golden Test Set source of truth
```

## Future Improvements
* CSV/Excel bulk upload for new Golden Datasets.
* Dynamic dataset versioning.
* Automated extraction of expected context from new documents.
* Multi-language dataset support.

## Screenshot

*(Add screenshot here)*

## Conclusion
The Evaluation Data module is an essential part of the RAG debugging lifecycle. By establishing a rigorous Golden Test Set with Human Labels and Expected Context, it guarantees that the RAG pipeline is evaluated against a reliable and professionally curated baseline.
