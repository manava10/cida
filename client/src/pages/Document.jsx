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
  const [isTyping, setIsTyping] = useState(false)
  const chatMessagesEndRef = useRef(null)
  const chatMessagesContainerRef = useRef(null)
  const typingIntervalRef = useRef(null)

  useEffect(() => {
    loadDocument()
  }, [id])

  // Auto-scroll chat messages container (not the whole page)
  const scrollToBottom = () => {
    if (chatMessagesContainerRef.current) {
      // Directly scroll the container - this won't affect the whole page
      chatMessagesContainerRef.current.scrollTop = chatMessagesContainerRef.current.scrollHeight
    }
  }

  // Auto-scroll when typing completes
  useEffect(() => {
    if (!isTyping && chatHistory.length > 0) {
      // Small delay to ensure DOM is updated
      setTimeout(scrollToBottom, 50)
    }
  }, [isTyping, chatHistory.length])

  // Cleanup typing interval on unmount
  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current)
      }
    }
  }, [])

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
    
    // Add placeholder for assistant response with typing indicator
    setChatHistory(prev => [...prev, { role: 'assistant', content: '', isTyping: true }])
    setIsTyping(true)
    
    try {
      const res = await apiPost(`/api/ai/qa?format=markdown`, { documentId: id, question: userQuestion, topK: 3 })
      const answer = res.answerMarkdown || res.answer || ''
      
      // Remove typing indicator and start typing effect
      setChatHistory(prev => {
        const updated = prev.map((msg, idx) => {
          // Find the last assistant message (the one we just added)
          if (idx === prev.length - 1 && msg.role === 'assistant' && msg.isTyping) {
            return { ...msg, isTyping: false }
          }
          return msg
        })
        return updated
      })
      
      // Type the answer word by word
      const words = answer.split(' ')
      let currentIndex = 0
      
      // Clear any existing interval
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current)
      }
      
      typingIntervalRef.current = setInterval(() => {
        if (currentIndex < words.length) {
          const currentText = words.slice(0, currentIndex + 1).join(' ')
          setChatHistory(prev => {
            const updated = [...prev]
            // Update the last assistant message
            const lastIndex = updated.length - 1
            if (lastIndex >= 0 && updated[lastIndex].role === 'assistant') {
              updated[lastIndex] = { 
                role: 'assistant', 
                content: currentText 
              }
            }
            return updated
          })
          
          // Smooth scroll chat container only (not the whole page)
          // Scroll less frequently to avoid janky scrolling and page jumps
          if (chatMessagesContainerRef.current && currentIndex % 8 === 0) {
            const container = chatMessagesContainerRef.current
            const scrollHeight = container.scrollHeight
            const scrollTop = container.scrollTop
            const clientHeight = container.clientHeight
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 250
            
            if (isNearBottom) {
              // Direct scroll assignment - prevents page jumps
              // Using requestAnimationFrame for smoother updates
              requestAnimationFrame(() => {
                if (chatMessagesContainerRef.current) {
                  chatMessagesContainerRef.current.scrollTop = chatMessagesContainerRef.current.scrollHeight
                }
              })
            }
          }
          
          currentIndex++
        } else {
          if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current)
            typingIntervalRef.current = null
          }
          setIsTyping(false)
          // Final scroll to bottom when typing completes
          setTimeout(scrollToBottom, 100)
        }
      }, 30) // 30ms per word (adjust for speed)
      
    } catch (e) {
      setError('Ask failed: ' + (e.message || 'unknown error'))
      setChatHistory(prev => prev.slice(0, -1)) // Remove user question and placeholder on error
      setIsTyping(false)
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current)
        typingIntervalRef.current = null
      }
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
          <button className="cta" onClick={() => navigate('/app')} style={{padding: '8px 14px', fontSize: '14px'}}>← Back to Dashboard</button>
          <h1 className="doc-title">{doc.title}</h1>
          <div className="doc-meta">
            <span className="badge">{doc.status}</span>
            <span className="muted" style={{fontSize: '12px'}}>ID: {doc._id || doc.id}</span>
          </div>
        </div>

        <div className="doc-content">
          <section className="doc-panel doc-preview">
            <h3 className="panel-title">👁️ Preview</h3>
            <iframe
              className="pdfframe-full"
              title="preview"
              src={`${import.meta.env.VITE_API_BASE || 'http://localhost:4000'}/api/documents/${id}/file`}
              onError={(e) => { console.error('iframe error', e); setError('Preview failed') }}
            />
          </section>

          <div className="doc-sidebar">
            <section className="doc-panel doc-summary">
              <h3 className="panel-title">📝 Summary</h3>
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
                <button className="cta" onClick={summarize}>✨ Summarize</button>
              </div>
              {summaryMd && (
                <div className="markdown-scroll" dangerouslySetInnerHTML={{__html: summaryMd.replace(/\n/g, '<br/>').replace(/### /g, '<h3>').replace(/#### /g, '<h4>')}} />
              )}
            </section>

            <section className="doc-panel doc-chat">
              <h3 className="panel-title" style={{flexShrink:0}}>💬 Chat with Gemini</h3>
              <div className="chat-container" style={{flex:1, minHeight:0, display:'flex', flexDirection:'column'}}>
                <div className="chat-messages" ref={chatMessagesContainerRef} style={{flex:'1 1 0', minHeight:0, overflowY:'auto'}}>
                  {chatHistory.length === 0 && (
                    <div className="chat-empty">
                      <p className="muted">Ask questions about this document...</p>
                    </div>
                  )}
                  {chatHistory.map((msg, idx) => (
                    <div key={idx} className={`chat-message ${msg.role}`}>
                      <div className="chat-bubble">
                        {msg.isTyping && !msg.content ? (
                          <span className="typing-indicator">
                            <span></span><span></span><span></span>
                          </span>
                        ) : msg.content ? (
                          <>
                            <div dangerouslySetInnerHTML={{__html: msg.content.replace(/\n/g, '<br/>').replace(/### /g, '<h3>').replace(/#### /g, '<h4>')}} />
                            {isTyping && idx === chatHistory.length - 1 && (
                              <span className="typing-cursor">▊</span>
                            )}
                          </>
                        ) : null}
                      </div>
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
                  <button className="cta" onClick={ask} disabled={!question.trim()}>
                    {isTyping ? '⏳' : '📤'} Send
                  </button>
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

