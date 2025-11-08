import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiGet, apiPostForm, apiDelete } from '../lib/api.js'
import Header from '../components/Header.jsx'

export default function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState('')

  async function load() {
    setError('')
    try {
      const me = await apiGet('/api/auth/me')
      setUser(me.user)
      const list = await apiGet('/api/documents')
      setDocs(list.documents || [])
    } catch (e) {
      setError('Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function upload() {
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    if (title) fd.append('title', title)
    await apiPostForm('/api/documents/upload', fd)
    setFile(null); setTitle('')
    await load()
  }

  async function deleteDoc(id, e) {
    e.stopPropagation()
    if (!confirm('Delete this document?')) return
    try {
      await apiDelete(`/api/documents/${id}`)
      await load()
    } catch (e) {
      setError('Delete failed')
    }
  }

  function openDocument(id) {
    navigate(`/app/document/${id}`)
  }

  if (loading) return (
    <main className="wrap">
      <Header />
      <div className="dash-simple">
        <section className="panel">
          <div className="skeleton" style={{height:'200px', marginBottom:'12px'}}></div>
          <div className="skeleton" style={{height:'60px'}}></div>
        </section>
        <section className="panel">
          <div className="skeleton" style={{height:'150px'}}></div>
        </section>
      </div>
    </main>
  )

  return (
    <main className="wrap">
      <Header />
      <div className="dash-simple">
        <section className="panel panel-docs">
          <h3 className="panel-title">Your documents</h3>
          {user && <div className="welcome">Welcome, {user.name}!</div>}
          <ul className="doclist">
            {docs.map(d => (
              <li key={d._id || d.id} className="docitem" onClick={() => openDocument(d._id || d.id)}>
                <span className="docname">{d.title}</span>
                <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
                  <span className={`badge ${d.status}`}>{d.status}</span>
                  <button 
                    className="small-link" 
                    onClick={(e)=>deleteDoc(d._id||d.id, e)} 
                    style={{
                      background:'transparent', 
                      border:0, 
                      cursor:'pointer', 
                      color:'var(--error)',
                      padding:'4px 8px',
                      borderRadius:'4px',
                      transition:'all 0.2s',
                      fontSize:'12px'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(248,113,113,.1)'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    title="Delete document"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </li>
            ))}
            {docs.length === 0 && (
              <li className="empty-state">
                <h3>No documents yet</h3>
                <p>Upload your first document to get started!</p>
              </li>
            )}
          </ul>
        </section>
        <section className="panel panel-upload">
          <h3 className="panel-title">Upload New Document</h3>
          <input type="text" className="input input--compact" placeholder="Title (optional)" value={title} onChange={e=>setTitle(e.target.value)} style={{marginBottom:'12px'}} />
          <div className="upload-area" onClick={() => document.querySelector('.file-input')?.click()}>
            <div style={{fontSize:'32px', marginBottom:'12px'}}>📤</div>
            <div style={{fontSize:'14px', marginBottom:'4px', fontWeight:600}}>
              {file ? file.name : 'Click to upload or drag & drop'}
            </div>
            <div style={{fontSize:'12px', color:'var(--muted)'}}>PDF, Word, or Text files</div>
            <input 
              type="file" 
              className="file-input"
              onChange={e=>setFile(e.target.files?.[0]||null)} 
              style={{display:'none'}}
              accept=".pdf,.doc,.docx,.txt"
            />
          </div>
          <button className="cta" onClick={upload} disabled={!file} style={{marginTop:'16px', width:'100%'}}>
            {file ? `📄 Upload ${file.name}` : 'Select a file first'}
          </button>
        </section>
      </div>
      {error && <div className="error" style={{textAlign:'center'}}>{error}</div>}
    </main>
  )
}


