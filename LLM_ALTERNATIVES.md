# LLM Alternatives & Self-Hosting Guide

## 🎯 Quick Answer

**Yes, you can fine-tune and host a small LLM, but it's medium-hard** (easier than you might think with modern tools).

---

## 📊 Alternatives Comparison

### 1. **API-Based (Easiest - Current Setup)**
These require API keys but no hosting:

#### **Option A: OpenAI GPT**
- **Models**: GPT-4, GPT-3.5-turbo
- **Cost**: ~$0.002-0.03 per 1K tokens
- **Pros**: Best quality, fast, reliable
- **Cons**: Costs add up, API dependency
- **Difficulty**: ⭐ Easy (just swap API)

#### **Option B: Anthropic Claude**
- **Models**: Claude 3.5 Sonnet, Claude 3 Opus
- **Cost**: ~$0.003-0.015 per 1K tokens
- **Pros**: Excellent reasoning, large context (200K tokens)
- **Cons**: Similar to OpenAI
- **Difficulty**: ⭐ Easy

#### **Option C: Other APIs**
- **Cohere**: Good for embeddings + generation
- **Together AI**: Access to open models via API
- **Groq**: Fast inference for open models (free tier available)
- **Hugging Face Inference API**: Access to many models

---

### 2. **Self-Hosted Open Models (Medium Difficulty)**
Run models on your own server:

#### **Option A: Ollama (⭐⭐ Easiest Self-Hosting)**
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull a model
ollama pull llama3.2:3b      # Small (3B params, ~2GB)
ollama pull mistral:7b       # Medium (7B params, ~4GB)
ollama pull llama3.1:8b      # Good balance

# Run API server
ollama serve
```

**Available Models:**
- `llama3.2:3b` - Smallest, fast, good for simple tasks (2GB RAM)
- `llama3.2:1b` - Tiny, very fast (1GB RAM)
- `mistral:7b` - Better quality, still fast (4GB RAM)
- `llama3.1:8b` - Great balance (5GB RAM)
- `qwen2.5:7b` - Good multilingual support

**API Usage:**
```javascript
// server/src/services/ollama.js
import fetch from 'node-fetch';

export async function ollamaAnswer(question, contexts) {
  const contextText = contexts
    .map((c, i) => `[[chunk ${i + 1} page=${c.page}]]\n${c.text}`)
    .join('\n\n');
  
  const prompt = `Answer based on these document chunks:\n\n${contextText}\n\nQuestion: ${question}\n\nAnswer:`;
  
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama3.2:3b',
      prompt: prompt,
      stream: false
    })
  });
  
  const data = await response.json();
  return { text: data.response.trim(), model: 'llama3.2:3b' };
}
```

**Pros:**
- ✅ Free (no API costs)
- ✅ Privacy (data stays local)
- ✅ Easy setup (one command)
- ✅ Good for RAG tasks
- ✅ Works offline

**Cons:**
- ❌ Requires GPU for good performance (CPU works but slow)
- ❌ Lower quality than GPT-4/Gemini Pro
- ❌ Takes up disk space (2-10GB per model)
- ❌ Needs decent RAM (8GB+ recommended)

**Difficulty**: ⭐⭐ (Easy with Ollama, harder if you want fine-tuning)

---

#### **Option B: vLLM (⭐⭐⭐ Advanced)**
High-performance serving for open models:

```bash
# Install vLLM
pip install vllm

# Run server
python -m vllm.entrypoints.openai.api_server \
  --model mistralai/Mistral-7B-Instruct-v0.2 \
  --port 8000
```

**Pros:**
- ✅ Very fast inference
- ✅ Supports many models
- ✅ OpenAI-compatible API
- ✅ Good for production

**Cons:**
- ❌ Requires GPU
- ❌ More complex setup
- ❌ Higher resource requirements

**Difficulty**: ⭐⭐⭐ (More complex)

---

#### **Option C: Hugging Face Transformers (⭐⭐⭐)**
Direct model loading:

```javascript
// server/src/services/hf.js
import { pipeline } from '@huggingface/transformers';

const generator = await pipeline('text-generation', 'microsoft/Phi-3-mini-4k-instruct');

export async function hfAnswer(question, contexts) {
  // ... implementation
}
```

**Difficulty**: ⭐⭐⭐ (Requires understanding of transformers)

---

### 3. **Fine-Tuning (⭐⭐⭐⭐ Harder)**
Customize a model for your specific use case:

#### **When to Fine-Tune:**
- ✅ You have domain-specific data (legal docs, medical terms, etc.)
- ✅ You want consistent output format
- ✅ You need the model to learn specific patterns
- ✅ You want to reduce hallucination in your domain

#### **When NOT to Fine-Tune:**
- ❌ You just need general Q&A (RAG + good prompts works better)
- ❌ You don't have much training data (<1000 examples)
- ❌ You want to save costs (fine-tuning is expensive upfront)
- ❌ Your needs change frequently (easier to update prompts)

#### **Fine-Tuning Options:**

**A. Using Ollama (Easiest Fine-Tuning)**
```bash
# Create fine-tuning data
# Format: JSONL file with prompt/response pairs

# Fine-tune (requires Modelfile)
ollama create my-custom-model -f Modelfile
```

**B. Using Hugging Face (More Control)**
```python
# Install libraries
pip install transformers datasets peft accelerate

# Fine-tune with LoRA (Parameter-Efficient Fine-Tuning)
from transformers import AutoModelForCausalLM, TrainingArguments, Trainer

# Load model
model = AutoModelForCausalLM.from_pretrained("mistralai/Mistral-7B-Instruct-v0.2")

# Fine-tune with your data
# (Requires preparing dataset, training loop, etc.)
```

**C. Using OpenAI Fine-Tuning API (Easiest but costs money)**
```javascript
// Upload training data
// Fine-tune via API
// Use fine-tuned model like regular GPT
```

**Difficulty**: 
- Ollama: ⭐⭐⭐ (Medium - requires data preparation)
- Hugging Face: ⭐⭐⭐⭐ (Hard - requires ML knowledge)
- OpenAI API: ⭐⭐ (Easy but expensive)

---

## 💡 **Recommended Approach for Your Use Case**

### **Best Option: Ollama (Self-Hosted, No Fine-Tuning)**

**Why:**
1. ✅ Your use case (document Q&A) works great with RAG + good prompts
2. ✅ Ollama is easy to set up (one command)
3. ✅ Free to run
4. ✅ Privacy (no data leaves your server)
5. ✅ Works well with your existing RAG pipeline

**Implementation:**
```javascript
// server/src/services/llm.js (unified LLM interface)
import { geminiAnswer, geminiSummarize } from './gemini.js';
import { ollamaAnswer, ollamaSummarize } from './ollama.js';
import { loadEnv } from '../config/env.js';

const { LLM_PROVIDER } = loadEnv(); // 'gemini' | 'ollama' | 'openai'

export async function answerQuestion(question, contexts) {
  switch (LLM_PROVIDER) {
    case 'ollama':
      return await ollamaAnswer(question, contexts);
    case 'gemini':
      return await geminiAnswer(question, contexts);
    default:
      return await geminiAnswer(question, contexts);
  }
}
```

**Models to Try:**
1. Start with `llama3.2:3b` - Small, fast, good enough for RAG
2. If quality isn't great, try `mistral:7b` - Better reasoning
3. If you have GPU, try `llama3.1:8b` - Best quality

---

## 🚀 **Quick Start with Ollama**

### **Step 1: Install Ollama**
```bash
# macOS/Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Windows
# Download from ollama.ai
```

### **Step 2: Pull a Model**
```bash
ollama pull llama3.2:3b
```

### **Step 3: Test It**
```bash
ollama run llama3.2:3b "What is RAG?"
```

### **Step 4: Create Service File**
```javascript
// server/src/services/ollama.js
import fetch from 'node-fetch';

const OLLAMA_BASE = process.env.OLLAMA_BASE || 'http://localhost:11434';

export async function ollamaAnswer(question, contexts) {
  const contextText = contexts
    .map((c, i) => `[Chunk ${i + 1}, Page ${c.page}]\n${c.text}`)
    .join('\n\n');
  
  const prompt = `You are a helpful assistant. Answer the question using ONLY the information from these document chunks. If the answer isn't in the chunks, say "I don't know."

Document Chunks:
${contextText}

Question: ${question}

Answer:`;

  try {
    const response = await fetch(`${OLLAMA_BASE}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2:3b',
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          max_tokens: 500
        }
      })
    });
    
    const data = await response.json();
    return { 
      text: data.response.trim(), 
      model: 'llama3.2:3b' 
    };
  } catch (error) {
    console.error('[ollama] error:', error);
    return null;
  }
}

export async function ollamaSummarize(text, sentences = 4) {
  const prompt = `Summarize the following document in about ${sentences} sentences. Be concise and factual:\n\n${text.slice(0, 8000)}`;

  try {
    const response = await fetch(`${OLLAMA_BASE}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2:3b',
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.5,
          max_tokens: 300
        }
      })
    });
    
    const data = await response.json();
    return { 
      text: data.response.trim(), 
      model: 'llama3.2:3b' 
    };
  } catch (error) {
    console.error('[ollama] error:', error);
    return null;
  }
}
```

### **Step 5: Update AI Routes**
```javascript
// server/src/routes/ai.js
import { ollamaAnswer, ollamaSummarize } from '../services/ollama.js';
import { geminiAnswer, geminiSummarize } from '../services/gemini.js';

const LLM_PROVIDER = process.env.LLM_PROVIDER || 'gemini';

// In your routes, check provider:
const llm = LLM_PROVIDER === 'ollama' 
  ? await ollamaAnswer(question, contexts)
  : await geminiAnswer(question, contexts);
```

---

## 💰 **Cost Comparison**

| Option | Setup Cost | Per Query Cost | Quality | Privacy |
|--------|-----------|----------------|---------|---------|
| **Gemini API** | $0 | ~$0.0001-0.001 | ⭐⭐⭐⭐⭐ | ❌ |
| **OpenAI GPT** | $0 | ~$0.001-0.01 | ⭐⭐⭐⭐⭐ | ❌ |
| **Ollama (CPU)** | $0 | $0 | ⭐⭐⭐ | ✅ |
| **Ollama (GPU)** | GPU cost | $0 | ⭐⭐⭐⭐ | ✅ |
| **Fine-Tuned** | $100-1000+ | $0 (self-hosted) | ⭐⭐⭐⭐ | ✅ |

---

## 🎯 **Final Recommendation**

### **For Your Project:**

1. **Short Term**: Keep Gemini (it's working well)
2. **Medium Term**: Add Ollama as fallback/option
   - Easy to add
   - No API costs
   - Better privacy
3. **Long Term**: Consider fine-tuning ONLY if:
   - You have specific domain data
   - You want consistent output format
   - You have 1000+ good examples

### **Don't Fine-Tune If:**
- You just want to save API costs (Ollama is easier)
- You don't have training data
- Your use case is general Q&A (RAG + prompts is enough)

---

## 📚 **Resources**

- **Ollama**: https://ollama.ai
- **Hugging Face Models**: https://huggingface.co/models
- **vLLM**: https://github.com/vllm-project/vllm
- **Fine-Tuning Guide**: https://huggingface.co/docs/transformers/training

---

## 🔧 **Hardware Requirements**

### **Ollama Models:**
- **llama3.2:1b** - 1GB RAM, CPU works
- **llama3.2:3b** - 2GB RAM, CPU works (slow), GPU recommended
- **mistral:7b** - 4GB RAM, GPU strongly recommended
- **llama3.1:8b** - 5GB RAM, GPU required for good performance

### **For Production:**
- **CPU-only**: Works but slow (3-10 seconds per query)
- **GPU (8GB+)**: Fast (0.5-2 seconds per query)
- **GPU (16GB+)**: Can run larger models, multiple concurrent requests

---

**Bottom Line**: Start with Ollama (`llama3.2:3b`), it's easier than you think and works great for RAG! 🚀


