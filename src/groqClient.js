/**
 * Sends a business profile request to the local API proxy, which streams
 * the Groq response as Server-Sent Events (SSE).
 *
 * @param {string} companyName - Name of the company to profile
 * @param {string} address - Address or location of the company
 * @param {AbortSignal} signal - AbortSignal for cancelling the request
 * @returns {Promise<Response>} Streaming SSE response
 * @throws {Error} If the server returns an error status
 */
export async function fetchBusinessProfile(companyName, address, signal) {
  const response = await fetch('/api/profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ companyName, address }),
    signal,
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error || `Server error: ${response.status}`)
  }

  return response
}
