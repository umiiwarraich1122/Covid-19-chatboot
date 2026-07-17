# Faithfulness Evaluation

## Overview
The **Faithfulness Evaluation** module is a core component of the RAG Evaluation Pipeline designed to measure how strictly the generated answer adheres to the retrieved context. It exists to detect, quantify, and prevent hallucinations by ensuring the LLM does not invent facts or pull in external knowledge outside of the provided medical documentation. 

## Features
* **Claim Decomposition**: Automatically breaks down complex generated answers into individual factual claims.
* **Evidence Verification**: Cross-references every single claim against the retrieved context to find exact supporting evidence.
* **Hallucination Detection**: Flags unsupported claims explicitly to alert developers of potential model hallucinations.
* **Faithfulness Score Generation**: Calculates an exact percentage score representing the reliability of the generated text.
* **Interactive Visualizations**: Circular progress indicators and dynamic color-coding to highlight passing vs. failing scores.

## Workflow

1. **Input**: The module receives the *Generated Answer* and the *Retrieved Context* from the RAG pipeline.
2. **Processing (Claim Decomposition)**: The generated answer is split into distinct, testable factual claims.
3. **Evaluation (Verification)**: Each claim is checked against the context. Claims are marked as *Supported* (with matching evidence) or *Unsupported* (hallucination).
4. **Output**: The system calculates the **Faithfulness Score** (Supported Claims / Total Claims) and renders the breakdown in the UI.

## User Interface
* **Layout**: A dedicated modal interface accessible from the Evaluation sidebar.
* **Dashboard**: Features a circular progress indicator displaying the Faithfulness Score (Green for 90-100%, Orange for 70-89%, Red for below 70%).
* **Tables**: A detailed claim verification table displaying the claim text, a ✅ / ❌ support badge, and the specific matching evidence.
* **Cards**: Summary cards highlighting Total Claims, Supported Claims, and Unsupported Claims.
* **Glassmorphism UI**: Beautiful semi-transparent backgrounds, modern typography, and smooth transitions matching the overall application theme.

## Technologies Used
* React
* Tailwind CSS
* JSON
* Python (Data Generation)
* Markdown

## Folder Structure
```text
/src
  /components
    FaithfulnessModal.jsx  # The main UI component
  /data
    faithfulness_data.json # The pre-processed claims dataset
```

## Future Improvements
* Real-time LLM-driven claim decomposition in the browser.
* Multi-model comparison (testing which LLM generates the most faithful claims).
* Export Faithfulness Reports to PDF.
* Interactive highlighting connecting the claim directly to the source text inside the document viewer.

## Screenshot

*(Add screenshot here)*

## Conclusion
The Faithfulness Evaluation module provides critical transparency into the LLM's reasoning process. By breaking down answers into verifiable claims, it ensures that your RAG application remains trustworthy, safe, and heavily grounded in the provided context.
