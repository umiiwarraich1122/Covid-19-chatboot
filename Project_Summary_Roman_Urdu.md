# COVIDIntel AI - Project Summary aur Tasks ki Tafseel

Yeh document un tamam tasks aur modules ki tafseel hai jo humne is COVID-19 RAG Chatbot (COVIDIntel AI) project mein perform kiye hain. Is project ka main maqsad ek highly accurate, hallucination-free aur reliable medical chatbot banana tha, aur uski performance ko deeply evaluate karna tha.

Neeche un tamam cheezon ki detail hai jo is project mein use hui hain aur jo tasks humne mil kar complete kiye hain.

---

## 1. Project Ka Overview (COVIDIntel AI)
Yeh project ek **Retrieval-Augmented Generation (RAG)** based AI system hai jo COVID-19 ke medical queries ka jawab deta hai. Kyunki medical domain mein accuracy bohat zaroori hai, isliye humne isme ek mukammal **Evaluation Pipeline** banayi hai jo chatbot ke har answer ko test karti hai taake woh galat information (hallucinations) na de.

---

## 2. Humne Kya Kya Tasks Perform Kiye? (Modules & Features)

Humne project ko different evaluation modules mein divide kiya aur har module ke liye ek behtareen UI/UX design kiya.

### A. RAG Pipeline Evaluation (Retrieval Testing)
- Humne different retrieval strategies ko test kiya (Baseline Dense, Hybrid BM25+Dense, Query Rewrite, aur Cross-Encoder Reranker).
- **Final Decision:** Humne **Hybrid + Reranker (Voyage Cross-Encoder)** ko ship karne ka faisla kiya kyunki isne Precision@5 ko 0.55 se badha kar 0.82 kar diya tha. Is se acronyms (jaise MIS-C) wale queries bilkul theek retrieve hone lag gaye.

### B. Evaluation Data (Golden Test Set)
- Humne 20 realistic medical queries ka ek **Golden Test Set** banaya jo patients aur clinicians ke sawalon ko simulate karta hai.
- Is dataset mein har query ke sath ek "Human Label", "Expected Context", aur "Persona" (jaise Patient ya Caregiver) define kiya gaya hai.
- Iska ek khoobsurat UI Dashboard banaya gaya jo dataset ke statistics dikhata hai.

### C. Diagnose Module (Root Cause Analysis)
- Yeh ek debugging dashboard hai jo batata hai ke agar query fail hui to *kyun* fail hui.
- Isme ek intelligent heuristic engine hai jo maslay ko categorize karta hai:
  - **Retriever Issue** (Jab context sahi fetch na ho)
  - **Prompt / LLM Issue** (Jab LLM answer theek se generate na kare)
  - **Document Issue** (Jab source docs mein answer hi na ho)
  - **False Refusals & Hallucinations**
- Is module mein "Product Recommendation Engine" bhi shamil hai jo automatically batata hai ke pipeline ko kaise fix kiya jaye (e.g., "Increase refusal threshold").

### D. Faithfulness Evaluation (Hallucination Detection)
- Is module ka kaam yeh check karna hai ke LLM apne paas se koi medical baat to nahi bana raha.
- Humne **Claim Decomposition** use ki jisme chatbot ke answer ko chotay chotay factual claims mein break kiya jata hai.
- Phir har claim ko retrieved context ke sath cross-verify kiya jata hai. Agar koi baat context mein na mile to use "Unsupported" (Hallucination) flag kar diya jata hai.
- UI mein ek circular progress bar aur claims ki verification table banayi gayi hai.

### E. Mr. Judge (LLM as a Judge)
- Har answer ko manually check karna mushkil tha, isliye humne **Mr. Judge** banaya jo ek automated "LLM-as-a-Judge" system hai.
- Isme **Groq API** ka use kiya gaya hai taake evaluation blazing fast ho.
- Mr. Judge ek strict prompt follow karta hai aur chatbot ke answer ko human labels ke sath compare karke Match/Mismatch aur Faithfulness score nikalta hai.

---

## 3. Technologies Jo Humne Use Ki Hain (Tech Stack)

Is project ko frontend aur backend dono mein state-of-the-art technologies use karke banaya gaya hai:

**Frontend:**
- **React.js:** UI components aur dashboard banane ke liye.
- **Tailwind CSS:** Styling aur responsive design ke liye.
- **Lucide React:** Modern icons ke liye.
- **Glassmorphism UI:** Ek premium, semi-transparent frosted-glass design aesthetic use kiya gaya hai taake dashboard bohat khoobsurat aur professional lage.

**Backend & AI:**
- **Python & FastAPI:** Backend services aur API endpoints (jaise `/judge`) run karne ke liye.
- **Groq API:** Mr. Judge (LLM evaluations) ki fast processing ke liye.
- **RAG Architecture:** Vector embeddings, BM25, aur Voyage Cross-Encoder Reranker ka use kiya gaya hai.

**Data:**
- **JSON & Markdown:** Data storage, evaluation metrics aur reporting ke liye.

---

## 4. Conclusion (Nateeja)
Humne is project mein na sirf ek RAG chatbot banaya balki ek poori **RAG Debugging aur Evaluation System** tyar ki hai. Yeh dashboards aur modules (Diagnose, Faithfulness, Mr. Judge) ensure karte hain ke system medical information mein 100% accurate, safe aur trustworthy ho. Frontend ko humne next-level aesthetics (glassmorphism) de kar ek premium look di hai.
