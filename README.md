# 🕹️ Mini Game Arcade

A fast, responsive, browser-based indie arcade website featuring instant-play HTML5 canvas games with zero downloads, zero paywalls, and zero tracking. Built with clean vanilla web standards (HTML5, CSS3, JavaScript) and deployable as a 100% static site on Vercel.

---

## 🎮 Playable Games in the Arcade

1. **🍉 Blade Harvest (Fruit Slicer Arcade)**
   - *Route*: [`games/blade-harvest/index.html`](games/blade-harvest/index.html)
   - *Genre*: Action / Arcade / Touch-Friendly
   - *Gameplay*: Fast-paced fruit slicing. Slash flying fruits, dodge explosive bombs, and trigger multi-fruit combo multipliers. Includes both Arcade (60s blitz) and Classic (3 lives) modes.
   - *Controls*: Mouse drag, Touch swipe, `P`/`Esc` to Pause, `M` to Mute.

2. **🚀 Chroma Breaker (Cyber Brick Arcade)**
   - *Route*: [`games/chroma-breaker/index.html`](games/chroma-breaker/index.html)
   - *Genre*: Retro / Casual / Touch-Friendly
   - *Gameplay*: High-speed neon brick breaking. Steer the cyber paddle to control rebound angle and spin, shatter multi-tier color bricks, and clear the grid.
   - *Controls*: Mouse cursor / Touch drag / Left & Right Arrow keys (or `A`/`D`) to steer paddle, `Space` / Tap to launch ball, `P` to Pause.

---

## ✨ Arcade Portal Features

- **Responsive Game Grid**: Auto-adjusting CSS Grid (`repeat(auto-fill, minmax(340px, 1fr))`) looks polished across smartphones, tablets, and 4K displays.
- **Real-Time Live Search**: Instantly filters games by title, genre, controls, or tags as you type.
- **Dynamic Category Pills**: Filter games by genre (`Action`, `Retro`, `Arcade`, `Casual`) with instant count badges and an interactive empty state.
- **Original Vector Thumbnails**: Handcrafted SVGs for thumbnails and logos—zero copyrighted images or third-party hotlinks.
- **Complete Portal Navigation**:
  - [`about.html`](about.html): Mission, open web philosophy, and technical stack.
  - [`contact.html`](contact.html): Client-side contact form and FAQ.
  - [`privacy.html`](privacy.html): Transparent privacy disclosure (explaining `localStorage` use for high scores and zero trackers).
  - [`terms.html`](terms.html): Standard terms of service and acceptable use guidelines.
- **Accessible & Keyboard Usable**: Includes `<a class="skip-link">` for screen readers, keyboard-navigable search and pills, focus rings, and full ARIA attributes.

---

## 📂 Project Architecture

```text
mini-game-arcade/
├── index.html                   # Arcade Portal Homepage (Hero, Search, Game Grid, Features)
├── about.html                   # About the Arcade
├── contact.html                 # Contact form & FAQ
├── privacy.html                 # Privacy policy
├── terms.html                   # Terms of service
├── vercel.json                  # Static routing & security headers for Vercel
├── package.json                 # Project scripts (dev, build, test)
├── README.md                    # Documentation & guide
├── assets/                      # Original SVG illustrations and logos
│   ├── logo.svg
│   ├── blade-harvest-thumb.svg
│   └── chroma-breaker-thumb.svg
├── css/
│   ├── portal.css               # Portal layout, dark neon theme, navbar, cards & footer
│   └── style.css                # Base responsive rules
├── js/
│   └── portal.js                # Game registry loader, live search & category filter engine
├── scripts/
│   └── build.py                 # Automated production build & asset verification script
└── games/
    ├── games.json               # Centralized game registry
    ├── blade-harvest/           # Dedicated route for Blade Harvest
    │   ├── index.html
    │   ├── css/style.css
    │   └── js/ (audio.js, blade.js, fruits.js, game.js, particles.js)
    └── chroma-breaker/          # Dedicated route for Chroma Breaker
        ├── index.html
        ├── css/style.css
        └── js/breaker.js
```

---

## 🛠️ How to Add a New Game (Step-by-Step)

The portal is designed with a modular, scalable architecture. Adding a new game takes **3 simple steps**:

### Step 1: Create Your Game Directory
Create a new folder under `games/<game-id>/` containing your game's files:
```text
games/my-new-game/
├── index.html
├── css/style.css
└── js/game.js
```
*Tip: Include a back-link to the arcade home in your game's header:*
```html
<a href="../../index.html" class="btn-back-arcade">◀ Arcade Home</a>
```

### Step 2: Add an Original Thumbnail
Place a `600x380` SVG or PNG thumbnail in the `assets/` directory:
```text
assets/my-new-game-thumb.svg
```

### Step 3: Register the Game in `games/games.json`
Open [`games/games.json`](games/games.json) and append a new JSON object:
```json
{
  "id": "my-new-game",
  "title": "My New Game",
  "subtitle": "Exciting Subtitle",
  "category": "Action",
  "tags": ["Action", "Arcade", "Touch-Friendly"],
  "description": "Short 1-2 sentence description of gameplay mechanics.",
  "thumbnail": "assets/my-new-game-thumb.svg",
  "route": "games/my-new-game/index.html",
  "controls": {
    "mouse": "Click to jump",
    "touch": "Tap screen",
    "keyboard": "Spacebar"
  },
  "featured": false,
  "releaseDate": "2026-11"
}
```

**That's it!** The portal's search engine, category filters, and responsive grid will automatically detect and display the new game card without modifying any other code.

---

## 🚀 Local Testing & Development

### Method 1: Instant Direct Open
Double-click [`index.html`](index.html) in your file explorer to open it in Chrome, Edge, Safari, or Firefox.

### Method 2: Local Python Server (Recommended)
```powershell
python -m http.server 8080
```
Then visit: `http://localhost:8080`

### Method 3: Run the Automated Production Build Audit
```powershell
python scripts/build.py
```
This tests all HTML pages, verifies that all referenced scripts, styles, images, and routes exist locally, and checks JavaScript/CSS syntax.

---

## ☁️ Deployment to Vercel

The portal is 100% static and pre-configured with [`vercel.json`](vercel.json).

### Deploy via Vercel CLI
```powershell
vercel
```
For production:
```powershell
vercel --prod
```

### Deploy via GitHub
1. Push this workspace to your GitHub repository.
2. Go to [vercel.com](https://vercel.com) and click **"Add New..."** ➡️ **"Project"**.
3. Select your repository, leave **Framework Preset** as **"Other"**, and click **Deploy**.
