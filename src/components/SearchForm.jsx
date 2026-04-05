import { useState } from 'react'
import PropTypes from 'prop-types'
import styles from './SearchForm.module.css'

const MAX_COMPANY_LENGTH = 200
const MAX_ADDRESS_LENGTH = 300

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

  const canSubmit = company.trim() && address.trim() && !isLoading

  return (
    <form className={styles.form} onSubmit={handleSubmit} aria-label="Business search form">
      <div className={styles.fields}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="company">
            Company Name
            <span className={styles.charCount} aria-hidden="true">
              {company.length}/{MAX_COMPANY_LENGTH}
            </span>
          </label>
          <input
            id="company"
            className={styles.input}
            type="text"
            placeholder="e.g. Apple Inc."
            value={company}
            onChange={e => setCompany(e.target.value)}
            disabled={isLoading}
            autoComplete="off"
            maxLength={MAX_COMPANY_LENGTH}
            aria-required="true"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="address">
            Address / Location
            <span className={styles.charCount} aria-hidden="true">
              {address.length}/{MAX_ADDRESS_LENGTH}
            </span>
          </label>
          <input
            id="address"
            className={styles.input}
            type="text"
            placeholder="e.g. One Apple Park Way, Cupertino, CA"
            value={address}
            onChange={e => setAddress(e.target.value)}
            disabled={isLoading}
            autoComplete="off"
            maxLength={MAX_ADDRESS_LENGTH}
            aria-required="true"
          />
        </div>
      </div>
      <button
        className={styles.button}
        type="submit"
        disabled={!canSubmit}
        aria-busy={isLoading}
      >
        {isLoading ? (
          <>
            <span className={styles.spinner} aria-hidden="true" />
            Researching...
          </>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
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

SearchForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
}
