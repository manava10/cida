# Document Lifecycle and Service Architecture
## CIDA - Cloud Intelligent Document Assistant

---

## Table of Contents
1. [Overview](#overview)
2. [Service Files Architecture](#service-files-architecture)
3. [Document Storage Architecture](#document-storage-architecture)
4. [Complete Document Lifecycle](#complete-document-lifecycle)
5. [Data Flow Diagrams](#data-flow-diagrams)

---

## Overview

This document explains the architecture of the CIDA system, focusing on:
- How service files process documents
- Where documents are stored (filesystem + database)
- The complete lifecycle of a document from upload to deletion

---

## Service Files Architecture

### 1. **textExtractor.js** - Text Extraction Service
**Purpose**: Extracts raw text from various file formats

**Key Functions**:
- `extractTextFromFile(filePath, mimeType)` - Main extraction function

**How it works**:
```javascript
// For PDF files
- Reads PDF file buffer
- Uses pdf-parse library to extract all text
- Returns plain text string

// For TXT files
- Directly reads file as UTF-8 text

// For other formats
- Attempts UTF-8 read as fallback
```

**Supported Formats**:
- PDF (using `pdf-parse`)
- Plain text files
- Word documents (future)
- Images (future: OCR)

**Output**: Plain text string containing all extracted text

---

### 2. **chunker.js** - Text Chunking Service
**Purpose**: Splits long documents into smaller, manageable chunks for processing

**Key Functions**:
- `chunkText(text, chunkSize = 1200, overlap = 150)`

**How it works**:
```javascript
// Default parameters:
- chunkSize: 1200 characters per chunk
- overlap: 150 characters between chunks (prevents context loss)

// Algorithm:
1. Start from beginning of text
2. Create chunk of chunkSize characters
3. Move forward by (chunkSize - overlap) characters
4. Repeat until end of text
5. Return array of text chunks
```

**Why chunking?**:
- LLMs have token limits
- Enables semantic search (find relevant chunks)
- Allows parallel processing
- Better for RAG (Retrieval Augmented Generation)

**Example**:
```
Input: "This is a very long document..." (5000 chars)
Output: [
  "This is a very long document...",     // Chunk 1 (chars 0-1200)
  "...document continues here...",      // Chunk 2 (chars 1050-2250, 150 overlap)
  "...and more text...",                 // Chunk 3 (chars 2100-3300)
  // ... etc
]
```

---

### 3. **embeddings.js** - Vector Embedding Service
**Purpose**: Converts text chunks into numerical vectors for semantic search

**Key Functions**:
- `generateEmbedding(text, dims = 64)`

**How it works**:
```javascript
// Current Implementation (Placeholder):
1. Creates 64-dimensional vector (all zeros)
2. For each character in text:
   - Calculate character code
   - Map to vector index (charCode % 64)
   - Increment that position
3. Normalize vector (divide by magnitude)
4. Return normalized vector

// Future: Replace with real embedding model
// (OpenAI, Cohere, or local transformer model)
```

**Why embeddings?**:
- Enables semantic search (find similar meaning, not just keywords)
- Used for RAG: find relevant chunks for Q&A
- Vector similarity = content similarity

**Vector Structure**:
```
Input: "Machine learning is..."
Output: [0.12, 0.45, 0.23, ..., 0.67]  // 64 numbers
```

---

### 4. **processor.js** - Document Processing Orchestrator
**Purpose**: Main service that coordinates the entire document processing pipeline

**Key Functions**:
- `processDocument(documentId)` - Main processing function

**Processing Pipeline**:
```javascript
1. LOAD DOCUMENT
   - Find document in MongoDB by ID
   - Set status to 'processing'

2. EXTRACT TEXT
   - Call extractTextFromFile(doc.originalPath, doc.mimeType)
   - Get plain text string

3. CHUNK TEXT
   - Call chunkText(text)
   - Get array of text chunks

4. SAVE TEXT ARTIFACT
   - Write full text to: uploads/{documentId}-text.txt
   - Store path in doc.textPath

5. GENERATE EMBEDDINGS
   - For each chunk:
     - Generate embedding vector
     - Create Chunk document with:
       * documentId
       * page (chunk index + 1)
       * text (chunk content)
       * embedding (64-dim vector)

6. SAVE TO DATABASE
   - Delete old chunks for this document
   - Insert new chunks into MongoDB
   - Update document status to 'ready'

7. ERROR HANDLING
   - If any step fails:
     * Set status to 'error'
     * Store error message
     * Return error details
```

**Status States**:
- `uploaded` → Initial state after upload
- `processing` → Currently being processed
- `ready` → Processing complete, ready for use
- `error` → Processing failed

---

### 5. **gemini.js** - AI Integration Service
**Purpose**: Interfaces with Google Gemini API for advanced AI features

**Key Functions**:
- `geminiSummarize(text, sentences)` - Generate document summaries
- `geminiAnswer(question, contexts)` - Answer questions using RAG

**Summarization**:
```javascript
// Input: Full document text (all chunks joined)
// Process:
1. If text > 100k chars:
   - Take samples: beginning (40k), middle (40k), end (40k)
   - Combine with markers
2. Create prompt: "Summarize in X sentences..."
3. Send to Gemini API
4. Return summary text

// Output: Concise summary of document
```

**Question Answering (RAG)**:
```javascript
// Input: User question + relevant chunks (from search)
// Process:
1. Format chunks with metadata (page, score)
2. Create prompt: "Answer using ONLY these chunks..."
3. Send to Gemini API
4. Return answer with citations

// Output: Answer with page references
```

**Fallback Mechanism**:
- If Gemini API fails or key missing:
  - Summary: Returns first N sentences
  - Q&A: Returns relevant chunk text directly

---

## Document Storage Architecture

### File System Storage

**Location**: `server/uploads/` directory

**File Naming Convention**:
```
Original file: {timestamp}-{random}.{ext}
Example: 1762252447551-p27s7tq6kcr.pdf

Extracted text: {documentId}-text.txt
Example: 6909d69fc1ad44a283cb83bf-text.txt
```

**Files Stored**:
1. **Original File**: The uploaded PDF/document (never modified)
2. **Text Artifact**: Extracted plain text (for debugging/backup)

**File Size Limit**: 100 MB per file

---

### Database Storage (MongoDB)

#### Document Collection (`documents`)
**Schema**:
```javascript
{
  _id: ObjectId,              // Unique document ID
  workspaceId: ObjectId,      // Workspace (future: multi-tenant)
  ownerId: ObjectId,          // User who uploaded
  title: String,               // Document title
  mimeType: String,           // e.g., "application/pdf"
  sizeBytes: Number,           // File size in bytes
  checksum: String,           // SHA-256 hash (duplicate detection)
  status: String,              // 'uploaded' | 'processing' | 'ready' | 'error'
  originalPath: String,       // Path to original file
  textPath: String,            // Path to extracted text file
  errorMessage: String,        // Error details if status='error'
  createdAt: Date,             // Upload timestamp
  updatedAt: Date              // Last update timestamp
}
```

**Indexes**:
- `workspaceId` - Fast workspace queries
- `ownerId` - Fast user document queries
- `checksum` - Duplicate detection

#### Chunk Collection (`chunks`)
**Schema**:
```javascript
{
  _id: ObjectId,              // Unique chunk ID
  documentId: ObjectId,        // Reference to parent document
  page: Number,                // Chunk index (currently, not PDF page)
  text: String,                // Chunk text content
  embedding: [Number],        // 64-dimensional vector
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `documentId` - Fast chunk retrieval per document
- `page` - Sorting chunks in order

**Note**: The `page` field currently stores chunk index (1, 2, 3...), not actual PDF page numbers. This is a limitation that could be improved.

---

## Complete Document Lifecycle

### Phase 1: Upload (`POST /api/documents/upload`)

```
┌─────────────┐
│   Client    │
│   (Browser) │
└──────┬──────┘
       │ 1. User selects file
       │ 2. POST /api/documents/upload
       │    (multipart/form-data)
       ▼
┌─────────────────────────────┐
│   Express Route Handler     │
│   (documents.js)            │
└──────┬──────────────────────┘
       │
       ├─► Multer middleware
       │   - Validates file type
       │   - Checks file size (max 100MB)
       │   - Saves to uploads/
       │   - Generates unique filename
       │
       ├─► Calculate SHA-256 checksum
       │   (for duplicate detection)
       │
       ├─► Create Document record
       │   - Status: 'uploaded'
       │   - Store file path
       │   - Store metadata
       │
       ├─► Create AuditEvent
       │   (for tracking)
       │
       └─► Trigger async processing
           (setImmediate - non-blocking)
           │
           ▼
    ┌──────────────────┐
    │ processDocument()│
    │   (async)         │
    └──────────────────┘
```

**What happens**:
1. File uploaded via Multer middleware
2. Saved to `server/uploads/` with unique name
3. SHA-256 checksum calculated
4. Document record created in MongoDB (status: `uploaded`)
5. Audit event logged
6. Processing triggered asynchronously (non-blocking)
7. Response returned immediately (status: `uploaded`)

**Database State**:
```javascript
Document: {
  status: 'uploaded',
  originalPath: 'uploads/1762252447551-p27s7tq6kcr.pdf',
  textPath: null,  // Not yet created
  // ... other fields
}
```

---

### Phase 2: Processing (`processDocument()` called)

```
┌──────────────────────┐
│  processDocument()   │
│  (processor.js)      │
└──────┬───────────────┘
       │
       ├─► 1. Update status → 'processing'
       │
       ├─► 2. Extract Text
       │      │
       │      ▼
       │   ┌──────────────────┐
       │   │ extractTextFromFile│
       │   │ (textExtractor.js)│
       │   └──────────────────┘
       │      - Read PDF file
       │      - Parse with pdf-parse
       │      - Return plain text
       │
       ├─► 3. Chunk Text
       │      │
       │      ▼
       │   ┌──────────────┐
       │   │ chunkText()  │
       │   │ (chunker.js) │
       │   └──────────────┘
       │      - Split into 1200-char chunks
       │      - 150-char overlap
       │      - Return array of chunks
       │
       ├─► 4. Save Text Artifact
       │      - Write to: uploads/{docId}-text.txt
       │      - Update doc.textPath
       │
       ├─► 5. Generate Embeddings
       │      │
       │      ▼
       │   ┌────────────────────┐
       │   │ generateEmbedding()│
       │   │ (embeddings.js)     │
       │   └────────────────────┘
       │      - For each chunk:
       │      - Generate 64-dim vector
       │      - Store in Chunk document
       │
       ├─► 6. Save Chunks to DB
       │      - Delete old chunks
       │      - Insert new chunks
       │
       └─► 7. Update status → 'ready'
```

**What happens**:
1. Status changed to `processing`
2. Text extracted from PDF
3. Text split into chunks (1200 chars each)
4. Text artifact saved to filesystem
5. Embeddings generated for each chunk
6. Chunks saved to MongoDB
7. Status changed to `ready`

**Filesystem State**:
```
uploads/
  ├── 1762252447551-p27s7tq6kcr.pdf  (original)
  └── 6909d69fc1ad44a283cb83bf-text.txt  (extracted text)
```

**Database State**:
```javascript
Document: {
  status: 'ready',
  textPath: 'uploads/6909d69fc1ad44a283cb83bf-text.txt',
  // ... other fields
}

Chunks: [
  { documentId: ..., page: 1, text: "...", embedding: [...] },
  { documentId: ..., page: 2, text: "...", embedding: [...] },
  { documentId: ..., page: 3, text: "...", embedding: [...] },
  // ... more chunks
]
```

---

### Phase 3: Usage (Ready State)

**Operations Available**:

#### 3.1 View Document
```
GET /api/documents/:id/file
→ Streams original PDF file
→ Used for iframe preview in UI
```

#### 3.2 Get Summary
```
POST /api/ai/summary
Body: { documentId, sentences: 5 }

Flow:
1. Load all chunks for document
2. Join chunks into full text
3. Call geminiSummarize(text, sentences)
4. Return summary

Note: For long docs (>100k chars), samples from beginning/middle/end
```

#### 3.3 Ask Question (RAG)
```
POST /api/ai/qa
Body: { documentId, question, topK: 3 }

Flow:
1. Generate embedding for question
2. Compare with all chunk embeddings (cosine similarity)
3. Select top K most relevant chunks
4. Call geminiAnswer(question, contexts)
5. Return answer with citations
```

#### 3.4 Search
```
GET /api/search?q=query&limit=10

Flow:
1. Keyword filter chunks (regex)
2. Generate embedding for query
3. Calculate similarity scores
4. Return ranked results
```

---

### Phase 4: Deletion (`DELETE /api/documents/:id`)

```
┌──────────────────────┐
│ DELETE /documents/:id│
└──────┬───────────────┘
       │
       ├─► 1. Verify ownership
       │      (user must own document or be admin)
       │
       ├─► 2. Delete Files
       │      - Delete originalPath file
       │      - Delete textPath file
       │
       ├─► 3. Delete Chunks
       │      - Delete all chunks for document
       │      - Clean up MongoDB
       │
       ├─► 4. Delete Document
       │      - Remove from MongoDB
       │
       └─► 5. Log Audit Event
           - Record deletion
```

**What gets deleted**:
- Original PDF file from filesystem
- Extracted text file from filesystem
- All chunk records from MongoDB
- Document record from MongoDB
- (Audit events remain for history)

---

## Data Flow Diagrams

### Upload → Processing Flow

```
[Client Upload]
      │
      ▼
[Multer Save to Disk]
      │
      ▼
[Create Document Record] ──► MongoDB: {status: 'uploaded'}
      │
      ▼
[Trigger Async Processing]
      │
      ▼
[Extract Text] ──► PDF → Plain Text
      │
      ▼
[Chunk Text] ──► Array of 1200-char chunks
      │
      ▼
[Generate Embeddings] ──► 64-dim vectors
      │
      ▼
[Save Chunks] ──► MongoDB: Chunks collection
      │
      ▼
[Update Document] ──► MongoDB: {status: 'ready'}
```

### Q&A Flow (RAG)

```
[User Question]
      │
      ▼
[Generate Question Embedding]
      │
      ▼
[Compare with Chunk Embeddings]
      │
      ▼
[Select Top K Chunks] ──► Most relevant chunks
      │
      ▼
[Send to Gemini API]
      │
      └─► Question + Context chunks
      │
      ▼
[Return Answer with Citations]
```

---

## Key Design Decisions

### 1. **Why Store Files on Filesystem?**
- MongoDB has 16MB document limit
- PDFs can be large (up to 100MB)
- Filesystem is more efficient for binary data
- MongoDB only stores metadata and paths

### 2. **Why Chunk Documents?**
- LLMs have token limits
- Enables semantic search (find relevant parts)
- Better for RAG (retrieval-based Q&A)
- Allows parallel processing

### 3. **Why Generate Embeddings?**
- Enables semantic search (find by meaning, not keywords)
- Critical for RAG: find relevant chunks for questions
- Vector similarity = content similarity

### 4. **Why Async Processing?**
- Upload returns immediately (better UX)
- Processing can take time (large PDFs)
- Non-blocking (server stays responsive)
- Uses `setImmediate()` for fire-and-forget

### 5. **Why Store Text Artifacts?**
- Debugging: see extracted text
- Backup: can reprocess without re-extracting
- Future: OCR results, metadata extraction

---

## Current Limitations & Future Improvements

### Limitations:
1. **Page Tracking**: `page` field stores chunk index, not PDF page number
2. **Embeddings**: Currently placeholder (hash-based), not real semantic embeddings
3. **Processing**: Synchronous processing (could use job queue)
4. **File Storage**: Local filesystem (should use S3/cloud storage)

### Future Improvements:
1. **Real Embeddings**: Use OpenAI/Cohere or local transformer model
2. **PDF Page Tracking**: Extract actual page numbers from PDF
3. **Job Queue**: Use Bull/Redis for background processing
4. **Cloud Storage**: Migrate to S3/Azure Blob Storage
5. **OCR**: Add image-to-text extraction
6. **Multi-format**: Support Word, Excel, PowerPoint

---

## Summary

**Document Lifecycle**:
1. **Upload** → File saved, metadata stored, status: `uploaded`
2. **Processing** → Text extracted, chunked, embedded, status: `ready`
3. **Usage** → View, summarize, Q&A, search
4. **Deletion** → Files and database records removed

**Service Architecture**:
- `textExtractor.js` - Extracts text from files
- `chunker.js` - Splits text into manageable chunks
- `embeddings.js` - Converts text to vectors
- `processor.js` - Orchestrates entire pipeline
- `gemini.js` - AI integration for summaries and Q&A

**Storage**:
- **Filesystem**: Original PDFs + extracted text
- **MongoDB**: Document metadata + text chunks + embeddings

