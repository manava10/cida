# CIDA - Cloud Intelligent Document Assistant

## 🎯 What is CIDA?

**CIDA (Cloud Intelligent Document Assistant)** is an AI-powered document intelligence platform that transforms static documents into interactive, queryable knowledge bases. Unlike traditional document management systems that rely on simple keyword search, CIDA uses **semantic understanding** and **Retrieval Augmented Generation (RAG)** to help you interact with your documents through natural language.

Upload your documents once, and ask questions forever. Get instant answers with citations, comprehensive summaries, and intelligent insights—all from your own documents.

## ✨ Key Features

- **🧠 Semantic Search**: Find information based on meaning, not just keywords
- **💬 AI-Powered Q&A**: Ask questions in natural language and get accurate answers with page citations
- **📝 Document Summarization**: Generate concise summaries of uploaded documents using Google Gemini AI
- **🔒 Secure Authentication**: JWT-based authentication with role-based access control (RBAC)
- **📤 File Upload**: Support for PDFs and text files (up to 100MB per file)
- **⚙️ Intelligent Processing**: Automatic text extraction, chunking, and vector embedding generation
- **🔍 Advanced Search**: Vector similarity-based semantic search using cosine similarity
- **📊 Document Management**: Track processing status, view documents, and manage your knowledge base
- **🔐 Privacy-First**: Self-hostable with full control over your data and infrastructure
- **📈 Audit Logging**: Complete audit trail for compliance and security

## 🌟 Why CIDA?

**The Problem**: Organizations drown in documents. Finding information requires manual searching, reading through pages, and hoping you find the right section. Traditional search finds words, not answers.

**The Solution**: CIDA makes your documents truly intelligent. Instead of searching for keywords and reading through results, simply ask questions and get direct answers with citations—saving hours of research time.

## 🎯 Use Cases

- **Research & Academia**: Upload research papers and ask questions about findings, methodologies, or conclusions
- **Legal & Compliance**: Analyze contracts, find specific clauses, and extract key terms quickly
- **Business Intelligence**: Search through proposals, reports, and documentation for insights
- **Customer Support**: Build a knowledge base from product documentation for instant answers
- **Personal Knowledge Management**: Organize and query your personal document collection

## Overview
- Full-stack MERN application with AI integration for intelligent document processing
- Features: Authentication (JWT), secure file upload, document processing, semantic search, AI-powered summaries and Q&A

## 🛠️ Tech Stack

**Backend:**
- Node.js with Express.js framework
- MongoDB (Mongoose ODM)
- JWT for authentication
- bcrypt for password hashing
- Multer for file uploads
- Google Gemini API for AI capabilities

**Frontend:**
- React with Vite
- TypeScript
- Fetch API for HTTP requests

## 🚀 Quickstart

1. **Create a MongoDB database** (local or MongoDB Atlas). Copy the connection URI.
   - For local MongoDB: `mongodb://localhost:27017/cida`
   - For MongoDB Atlas: Create a cluster and get your connection string (requires network access configuration)

2. **Copy environment templates:**
   ```bash
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   ```

3. **Fill in environment values:**
   - MongoDB URI
   - JWT secret
   - Google Gemini API key

4. **Install dependencies and run development servers:**
   ```bash
   # Server
   cd server
   npm install
   npm run dev
   
   # Client (in a new terminal)
   cd client
   npm install
   npm run dev
   ```

## 📁 Project Structure

```
cida/
├── server/          # Express API backend
│   ├── src/
│   │   ├── models/      # MongoDB models (User, Document, Chunk, AuditEvent)
│   │   ├── routes/      # API routes (auth, documents, search, ai)
│   │   ├── services/    # Business logic (processing, embeddings, AI)
│   │   └── middleware/  # Authentication and authorization
│   └── uploads/     # Document storage
│
└── client/          # React frontend
    └── src/
        ├── components/  # React components
        ├── pages/       # Application pages
        └── utils/       # Utilities and helpers
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Login and receive JWT token

### Documents
- `POST /api/documents/upload` - Upload document (multipart form data)
- `GET /api/documents/:id` - Retrieve document metadata
- `GET /api/documents/:id/stream` - Stream document file
- `DELETE /api/documents/:id` - Delete document

### Search
- `GET /api/search?q=<query>` - Semantic search across documents

### AI Features
- `POST /api/ai/summary` - Generate document summary
- `POST /api/ai/qa` - Ask questions about documents

## 🔒 Security Features

- **JWT Authentication**: Tokens stored in httpOnly cookies
  - ⚠️ **Note**: Development mode uses non-secure cookies for localhost. **Always enable secure cookies in production.**
- **Password Hashing**: bcrypt with salt rounds for secure password storage
- **Role-Based Access Control (RBAC)**: Admin, contributor, and viewer roles
- **Audit Logging**: Track all user actions for compliance
- **File Validation**: Type and size validation for uploaded files

## 📝 Notes

- Current implementation uses a simplified embedding system for development
- For production, integrate with production-ready vector databases (Pinecone, Weaviate, etc.)
- Consider using specialized embedding models (OpenAI, Cohere) for better semantic understanding

## 📚 Additional Documentation

- [Project Description](./PROJECT_DESCRIPTION.md) - Detailed project overview and architecture
- [Why CIDA?](./WHY_CIDA.md) - Value proposition and use cases
- [Document Lifecycle](./DOCUMENT_LIFECYCLE.md) - How documents flow through the system
- [Future Enhancements](./FUTURE_ENHANCEMENTS.md) - Planned features and improvements


