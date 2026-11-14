/**
 * Mini Game Arcade - Portal Controller
 * Handles game registry loading, dynamic card rendering, real-time search,
 * category filtering, and mobile menu toggle.
 */

// Embedded fallback registry ensuring instant rendering even on file:/// local protocols
const EMBEDDED_GAMES = [
  {
    "id": "blade-harvest",
    "title": "Blade Harvest",
    "subtitle": "Fruit Slicer Arcade",
    "category": "Action",
    "categories": ["Action", "Arcade"],
    "tags": ["Action", "Arcade", "Casual", "Touch-Friendly"],
    "keywords": ["fruit", "slice", "ninja", "blade", "slash", "sword", "combo", "bomb", "swipe"],
    "description": "Slice juicy fruits across the screen, dodge dangerous bombs, and chain massive combo multipliers in this fast-paced arcade game.",
    "thumbnail": "assets/blade-harvest-thumb.svg",
    "route": "games/blade-harvest/index.html",
    "controls": {
      "mouse": "Click & Drag across fruits to slice",
      "touch": "Swipe finger across flying fruits",
      "keyboard": "P / Esc to Pause, M to Mute, Space to Launch"
    },
    "icon": "⚔️",
    "featured": true
  },
  {
    "id": "chroma-breaker",
    "title": "Chroma Breaker",
    "subtitle": "Cyber Brick Arcade",
    "category": "Arcade",
    "categories": ["Arcade", "Action"],
    "tags": ["Arcade", "Action", "Retro", "Touch-Friendly"],
    "keywords": ["brick", "breaker", "paddle", "ball", "breakout", "bounce", "retro", "neon", "cyber"],
    "description": "Shatter vibrant neon bricks with an energy pulse ball. Control paddle spin, angle your rebounds, and clear the grid without losing a life.",
    "thumbnail": "assets/chroma-breaker-thumb.svg",
    "route": "games/chroma-breaker/index.html",
    "controls": {
      "mouse": "Move cursor to guide paddle",
      "touch": "Drag finger horizontally across screen",
      "keyboard": "Left / Right Arrow (or A / D) to steer, Space to launch"
    },
    "icon": "🚀",
    "featured": false
  },
  {
    "id": "neon-snake",
    "title": "Neon Snake",
    "subtitle": "Cyber Slither Grid",
    "category": "Arcade",
    "categories": ["Arcade", "Strategy"],
    "tags": ["Arcade", "Strategy", "Retro", "Touch-Friendly"],
    "keywords": ["snake", "slither", "neon", "food", "grow", "speed", "classic", "retro", "grid"],
    "description": "Slither through a pulsating neon cyber grid. Munch glowing energy bits, dodge walls and your own tail, and grab bonus star power-ups.",
    "thumbnail": "assets/neon-snake-thumb.svg",
    "route": "games/neon-snake/index.html",
    "controls": {
      "mouse": "On-screen directional D-pad & buttons",
      "touch": "Swipe screen or tap responsive D-pad",
      "keyboard": "Arrow keys or W, A, S, D to steer"
    },
    "icon": "🐍",
    "featured": false
  },
  {
    "id": "space-invaders",
    "title": "Space Invaders",
    "subtitle": "Galactic Defense Arcade",
    "category": "Action",
    "categories": ["Action", "Arcade"],
    "tags": ["Action", "Arcade", "Retro", "Touch-Friendly"],
    "keywords": ["space", "invaders", "shooter", "aliens", "laser", "galaxy", "boss", "ship", "retro"],
    "description": "Command your star fighter against relentless waves of descending alien formations. Blast invaders, dodge plasma bombs, and defeat epic bosses.",
    "thumbnail": "assets/space-invaders-thumb.svg",
    "route": "games/space-invaders/index.html",
    "controls": {
      "mouse": "Drag ship left/right, click to shoot",
      "touch": "Drag finger to steer, tap fire button",
      "keyboard": "Left / Right Arrow (or A, D) to move, Space to fire"
    },
    "icon": "🛸",
    "featured": false
  },
  {
    "id": "neon-rush",
    "title": "Neon Rush",
    "subtitle": "Endless Cyber Runner",
    "category": "Adventure",
    "categories": ["Adventure", "Arcade"],
    "tags": ["Adventure", "Arcade", "Action", "Touch-Friendly"],
    "keywords": ["runner", "rush", "endless", "jump", "slide", "parkour", "coins", "speed", "cyberpunk"],
    "description": "Sprint down an endless synthwave highway at breakneck speed. Leap over laser spikes, slide under plasma gates, and collect glowing power-ups.",
    "thumbnail": "assets/neon-rush-thumb.svg",
    "route": "games/neon-rush/index.html",
    "controls": {
      "mouse": "Click Jump / Slide on-screen controls",
      "touch": "Swipe Up to Jump, Swipe Down to Slide",
      "keyboard": "Up / Space to Jump, Down / S to Slide"
    },
    "icon": "⚡",
    "featured": false
  },
  {
    "id": "puzzle-2048",
    "title": "2048 Puzzle",
    "subtitle": "Neon Number Merger",
    "category": "Puzzle",
    "categories": ["Puzzle", "Strategy"],
    "tags": ["Puzzle", "Strategy", "Brain", "Touch-Friendly"],
    "keywords": ["2048", "puzzle", "numbers", "merge", "math", "tiles", "brain", "strategy", "logic"],
    "description": "Slide and merge matching neon number tiles to reach the legendary 2048 tile. Features silky smooth merge animations, undo move, and high scores.",
    "thumbnail": "assets/puzzle-2048-thumb.svg",
    "route": "games/puzzle-2048/index.html",
    "controls": {
      "mouse": "Click & Drag in direction to slide",
      "touch": "Swipe Left, Right, Up, or Down",
      "keyboard": "Arrow keys or W, A, S, D to slide tiles"
    },
    "icon": "🔢",
    "featured": false
  },
  {
    "id": "whack-a-mole",
    "title": "Whack-a-Mole",
    "subtitle": "Cyber Bot Reaction",
    "category": "Arcade",
    "categories": ["Arcade", "Action"],
    "tags": ["Arcade", "Action", "Casual", "Touch-Friendly"],
    "keywords": ["whack", "mole", "reaction", "speed", "reflex", "bot", "hammer", "portal", "frenzy"],
    "description": "Test your reflexes against mischievous cyber bots popping out of neon portals. Whack gold bots for bonus points and avoid explosive glitch bombs!",
    "thumbnail": "assets/whack-a-mole-thumb.svg",
    "route": "games/whack-a-mole/index.html",
    "controls": {
      "mouse": "Click directly on popping cyber bots",
      "touch": "Tap bots on touchscreen before they retreat",
      "keyboard": "Number keys 1-9 corresponding to 3x3 holes"
    },
    "icon": "🔨",
    "featured": false
  },
  {
    "id": "memory-master",
    "title": "Memory Master",
    "subtitle": "Cyber Sequence Simon",
    "category": "Puzzle",
    "categories": ["Puzzle", "Strategy"],
    "tags": ["Puzzle", "Strategy", "Brain", "Touch-Friendly"],
    "keywords": ["memory", "simon", "sequence", "sound", "music", "colors", "brain", "pattern", "recall"],
    "description": "Challenge your visual and auditory recall. Watch the four glowing neon quadrants pulse with harmonic synth chimes and repeat the sequence.",
    "thumbnail": "assets/memory-master-thumb.svg",
    "route": "games/memory-master/index.html",
    "controls": {
      "mouse": "Click glowing colored quadrant pads",
      "touch": "Tap quadrant pads on touchscreen",
      "keyboard": "1, 2, 3, 4 or Q, W, A, S or Arrow keys"
    },
    "icon": "🧠",
    "featured": false
  }
];

class ArcadePortal {
    constructor() {
        this.games = [];
        this.activeCategory = 'All';
        this.searchQuery = '';

        this.gridEl = document.getElementById('gamesGrid');
        this.searchInput = document.getElementById('searchGames');
        this.clearBtn = document.getElementById('clearSearch');
        this.countEl = document.getElementById('resultsCount');
        this.categoryPills = document.querySelectorAll('.category-pill');

        this.init();
    }

    async init() {
        this.bindEvents();
        await this.loadGames();
        this.render();
    }

    async loadGames() {
        try {
            const res = await fetch('games/games.json');
            if (res.ok) {
                this.games = await res.json();
            } else {
                this.games = EMBEDDED_GAMES;
            }
        } catch (e) {
            // Fallback for file:/// protocol where browser blocks local fetch
            this.games = EMBEDDED_GAMES;
        }
    }

    bindEvents() {
        // Mobile Menu Toggle
        const menuBtn = document.getElementById('mobileMenuBtn');
        const navMenu = document.getElementById('navMenu');
        if (menuBtn && navMenu) {
            menuBtn.addEventListener('click', () => {
                const isOpen = navMenu.classList.toggle('open');
                menuBtn.setAttribute('aria-expanded', isOpen);
                menuBtn.textContent = isOpen ? '✕' : '☰';
            });
        }

        // Live Search Input
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.trim().toLowerCase();
                if (this.clearBtn) {
                    this.clearBtn.classList.toggle('visible', this.searchQuery.length > 0);
                }
                this.render();
            });
        }

        // Search Clear Button
        if (this.clearBtn) {
            this.clearBtn.addEventListener('click', () => {
                this.searchInput.value = '';
                this.searchQuery = '';
                this.clearBtn.classList.remove('visible');
                this.searchInput.focus();
                this.render();
            });
        }

        // Category Pills
        this.categoryPills.forEach(pill => {
            pill.addEventListener('click', () => {
                this.categoryPills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                this.activeCategory = pill.dataset.category;
                this.render();
            });
        });
    }

    getFilteredGames() {
        const cat = (this.activeCategory || 'All').toLowerCase();
        const q = (this.searchQuery || '').trim().toLowerCase();

        return this.games.filter(game => {
            // Category match (All, or matches game.categories, game.category, or game.tags)
            const matchesCategory = 
                cat === 'all' || 
                (game.category && game.category.toLowerCase() === cat) ||
                (Array.isArray(game.categories) && game.categories.some(c => c.toLowerCase() === cat)) ||
                (Array.isArray(game.tags) && game.tags.some(t => t.toLowerCase() === cat));

            // Search query match (title, subtitle, description, categories, tags, keywords)
            const matchesSearch = 
                !q ||
                (game.title && game.title.toLowerCase().includes(q)) ||
                (game.subtitle && game.subtitle.toLowerCase().includes(q)) ||
                (game.description && game.description.toLowerCase().includes(q)) ||
                (Array.isArray(game.categories) && game.categories.some(c => c.toLowerCase().includes(q))) ||
                (Array.isArray(game.tags) && game.tags.some(t => t.toLowerCase().includes(q))) ||
                (Array.isArray(game.keywords) && game.keywords.some(k => k.toLowerCase().includes(q)));

            return matchesCategory && matchesSearch;
        });
    }

    render() {
        if (!this.gridEl) return;

        const filtered = this.getFilteredGames();

        // Update count
        if (this.countEl) {
            this.countEl.textContent = `Showing ${filtered.length} of ${this.games.length} games`;
        }

        if (filtered.length === 0) {
            let emptyIcon = '🕹️';
            let emptyTitle = 'No Games Found';
            let emptyDesc = `No playable games matched your search for "${this.searchQuery}".`;

            if (this.activeCategory.toLowerCase() === 'sports' && !this.searchQuery) {
                emptyIcon = '⚽';
                emptyTitle = 'Sports Category In Development';
                emptyDesc = 'Our indie creators are currently developing retro neon sports games (Air Hockey & Cyber Tennis). Check back soon, or jump into Action & Arcade games now!';
            } else if (this.searchQuery && this.activeCategory !== 'All') {
                emptyDesc = `No ${this.activeCategory} games matched "${this.searchQuery}". Try switching to All Games or resetting filters.`;
            } else if (!this.searchQuery) {
                emptyDesc = `No games currently categorized under ${this.activeCategory}. Explore our other categories!`;
            }

            this.gridEl.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">${emptyIcon}</div>
                    <h3 class="empty-title">${emptyTitle}</h3>
                    <p class="empty-desc">${emptyDesc}</p>
                    <button id="btnResetFilters" class="btn-play-game" style="display:inline-flex; width:auto; margin:0 auto;">
                        Reset Filters 🔄
                    </button>
                </div>
            `;
            document.getElementById('btnResetFilters')?.addEventListener('click', () => {
                if (this.searchInput) this.searchInput.value = '';
                this.searchQuery = '';
                this.activeCategory = 'All';
                this.categoryPills.forEach(p => p.classList.toggle('active', p.dataset.category === 'All'));
                this.clearBtn?.classList.remove('visible');
                this.render();
            });
            return;
        }

        const iconMap = {
            'blade-harvest': '⚔️',
            'chroma-breaker': '🚀',
            'neon-snake': '🐍',
            'space-invaders': '🛸',
            'neon-rush': '⚡',
            'puzzle-2048': '🔢',
            'whack-a-mole': '🔨',
            'memory-master': '🧠'
        };

        this.gridEl.innerHTML = filtered.map(game => {
            const badges = (Array.isArray(game.categories) && game.categories.length > 0 
                ? game.categories 
                : [game.category || 'Arcade']
            ).map(c => `<span class="tag-badge">${c.toUpperCase()}</span>`).join('');

            const icon = iconMap[game.id] || game.icon || '🎮';

            return `
            <article class="game-card" id="game-${game.id}">
                <div class="card-thumb-wrap">
                    <img src="${game.thumbnail}" alt="${game.title} Thumbnail" class="card-thumb" loading="lazy">
                    ${game.featured ? '<span class="card-badge-featured">⭐ FEATURED</span>' : ''}
                </div>
                <div class="card-body">
                    <div class="card-tags">
                        ${badges}
                    </div>
                    <h2 class="card-title">${game.title}</h2>
                    <div class="card-subtitle">${game.subtitle || ''}</div>
                    <p class="card-desc">${game.description}</p>
                    <div class="card-controls" title="Controls">
                        <span>🖱️ ${game.controls.mouse}</span>
                        <span>📱 ${game.controls.touch}</span>
                    </div>
                    <a href="${game.route}" class="btn-play-game" aria-label="Play ${game.title} now">
                        <span>PLAY NOW</span>
                        <span>${icon}</span>
                    </a>
                </div>
            </article>
            `;
        }).join('');
    }
}

// -------------------------------------------------------------
// Direct Email Form Handler (FormSubmit.co API Integration)
// Automatically dispatches customer queries to sanchit1098@gmail.com
// -------------------------------------------------------------
function setupFormSubmitHandler(formId, statusId, submitBtnId) {
    const form = document.getElementById(formId);
    const statusMsg = document.getElementById(statusId);
    const submitBtn = submitBtnId ? document.getElementById(submitBtnId) : form?.querySelector('button[type="submit"]');

    if (!form || !statusMsg) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nameInput = form.querySelector('[name="name"]');
        const emailInput = form.querySelector('[name="email"]');
        const messageInput = form.querySelector('[name="message"]');
        const topicInput = form.querySelector('[name="subject"], [name="topic"]');
        const phoneInput = form.querySelector('[name="phone"]');

        const name = nameInput ? nameInput.value.trim() : '';
        const email = emailInput ? emailInput.value.trim() : '';
        const message = messageInput ? messageInput.value.trim() : '';
        const topic = topicInput ? topicInput.value : 'Customer Feedback';
        const phone = phoneInput ? phoneInput.value.trim() : 'Not provided';

        if (!name || !email || !message) {
            statusMsg.className = 'form-status';
            statusMsg.style.display = 'block';
            statusMsg.style.background = 'rgba(255, 56, 56, 0.15)';
            statusMsg.style.border = '1px solid #ff3838';
            statusMsg.style.color = '#ff3838';
            statusMsg.textContent = 'Please fill out your Name, Email, and Message before submitting.';
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            statusMsg.className = 'form-status';
            statusMsg.style.display = 'block';
            statusMsg.style.background = 'rgba(255, 56, 56, 0.15)';
            statusMsg.style.border = '1px solid #ff3838';
            statusMsg.style.color = '#ff3838';
            statusMsg.textContent = 'Please enter a valid email address.';
            return;
        }

        const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>SENDING QUERY...</span> <span>⏳</span>';
        }

        statusMsg.className = 'form-status';
        statusMsg.style.display = 'block';
        statusMsg.style.background = 'rgba(0, 242, 254, 0.12)';
        statusMsg.style.border = '1px solid var(--primary-cyan)';
        statusMsg.style.color = 'var(--primary-cyan)';
        statusMsg.textContent = 'Sending your query directly to sanchit1098@gmail.com...';

        try {
            const payload = {
                name: name,
                email: email,
                phone: phone,
                topic: topic,
                message: message,
                _subject: `New Arcade Feedback from ${name} [${topic}]`,
                _template: 'table',
                _captcha: 'false'
            };

            const response = await fetch('https://formsubmit.co/ajax/sanchit1098@gmail.com', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                statusMsg.className = 'form-status success';
                statusMsg.style.display = 'block';
                statusMsg.style.background = 'rgba(46, 204, 113, 0.15)';
                statusMsg.style.border = '1px solid var(--accent-green)';
                statusMsg.style.color = '#2ecc71';
                statusMsg.textContent = `🎉 Thank you, ${name}! Your feedback has been sent directly to sanchit1098@gmail.com. We appreciate your review!`;
                form.reset();
            } else {
                throw new Error('API status: ' + response.status);
            }
        } catch (err) {
            // Graceful fallback: trigger native submit
            form.submit();
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHtml;
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    window.arcadePortal = new ArcadePortal();
    setupFormSubmitHandler('contactForm', 'formStatusMsg', 'btnSubmitContact');

    // Smooth autofocus when redirected via #feedbackForm
    if (window.location.hash === '#feedbackForm') {
        setTimeout(() => {
            const nameEl = document.getElementById('contactName');
            if (nameEl) {
                nameEl.focus();
                nameEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 150);
    }
});
