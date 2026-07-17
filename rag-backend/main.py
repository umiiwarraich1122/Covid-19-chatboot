import asyncio
from fastapi import FastAPI, UploadFile, File, Form, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import rag
import os

app = FastAPI()

app.mount("/assets", StaticFiles(directory="../covid-intel-frontend/dist/assets"), name="assets")

@app.get("/")
async def serve_frontend():
    return FileResponse("../covid-intel-frontend/dist/index.html")


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
    chunks_added = rag.add_document(file.filename, contents)
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