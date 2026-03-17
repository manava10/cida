MERN Intelligent Document Assistant (MVP)

Overview
- Backend-first vertical slice for a cloud document assistant using MERN.
- Features: Auth (JWT), file upload, processing stubs, search stubs, summaries/Q&A stubs.

Stack
- Backend: Node.js, Express, MongoDB (Mongoose), JWT, bcrypt, Multer
- Frontend: React (Vite), TypeScript (client), fetch API

Resume Summary (Short)
- Built a full-stack MERN “Cloud Intelligent Document Assistant” enabling secure document upload, processing, and AI-driven summaries/Q&A.
- Implemented an end-to-end pipeline for PDF text extraction, chunking, vector embeddings, semantic search, and Gemini-powered responses.
- Delivered secure backend services with JWT auth, bcrypt hashing, RBAC (admin/contributor/viewer), rate limiting, audit logging, and file validation.
- Built a React UI for authentication, document management, PDF preview, and chat-style Q&A integrated with REST APIs.
- Deployed client and server on Render with environment-based configuration (MongoDB, JWT secret, Gemini API key).

Quickstart
1) Create a MongoDB database (local or Atlas). Copy the URI.
2) Copy env templates:
   - server: cp server/.env.example server/.env
   - client: cp client/.env.example client/.env
3) Fill in values (Mongo URI, JWT secret, Gemini API key).
4) Install deps in both apps and run dev:
   - server: npm install && npm run dev
   - client: npm install && npm run dev

Structure
- server/: Express API, models, routes, services
- client/: React UI with auth, upload, search (skeleton)

MVP Endpoints (server)
- POST /api/auth/signup, /api/auth/login
- POST /api/documents/upload (multipart)
- GET /api/documents/:id
- GET /api/search?q=...
- POST /api/ai/summary, /api/ai/qa (stubs)

Security
- JWT in httpOnly cookie (development uses non-secure cookie).
- Password hashing with bcrypt. Basic RBAC middleware (admin/contributor/viewer).

Notes
- Processing, embeddings, semantic search are stubbed. Swap in real services later.

