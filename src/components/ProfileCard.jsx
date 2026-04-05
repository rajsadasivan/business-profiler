import ReactMarkdown from 'react-markdown'
import styles from './ProfileCard.module.css'

export default function ProfileCard({ entry }) {
  const { company, address, content, isStreaming, error, timestamp } = entry

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.meta}>
          <div className={styles.companyRow}>
            <span className={styles.icon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </span>
            <span className={styles.companyName}>{company}</span>
          </div>
          <div className={styles.addressRow}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>{address}</span>
          </div>
        </div>
        <div className={styles.timestamp}>{timestamp}</div>
      </div>

      <div className={styles.body}>
        {error ? (
          <div className={styles.error}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        ) : (
          <div className={styles.markdown}>
            <ReactMarkdown>{content || ' '}</ReactMarkdown>
            {isStreaming && <span className={styles.cursor} />}
          </div>
        )}
      </div>
    </div>
  )
}
