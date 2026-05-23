# PrepWise

AI-powered interview and placement preparation platform. Practice mock interviews, analyze resumes for ATS, track analytics, and get a personalized AI study roadmap.

## Features

- **Authentication** — Register, login, JWT refresh, password reset
- **AI Mock Interviews** — Domain-based sessions (DSA, DBMS, OS, CN, Web Dev, HR) with Gemini feedback
- **ATS Resume Analyzer** — PDF upload, keyword/skill analysis, job description matching
- **Analytics Dashboard** — Placement readiness, weak topics, charts, streaks
- **AI Prep Roadmap** — 4-week personalized study plan
- **Dark mode**, responsive UI, command palette search (⌘K)

## Tech Stack

| Layer | Technologies |
|-------|----------------|
| Frontend | React 18, Vite, Tailwind CSS, Recharts, React Router |
| Backend | Node.js, Express, Mongoose |
| Database | MongoDB Atlas |
| AI | Google Gemini API |

## Project Structure

```
PrepWise/
├── client/          # React SPA (deploy to Vercel)
├── server/          # Express API (deploy to Render)
├── render.yaml      # Render blueprint
└── README.md
```

## Prerequisites

- Node.js **18+**
- MongoDB Atlas cluster (or local MongoDB)
- [Google AI Studio](https://aistudio.google.com/apikey) API key

## Local Setup

### 1. Clone and install

```bash
git clone <your-repo-url>
cd PrepWise

cd server && npm install
cd ../client && npm install
```

### 2. Environment variables

**Server** — copy `server/.env.example` to `server/.env`:

```bash
cp server/.env.example server/.env
```

Fill in `MONGO_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, etc.

**Client** — copy `client/.env.example` to `client/.env`:

```bash
cp client/.env.example client/.env
```

Default `VITE_API_BASE_URL=http://localhost:5000/api/v1` works for local dev.

### 3. Run development servers

Terminal 1 — API:

```bash
cd server
npm run dev
```

Terminal 2 — Frontend:

```bash
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Production Deployment

**Full step-by-step guide:** see [DEPLOYMENT.md](./DEPLOYMENT.md) (GitHub push, Render, Vercel).

### MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Database Access → create user
3. Network Access → allow `0.0.0.0/0` (or Render/Vercel IPs)
4. Connect → copy connection string → set as `MONGO_URI`

### Backend — Render

1. Push code to GitHub
2. [Render Dashboard](https://dashboard.render.com) → **New Web Service**
3. Connect repo, set **Root Directory**: `server`
4. Build: `npm install` | Start: `npm start`
5. Add environment variables from `server/.env.example`
6. Set `CLIENT_URL` and `CLIENT_URLS` to your Vercel URL(s):

   ```
   CLIENT_URL=https://your-app.vercel.app
   CLIENT_URLS=https://your-app.vercel.app
   ```

7. Health check: `/api/v1/health`

Or use the included blueprint:

```bash
# render.yaml at repo root
```

### Frontend — Vercel

1. [Vercel](https://vercel.com) → Import Git repository
2. Set **Root Directory**: `client`
3. Framework: **Vite**
4. Environment variable:

   ```
   VITE_API_BASE_URL=https://your-api.onrender.com/api/v1
   ```

5. Deploy — `vercel.json` handles SPA routing

### Post-deploy checklist

- [ ] `GEMINI_MODEL=gemini-2.5-flash` (or model available on your API key)
- [ ] CORS `CLIENT_URLS` includes exact Vercel URL (no trailing slash)
- [ ] MongoDB Atlas allows connections from Render
- [ ] Strong `JWT_SECRET` / `JWT_REFRESH_SECRET` in production

## API Overview

Base URL: `/api/v1`

| Module | Endpoints |
|--------|-----------|
| Auth | `/auth/register`, `/login`, `/refresh`, `/me` |
| Interviews | `/interviews/sessions`, `/:id/message`, `/:id/end` |
| Resumes | `/resumes/analyze`, `/resumes/latest` |
| Analytics | `/analytics`, `/analytics/dashboard`, `/analytics/roadmap/generate` |
| Health | `/health` |

## Scripts

**Server**

```bash
npm run dev    # nodemon
npm start      # production
```

**Client**

```bash
npm run dev      # Vite dev server
npm run build    # production build
npm run preview  # preview build
```

## License

MIT — see repository for details.
