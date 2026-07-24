-- Enable the pgvector extension to work with embedding vectors
-- (Even if using Qdrant for vectors, we might want to store metadata in Supabase. We don't strictly need pgvector in Supabase if we use Qdrant for vector search, but it's good practice for RAG apps just in case).
create extension if not exists vector;

-- Table for storing document metadata
create table if not exists public.documents (
    id uuid default gen_random_uuid() primary key,
    filename text not null,
    status text not null default 'processing', -- 'processing', 'completed', 'failed'
    chunks_count integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table for storing chat history
create table if not exists public.chat_history (
    id uuid default gen_random_uuid() primary key,
    session_id text not null,
    role text not null, -- 'user' or 'assistant'
    content text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table for storing evaluation results
create table if not exists public.rag_evaluations (
    id uuid default gen_random_uuid() primary key,
    query text not null,
    retrieved_context text,
    generated_answer text,
    golden_answer text,
    precision_k numeric,
    recall_k numeric,
    mrr numeric,
    ndcg numeric,
    faithfulness_score numeric,
    supported_claims integer,
    unsupported_claims integer,
    hallucinations jsonb,
    judge_label text,
    latency_seconds numeric,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Storage bucket for documents
insert into storage.buckets (id, name, public) 
values ('documents', 'documents', true)
on conflict (id) do nothing;
