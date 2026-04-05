import 'dotenv/config'
import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 3001
const GROQ_API_KEY = process.env.GROQ_API_KEY
const MODEL = process.env.GROQ_MODEL || 'gpt-oss-120b'
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

if (!GROQ_API_KEY) {
  console.error('ERROR: GROQ_API_KEY environment variable is required')
  process.exit(1)
}

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

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.post('/api/profile', async (req, res) => {
  const { companyName, address } = req.body

  if (!companyName || typeof companyName !== 'string' || companyName.trim().length === 0) {
    return res.status(400).json({ error: 'companyName is required' })
  }
  if (!address || typeof address !== 'string' || address.trim().length === 0) {
    return res.status(400).json({ error: 'address is required' })
  }
  if (companyName.length > 200 || address.length > 300) {
    return res.status(400).json({ error: 'Input too long' })
  }

  const userMessage = `Company Name: ${companyName.trim()}\nAddress/Location: ${address.trim()}\n\nPlease provide a comprehensive business profile for this company.`

  let groqResponse
  try {
    groqResponse = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
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
  } catch (err) {
    console.error('Groq fetch error:', err.message)
    return res.status(502).json({ error: 'Failed to reach Groq API' })
  }

  if (!groqResponse.ok) {
    const errBody = await groqResponse.json().catch(() => ({}))
    const message = errBody?.error?.message || `Groq API error: ${groqResponse.status}`
    console.error('Groq API error:', message)
    return res.status(groqResponse.status).json({ error: message })
  }

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  groqResponse.body.pipeTo(
    new WritableStream({
      write(chunk) {
        res.write(chunk)
      },
      close() {
        res.end()
      },
      abort(err) {
        console.error('Stream aborted:', err)
        res.end()
      },
    })
  )
})

app.listen(PORT, () => {
  console.log(`Business Profiler API server running on http://localhost:${PORT}`)
})
