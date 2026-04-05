const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY
const MODEL = 'gpt-oss-120b'
const API_URL = 'https://api.groq.com/openai/v1/chat/completions'

const SYSTEM_PROMPT = `You are a business intelligence analyst. When given a company name and address, produce a comprehensive, well-structured business profile using your knowledge. Format your response in clean Markdown with clear sections.

Include the following sections (use ## for section headers):

## Overview
Brief description, industry, founding year (if known), company type (public/private/etc).

## Products & Services
Core offerings, key products or service lines.

## Market Position
Market share context, key competitors, competitive advantages.

## Financial Snapshot
Revenue range or estimates, employee count, growth trajectory (if known).

## Leadership
Key executives or founders (if known).

## Locations & Operations
HQ and major office locations, operational footprint.

## Recent Developments
Latest news, product launches, acquisitions, or notable events (based on your training data).

## Online Presence
Website, social media, or notable digital presence.

## Reputation & Reviews
General public/customer perception, notable awards or certifications.

Be factual and concise. If information is uncertain, note it clearly. If a company is not widely known, provide what you can and note the limitations.`

export async function fetchBusinessProfile(companyName, address) {
  const userMessage = `Company Name: ${companyName}\nAddress/Location: ${address}\n\nPlease provide a comprehensive business profile for this company.`

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.3,
      max_tokens: 2048,
      stream: true,
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error?.message || `API error: ${response.status}`)
  }

  return response
}
