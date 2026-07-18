# 👗 DripCheck

*The friend who tells you the truth about your outfit — minus the side-eye.*

An AI-powered style companion. Show it your outfit, ask it what it thinks, and get instant feedback powered by Google's multimodal Gemini model — all wrapped in a fast, no-fuss React app.

![React 19](https://img.shields.io/badge/React-19-61DAFB)
![Vite](https://img.shields.io/badge/Vite-8-646CFF)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38BDF8)
![Gemini API](https://img.shields.io/badge/AI-Gemini-8E75B2)

**Live:** [drip-check-ten.vercel.app](https://drip-check-ten.vercel.app)

---

## Why this exists

Mirrors lie by omission, group chats take twenty minutes to respond, and not everyone has a brutally honest best friend on standby. DripCheck is that check-in, on demand — upload a look, get a read, move on with your day.

## ✨ What it does

- **📸 Multimodal input** — send an image, a description, or both
- **🤖 AI-generated feedback** — Gemini reads the outfit and responds with style commentary
- **⚡ Fast, lightweight UI** — built on Vite + React 19, no heavyweight state management
- **🎨 Styled with Tailwind v4** — clean, utility-first styling
- **☁️ Serverless by design** — no database, no accounts, nothing to maintain

## 🧠 How it works

```
   You upload a photo / type a description
                  │
                  ▼
        React app (src/) sends the request
                  │
                  ▼
     Vercel serverless function (api/)
     — or local-api-server.mjs in dev —
        calls the Gemini API
                  │
                  ▼
     AI-generated style feedback streams
              back to the UI
```

## 🛠️ Tech Stack

- **Frontend:** React 19 + Vite
- **Styling:** Tailwind CSS v4
- **AI:** Google Gemini API (`@google/genai`) — multimodal generation
- **Backend:** Vercel serverless functions (`api/`), with `local-api-server.mjs` standing in during local dev
- **Linting:** Oxlint

## 📂 Project Structure

```
DripCheck/
├── api/                   # Vercel serverless function(s) — talks to Gemini
├── public/                # Static assets
├── src/                   # React app source
├── local-api-server.mjs   # Local stand-in for the Vercel API during dev
├── vercel.json             # Vercel deployment config
├── vite.config.js
└── .env.example
```

## 🚀 Getting Started

### 1. Clone and install

```bash
git clone https://github.com/Tanvik01/DripCheck.git
cd DripCheck
npm install
```

### 2. Get a Gemini API key

Grab one from [Google AI Studio](https://ai.google.dev/), then set it up locally:

```bash
cp .env.example .env.local
```

```
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Run it

Two terminals, two commands:

```bash
npm run dev        # frontend — Vite dev server
npm run api:local   # backend — local API server
```

Open the app, upload a fit, and see what the AI thinks. 🎉

## 📜 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run api:local` | Run the local API server |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run Oxlint |

## ☁️ Deployment

Deployed on [Vercel](https://vercel.com) — `api/` ships automatically as serverless functions. Set `GEMINI_API_KEY` in your Vercel project's environment variables and you're live.

## 🗺️ Ideas for later

- Outfit history / saved looks
- Style presets (casual, formal, event-specific)
- Shareable feedback cards

## 📄 License

No license specified.
