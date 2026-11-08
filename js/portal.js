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
    "tags": ["Action", "Arcade", "Casual", "Touch-Friendly"],
    "description": "Slice juicy fruits across the screen, dodge dangerous bombs, and chain massive combo multipliers in this fast-paced arcade game.",
    "thumbnail": "assets/blade-harvest-thumb.svg",
    "route": "games/blade-harvest/index.html",
    "controls": {
      "mouse": "Click & Drag",
      "touch": "Swipe finger",
      "keyboard": "P / Esc (Pause), M (Mute)"
    },
    "featured": true
  },
  {
    "id": "chroma-breaker",
    "title": "Chroma Breaker",
    "subtitle": "Cyber Brick Arcade",
    "category": "Retro",
    "tags": ["Retro", "Arcade", "Casual", "Touch-Friendly"],
    "description": "Shatter vibrant neon bricks with an energy pulse ball. Control paddle spin, angle your rebounds, and clear the grid without losing a life.",
    "thumbnail": "assets/chroma-breaker-thumb.svg",
    "route": "games/chroma-breaker/index.html",
    "controls": {
      "mouse": "Move cursor",
      "touch": "Drag paddle",
      "keyboard": "Arrow keys / A, D, Space"
    },
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
        return this.games.filter(game => {
            // Category match
            const matchesCategory = 
                this.activeCategory === 'All' || 
                game.category.toLowerCase() === this.activeCategory.toLowerCase() ||
                (game.tags && game.tags.some(t => t.toLowerCase() === this.activeCategory.toLowerCase()));

            // Search query match (title, subtitle, description, tags)
            const q = this.searchQuery;
            const matchesSearch = 
                !q ||
                game.title.toLowerCase().includes(q) ||
                game.subtitle.toLowerCase().includes(q) ||
                game.description.toLowerCase().includes(q) ||
                (game.tags && game.tags.some(t => t.toLowerCase().includes(q)));

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
            this.gridEl.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🕹️</div>
                    <h3 class="empty-title">No games found</h3>
                    <p class="empty-desc">No playable games matched your search for "${this.searchQuery}".</p>
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

        this.gridEl.innerHTML = filtered.map(game => `
            <article class="game-card" id="game-${game.id}">
                <div class="card-thumb-wrap">
                    <img src="${game.thumbnail}" alt="${game.title} Thumbnail" class="card-thumb" loading="lazy">
                    ${game.featured ? '<span class="card-badge-featured">⭐ FEATURED</span>' : ''}
                </div>
                <div class="card-body">
                    <div class="card-tags">
                        <span class="tag-badge">${game.category.toUpperCase()}</span>
                        <span class="tag-badge">TOUCH FRIENDLY</span>
                    </div>
                    <h2 class="card-title">${game.title}</h2>
                    <div class="card-subtitle">${game.subtitle}</div>
                    <p class="card-desc">${game.description}</p>
                    <div class="card-controls" title="Controls">
                        <span>🖱️ ${game.controls.mouse}</span>
                        <span>📱 ${game.controls.touch}</span>
                    </div>
                    <a href="${game.route}" class="btn-play-game" aria-label="Play ${game.title} now">
                        <span>PLAY NOW</span>
                        <span>⚔️</span>
                    </a>
                </div>
            </article>
        `).join('');
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
                statusMsg.style.color = var(--accent-green);
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

function setupFeedbackModal() {
    const openBtn = document.getElementById('btnOpenFeedbackModal');
    const modal = document.getElementById('feedbackModal');
    const closeBtn = document.getElementById('btnCloseFeedbackModal');

    if (!openBtn || !modal) return;

    const openModal = () => {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        const firstInput = document.getElementById('modalName');
        if (firstInput) firstInput.focus();
    };

    const closeModal = () => {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        openBtn.focus();
    };

    openBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
    });

    closeBtn?.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    window.arcadePortal = new ArcadePortal();
    setupFeedbackModal();
    setupFormSubmitHandler('homeFeedbackForm', 'modalStatusMsg', 'btnSubmitModal');
    setupFormSubmitHandler('contactForm', 'formStatusMsg', 'btnSubmitContact');
});
