# Vercel Deployment Guide

This project is a multi-page static website built with pure HTML5, CSS3, and vanilla JavaScript. It requires zero backend servers, zero databases, and zero API keys.

---

## ⚙️ Exact Vercel Project Settings

When importing this project into Vercel via the Web Dashboard or CLI, use the following configuration:

| Setting | Exact Value to Enter | Notes |
| :--- | :--- | :--- |
| **Framework Preset** | **Other** | Pure static web application (do not select Next.js, Vite, or React). |
| **Root Directory** | `./` | Root of the workspace (default). |
| **Build Command** | *Leave Default* (or `npm run build`) | Runs `node scripts/build.js` to verify asset and route integrity. |
| **Output Directory** | *Leave Default / Empty* | Vercel will serve files directly from the project root (`index.html`). |
| **Install Command** | *Leave Default / Empty* | No `npm install` packages are required; uses vanilla web standards. |
| **Node.js Version** | **20.x** or **18.x** (Default) | Standard Vercel build environment. |

---

## 🚀 Deployment Instructions

### Method 1: Deploy via GitHub (Recommended)

1. Push this repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Deploy Mini Game Arcade"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```
2. Go to [vercel.com/new](https://vercel.com/new) and log in.
3. Select your repository and click **Import**.
4. In the configuration screen:
   - Ensure **Framework Preset** is set to **Other**.
   - Keep **Build and Output Settings** at their defaults.
5. Click **Deploy**. Vercel will build and deploy your site globally with automatic HTTPS.

### Method 2: Deploy via Vercel CLI

1. Ensure the Vercel CLI is installed:
   ```bash
   npm i -g vercel
   ```
2. Run the deployment command in the project root:
   ```bash
   vercel
   ```
   - When asked *"Set up and deploy?"*, press `y`.
   - Select your scope and enter a project name (e.g. `mini-game-arcade`).
   - Leave directory as `./`.
3. To deploy to production:
   ```bash
   vercel --prod
   ```

---

## 🔍 Pre-Flight Verification Checklist

Before deploying, the following audits have been completed:
- [x] **Framework**: Static HTML5/CSS/JS (Framework preset: `Other`).
- [x] **Project Root**: All primary routes (`index.html`, `about.html`, `contact.html`, `privacy.html`, `terms.html`, `games/`) reside relative to root.
- [x] **Output Directory**: Root directory `.` contains `index.html`.
- [x] **Routing & Rewrites**: Uses genuine static files—no SPA client-side rewrite needed. Direct links work without broken routes.
- [x] **Case-Sensitivity**: 100% of internal paths match on-disk file casing letter-for-letter for Linux compatibility.
- [x] **Secrets & Credentials**: Zero API keys, passwords, `.env` files, or secrets exist in the codebase.
- [x] **Hardcoded URLs**: Zero references to `localhost` or `127.0.0.1` in source code.
- [x] **Asset Independence**: All game graphics are generated via Canvas 2D; all thumbnails and logos are local SVG files in `assets/`; all audio is procedurally synthesized via Web Audio API.
- [x] **Configuration**: [`vercel.json`](vercel.json) specifies `cleanUrls: true` and security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Cache-Control`).

---

## 🧪 Local Testing Before Deployment

To verify the site locally before pushing:
```bash
# Start local web server
python -m http.server 8080
```
Open `http://localhost:8080` to test the homepage, navigation links, and playable games.
