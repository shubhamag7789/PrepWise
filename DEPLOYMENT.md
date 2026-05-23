# PrepWise — Deploy to GitHub, Vercel & Render

## Part 1: Push to GitHub

### 1. Create a new repository on GitHub

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `PrepWise` (or any name you like)
3. Set to **Public** or **Private**
4. **Do not** add README, .gitignore, or license (this project already has them)
5. Click **Create repository**

### 2. Push from your computer

Open PowerShell in the `PrepWise` folder and run (replace `YOUR_USERNAME`):

```powershell
cd C:\Users\shubh\Desktop\PrepWise

git remote add origin https://github.com/YOUR_USERNAME/PrepWise.git
git push -u origin main
```

If GitHub asks for login, use a **Personal Access Token** as the password:
[github.com/settings/tokens](https://github.com/settings/tokens) → Generate new token (classic) → scope: `repo`

---

## Part 2: MongoDB Atlas (database)

1. [mongodb.com/atlas](https://www.mongodb.com/atlas) → Create free cluster
2. **Database Access** → Add user + password
3. **Network Access** → Add IP `0.0.0.0/0` (allow from anywhere)
4. **Connect** → Copy connection string → replace `<password>` with your DB password
5. Save this as `MONGO_URI` for Render (step 3)

---

## Part 3: Deploy backend on Render

1. [dashboard.render.com](https://dashboard.render.com) → Sign up / Log in with GitHub
2. **New +** → **Web Service** → Connect your `PrepWise` repository
3. Settings:

| Setting | Value |
|---------|--------|
| Root Directory | `server` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Health Check Path | `/api/v1/health` |

4. **Environment** → Add variables:

```
NODE_ENV=production
MONGO_URI=mongodb+srv://...your atlas string...
JWT_SECRET=<run: openssl rand -base64 48>
JWT_REFRESH_SECRET=<another random string>
GEMINI_API_KEY=<from https://aistudio.google.com/apikey>
GEMINI_MODEL=gemini-2.5-flash
CLIENT_URL=https://YOUR-APP.vercel.app
CLIENT_URLS=https://YOUR-APP.vercel.app
```

5. Click **Create Web Service** → wait for deploy → copy URL (e.g. `https://prepwise-api.onrender.com`)

**Test:** Open `https://YOUR-API.onrender.com/api/v1/health` — should show healthy JSON.

> Free Render services sleep after ~15 min idle. First request may take 30–60 seconds.

---

## Part 4: Deploy frontend on Vercel

1. [vercel.com](https://vercel.com) → Sign up / Log in with GitHub
2. **Add New Project** → Import `PrepWise` repo
3. Settings:

| Setting | Value |
|---------|--------|
| Root Directory | `client` |
| Framework Preset | Vite |

4. **Environment Variables:**

```
VITE_API_BASE_URL=https://YOUR-API.onrender.com/api/v1
```

(Use your real Render URL from Part 3.)

5. Click **Deploy** → copy your Vercel URL (e.g. `https://prepwise.vercel.app`)

---

## Part 5: Final CORS update

Go back to **Render** → your service → **Environment**:

```
CLIENT_URL=https://your-actual-vercel-url.vercel.app
CLIENT_URLS=https://your-actual-vercel-url.vercel.app
```

Save → Render will redeploy automatically.

---

## Part 6: Verify production

- [ ] Health: `https://YOUR-API.onrender.com/api/v1/health`
- [ ] Register a new account on Vercel URL
- [ ] Login → Dashboard loads
- [ ] Upload resume → Analysis works (needs valid `GEMINI_API_KEY`)

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Login network error | Wrong `VITE_API_BASE_URL` or missing CORS `CLIENT_URLS` |
| API very slow first time | Render free tier cold start — wait and retry |
| AI fails | Check `GEMINI_API_KEY` and `gemini-2.5-flash` quota |
| Blank page | Hard refresh; rebuild Vercel after env change |

---

## Optional: GitHub CLI (one-command repo create)

```powershell
gh auth login
cd C:\Users\shubh\Desktop\PrepWise
gh repo create PrepWise --public --source=. --remote=origin --push
```
