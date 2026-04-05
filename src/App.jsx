import { useState, useRef, useEffect } from 'react'
import SearchForm from './components/SearchForm'
import ProfileCard from './components/ProfileCard'
import { fetchBusinessProfile } from './groqClient'
import styles from './App.module.css'

export default function App() {
  const [entries, setEntries] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [entries])

  async function handleSearch(company, address) {
    const id = Date.now()
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const newEntry = { id, company, address, content: '', isStreaming: true, error: null, timestamp }
    setEntries(prev => [...prev, newEntry])
    setIsLoading(true)

    try {
      const response = await fetchBusinessProfile(company, address)
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop()

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || trimmed === 'data: [DONE]') continue
          if (!trimmed.startsWith('data: ')) continue

          try {
            const json = JSON.parse(trimmed.slice(6))
            const delta = json.choices?.[0]?.delta?.content
            if (delta) {
              setEntries(prev =>
                prev.map(e =>
                  e.id === id ? { ...e, content: e.content + delta } : e
                )
              )
            }
          } catch {
            // skip malformed SSE chunks
          }
        }
      }
    } catch (err) {
      setEntries(prev =>
        prev.map(e =>
          e.id === id ? { ...e, error: err.message, isStreaming: false } : e
        )
      )
    } finally {
      setEntries(prev =>
        prev.map(e =>
          e.id === id ? { ...e, isStreaming: false } : e
        )
      )
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logo}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" />
            </svg>
            <span>Business Profiler</span>
          </div>
          <span className={styles.badge}>Powered by Groq</span>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.container}>
          {entries.length === 0 && (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <h2 className={styles.emptyTitle}>Research any business</h2>
              <p className={styles.emptyText}>
                Enter a company name and address below to generate a comprehensive business intelligence profile.
              </p>
            </div>
          )}

          <div className={styles.results}>
            {entries.map(entry => (
              <ProfileCard key={entry.id} entry={entry} />
            ))}
            <div ref={bottomRef} />
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.container}>
          <SearchForm onSubmit={handleSearch} isLoading={isLoading} />
        </div>
      </footer>
    </div>
  )
}
