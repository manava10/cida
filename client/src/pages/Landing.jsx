import Header from '../components/Header.jsx'

export default function Landing({ onGetStarted }) {
  return (
    <main className="wrap">
      <Header />
      <section className="hero">
        <h1>Organize. Understand. Act.</h1>
        <p>Secure, AI-powered document assistant. Upload, search, summarize, and ask questions—safely.</p>
        <div className="actions">
          <button className="cta" onClick={onGetStarted}>Get started</button>
          <a href="#how" className="link">Learn more</a>
        </div>
        <ul className="trust">
          <li>Private</li><li>Secure</li><li>Search</li><li>Summarize</li>
        </ul>
      </section>
      <section id="how" className="how">
        <div className="how-item"><strong>1.</strong> Upload your document</div>
        <div className="how-item"><strong>2.</strong> Get a concise summary</div>
        <div className="how-item"><strong>3.</strong> Ask follow-up questions with citations</div>
      </section>
      <footer className="footer">
        <a className="muted" href="#">Privacy</a>
        <a className="muted" href="#">Terms</a>
        <a className="muted" href="#">Contact</a>
      </footer>
    </main>
  )
}


