# Mr. Judge (LLM as Judge)

## Overview
The **Mr. Judge** module introduces an automated "LLM-as-a-Judge" system to the RAG Evaluation Pipeline. Because manually evaluating hundreds of RAG responses is time-consuming and unscalable, Mr. Judge automates this process by using a highly-prompted LLM to impartially evaluate the quality of the generated answers. It compares its own automated judgments against Human Labels to measure alignment and accuracy.

## Features
* **LLM as Judge**: Utilizes a strict, impartial prompt to evaluate the chatbot's answers based *only* on retrieved context.
* **Groq Integration**: Leverages the blazing-fast Groq API for rapid, scalable batch evaluations.
* **Structured JSON Output**: Enforces strict JSON schemas to reliably parse Judge Labels, Faithfulness Scores, and Hallucination arrays.
* **Human vs Judge Validation**: Automatically compares the automated Judge Label against the curated Human Label (Match/Mismatch).
* **Judge Agreement Metric**: Calculates the percentage of alignment between the automated judge and human reviewers.
* **Detailed Reasoning**: Captures the Judge's explanation for *why* it assigned a specific label.

## Workflow

1. **Input**: A query from the Golden Test Set, along with the *Retrieved Context* and *Generated Answer*.
2. **Processing (Judge Prompting)**: The data is sent to the Groq LLM using a specialized Judge Prompt instructing it to ignore grammar/style and focus purely on factual support.
3. **Evaluation**: The LLM returns a structured JSON evaluation including its Judge Label, Faithfulness Score, and identified hallucinations.
4. **Output**: The frontend compares the Judge Label to the Human Label, calculates Judge Agreement, and populates the evaluation matrix.

## User Interface
* **Layout**: A wide, expansive dashboard accessed via the ⚖️ "Mr. Judge" button.
* **Dashboard**: Top-level statistics including a dynamic circular progress indicator for Judge Agreement, and counters for Matches, Mismatches, and Avg Faithfulness.
* **Tables**: A highly searchable and filterable table displaying Human vs. Judge labels side-by-side with color-coded Match/Mismatch badges.
* **Cards**: An interactive "View Details" nested modal panel that displays the exact prompt outputs, Judge reasoning, and highlighted hallucinations.
* **Glassmorphism UI**: Consistent use of frosted glass elements, modern badging (🟢 Good, 🟡 Irrelevant, 🔴 Hallucinated, ⚪ Refused), and responsive design.

## Technologies Used
* React
* FastAPI (Backend Service)
* Python
* Groq API
* Tailwind CSS
* Lucide React
* JSON

## Folder Structure
```text
/src
  /components
    MrJudgeModal.jsx       # The frontend Evaluation Dashboard
/rag-backend
  main.py                  # Hosts the POST /judge endpoint
  rag.py                   # Contains the LLM Judge Prompt & execution logic
```

## Future Improvements
* Multi-model Judge comparison (e.g., using GPT-4 or Gemini to judge Groq outputs).
* Batch processing with asynchronous webhooks for massive datasets.
* Export detailed Judge Reports to PDF.
* Better analytics on Judge failure cases (when the Judge is wrong).

## Screenshot

*(Add screenshot here)*

## Conclusion
The Mr. Judge module brings scalable, automated quality assurance to the RAG pipeline. By acting as an impartial evaluator and validating its accuracy against Human Labels, it allows developers to rapidly iterate on prompts and retrieval strategies without sacrificing evaluation quality.
