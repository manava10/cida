import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiGet, apiPost } from '../lib/api.js'
import Header from '../components/Header.jsx'

export default function Document() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [doc, setDoc] = useState(null)
  const [summaryMd, setSummaryMd] = useState('')
  const [summarySentences, setSummarySentences] = useState(8)
  const [question, setQuestion] = useState('')
  const [answerMd, setAnswerMd] = useState('')
  const [chatHistory, setChatHistory] = useState([])
  const chatMessagesEndRef = useRef(null)

  useEffect(() => {
    loadDocument()
  }, [id])

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatMessagesEndRef.current) {
      chatMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatHistory])

  async function loadDocument() {
    setError('')
    setLoading(true)
    try {
      const res = await apiGet(`/api/documents/${id}`)
      setDoc(res.document)
    } catch (e) {
      setError('Failed to load document')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function summarize() {
    if (!id) return
    setError('')
    try {
      const res = await apiPost(`/api/ai/summary?format=markdown`, { documentId: id, sentences: summarySentences })
      setSummaryMd(res.summaryMarkdown || res.summary || '')
    } catch (e) {
      setError('Summary failed: ' + (e.message || 'unknown error'))
    }
  }

  async function ask() {
    if (!id || !question.trim()) return
    setError('')
    const userQuestion = question.trim()
    setQuestion('')
    
    // Add user question to chat
    setChatHistory(prev => [...prev, { role: 'user', content: userQuestion }])
    
    try {
      const res = await apiPost(`/api/ai/qa?format=markdown`, { documentId: id, question: userQuestion, topK: 3 })
      const answer = res.answerMarkdown || res.answer || ''
      setChatHistory(prev => [...prev, { role: 'assistant', content: answer }])
      setAnswerMd('')
    } catch (e) {
      setError('Ask failed: ' + (e.message || 'unknown error'))
      setChatHistory(prev => prev.slice(0, -1)) // Remove user question on error
    }
  }

  if (loading) {
    return (
      <main className="wrap">
        <Header />
        <div className="auth-center">
          <div className="muted">Loading document…</div>
        </div>
      </main>
    )
  }

  if (!doc) {
    return (
      <main className="wrap">
        <Header />
        <div className="auth-center">
          <div className="error">Document not found</div>
          <button className="cta" onClick={() => navigate('/app')} style={{marginTop: '16px'}}>Back to Dashboard</button>
        </div>
      </main>
    )
  }

  return (
    <main className="wrap">
      <Header />
      <div className="doc-page">
        <div className="doc-header">
          <button className="cta" onClick={() => navigate('/app')} style={{padding: '8px 14px', fontSize: '14px'}}>← Back</button>
          <h1 className="doc-title">{doc.title}</h1>
          <div className="doc-meta">
            <span className="badge">{doc.status}</span>
            <span className="muted" style={{fontSize: '12px'}}>ID: {doc._id || doc.id}</span>
          </div>
        </div>

        <div className="doc-content">
          <section className="doc-panel doc-preview">
            <h3 className="panel-title">Preview</h3>
            <iframe
              className="pdfframe-full"
              title="preview"
              src={`${import.meta.env.VITE_API_BASE || 'http://localhost:4000'}/api/documents/${id}/file`}
              onError={(e) => { console.error('iframe error', e); setError('Preview failed') }}
            />
          </section>

          <div className="doc-sidebar">
            <section className="doc-panel doc-summary">
              <h3 className="panel-title">Summary</h3>
              <div style={{display:'flex', gap:'8px', alignItems:'center', marginBottom:'8px', flexShrink:0}}>
                <input 
                  type="number" 
                  className="input input--compact" 
                  value={summarySentences} 
                  onChange={e=>setSummarySentences(Math.max(1, Math.min(20, parseInt(e.target.value)||8)))} 
                  min="1" 
                  max="20" 
                  style={{width:'60px'}} 
                />
                <span className="muted" style={{fontSize:'12px'}}>sentences</span>
                <button className="cta" onClick={summarize}>Summarize</button>
              </div>
              {summaryMd && (
                <div className="markdown-scroll" dangerouslySetInnerHTML={{__html: summaryMd.replace(/\n/g, '<br/>').replace(/### /g, '<h3>').replace(/#### /g, '<h4>')}} />
              )}
            </section>

            <section className="doc-panel doc-chat">
              <h3 className="panel-title">Chat with Gemini</h3>
              <div className="chat-container">
                <div className="chat-messages">
                  {chatHistory.length === 0 && (
                    <div className="chat-empty">
                      <p className="muted">Ask questions about this document...</p>
                    </div>
                  )}
                  {chatHistory.map((msg, idx) => (
                    <div key={idx} className={`chat-message ${msg.role}`}>
                      <div className="chat-bubble" dangerouslySetInnerHTML={{__html: msg.content.replace(/\n/g, '<br/>').replace(/### /g, '<h3>').replace(/#### /g, '<h4>')}} />
                    </div>
                  ))}
                  <div ref={chatMessagesEndRef} />
                </div>
                <div className="chat-input-container">
                  <input 
                    type="text" 
                    className="input input--compact" 
                    placeholder="Ask a question about this document..." 
                    value={question} 
                    onChange={e=>setQuestion(e.target.value)} 
                    onKeyDown={(e)=>e.key==='Enter' && !e.shiftKey && ask()} 
                    style={{flex:1}} 
                  />
                  <button className="cta" onClick={ask} disabled={!question.trim()}>Send</button>
                </div>
              </div>
            </section>
          </div>
        </div>

        {error && <div className="error" style={{textAlign:'center', marginTop:'16px'}}>{error}</div>}
      </div>
    </main>
  )
}

