# Business Profiler

AI-powered business intelligence tool. Enter a company name and address to generate a comprehensive, streamed profile using Groq AI.

## Features

- Real-time streaming output via SSE
- Structured profile: overview, financials, leadership, competitors, and more
- Multiple lookups per session
- Accessible, keyboard-navigable UI

## Architecture

```
browser  →  Vite dev server  →  Express proxy (:3001)  →  Groq API
```

The Express backend holds the API key — it is never sent to the browser.

## Setup

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- A [Groq](https://console.groq.com/) API key

### Install

```bash
npm install
```

### Configure

Copy `.env.example` to `.env` and fill in your key:

```bash
cp .env.example .env
```

```env
GROQ_API_KEY=your_groq_api_key_here
```

### Run

```bash
npm run dev
```

Opens at `http://localhost:5173`. The API server runs on port 3001.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both UI and API servers |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GROQ_API_KEY` | Yes | — | Your Groq API key |
| `GROQ_MODEL` | No | `gpt-oss-120b` | Model to use |
| `PORT` | No | `3001` | API server port |
