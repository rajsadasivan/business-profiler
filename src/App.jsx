import { useState, useRef, useEffect, useCallback } from 'react'
import SearchForm from './components/SearchForm'
import ProfileCard from './components/ProfileCard'
import ErrorBoundary from './components/ErrorBoundary'
import { fetchBusinessProfile } from './groqClient'
import styles from './App.module.css'

export default function App() {
  const [entries, setEntries] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef(null)
  const abortRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [entries.length])

  // Cleanup on unmount
  useEffect(() => {
    return () => abortRef.current?.abort()
  }, [])

  const handleSearch = useCallback(async (company, address) => {
    // Cancel any in-flight request
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    const id = Date.now()
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    setEntries(prev => [...prev, { id, company, address, content: '', isStreaming: true, error: null, timestamp }])
    setIsLoading(true)

    // Accumulate chunks in a ref to batch React state updates
    let accumulated = ''
    let rafId = null

    const flush = (entryId) => {
      const snapshot = accumulated
      setEntries(prev =>
        prev.map(e => e.id === entryId ? { ...e, content: snapshot } : e)
      )
    }

    try {
      const response = await fetchBusinessProfile(company, address, controller.signal)
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() // keep incomplete last line

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || trimmed === 'data: [DONE]') continue
          if (!trimmed.startsWith('data: ')) continue

          try {
            const json = JSON.parse(trimmed.slice(6))
            const delta = json.choices?.[0]?.delta?.content
            if (typeof delta === 'string') {
              accumulated += delta
              // Batch DOM updates with rAF — avoids one setState per SSE chunk
              cancelAnimationFrame(rafId)
              rafId = requestAnimationFrame(() => flush(id))
            }
          } catch {
            // Skip malformed SSE chunks
          }
        }
      }
      // Final flush for any remaining content
      cancelAnimationFrame(rafId)
      flush(id)
    } catch (err) {
      if (err.name === 'AbortError') return
      setEntries(prev =>
        prev.map(e => e.id === id ? { ...e, error: err.message, isStreaming: false } : e)
      )
    } finally {
      setEntries(prev =>
        prev.map(e => e.id === id ? { ...e, isStreaming: false } : e)
      )
      setIsLoading(false)
    }
  }, [])

  return (
    <div className={styles.app}>
      <header className={styles.header} role="banner">
        <div className={styles.headerInner}>
          <div className={styles.logo}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" />
            </svg>
            <span>Business Profiler</span>
          </div>
          <span className={styles.badge} aria-label="Powered by Groq AI">Powered by Groq</span>
        </div>
      </header>

      {/* Screen reader live region for loading status */}
      <div role="status" aria-live="polite" aria-atomic="true" className={styles.srOnly}>
        {isLoading ? 'Generating business profile…' : ''}
      </div>

      <main className={styles.main} id="main-content">
        <div className={styles.container}>
          {entries.length === 0 && (
            <div className={styles.empty}>
              <div className={styles.emptyIcon} aria-hidden="true">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <h1 className={styles.emptyTitle}>Research any business</h1>
              <p className={styles.emptyText}>
                Enter a company name and address below to generate a comprehensive business intelligence profile.
              </p>
            </div>
          )}

          <div className={styles.results} aria-label="Profile results">
            {entries.map(entry => (
              <ErrorBoundary key={entry.id}>
                <ProfileCard entry={entry} />
              </ErrorBoundary>
            ))}
            <div ref={bottomRef} aria-hidden="true" />
          </div>
        </div>
      </main>

      <footer className={styles.footer} role="contentinfo">
        <div className={styles.container}>
          <SearchForm onSubmit={handleSearch} isLoading={isLoading} />
        </div>
      </footer>
    </div>
  )
}
