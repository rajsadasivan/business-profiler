import PropTypes from 'prop-types'
import ReactMarkdown from 'react-markdown'
import styles from './ProfileCard.module.css'

export default function ProfileCard({ entry }) {
  const { company, address, content, isStreaming, error, timestamp } = entry

  return (
    <article className={styles.card} aria-label={`Business profile for ${company}`}>
      <div className={styles.header}>
        <div className={styles.meta}>
          <div className={styles.companyRow}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span className={styles.companyName}>{company}</span>
          </div>
          <div className={styles.addressRow}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>{address}</span>
          </div>
        </div>
        <time className={styles.timestamp} dateTime={new Date().toISOString()}>{timestamp}</time>
      </div>

      <div className={styles.body}>
        {error ? (
          <div role="alert" className={styles.error}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        ) : (
          <div className={styles.markdown} aria-busy={isStreaming}>
            {content && <ReactMarkdown>{content}</ReactMarkdown>}
            {isStreaming && <span className={styles.cursor} aria-hidden="true" />}
          </div>
        )}
      </div>
    </article>
  )
}

ProfileCard.propTypes = {
  entry: PropTypes.shape({
    id: PropTypes.number.isRequired,
    company: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    isStreaming: PropTypes.bool.isRequired,
    error: PropTypes.string,
    timestamp: PropTypes.string.isRequired,
  }).isRequired,
}
