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

  if (loading) return <main className="wrap"><div className="auth-center"><div className="muted">Loading…</div></div></main>

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
                  <button className="small-link" onClick={(e)=>deleteDoc(d._id||d.id, e)} style={{background:'transparent', border:0, cursor:'pointer', color:'#ffb3b3'}}>delete</button>
                </div>
              </li>
            ))}
            {docs.length === 0 && <li className="muted">No documents yet. Upload one to get started!</li>}
          </ul>
        </section>
        <section className="panel panel-upload">
          <h3 className="panel-title">Upload New Document</h3>
          <input type="text" className="input input--compact" placeholder="Title (optional)" value={title} onChange={e=>setTitle(e.target.value)} />
          <input type="file" onChange={e=>setFile(e.target.files?.[0]||null)} style={{marginTop:'8px'}} />
          <button className="cta" onClick={upload} disabled={!file} style={{marginTop:'12px', width:'100%'}}>Upload</button>
        </section>
      </div>
      {error && <div className="error" style={{textAlign:'center'}}>{error}</div>}
    </main>
  )
}


