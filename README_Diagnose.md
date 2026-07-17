# Diagnose Evaluation

## Overview
The **Diagnose** module implements "Step 4 – Diagnose, Don't Guess" of our RAG Evaluation System. While other modules tell you *if* a query failed, the Diagnose module tells you exactly *why* it failed. It acts as an automated RAG Debugging Dashboard that identifies the root cause of pipeline failures—whether the fault lies with the Retriever, the Prompt, or the Documents themselves.

## Features
* **Debugging Matrix**: An intelligent heuristic engine that evaluates Context Relevance, Answer Relevance, and Faithfulness to isolate root causes.
* **Root Cause Analysis**: Classifies every failed query into specific categories: Retriever Issue, Prompt / LLM Issue, Prompt / Answer Generation Issue, or Document Issue.
* **Guardrail Analysis**: Actively monitors and calculates rates for critical pipeline failures: Hallucinations and False Refusals.
* **False Refusal Detection**: Automatically identifies queries where the context had the answer, but the LLM incorrectly refused to answer ("I don't know").
* **Product Recommendation Engine**: Generates actionable, dynamic advice (e.g., "Increase refusal threshold") based on the balance of Hallucinations vs. False Refusals.
* **Export Options**: One-click exports of the entire diagnostic report to JSON and CSV.

## Workflow

1. **Input**: Ingests the Golden Test Set, Retrieved Context, Generated Answers, Human Labels, and Faithfulness Scores.
2. **Processing (Heuristic Matrix)**: The Diagnosis Engine applies logical rules to synthesize Context Relevance and Answer Relevance.
3. **Evaluation (Root Cause)**: Based on the matrix (e.g., *Context Rel = High + Faithfulness = Low*), it assigns a specific Diagnosis (e.g., *Prompt Issue*).
4. **Output**: Renders the Root Cause Analytics dashboard, alerts the user with a Product Recommendation, and populates the Diagnosis Table.

## User Interface
* **Layout**: A comprehensive, full-screen diagnostic command center accessed via the 🩺 "Diagnose" button.
* **Dashboard**: Features a multi-colored progress bar visualizing the exact percentage split of healthy vs. failing components across the entire pipeline.
* **Tables**: A searchable, filterable table displaying every query alongside its Context Relevance, Faithfulness, Answer Relevance, and resulting Diagnosis Badge.
* **Cards**: Nested detail panels that thoroughly break down the diagnostic reasoning, showing the user query, context, and the recommended action to fix the pipeline.
* **Glassmorphism UI**: Beautiful, premium styling featuring color-coded diagnosis badges (🟢 Healthy, 🟠 Retriever, 🟡 Prompt / LLM, 🔴 Documents, ⚪ False Refusal, 🔵 Hallucination).

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
    DiagnoseModal.jsx  # The core Diagnosis Engine and UI Dashboard
```

## Future Improvements
* LLM-driven deep-dive diagnostics for highly ambiguous queries.
* Integration with telemetry platforms to diagnose live production traffic.
* Multi-model comparison (testing if a different embedding model fixes Retriever Issues).
* Export visual charts to PDF reports.

## Screenshot

*(Add screenshot here)*

## Conclusion
The Diagnose module transforms RAG evaluation from a simple grading system into an actionable engineering tool. By automatically identifying the root cause of failures and generating concrete product recommendations, it drastically reduces debugging time and provides a clear roadmap for improving the system.
