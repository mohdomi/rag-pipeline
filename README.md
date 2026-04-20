# RAG Pipeline

A Retrieval-Augmented Generation system built with Node.js and TypeScript.

## How it works
1. Documents are chunked and embedded using `@xenova/transformers` (local embeddings) as well as `gemini-embedding-001` (Google's embeddings)
2. Embeddings stored in PostgreSQL via `pgvector`
3. On query, cosine similarity search retrieves relevant chunks
4. Retrieved context passed to Gemini 1.5 Flash for answer generation

## Stack
- TypeScript + ES Modules
- Node.js / Express
- PostgreSQL + pgvector
- @xenova/transformers
- Gemini 1.5 Flash API

## Setup
```bash
git clone https://github.com/mohdomi/rag-pipeline
cd rag-pipeline/server
npm install
cp .env.example .env  # add your Gemini API key
node index.js
```

## Environment Variables
GEMINI_API_KEY=your_gemini_api_keys
DATABASE_URL=your_postgres_url
