# DripCheck

An AI-powered outfit companion built with React and Google's Gemini multimodal model. Upload a photo or describe your outfit and get instant AI-generated style feedback and recommendations.

**Live demo:** [drip-check-ten.vercel.app](https://drip-check-ten.vercel.app)

## Tech Stack

- **Frontend:** React 19, Vite
- **Styling:** Tailwind CSS v4
- **AI:** Google Gemini API (`@google/genai`) for multimodal (image + text) generation
- **Backend:** Vercel serverless function (with a local Node server for dev)
- **Linting:** Oxlint

## Project Structure

```
DripCheck/
├── api/                   # Vercel serverless function(s)
├── public/                # Static assets
├── src/                   # React app source
├── local-api-server.mjs   # Local stand-in for the Vercel API during dev
├── vercel.json             # Vercel deployment config
├── vite.config.js
└── .env.example
```

## Prerequisites

- Node.js 18+
- A [Google Gemini API key](https://ai.google.dev/)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and add your key:

```bash
cp .env.example .env.local
```

```
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Run the app

Start the frontend:

```bash
npm run dev
```

In a separate terminal, run the local API server (emulates the Vercel serverless function):

```bash
npm run api:local
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run api:local` | Run the local API server |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run Oxlint |

## Deployment

Deployed on [Vercel](https://vercel.com), with `api/` deploying automatically as serverless functions. Set `GEMINI_API_KEY` in your Vercel project's environment variables.

## License

No license specified.
