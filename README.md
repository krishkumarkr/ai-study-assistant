# AI Study Assistant

![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-Frontend-61DAFB?logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20Vector%20Search-47A248?logo=mongodb&logoColor=white)
![OpenRouter](https://img.shields.io/badge/OpenRouter-AI%20API-6E56CF?logo=openai&logoColor=white)
![Cloudflare R2](https://img.shields.io/badge/Cloudflare-R2%20Storage-F38020?logo=cloudflare&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?logo=docker&logoColor=white)

Transform your PDFs into active learning tools. Upload your notes and this AI-powered, RAG-based platform turns them into instant flashcards, quizzes, and summaries — with an integrated chat interface grounded in your own documents.

**Live:** [ailearn.krishkr.com](https://ailearn.krishkr.com)

---

## Overview

**AI Study Assistant** is a full-stack MERN application that converts static PDFs into interactive, active-recall learning tools using Retrieval-Augmented Generation (RAG). Documents are chunked with overlapping windows and embedded, then semantically matched via cosine similarity using MongoDB Atlas Vector Search, so generated flashcards, quizzes, and chat answers stay grounded in the actual uploaded content rather than the model's general knowledge.

The backend handles document metadata, encrypted chat histories, and file storage via Cloudflare R2, behind a custom Tailwind glassmorphism UI on the frontend. The whole stack is deployed with Docker and Nginx on an Oracle Cloud VM.

---

## Features

- **PDF Upload & Chunking**: Uploaded documents are split into overlapping text chunks to improve retrieval accuracy.
- **RAG-Based Generation**: Flashcards, quizzes, and summaries are generated via the OpenRouter AI API, grounded in the user's own uploaded content.
- **Semantic Search**: Cosine-similarity vector embeddings via MongoDB Atlas Vector Search match query chunks against document embeddings for precise retrieval.
- **Document-Grounded Chat**: An integrated chat interface answers questions using the retrieved, relevant chunks of the uploaded material.
- **Encrypted Chat History**: Chat histories are stored encrypted rather than in plaintext.
- **Cloud File Storage**: Documents are stored in Cloudflare R2 (S3-compatible object storage) rather than on the server disk.
- **User Authentication**: Full sign-up/login flow so users can save and revisit their own study material.
- **Custom UI**: Tailwind CSS with a custom glassmorphism design.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Stack | MERN (MongoDB, Express, React, Node.js) |
| Frontend Tooling | Vite |
| AI / LLM | OpenRouter AI API |
| Retrieval (RAG) | Text-chunking with overlapping windows + MongoDB Atlas Vector Search (cosine similarity) |
| File Storage | Cloudflare R2 (accessed via the S3-compatible AWS SDK client) |
| UI | Tailwind CSS, custom glassmorphism design |
| Security | JWT auth, encrypted chat histories, rate-limited API |
| Deployment | Docker, Nginx, Oracle Cloud VM |
| CI/CD | GitHub Actions |

> **Note on storage:** the backend uses `@aws-sdk/client-s3` in `package.json` — this is expected, since Cloudflare R2 exposes an S3-compatible API and is commonly accessed using the standard AWS S3 SDK. The actual storage provider is Cloudflare R2, not AWS S3.

---

## Architecture

The app runs as two Docker services defined in `docker-compose.yml`:

- **`backend`**: Node/Express API, built from `./backend`, listens internally on port `8000`. Handles document metadata, RAG pipeline (chunking, embeddings, vector search), encrypted chat history, and auth. Environment variables (DB connection, API keys, R2 credentials) are supplied via a `.env` file inside `backend/`. Uploaded files are persisted in a mounted volume so they survive container restarts.
- **`frontend`**: Built from `./frontend/ai-learning-assistant`, serves the app over ports `80` and `443` via Nginx with mounted Let's Encrypt certificates for HTTPS. Depends on the backend service being available.

---

## Project Structure

```
ai-study-assistant/
├── .github/workflows/        # GitHub Actions CI/CD pipeline
├── backend/                  # Node/Express API, MongoDB models, RAG + OpenRouter integration
├── frontend/
│   └── ai-learning-assistant/  # React frontend (Tailwind CSS, glassmorphism UI)
├── docker-compose.yml         # Orchestrates backend + frontend containers
├── package.json                # Shared root-level dependencies
└── README.md
```

---

## Running the Project

### Prerequisites
- Docker and Docker Compose installed
- An OpenRouter AI API key
- A MongoDB Atlas connection string (with Vector Search enabled)
- Cloudflare R2 credentials (Account ID, Access Key, Secret Key, Bucket name)

### Setup

1. **Clone the repository**

```
git clone https://github.com/krishkumarkr/ai-study-assistant.git
cd ai-study-assistant
```

2. **Configure environment variables**

Create a `.env` file inside `backend/` with values such as:

```
MONGO_URI=your-mongodb-atlas-connection-string
OPENROUTER_API_KEY=your-openrouter-api-key
JWT_SECRET=your-jwt-secret
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key
R2_BUCKET_NAME=your-r2-bucket-name
```

3. **Build and run with Docker Compose**

```
docker-compose up --build
```

4. **Access the app**

- **Production (Docker Compose)**: the frontend is served via Nginx on `http://localhost` (ports 80/443), with the backend API running internally on port `8000`.
- **Local development**: running the frontend directly with `npm run dev` (Vite) serves it on `http://localhost:5173`, while the backend API runs on `http://localhost:8000`.

---

## Potential Improvements

- Add automated tests for the RAG pipeline and API endpoints.
- Support additional file formats beyond PDF (e.g. DOCX, PPTX).
- Add caching for repeated AI generation requests to reduce API costs.
- Improve chunk-overlap tuning for longer, more complex documents.
