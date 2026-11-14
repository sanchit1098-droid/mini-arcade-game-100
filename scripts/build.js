/**
 * Mini Game Arcade - Node.js Production Build Verifier (for Vercel & CI/CD)
 * Validates all HTML pages, routes, assets, and configs.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

function audit() {
    console.log('========================================');
    console.log('MINI GAME ARCADE - PRODUCTION BUILD AUDIT (Node.js)');
    console.log('========================================');

    // 1. Audit HTML Pages
    const pages = [
        'index.html',
        'about.html',
        'contact.html',
        'privacy.html',
        'terms.html',
        path.join('games', 'blade-harvest', 'index.html'),
        path.join('games', 'chroma-breaker', 'index.html'),
        path.join('games', 'neon-snake', 'index.html'),
        path.join('games', 'space-invaders', 'index.html'),
        path.join('games', 'neon-rush', 'index.html'),
        path.join('games', 'puzzle-2048', 'index.html'),
        path.join('games', 'whack-a-mole', 'index.html'),
        path.join('games', 'memory-master', 'index.html')
    ];

    pages.forEach(rel => {
        const full = path.join(ROOT_DIR, rel);
        if (!fs.existsSync(full)) {
            throw new Error(`Missing page: ${rel}`);
        }
        const dir = path.dirname(full);
        const content = fs.readFileSync(full, 'utf8');

        // Check local scripts
        const scriptMatches = content.matchAll(/<script\s+[^>]*src=["']([^"']+)["']/g);
        for (const m of scriptMatches) {
            const src = m[1];
            if (!src.startsWith('http')) {
                const target = path.resolve(dir, src);
                if (!fs.existsSync(target)) {
                    throw new Error(`Missing script in ${rel}: ${src}`);
                }
            }
        }

        // Check local stylesheets
        const styleMatches = content.matchAll(/<link\s+[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["']/g);
        for (const m of styleMatches) {
            const href = m[1];
            if (!href.startsWith('http')) {
                const target = path.resolve(dir, href);
                if (!fs.existsSync(target)) {
                    throw new Error(`Missing stylesheet in ${rel}: ${href}`);
                }
            }
        }

        // Check local images
        const imgMatches = content.matchAll(/<img\s+[^>]*src=["']([^"']+)["']/g);
        for (const m of imgMatches) {
            const src = m[1];
            if (!src.startsWith('http') && !src.startsWith('data:')) {
                const target = path.resolve(dir, src);
                if (!fs.existsSync(target)) {
                    throw new Error(`Missing image in ${rel}: ${src}`);
                }
            }
        }
        console.log(`  [OK] Page verified: ${rel}`);
    });

    // 2. Audit games/games.json
    const regPath = path.join(ROOT_DIR, 'games', 'games.json');
    if (!fs.existsSync(regPath)) {
        throw new Error('games/games.json missing!');
    }
    const games = JSON.parse(fs.readFileSync(regPath, 'utf8'));
    games.forEach(g => {
        const routeTarget = path.join(ROOT_DIR, g.route);
        const thumbTarget = path.join(ROOT_DIR, g.thumbnail);
        if (!fs.existsSync(routeTarget)) {
            throw new Error(`Missing route for ${g.title}: ${g.route}`);
        }
        if (!fs.existsSync(thumbTarget)) {
            throw new Error(`Missing thumbnail for ${g.title}: ${g.thumbnail}`);
        }
        console.log(`  [OK] Registry entry verified: ${g.title}`);
    });

    // 3. Audit vercel.json if present
    const vercelPath = path.join(ROOT_DIR, 'vercel.json');
    if (fs.existsSync(vercelPath)) {
        JSON.parse(fs.readFileSync(vercelPath, 'utf8'));
        console.log('  [OK] vercel.json is valid JSON');
    }

    console.log('========================================');
    console.log('BUILD SUCCESS: Static site verified and ready for deployment.');
    console.log('========================================');
}

audit();
