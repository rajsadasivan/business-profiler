import { useState } from 'react'
import styles from './SearchForm.module.css'

export default function SearchForm({ onSubmit, isLoading }) {
  const [company, setCompany] = useState('')
  const [address, setAddress] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!company.trim() || !address.trim() || isLoading) return
    onSubmit(company.trim(), address.trim())
    setCompany('')
    setAddress('')
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.fields}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="company">Company Name</label>
          <input
            id="company"
            className={styles.input}
            type="text"
            placeholder="e.g. Apple Inc."
            value={company}
            onChange={e => setCompany(e.target.value)}
            disabled={isLoading}
            autoComplete="off"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="address">Address / Location</label>
          <input
            id="address"
            className={styles.input}
            type="text"
            placeholder="e.g. One Apple Park Way, Cupertino, CA"
            value={address}
            onChange={e => setAddress(e.target.value)}
            disabled={isLoading}
            autoComplete="off"
          />
        </div>
      </div>
      <button
        className={styles.button}
        type="submit"
        disabled={!company.trim() || !address.trim() || isLoading}
      >
        {isLoading ? (
          <>
            <span className={styles.spinner} />
            Researching...
          </>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            Generate Profile
          </>
        )}
      </button>
    </form>
  )
}
