# Simple Example: What Happens When You Upload a Small Document

## Scenario
- **Document**: 5-page PDF about "Machine Learning Basics"
- **File Size**: 50 KB
- **Content**: ~3000 characters of text

---

## Step 1: Upload (User uploads file)

### What Gets Stored WHERE:

#### 📁 Filesystem (`server/uploads/`)
```
1762252447551-p27s7tq6kcr.pdf
```
- **Original PDF file** (the file you uploaded)
- **Size**: 50 KB
- **Content**: Binary PDF data

#### 💾 MongoDB - Document Collection
```javascript
{
  _id: "6909d69fc1ad44a283cb83bf",
  title: "Machine Learning Basics",
  mimeType: "application/pdf",
  sizeBytes: 51200,  // 50 KB
  status: "uploaded",
  originalPath: "uploads/1762252447551-p27s7tq6kcr.pdf",
  textPath: null,  // Not yet created
  ownerId: "6909d4a4e0ab841192a0d22f",
  createdAt: "2025-01-04T10:34:07.567Z"
}
```

#### 💾 MongoDB - Chunk Collection
```
(Empty - no chunks yet)
```

---

## Step 2: Processing (Automatic background process)

### What Happens:

#### 2.1 Extract Text
**Input**: `uploads/1762252447551-p27s7tq6kcr.pdf`

**Process**:
- Reads PDF file
- Extracts all text using `pdf-parse`
- Gets: "Machine learning is a subset of artificial intelligence..."

**Output**: Plain text string (~3000 characters)

---

#### 2.2 Save Text Artifact
**Filesystem** (`server/uploads/`):
```
6909d69fc1ad44a283cb83bf-text.txt
```
**Content**:
```
Machine learning is a subset of artificial intelligence...
[full extracted text - 3000 chars]
```

---

#### 2.3 Chunk Text
**Input**: 3000 characters of text

**Process**:
- Split into chunks of 1200 characters each
- With 150-character overlap

**Output**:
```
Chunk 1: "Machine learning is a subset of artificial intelligence. It enables computers to learn from data without being explicitly programmed..." (chars 0-1200)
Chunk 2: "...explicitly programmed. There are three main types of machine learning: supervised learning..." (chars 1050-2250, 150 overlap)
Chunk 3: "...unsupervised learning, and reinforcement learning. Supervised learning uses labeled data..." (chars 2100-3000)
```

**Result**: 3 chunks created

---

#### 2.4 Generate Embeddings
**For each chunk**:
- Chunk 1 text → Embedding vector: `[0.12, 0.45, 0.23, 0.67, ...]` (64 numbers)
- Chunk 2 text → Embedding vector: `[0.34, 0.21, 0.89, 0.12, ...]` (64 numbers)
- Chunk 3 text → Embedding vector: `[0.56, 0.78, 0.34, 0.45, ...]` (64 numbers)

**Note**: These are just numbers representing the text, used for search only!

---

#### 2.5 Save to Database

**💾 MongoDB - Document Collection** (Updated):
```javascript
{
  _id: "6909d69fc1ad44a283cb83bf",
  title: "Machine Learning Basics",
  status: "ready",  // ← Changed!
  textPath: "uploads/6909d69fc1ad44a283cb83bf-text.txt",  // ← Added!
  // ... other fields
}
```

**💾 MongoDB - Chunk Collection** (New records):
```javascript
// Chunk 1
{
  _id: "chunk1_id",
  documentId: "6909d69fc1ad44a283cb83bf",
  page: 1,
  text: "Machine learning is a subset of artificial intelligence. It enables computers to learn from data...",
  embedding: [0.12, 0.45, 0.23, 0.67, ...]  // 64 numbers
}

// Chunk 2
{
  _id: "chunk2_id",
  documentId: "6909d69fc1ad44a283cb83bf",
  page: 2,
  text: "...explicitly programmed. There are three main types of machine learning: supervised learning...",
  embedding: [0.34, 0.21, 0.89, 0.12, ...]  // 64 numbers
}

// Chunk 3
{
  _id: "chunk3_id",
  documentId: "6909d69fc1ad44a283cb83bf",
  page: 3,
  text: "...unsupervised learning, and reinforcement learning. Supervised learning uses labeled data...",
  embedding: [0.56, 0.78, 0.34, 0.45, ...]  // 64 numbers
}
```

---

## Final Storage Summary

### 📁 Filesystem:
```
uploads/
  ├── 1762252447551-p27s7tq6kcr.pdf          (Original PDF - 50 KB)
  └── 6909d69fc1ad44a283cb83bf-text.txt       (Extracted text - 3 KB)
```

### 💾 MongoDB - Document Collection:
```
1 document record with metadata
```

### 💾 MongoDB - Chunk Collection:
```
3 chunk records (each with text + embedding)
```

---

## Step 3: User Asks Question

**Question**: "What are the types of machine learning?"

---

### 3.1 Generate Question Embedding

**Input**: "What are the types of machine learning?"

**Process**: Convert question to embedding vector

**Output**: `[0.45, 0.23, 0.67, 0.12, ...]` (64 numbers)

**Stored WHERE?**: 
- ❌ **NOT stored anywhere**
- ✅ **Calculated on-the-fly, used immediately**

---

### 3.2 Compare with Chunk Embeddings

**Process**:
- Compare question embedding with each chunk embedding
- Calculate similarity scores (cosine similarity)

**Results**:
```
Chunk 2: score = 0.89  (Most relevant - mentions "types of machine learning")
Chunk 3: score = 0.67  (Somewhat relevant - mentions "supervised learning")
Chunk 1: score = 0.34  (Least relevant)
```

**Stored WHERE?**:
- ❌ **NOT stored anywhere**
- ✅ **Calculated on-the-fly**

---

### 3.3 Select Top Chunks

**Process**: Pick top 2 chunks (topK = 2)

**Selected**:
- Chunk 2 (score: 0.89)
- Chunk 3 (score: 0.67)

**Stored WHERE?**:
- ❌ **NOT stored anywhere**
- ✅ **Temporary variables**

---

### 3.4 Extract TEXT from Chunks

**Input**: Chunk 2 and Chunk 3 (with embeddings)

**Process**: Extract only the TEXT field

**Output**:
```javascript
contexts = [
  {
    text: "...explicitly programmed. There are three main types of machine learning: supervised learning...",
    page: 2,
    score: 0.89
  },
  {
    text: "...unsupervised learning, and reinforcement learning. Supervised learning uses labeled data...",
    page: 3,
    score: 0.67
  }
]
```

**Note**: We extract TEXT, NOT embeddings!

---

### 3.5 Send to Gemini

**What gets sent to Gemini**:

```javascript
prompt = `You are a helpful assistant. Answer the question using ONLY the provided chunks.

Question: What are the types of machine learning?

Chunks:
[[chunk 1 page=2 score=0.89]]
...explicitly programmed. There are three main types of machine learning: supervised learning...

[[chunk 2 page=3 score=0.67]]
...unsupervised learning, and reinforcement learning. Supervised learning uses labeled data...
`
```

**Sent WHERE?**: Google Gemini API (external service)

**What format?**: Plain text string (not numbers/embeddings!)

---

### 3.6 Gemini Returns Answer

**Response from Gemini**:
```
"The three main types of machine learning are: 
1. Supervised learning - uses labeled data
2. Unsupervised learning - finds patterns in unlabeled data  
3. Reinforcement learning - learns through rewards/punishments
(Page 2, Page 3)"
```

**Stored WHERE?**:
- ❌ **NOT stored in database** (unless you implement chat history)
- ✅ **Returned to user immediately**

---

## Complete Flow Diagram

```
[Upload PDF]
    │
    ▼
[Filesystem: Save PDF] ──► uploads/1762252447551-p27s7tq6kcr.pdf
    │
    ▼
[MongoDB: Create Document] ──► Document collection (metadata)
    │
    ▼
[Extract Text] ──► "Machine learning is..."
    │
    ▼
[Save Text File] ──► uploads/6909d69fc1ad44a283cb83bf-text.txt
    │
    ▼
[Chunk Text] ──► 3 chunks created
    │
    ▼
[Generate Embeddings] ──► 3 vectors (64 numbers each)
    │
    ▼
[MongoDB: Save Chunks] ──► Chunk collection (text + embeddings)
    │
    │
    │ User asks question
    │
    ▼
[Generate Question Embedding] ──► [0.45, 0.23, ...] (NOT stored)
    │
    ▼
[Compare Embeddings] ──► Find Chunk 2, Chunk 3 (NOT stored)
    │
    ▼
[Extract TEXT] ──► "There are three main types..." (NOT stored)
    │
    ▼
[Send TEXT to Gemini] ──► Google API (external)
    │
    ▼
[Return Answer] ──► User sees answer (NOT stored)
```

---

## Key Takeaways

### What Gets STORED:
1. ✅ **Original PDF** → Filesystem
2. ✅ **Extracted text** → Filesystem
3. ✅ **Document metadata** → MongoDB
4. ✅ **Chunk text + embeddings** → MongoDB

### What Does NOT Get Stored:
1. ❌ Question embeddings (calculated on-the-fly)
2. ❌ Similarity scores (calculated on-the-fly)
3. ❌ Selected chunks (temporary variables)
4. ❌ Gemini responses (returned to user, not stored)

### What Gets Sent WHERE:
1. **Text to Gemini** → Google Gemini API (external)
2. **Embeddings** → Only used internally for search, NEVER sent to Gemini
3. **Original PDF** → Never sent anywhere (stays on server)
4. **Chunk text** → Extracted and sent to Gemini (not embeddings!)

---

## Simple Summary

**Storage**:
- PDF file → Filesystem
- Text file → Filesystem  
- Document info → MongoDB
- Chunks (text + embeddings) → MongoDB

**When user asks question**:
- Use embeddings to FIND relevant chunks (internal search)
- Extract TEXT from those chunks
- Send TEXT to Gemini (not embeddings!)
- Return answer to user

**Embeddings = Search tool (like Google)**
**Text = What we actually send to Gemini**

