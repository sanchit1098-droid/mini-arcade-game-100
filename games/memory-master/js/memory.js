/**
 * MEMORY MASTER: GEM MATRIX
 * Complete Gem Matching Memory Card Game Engine
 * Features:
 * - 24 visually distinct, faceted vector SVG gems with vibrant arcade hues
 * - Mystery arcane crystal card back design
 * - Smooth 3D card flip transitions with perspective
 * - 5-second initial face-up memorization phase with animated countdown & bar
 * - Progressive grid layouts (3x4, 4x4, 4x5, 5x4, 5x6, 6x6, up to 6x8)
 * - Safe mismatch handling (cards flip back after ~1s without restarting level)
 * - Persistent matched pairs with golden/emerald shimmer
 * - Score system with streak multipliers, speed bonus, & perfect memory rewards
 * - Web Audio API sound synthesizer with zero external assets
 * - High score and highest level persistence via localStorage
 */

(function () {
  'use strict';

  // ========================================================
  // GEM SVG DATABASE (24 Visually Distinct Faceted Crystals)
  // ========================================================
  const GEMS = [
    {
      id: 'ruby',
      name: 'Ruby',
      color: '#ff0055',
      glow: 'rgba(255, 0, 85, 0.7)',
      svg: `<svg viewBox="0 0 100 100" class="gem-vector">
        <polygon points="50,6 90,30 75,92 25,92 10,30" fill="#ff0055" stroke="#ff80aa" stroke-width="2.5"/>
        <polygon points="50,6 90,30 68,40 50,22" fill="#ff3377"/>
        <polygon points="50,6 10,30 32,40 50,22" fill="#ff6699"/>
        <polygon points="50,22 68,40 50,78 32,40" fill="#ff0044"/>
        <polygon points="68,40 90,30 75,92 50,78" fill="#cc0033"/>
        <polygon points="32,40 10,30 25,92 50,78" fill="#990022"/>
        <polygon points="45,14 55,14 62,26 38,26" fill="#ffffff" opacity="0.6"/>
      </svg>`
    },
    {
      id: 'emerald',
      name: 'Emerald',
      color: '#00e676',
      glow: 'rgba(0, 230, 118, 0.7)',
      svg: `<svg viewBox="0 0 100 100" class="gem-vector">
        <polygon points="26,8 74,8 92,26 92,74 74,92 26,92 8,74 8,26" fill="#00b050" stroke="#69f0ae" stroke-width="2.5"/>
        <polygon points="32,18 68,18 82,32 82,68 68,82 32,82 18,68 18,32" fill="#00e676"/>
        <polygon points="40,28 60,28 72,40 72,60 60,72 40,72 28,60 28,40" fill="#00c853"/>
        <polygon points="26,8 32,18 18,32 8,26" fill="#b9f6ca" opacity="0.7"/>
        <polygon points="74,8 68,18 82,32 92,26" fill="#008c3a"/>
        <polygon points="74,92 68,82 82,68 92,74" fill="#004d20"/>
        <polygon points="26,92 32,82 18,68 8,74" fill="#007030"/>
        <rect x="36" y="24" width="28" height="12" fill="#ffffff" opacity="0.55"/>
      </svg>`
    },
    {
      id: 'sapphire',
      name: 'Sapphire',
      color: '#0088ff',
      glow: 'rgba(0, 136, 255, 0.7)',
      svg: `<svg viewBox="0 0 100 100" class="gem-vector">
        <polygon points="50,6 94,36 78,92 22,92 6,36" fill="#0055ff" stroke="#80bfff" stroke-width="2.5"/>
        <polygon points="50,6 94,36 68,44 50,24" fill="#3385ff"/>
        <polygon points="50,6 6,36 32,44 50,24" fill="#80b3ff"/>
        <polygon points="50,24 68,44 50,80 32,44" fill="#0066ff"/>
        <polygon points="68,44 94,36 78,92 50,80" fill="#003db3"/>
        <polygon points="32,44 6,36 22,92 50,80" fill="#002980"/>
        <polygon points="44,14 56,14 62,26 38,26" fill="#ffffff" opacity="0.6"/>
      </svg>`
    },
    {
      id: 'amethyst',
      name: 'Amethyst',
      color: '#b537f2',
      glow: 'rgba(181, 55, 242, 0.7)',
      svg: `<svg viewBox="0 0 100 100" class="gem-vector">
        <polygon points="50,6 88,26 88,74 50,94 12,74 12,26" fill="#9900e6" stroke="#e080ff" stroke-width="2.5"/>
        <polygon points="50,22 74,34 74,66 50,78 26,66 26,34" fill="#b537f2"/>
        <polygon points="50,6 88,26 74,34 50,22" fill="#d966ff"/>
        <polygon points="12,26 50,6 50,22 26,34" fill="#f0b3ff"/>
        <polygon points="88,26 88,74 74,66 74,34" fill="#7a00b8"/>
        <polygon points="12,26 12,74 26,66 26,34" fill="#8a00cc"/>
        <polygon points="50,94 88,74 74,66 50,78" fill="#4d0073"/>
        <polygon points="50,94 12,74 26,66 50,78" fill="#5c008a"/>
        <polygon points="44,14 56,14 62,24 38,24" fill="#ffffff" opacity="0.65"/>
      </svg>`
    },
    {
      id: 'diamond',
      name: 'Diamond',
      color: '#00f0ff',
      glow: 'rgba(0, 240, 255, 0.75)',
      svg: `<svg viewBox="0 0 100 100" class="gem-vector">
        <polygon points="26,12 74,12 94,36 50,92 6,36" fill="#80f5ff" stroke="#ffffff" stroke-width="2.5"/>
        <polygon points="26,12 74,12 62,36 38,36" fill="#ffffff"/>
        <polygon points="26,12 38,36 6,36" fill="#b3f9ff"/>
        <polygon points="74,12 62,36 94,36" fill="#4deeff"/>
        <polygon points="38,36 62,36 50,92" fill="#00d4e6"/>
        <polygon points="6,36 38,36 50,92" fill="#00a3b3"/>
        <polygon points="94,36 62,36 50,92" fill="#00808c"/>
        <polygon points="40,16 60,16 56,26 44,26" fill="#ffffff" opacity="0.8"/>
      </svg>`
    },
    {
      id: 'topaz',
      name: 'Topaz',
      color: '#ff8800',
      glow: 'rgba(255, 136, 0, 0.7)',
      svg: `<svg viewBox="0 0 100 100" class="gem-vector">
        <polygon points="50,6 94,50 50,94 6,50" fill="#ff7700" stroke="#ffbb66" stroke-width="2.5"/>
        <polygon points="50,22 78,50 50,78 22,50" fill="#ffa200"/>
        <polygon points="50,6 94,50 78,50 50,22" fill="#ffbb33"/>
        <polygon points="50,6 6,50 22,50 50,22" fill="#ffdd80"/>
        <polygon points="50,94 94,50 78,50 50,78" fill="#cc5500"/>
        <polygon points="50,94 6,50 22,50 50,78" fill="#993d00"/>
        <polygon points="44,14 56,14 64,28 36,28" fill="#ffffff" opacity="0.6"/>
      </svg>`
    },
    {
      id: 'aquamarine',
      name: 'Aquamarine',
      color: '#00f5d4',
      glow: 'rgba(0, 245, 212, 0.7)',
      svg: `<svg viewBox="0 0 100 100" class="gem-vector">
        <polygon points="32,8 68,8 90,30 90,70 68,92 32,92 10,70 10,30" fill="#00d2b4" stroke="#80ffea" stroke-width="2.5"/>
        <polygon points="36,20 64,20 80,36 80,64 64,80 36,80 20,64 20,36" fill="#00f5d4"/>
        <polygon points="42,30 58,30 68,42 68,58 58,70 42,70 32,58 32,42" fill="#70fff0"/>
        <polygon points="32,8 68,8 64,20 36,20" fill="#b8fff6"/>
        <polygon points="68,92 32,92 36,80 64,80" fill="#009e87"/>
        <polygon points="10,30 32,8 36,20 20,36" fill="#d9fffa" opacity="0.75"/>
        <polygon points="90,70 68,92 64,80 80,64" fill="#006b5b"/>
      </svg>`
    },
    {
      id: 'citrine',
      name: 'Citrine',
      color: '#ffd700',
      glow: 'rgba(255, 215, 0, 0.75)',
      svg: `<svg viewBox="0 0 100 100" class="gem-vector">
        <polygon points="30,8 70,8 92,30 92,70 70,92 30,92 8,70 8,30" fill="#e6b800" stroke="#fff066" stroke-width="2.5"/>
        <polygon points="36,18 64,18 80,36 80,64 64,82 36,82 20,64 20,36" fill="#ffd700"/>
        <polygon points="44,28 56,28 70,42 70,58 56,72 44,72 30,58 30,42" fill="#ffeb3b"/>
        <polygon points="30,8 70,8 64,18 36,18" fill="#fff9b3"/>
        <polygon points="8,30 30,8 36,18 20,36" fill="#ffffff" opacity="0.7"/>
        <polygon points="92,70 70,92 64,82 80,64" fill="#b38f00"/>
        <polygon points="30,92 8,70 20,64 36,82" fill="#806600"/>
      </svg>`
    },
    {
      id: 'opal',
      name: 'Opal',
      color: '#ff70a6',
      glow: 'rgba(255, 112, 166, 0.7)',
      svg: `<svg viewBox="0 0 100 100" class="gem-vector">
        <ellipse cx="50" cy="50" rx="42" ry="44" fill="#f8bbd0" stroke="#ff80ab" stroke-width="2.5"/>
        <ellipse cx="50" cy="50" rx="35" ry="37" fill="#fce4ec"/>
        <path d="M 35 25 Q 50 40 65 30 Q 75 55 55 65 Q 35 60 35 25 Z" fill="#b3e5fc" opacity="0.6"/>
        <path d="M 25 45 Q 40 60 55 50 Q 60 75 40 75 Q 25 65 25 45 Z" fill="#b9f6ca" opacity="0.6"/>
        <path d="M 45 35 Q 65 45 60 65 Q 45 70 45 35 Z" fill="#e1bee7" opacity="0.65"/>
        <ellipse cx="38" cy="30" rx="12" ry="7" fill="#ffffff" opacity="0.75" transform="rotate(-25 38 30)"/>
      </svg>`
    },
    {
      id: 'obsidian',
      name: 'Obsidian',
      color: '#78909c',
      glow: 'rgba(120, 144, 156, 0.7)',
      svg: `<svg viewBox="0 0 100 100" class="gem-vector">
        <polygon points="50,6 92,30 76,92 24,92 8,30" fill="#263238" stroke="#90a4ae" stroke-width="2.5"/>
        <polygon points="50,6 92,30 68,40 50,22" fill="#37474f"/>
        <polygon points="50,6 8,30 32,40 50,22" fill="#546e7a"/>
        <polygon points="50,22 68,40 50,78 32,40" fill="#1c2529"/>
        <polygon points="68,40 92,30 76,92 50,78" fill="#10171a"/>
        <polygon points="32,40 8,30 24,92 50,78" fill="#151d21"/>
        <polygon points="44,14 56,14 62,26 38,26" fill="#cfd8dc" opacity="0.75"/>
      </svg>`
    },
    {
      id: 'rose_quartz',
      name: 'Rose Quartz',
      color: '#ff66b2',
      glow: 'rgba(255, 102, 178, 0.7)',
      svg: `<svg viewBox="0 0 100 100" class="gem-vector">
        <polygon points="50,14 88,38 72,92 28,92 12,38" fill="#f06292" stroke="#ff80ab" stroke-width="2.5"/>
        <polygon points="50,14 88,38 66,46 50,30" fill="#f48fb1"/>
        <polygon points="50,14 12,38 34,46 50,30" fill="#ff80ab"/>
        <polygon points="50,30 66,46 50,80 34,46" fill="#ec407a"/>
        <polygon points="66,46 88,38 72,92 50,80" fill="#d81b60"/>
        <polygon points="34,46 12,38 28,92 50,80" fill="#c2185b"/>
        <polygon points="45,20 55,20 62,32 38,32" fill="#ffffff" opacity="0.75"/>
      </svg>`
    },
    {
      id: 'jade',
      name: 'Jade',
      color: '#2e7d32',
      glow: 'rgba(46, 125, 50, 0.7)',
      svg: `<svg viewBox="0 0 100 100" class="gem-vector">
        <circle cx="50" cy="50" r="42" fill="#2e7d32" stroke="#a5d6a7" stroke-width="2.5"/>
        <circle cx="50" cy="50" r="32" fill="#388e3c"/>
        <circle cx="50" cy="50" r="16" fill="#1b5e20"/>
        <circle cx="50" cy="50" r="8" fill="#ffd700"/>
        <path d="M 28 28 Q 50 18 72 28" stroke="#a5d6a7" stroke-width="3" fill="none" opacity="0.6"/>
        <path d="M 28 72 Q 50 82 72 72" stroke="#1b5e20" stroke-width="3" fill="none" opacity="0.8"/>
        <ellipse cx="38" cy="32" rx="10" ry="5" fill="#ffffff" opacity="0.5" transform="rotate(-30 38 32)"/>
      </svg>`
    },
    {
      id: 'tanzanite',
      name: 'Tanzanite',
      color: '#651fff',
      glow: 'rgba(101, 31, 255, 0.7)',
      svg: `<svg viewBox="0 0 100 100" class="gem-vector">
        <polygon points="16,16 84,16 84,84 16,84" fill="#4a148c" stroke="#b388ff" stroke-width="2.5"/>
        <polygon points="26,26 74,26 74,74 26,74" fill="#651fff"/>
        <polygon points="36,36 64,36 64,64 36,64" fill="#7c4dff"/>
        <polygon points="16,16 84,16 74,26 26,26" fill="#d1c4e9"/>
        <polygon points="84,16 84,84 74,74 74,26" fill="#311b92"/>
        <polygon points="84,84 16,84 26,74 74,74" fill="#1a237e"/>
        <polygon points="16,84 16,16 26,26 26,74" fill="#4527a0"/>
        <polygon points="32,22 68,22 60,28 40,28" fill="#ffffff" opacity="0.65"/>
      </svg>`
    },
    {
      id: 'peridot',
      name: 'Peridot',
      color: '#76ff03',
      glow: 'rgba(118, 255, 3, 0.7)',
      svg: `<svg viewBox="0 0 100 100" class="gem-vector">
        <polygon points="50,6 90,30 74,92 26,92 10,30" fill="#64dd17" stroke="#ccff90" stroke-width="2.5"/>
        <polygon points="50,6 90,30 68,40 50,22" fill="#76ff03"/>
        <polygon points="50,6 10,30 32,40 50,22" fill="#b2ff59"/>
        <polygon points="50,22 68,40 50,78 32,40" fill="#43a047"/>
        <polygon points="68,40 90,30 74,92 50,78" fill="#2e7d32"/>
        <polygon points="32,40 10,30 26,92 50,78" fill="#1b5e20"/>
        <polygon points="45,14 55,14 62,26 38,26" fill="#ffffff" opacity="0.75"/>
      </svg>`
    },
    {
      id: 'garnet',
      name: 'Garnet',
      color: '#b71c1c',
      glow: 'rgba(183, 28, 28, 0.7)',
      svg: `<svg viewBox="0 0 100 100" class="gem-vector">
        <polygon points="50,6 94,36 78,92 22,92 6,36" fill="#880e4f" stroke="#ff5252" stroke-width="2.5"/>
        <polygon points="50,6 94,36 68,44 50,24" fill="#b71c1c"/>
        <polygon points="50,6 6,36 32,44 50,24" fill="#c62828"/>
        <polygon points="50,24 68,44 50,80 32,44" fill="#7f0000"/>
        <polygon points="68,44 94,36 78,92 50,80" fill="#4a0000"/>
        <polygon points="32,44 6,36 22,92 50,80" fill="#330000"/>
        <polygon points="44,14 56,14 62,26 38,26" fill="#ff8a80" opacity="0.6"/>
      </svg>`
    },
    {
      id: 'morganite',
      name: 'Morganite',
      color: '#ff8a80',
      glow: 'rgba(255, 138, 128, 0.7)',
      svg: `<svg viewBox="0 0 100 100" class="gem-vector">
        <polygon points="50,6 88,40 68,92 32,92 12,40" fill="#ff8a80" stroke="#ffd180" stroke-width="2.5"/>
        <polygon points="50,6 88,40 64,48 50,28" fill="#ffab91"/>
        <polygon points="50,6 12,40 36,48 50,28" fill="#ffccbc"/>
        <polygon points="50,28 64,48 50,80 36,48" fill="#ff7043"/>
        <polygon points="64,48 88,40 68,92 50,80" fill="#f4511e"/>
        <polygon points="36,48 12,40 32,92 50,80" fill="#e64a19"/>
        <polygon points="45,14 55,14 62,26 38,26" fill="#ffffff" opacity="0.75"/>
      </svg>`
    },
    {
      id: 'turquoise',
      name: 'Turquoise',
      color: '#00b4d8',
      glow: 'rgba(0, 180, 216, 0.7)',
      svg: `<svg viewBox="0 0 100 100" class="gem-vector">
        <ellipse cx="50" cy="50" rx="42" ry="44" fill="#00b4d8" stroke="#90e0ef" stroke-width="2.5"/>
        <ellipse cx="50" cy="50" rx="35" ry="37" fill="#48cae4"/>
        <path d="M 25 35 Q 40 45 55 35 Q 65 50 80 45" stroke="#795548" stroke-width="2.5" fill="none" opacity="0.75"/>
        <path d="M 35 65 Q 50 55 65 65" stroke="#5d4037" stroke-width="2" fill="none" opacity="0.7"/>
        <path d="M 50 20 Q 55 40 45 55" stroke="#3e2723" stroke-width="1.8" fill="none" opacity="0.6"/>
        <ellipse cx="36" cy="30" rx="12" ry="6" fill="#ffffff" opacity="0.55" transform="rotate(-25 36 30)"/>
      </svg>`
    },
    {
      id: 'moonstone',
      name: 'Moonstone',
      color: '#b0bec5',
      glow: 'rgba(176, 190, 197, 0.75)',
      svg: `<svg viewBox="0 0 100 100" class="gem-vector">
        <ellipse cx="50" cy="50" rx="42" ry="44" fill="#cfd8dc" stroke="#ffffff" stroke-width="2.5"/>
        <ellipse cx="50" cy="50" rx="35" ry="37" fill="#eceff1"/>
        <path d="M 28 35 Q 50 15 72 35 Q 50 85 28 35 Z" fill="#b3e5fc" opacity="0.65"/>
        <path d="M 38 42 Q 50 28 62 42 Q 50 72 38 42 Z" fill="#ffffff" opacity="0.8"/>
        <ellipse cx="38" cy="28" rx="10" ry="5" fill="#ffffff" opacity="0.9" transform="rotate(-20 38 28)"/>
      </svg>`
    },
    {
      id: 'beryl',
      name: 'Golden Beryl',
      color: '#e6c300',
      glow: 'rgba(230, 195, 0, 0.7)',
      svg: `<svg viewBox="0 0 100 100" class="gem-vector">
        <polygon points="50,6 88,28 88,72 50,94 12,72 12,28" fill="#d4af37" stroke="#fff176" stroke-width="2.5"/>
        <polygon points="50,22 74,36 74,64 50,78 26,64 26,36" fill="#ffd54f"/>
        <polygon points="50,6 88,28 74,36 50,22" fill="#fff59d"/>
        <polygon points="12,28 50,6 50,22 26,36" fill="#ffffcc"/>
        <polygon points="88,28 88,72 74,64 74,36" fill="#b7950b"/>
        <polygon points="12,28 12,72 26,64 26,36" fill="#c49f12"/>
        <polygon points="50,94 88,72 74,64 50,78" fill="#7d6608"/>
        <polygon points="50,94 12,72 26,64 50,78" fill="#9a7d0a"/>
        <polygon points="42,14 58,14 64,24 36,24" fill="#ffffff" opacity="0.8"/>
      </svg>`
    },
    {
      id: 'lapis',
      name: 'Lapis Lazuli',
      color: '#1a237e',
      glow: 'rgba(26, 35, 126, 0.75)',
      svg: `<svg viewBox="0 0 100 100" class="gem-vector">
        <polygon points="28,8 72,8 92,28 92,72 72,92 28,92 8,72 8,28" fill="#0d47a1" stroke="#82b1ff" stroke-width="2.5"/>
        <polygon points="34,18 66,18 82,34 82,66 66,82 34,82 18,66 18,34" fill="#1565c0"/>
        <circle cx="35" cy="40" r="2.5" fill="#ffd700"/>
        <circle cx="65" cy="35" r="2" fill="#ffd700"/>
        <circle cx="50" cy="60" r="3" fill="#ffd700"/>
        <circle cx="70" cy="65" r="2.2" fill="#ffd700"/>
        <circle cx="30" cy="68" r="1.8" fill="#ffd700"/>
        <polygon points="28,8 72,8 66,18 34,18" fill="#bbdefb" opacity="0.7"/>
        <polygon points="8,28 28,8 34,18 18,34" fill="#ffffff" opacity="0.6"/>
      </svg>`
    },
    {
      id: 'malachite',
      name: 'Malachite',
      color: '#004d40',
      glow: 'rgba(0, 77, 64, 0.75)',
      svg: `<svg viewBox="0 0 100 100" class="gem-vector">
        <ellipse cx="50" cy="50" rx="42" ry="44" fill="#004d40" stroke="#80cbc4" stroke-width="2.5"/>
        <ellipse cx="50" cy="50" rx="35" ry="37" fill="#00695c"/>
        <ellipse cx="45" cy="48" rx="26" ry="28" fill="#00897b"/>
        <ellipse cx="42" cy="46" rx="18" ry="20" fill="#26a69a"/>
        <ellipse cx="40" cy="44" rx="10" ry="12" fill="#4db6ac"/>
        <ellipse cx="38" cy="42" rx="4" ry="5" fill="#80cbc4"/>
        <ellipse cx="34" cy="28" rx="10" ry="5" fill="#ffffff" opacity="0.5" transform="rotate(-30 34 28)"/>
      </svg>`
    },
    {
      id: 'alexandrite',
      name: 'Alexandrite',
      color: '#00897b',
      glow: 'rgba(0, 137, 123, 0.75)',
      svg: `<svg viewBox="0 0 100 100" class="gem-vector">
        <polygon points="50,6 94,36 78,92 22,92 6,36" fill="#00897b" stroke="#80cbc4" stroke-width="2.5"/>
        <polygon points="50,6 94,36 68,44 50,24" fill="#26a69a"/>
        <polygon points="50,6 6,36 32,44 50,24" fill="#8e24aa"/>
        <polygon points="50,24 68,44 50,80 32,44" fill="#6a1b9a"/>
        <polygon points="68,44 94,36 78,92 50,80" fill="#004d40"/>
        <polygon points="32,44 6,36 22,92 50,80" fill="#4a148c"/>
        <polygon points="44,14 56,14 62,26 38,26" fill="#e1bee7" opacity="0.7"/>
      </svg>`
    },
    {
      id: 'sunstone',
      name: 'Sunstone',
      color: '#e65100',
      glow: 'rgba(230, 81, 0, 0.75)',
      svg: `<svg viewBox="0 0 100 100" class="gem-vector">
        <ellipse cx="50" cy="50" rx="42" ry="44" fill="#ef6c00" stroke="#ffcc80" stroke-width="2.5"/>
        <ellipse cx="50" cy="50" rx="35" ry="37" fill="#f57c00"/>
        <ellipse cx="48" cy="48" rx="26" ry="28" fill="#fb8c00"/>
        <circle cx="36" cy="38" r="2" fill="#fff" opacity="0.8"/>
        <circle cx="62" cy="42" r="2.5" fill="#ffe082"/>
        <circle cx="48" cy="62" r="2" fill="#fff" opacity="0.7"/>
        <circle cx="58" cy="58" r="1.8" fill="#ffe082"/>
        <ellipse cx="36" cy="28" rx="12" ry="6" fill="#ffffff" opacity="0.65" transform="rotate(-25 36 28)"/>
      </svg>`
    },
    {
      id: 'spinel',
      name: 'Spinel',
      color: '#d81b60',
      glow: 'rgba(216, 27, 96, 0.75)',
      svg: `<svg viewBox="0 0 100 100" class="gem-vector">
        <polygon points="50,6 94,50 50,94 6,50" fill="#c2185b" stroke="#ff80ab" stroke-width="2.5"/>
        <polygon points="50,22 78,50 50,78 22,50" fill="#e91e63"/>
        <polygon points="50,6 94,50 78,50 50,22" fill="#ff4081"/>
        <polygon points="50,6 6,50 22,50 50,22" fill="#ff80ab"/>
        <polygon points="50,94 94,50 78,50 50,78" fill="#ad1457"/>
        <polygon points="50,94 6,50 22,50 50,78" fill="#880e4f"/>
        <polygon points="44,14 56,14 64,28 36,28" fill="#ffffff" opacity="0.75"/>
      </svg>`
    }
  ];

  // ========================================================
  // LEVEL DEFINITIONS & PROGRESSION
  // ========================================================
  const LEVELS = [
    { level: 1, rows: 3, cols: 4, pairs: 6, previewSec: 5.0, targetMoves: 9, targetSec: 25 },
    { level: 2, rows: 4, cols: 4, pairs: 8, previewSec: 5.0, targetMoves: 13, targetSec: 35 },
    { level: 3, rows: 4, cols: 5, pairs: 10, previewSec: 4.5, targetMoves: 16, targetSec: 45 },
    { level: 4, rows: 5, cols: 4, pairs: 10, previewSec: 4.5, targetMoves: 16, targetSec: 45 },
    { level: 5, rows: 5, cols: 6, pairs: 15, previewSec: 4.0, targetMoves: 25, targetSec: 65 },
    { level: 6, rows: 6, cols: 6, pairs: 18, previewSec: 3.5, targetMoves: 30, targetSec: 80 },
    { level: 7, rows: 6, cols: 6, pairs: 18, previewSec: 3.0, targetMoves: 28, targetSec: 75 },
    { level: 8, rows: 6, cols: 7, pairs: 21, previewSec: 3.5, targetMoves: 34, targetSec: 90 },
    { level: 9, rows: 6, cols: 8, pairs: 24, previewSec: 3.5, targetMoves: 38, targetSec: 100 },
    { level: 10, rows: 6, cols: 8, pairs: 24, previewSec: 3.0, targetMoves: 36, targetSec: 95 }
  ];

  // ========================================================
  // WEB AUDIO SYNTHESIZER
  // ========================================================
  class SoundController {
    constructor() {
      this.ctx = null;
      this.muted = localStorage.getItem('arcade_sound_muted') === 'true';
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggle() {
      this.muted = !this.muted;
      localStorage.setItem('arcade_sound_muted', this.muted ? 'true' : 'false');
      return !this.muted;
    }

    playCardFlip() {
      if (this.muted || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(740, now + 0.08);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.09);
      } catch (_) {}
    }

    playMatch() {
      if (this.muted || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio
        notes.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.06);
          gain.gain.setValueAtTime(0.22, now + idx * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.28);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + idx * 0.06);
          osc.stop(now + idx * 0.06 + 0.29);
        });
      } catch (_) {}
    }

    playMismatch() {
      if (this.muted || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const notes = [349.23, 261.63]; // F4, C4 gentle downward tone
        notes.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.1);
          gain.gain.setValueAtTime(0.14, now + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.18);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + idx * 0.1);
          osc.stop(now + idx * 0.1 + 0.19);
        });
      } catch (_) {}
    }

    playCountdownTick() {
      if (this.muted || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.07);
      } catch (_) {}
    }

    playCountdownGo() {
      if (this.muted || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
        gain.gain.setValueAtTime(0.24, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.17);
      } catch (_) {}
    }

    playLevelComplete() {
      if (this.muted || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51]; // C5, E5, G5, C6, E6
        notes.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          gain.gain.setValueAtTime(0.24, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.36);
        });
      } catch (_) {}
    }

    playButtonClick() {
      if (this.muted || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
      } catch (_) {}
    }
  }

  // ========================================================
  // MEMORY MASTER GAME CONTROLLER
  // ========================================================
  class MemoryMasterGame {
    constructor() {
      this.sound = new SoundController();

      // DOM Elements
      this.gameContainer = document.getElementById('gameContainer');
      this.boardArea = document.getElementById('boardArea');
      this.boardGrid = document.getElementById('boardGrid');

      // Top Nav
      this.btnSoundToggle = document.getElementById('btnSoundToggle');
      this.btnPause = document.getElementById('btnPause');

      // In-Game HUD
      this.hudLevel = document.getElementById('hudLevel');
      this.hudScore = document.getElementById('hudScore');
      this.hudMoves = document.getElementById('hudMoves');
      this.hudPairs = document.getElementById('hudPairs');
      this.hudRemaining = document.getElementById('hudRemaining');
      this.hudTime = document.getElementById('hudTime');
      this.hudBest = document.getElementById('hudBest');
      this.pairsProgressBar = document.getElementById('pairsProgressBar');

      // Memorization Banner
      this.memorizeBanner = document.getElementById('memorizeBanner');
      this.memorizeTitle = document.getElementById('memorizeTitle');
      this.memorizeSub = document.getElementById('memorizeSub');
      this.countdownVal = document.getElementById('countdownVal');
      this.memorizeTimerFill = document.getElementById('memorizeTimerFill');

      // Popups & Showcase
      this.comboPopup = document.getElementById('comboPopup');
      this.gemShowcase = document.getElementById('gemShowcase');

      // Screens / Modals
      this.screenMenu = document.getElementById('screenMenu');
      this.screenHelp = document.getElementById('screenHelp');
      this.screenPause = document.getElementById('screenPause');
      this.screenLevelComplete = document.getElementById('screenLevelComplete');
      this.screenGameOver = document.getElementById('screenGameOver');

      // Menu Elements
      this.menuBestScore = document.getElementById('menuBestScore');
      this.menuMaxLevel = document.getElementById('menuMaxLevel');
      this.btnStartGame = document.getElementById('btnStartGame');
      this.btnOpenHelp = document.getElementById('btnOpenHelp');
      this.btnCloseHelp = document.getElementById('btnCloseHelp');

      // Pause Elements
      this.btnResume = document.getElementById('btnResume');
      this.btnRestartLevel = document.getElementById('btnRestartLevel');
      this.btnMenuFromPause = document.getElementById('btnMenuFromPause');

      // Level Complete Elements
      this.lvlCompTitle = document.getElementById('lvlCompTitle');
      this.lvlCompSubtitle = document.getElementById('lvlCompSubtitle');
      this.lvlCompScore = document.getElementById('lvlCompScore');
      this.lvlCompMoves = document.getElementById('lvlCompMoves');
      this.lvlCompTime = document.getElementById('lvlCompTime');
      this.lvlCompRating = document.getElementById('lvlCompRating');
      this.perfectBonusTag = document.getElementById('perfectBonusTag');
      this.btnNextLevel = document.getElementById('btnNextLevel');

      // Game Over Elements
      this.goFinalScore = document.getElementById('goFinalScore');
      this.goFinalLevel = document.getElementById('goFinalLevel');
      this.goFinalMoves = document.getElementById('goFinalMoves');
      this.goBestRecord = document.getElementById('goBestRecord');
      this.goRecordBanner = document.getElementById('goRecordBanner');
      this.btnPlayAgain = document.getElementById('btnPlayAgain');
      this.btnGoMenu = document.getElementById('btnGoMenu');

      // Game State
      this.state = 'MENU'; // 'MENU', 'MEMORIZING', 'PLAYING', 'CHECKING', 'LEVEL_COMPLETE', 'PAUSED', 'GAMEOVER'
      this.currentLevelIndex = 0; // 0-based index into LEVELS
      this.selectedStartingLevel = 1;
      this.score = 0;
      this.levelScore = 0;
      this.moves = 0;
      this.totalMovesSession = 0;
      this.pairsFound = 0;
      this.totalPairs = 6;
      this.streak = 1;
      this.maxStreak = 1;

      // Card Selection
      this.cardsData = [];
      this.firstCard = null;
      this.secondCard = null;
      this.isChecking = false;

      // Timers & Handles (Strictly managed to eliminate memory leaks)
      this.memorizeTimerId = null;
      this.mismatchTimeoutId = null;
      this.elapsedTimerId = null;
      this.comboTimeoutId = null;
      this.previewRemainingMs = 5000;
      this.previewTotalMs = 5000;
      this.elapsedSeconds = 0;

      // High Score Records
      this.highScore = parseInt(localStorage.getItem('memory_master_gem_highscore') || '0', 10);
      this.highestLevel = parseInt(localStorage.getItem('memory_master_gem_max_level') || '1', 10);

      this.init();
    }

    init() {
      this.updateSoundButtonUI();
      this.updateRecordsUI();
      this.renderShowcaseGems();
      this.bindEvents();
    }

    updateSoundButtonUI() {
      if (this.btnSoundToggle) {
        this.btnSoundToggle.textContent = this.sound.muted ? '🔇' : '🔊';
      }
    }

    updateRecordsUI() {
      if (this.hudBest) this.hudBest.textContent = this.highScore;
      if (this.menuBestScore) this.menuBestScore.textContent = this.highScore;
      if (this.menuMaxLevel) this.menuMaxLevel.textContent = this.highestLevel;
    }

    renderShowcaseGems() {
      if (!this.gemShowcase) return;
      this.gemShowcase.innerHTML = '';
      const sample = [GEMS[0], GEMS[1], GEMS[2], GEMS[3], GEMS[4], GEMS[5]];
      sample.forEach(gem => {
        const d = document.createElement('div');
        d.className = 'showcase-gem';
        d.title = gem.name;
        d.innerHTML = gem.svg;
        this.gemShowcase.appendChild(d);
      });
    }

    clearAllTimers() {
      if (this.memorizeTimerId) {
        clearInterval(this.memorizeTimerId);
        this.memorizeTimerId = null;
      }
      if (this.mismatchTimeoutId) {
        clearTimeout(this.mismatchTimeoutId);
        this.mismatchTimeoutId = null;
      }
      if (this.elapsedTimerId) {
        clearInterval(this.elapsedTimerId);
        this.elapsedTimerId = null;
      }
      if (this.comboTimeoutId) {
        clearTimeout(this.comboTimeoutId);
        this.comboTimeoutId = null;
      }
      this.comboPopup?.classList.add('hidden');
    }

    bindEvents() {
      // Sound Toggle
      this.btnSoundToggle?.addEventListener('click', () => {
        this.sound.init();
        this.sound.toggle();
        this.updateSoundButtonUI();
      });

      // Pause Controls
      this.btnPause?.addEventListener('click', () => this.togglePause());
      this.btnResume?.addEventListener('click', () => this.togglePause());
      this.btnRestartLevel?.addEventListener('click', () => {
        this.sound.init();
        this.screenPause?.classList.add('hidden');
        this.startLevel(this.currentLevelIndex);
      });
      this.btnMenuFromPause?.addEventListener('click', () => this.openMainMenu());

      // Start Screen Actions
      this.btnStartGame?.addEventListener('click', () => {
        this.sound.init();
        this.startNewGame(this.selectedStartingLevel);
      });

      this.btnOpenHelp?.addEventListener('click', () => {
        this.sound.init();
        this.sound.playButtonClick();
        this.screenHelp?.classList.remove('hidden');
      });

      this.btnCloseHelp?.addEventListener('click', () => {
        this.sound.init();
        this.sound.playButtonClick();
        this.screenHelp?.classList.add('hidden');
      });

      // Starting Level Chips
      const chips = document.querySelectorAll('.diff-chip');
      chips.forEach(chip => {
        chip.addEventListener('click', () => {
          this.sound.init();
          this.sound.playButtonClick();
          chips.forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          const lvl = parseInt(chip.getAttribute('data-start-level') || '1', 10);
          this.selectedStartingLevel = lvl;
        });
      });

      // Level Complete Next Level Button
      this.btnNextLevel?.addEventListener('click', () => {
        this.sound.init();
        this.sound.playButtonClick();
        this.screenLevelComplete?.classList.add('hidden');
        if (this.currentLevelIndex + 1 < LEVELS.length) {
          this.startLevel(this.currentLevelIndex + 1);
        } else {
          this.triggerVictory();
        }
      });

      // Game Over Buttons
      this.btnPlayAgain?.addEventListener('click', () => {
        this.sound.init();
        this.startNewGame(1);
      });

      this.btnGoMenu?.addEventListener('click', () => this.openMainMenu());

      // Keyboard Controls
      window.addEventListener('keydown', (e) => {
        if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
          if (this.state === 'PLAYING' || this.state === 'PAUSED' || this.state === 'MEMORIZING') {
            this.togglePause();
          }
        } else if (e.key === 'm' || e.key === 'M') {
          this.sound.init();
          this.sound.toggle();
          this.updateSoundButtonUI();
        }
      });
    }

    openMainMenu() {
      this.clearAllTimers();
      this.state = 'MENU';

      this.screenPause?.classList.add('hidden');
      this.screenLevelComplete?.classList.add('hidden');
      this.screenGameOver?.classList.add('hidden');
      this.screenHelp?.classList.add('hidden');

      this.updateRecordsUI();
      this.screenMenu?.classList.remove('hidden');
    }

    togglePause() {
      if (this.state === 'PLAYING' || this.state === 'MEMORIZING') {
        this.pausedPreviousState = this.state;
        this.state = 'PAUSED';

        // Pause timers
        if (this.memorizeTimerId) clearInterval(this.memorizeTimerId);
        if (this.elapsedTimerId) clearInterval(this.elapsedTimerId);

        // Conceal board to prevent cheat memorization
        this.boardArea?.classList.add('hidden');
        this.screenPause?.classList.remove('hidden');
      } else if (this.state === 'PAUSED') {
        this.state = this.pausedPreviousState || 'PLAYING';
        this.screenPause?.classList.add('hidden');
        this.boardArea?.classList.remove('hidden');

        if (this.state === 'MEMORIZING') {
          this.resumeMemorizeTimer();
        } else if (this.state === 'PLAYING') {
          this.resumeElapsedTimer();
        }
      }
    }

    // ========================================================
    // GAME INITIALIZATION & LEVEL START
    // ========================================================
    startNewGame(startingLevel = 1) {
      this.clearAllTimers();
      this.sound.init();

      this.score = 0;
      this.totalMovesSession = 0;
      this.currentLevelIndex = Math.max(0, Math.min(LEVELS.length - 1, startingLevel - 1));

      this.screenMenu?.classList.add('hidden');
      this.screenPause?.classList.add('hidden');
      this.screenLevelComplete?.classList.add('hidden');
      this.screenGameOver?.classList.add('hidden');
      this.screenHelp?.classList.add('hidden');

      this.startLevel(this.currentLevelIndex);
    }

    startLevel(levelIndex) {
      this.clearAllTimers();
      this.currentLevelIndex = levelIndex;
      const cfg = LEVELS[levelIndex];

      this.state = 'MEMORIZING';
      this.firstCard = null;
      this.secondCard = null;
      this.isChecking = false;

      this.moves = 0;
      this.pairsFound = 0;
      this.totalPairs = cfg.pairs;
      this.streak = 1;
      this.levelScore = 0;
      this.elapsedSeconds = 0;

      // Update HUD
      if (this.hudLevel) this.hudLevel.textContent = `${cfg.level}`;
      if (this.hudScore) this.hudScore.textContent = this.score;
      if (this.hudMoves) this.hudMoves.textContent = '0';
      if (this.hudPairs) this.hudPairs.textContent = `0 / ${cfg.pairs}`;
      if (this.hudRemaining) this.hudRemaining.textContent = `${cfg.pairs}`;
      if (this.hudTime) this.hudTime.textContent = '00:00';
      if (this.pairsProgressBar) this.pairsProgressBar.style.width = '0%';

      // Build & Shuffle Board
      this.buildBoard(cfg);

      // Start 5-Second (or configured) Memorization Countdown
      this.startMemorizationPhase(cfg.previewSec);
    }

    buildBoard(cfg) {
      if (!this.boardGrid) return;
      this.boardGrid.innerHTML = '';

      // Set CSS Grid layout dynamically
      this.boardGrid.style.gridTemplateColumns = `repeat(${cfg.cols}, minmax(0, 1fr))`;
      this.boardGrid.style.maxWidth = `${Math.min(720, cfg.cols * 105)}px`;

      // Select cfg.pairs unique gems
      const shuffledGemsPool = [...GEMS].sort(() => Math.random() - 0.5);
      const chosenGems = shuffledGemsPool.slice(0, cfg.pairs);

      // Duplicate each gem to make exact pairs
      const cardPairs = [];
      chosenGems.forEach((gem, idx) => {
        cardPairs.push({ id: gem.id, name: gem.name, color: gem.color, svg: gem.svg, pairIndex: idx });
        cardPairs.push({ id: gem.id, name: gem.name, color: gem.color, svg: gem.svg, pairIndex: idx });
      });

      // Fisher-Yates Fair Shuffle
      for (let i = cardPairs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cardPairs[i], cardPairs[j]] = [cardPairs[j], cardPairs[i]];
      }

      this.cardsData = cardPairs;

      // Render cards in initially face-up (previewing) state
      cardPairs.forEach((item, index) => {
        const cardEl = document.createElement('div');
        cardEl.className = 'card previewing is-flipped';
        cardEl.setAttribute('data-index', index.toString());
        cardEl.setAttribute('data-gem-id', item.id);
        cardEl.setAttribute('role', 'button');
        cardEl.setAttribute('aria-label', `Card ${index + 1}: ${item.name}`);

        cardEl.innerHTML = `
          <div class="card-inner">
            <div class="card-face card-back">
              <div class="card-back-pattern"></div>
              <div class="card-back-rune">✦</div>
            </div>
            <div class="card-face card-front" style="border-color: ${item.color}44;">
              <div class="gem-svg-wrap">${item.svg}</div>
              <span class="gem-name-tag">${item.name}</span>
            </div>
          </div>
        `;

        // Card interaction listener
        cardEl.addEventListener('click', () => this.handleCardClick(cardEl, index));
        this.boardGrid.appendChild(cardEl);
      });
    }

    // ========================================================
    // MEMORIZATION PHASE (5.0s COUNTDOWN)
    // ========================================================
    startMemorizationPhase(durationSec) {
      // Ensure preview time never falls below 3 seconds as required
      const safeDuration = Math.max(3.0, durationSec);
      this.previewTotalMs = Math.round(safeDuration * 1000);
      this.previewRemainingMs = this.previewTotalMs;

      // Update Memorize Banner UI
      if (this.memorizeBanner) {
        this.memorizeBanner.classList.remove('playing-mode');
        this.memorizeBanner.classList.remove('hidden');
      }
      if (this.memorizeTitle) this.memorizeTitle.textContent = 'MEMORIZE THE GEMS!';
      if (this.memorizeSub) {
        this.memorizeSub.innerHTML = `Cards flip face-down in <span class="countdown-val" id="countdownVal">${safeDuration.toFixed(1)}</span>s`;
      }
      if (this.countdownVal) this.countdownVal.textContent = safeDuration.toFixed(1);
      if (this.memorizeTimerFill) this.memorizeTimerFill.style.width = '100%';

      this.sound.playCountdownTick();
      this.resumeMemorizeTimer();
    }

    resumeMemorizeTimer() {
      const stepMs = 50;
      let lastWholeSec = Math.ceil(this.previewRemainingMs / 1000);

      if (this.memorizeTimerId) clearInterval(this.memorizeTimerId);
      this.memorizeTimerId = setInterval(() => {
        if (this.state !== 'MEMORIZING') return;

        this.previewRemainingMs -= stepMs;
        const remainingSec = Math.max(0, this.previewRemainingMs / 1000);
        const ratio = Math.max(0, this.previewRemainingMs / this.previewTotalMs);

        // Update countdown text & bar
        const cdElem = document.getElementById('countdownVal');
        if (cdElem) cdElem.textContent = remainingSec.toFixed(1);
        if (this.memorizeTimerFill) this.memorizeTimerFill.style.width = `${ratio * 100}%`;

        // Play tick on whole seconds
        const currentWholeSec = Math.ceil(remainingSec);
        if (currentWholeSec > 0 && currentWholeSec < lastWholeSec) {
          lastWholeSec = currentWholeSec;
          this.sound.playCountdownTick();
        }

        // Countdown Finished: Automatically flip unmatched cards face-down
        if (this.previewRemainingMs <= 0) {
          clearInterval(this.memorizeTimerId);
          this.memorizeTimerId = null;
          this.endMemorizationPhase();
        }
      }, stepMs);
    }

    endMemorizationPhase() {
      this.state = 'PLAYING';
      this.sound.playCountdownGo();

      // Automatically flip all cards face-down with 3D transition
      const cardEls = this.boardGrid.querySelectorAll('.card');
      cardEls.forEach(card => {
        card.classList.remove('previewing');
        card.classList.remove('is-flipped');
      });

      // Update banner to active playing status
      if (this.memorizeBanner) this.memorizeBanner.classList.add('playing-mode');
      if (this.memorizeTitle) this.memorizeTitle.textContent = 'FIND MATCHING PAIRS! 💎';
      if (this.memorizeSub) this.memorizeSub.textContent = 'Select two cards to reveal their crystals';
      if (this.memorizeTimerFill) this.memorizeTimerFill.style.width = '0%';

      // Start the gameplay elapsed timer
      this.startElapsedTimer();
    }

    startElapsedTimer() {
      if (this.elapsedTimerId) clearInterval(this.elapsedTimerId);
      this.elapsedTimerId = setInterval(() => {
        if (this.state !== 'PLAYING') return;
        this.elapsedSeconds++;
        const mins = Math.floor(this.elapsedSeconds / 60).toString().padStart(2, '0');
        const secs = (this.elapsedSeconds % 60).toString().padStart(2, '0');
        if (this.hudTime) this.hudTime.textContent = `${mins}:${secs}`;
      }, 1000);
    }

    resumeElapsedTimer() {
      this.startElapsedTimer();
    }

    // ========================================================
    // CARD SELECTION & PAIR MATCHING LOGIC
    // ========================================================
    handleCardClick(cardEl, index) {
      // Ignore clicks if not in playing state or currently resolving a mismatch
      if (this.state !== 'PLAYING' || this.isChecking) return;

      // Ignore already matched or already flipped cards
      if (cardEl.classList.contains('matched') || cardEl.classList.contains('is-flipped')) return;

      this.sound.init();

      // First Card Selection
      if (!this.firstCard) {
        this.firstCard = { el: cardEl, index: index, data: this.cardsData[index] };
        cardEl.classList.add('is-flipped');
        this.sound.playCardFlip();
        return;
      }

      // Second Card Selection (Prevent selecting the same card twice)
      if (this.firstCard.index === index) return;

      this.secondCard = { el: cardEl, index: index, data: this.cardsData[index] };
      cardEl.classList.add('is-flipped');
      this.sound.playCardFlip();

      // Increment moves counter
      this.moves++;
      this.totalMovesSession++;
      if (this.hudMoves) this.hudMoves.textContent = this.moves;

      // Lock further clicks while pair is evaluated
      this.isChecking = true;

      // Evaluate Match
      if (this.firstCard.data.id === this.secondCard.data.id) {
        // --- MATCH FOUND ---
        this.handleMatchSuccess();
      } else {
        // --- MISMATCH ---
        this.handleMismatch();
      }
    }

    handleMatchSuccess() {
      const card1 = this.firstCard;
      const card2 = this.secondCard;

      this.sound.playMatch();

      // Keep cards face-up permanently with glowing success aura
      card1.el.classList.add('matched');
      card2.el.classList.add('matched');

      this.pairsFound++;
      const remaining = Math.max(0, this.totalPairs - this.pairsFound);

      // Scoring: Base match points + Streak bonus
      let points = 100;
      if (this.streak >= 2) {
        points = Math.round(points * (1 + (this.streak - 1) * 0.5));
      }
      this.score += points;
      this.levelScore += points;

      // Update streak
      this.streak++;
      if (this.streak > this.maxStreak) this.maxStreak = this.streak;
      if (this.streak >= 2) {
        this.triggerComboPopup(this.streak);
      }

      // Update HUD & Progress Bar
      if (this.hudScore) this.hudScore.textContent = this.score;
      if (this.hudPairs) this.hudPairs.textContent = `${this.pairsFound} / ${this.totalPairs}`;
      if (this.hudRemaining) this.hudRemaining.textContent = `${remaining}`;

      const progressPct = Math.round((this.pairsFound / this.totalPairs) * 100);
      if (this.pairsProgressBar) this.pairsProgressBar.style.width = `${progressPct}%`;

      // Update High Score if beaten
      if (this.score > this.highScore) {
        this.highScore = this.score;
        localStorage.setItem('memory_master_gem_highscore', this.highScore.toString());
        if (this.hudBest) this.hudBest.textContent = this.highScore;
      }

      // Unlock selection
      this.firstCard = null;
      this.secondCard = null;
      this.isChecking = false;

      // Check Level Clear Condition
      if (this.pairsFound >= this.totalPairs) {
        setTimeout(() => this.handleLevelComplete(), 450);
      }
    }

    handleMismatch() {
      const card1 = this.firstCard;
      const card2 = this.secondCard;

      this.sound.playMismatch();

      // Show brief red error outline / wobble effect
      card1.el.classList.add('mismatch');
      card2.el.classList.add('mismatch');

      // Reset streak
      this.streak = 1;

      // IMPORTANT: After ~1 second, flip both cards back face-down.
      // Do NOT restart the game. Player continues seamlessly!
      if (this.mismatchTimeoutId) clearTimeout(this.mismatchTimeoutId);
      this.mismatchTimeoutId = setTimeout(() => {
        this.mismatchTimeoutId = null;

        card1.el.classList.remove('mismatch');
        card2.el.classList.remove('mismatch');
        card1.el.classList.remove('is-flipped');
        card2.el.classList.remove('is-flipped');

        this.firstCard = null;
        this.secondCard = null;
        this.isChecking = false;
      }, 1000);
    }

    triggerComboPopup(streakVal) {
      if (!this.comboPopup) return;
      this.comboPopup.textContent = `💎 COMBO x${streakVal}!`;
      this.comboPopup.classList.remove('hidden');

      if (this.comboTimeoutId) clearTimeout(this.comboTimeoutId);
      this.comboTimeoutId = setTimeout(() => {
        this.comboTimeoutId = null;
        this.comboPopup.classList.add('hidden');
      }, 750);
    }

    // ========================================================
    // LEVEL COMPLETE & VICTORY
    // ========================================================
    handleLevelComplete() {
      this.state = 'LEVEL_COMPLETE';
      this.clearAllTimers();
      this.sound.playLevelComplete();

      const cfg = LEVELS[this.currentLevelIndex];

      // Calculate Speed Bonus
      let speedBonus = 0;
      if (this.elapsedSeconds < cfg.targetSec) {
        speedBonus = (cfg.targetSec - this.elapsedSeconds) * 20;
      }

      // Calculate Perfect Memory / Move Efficiency Bonus
      let moveBonus = 0;
      let isPerfect = false;
      if (this.moves === this.totalPairs) {
        // Zero misses: Flawless recall!
        isPerfect = true;
        moveBonus = 1000 * cfg.level;
      } else if (this.moves <= cfg.targetMoves) {
        moveBonus = 300 * cfg.level;
      }

      const totalLevelGain = this.levelScore + speedBonus + moveBonus;
      this.score += (speedBonus + moveBonus);
      if (this.hudScore) this.hudScore.textContent = this.score;

      // Update High Scores & Highest Level
      if (this.score > this.highScore) {
        this.highScore = this.score;
        localStorage.setItem('memory_master_gem_highscore', this.highScore.toString());
        this.updateRecordsUI();
      }

      const reachedLvl = cfg.level;
      if (reachedLvl > this.highestLevel) {
        this.highestLevel = reachedLvl;
        localStorage.setItem('memory_master_gem_max_level', this.highestLevel.toString());
        this.updateRecordsUI();
      }

      // Populate Level Complete Modal
      if (this.lvlCompTitle) this.lvlCompTitle.textContent = `LEVEL ${cfg.level} CLEARED! ✨`;
      if (this.lvlCompSubtitle) {
        this.lvlCompSubtitle.textContent = `All ${this.totalPairs} crystal pairs synchronized!`;
      }
      if (this.lvlCompScore) this.lvlCompScore.textContent = `+${totalLevelGain}`;
      if (this.lvlCompMoves) this.lvlCompMoves.textContent = `${this.moves} moves`;

      const mins = Math.floor(this.elapsedSeconds / 60).toString().padStart(2, '0');
      const secs = (this.elapsedSeconds % 60).toString().padStart(2, '0');
      if (this.lvlCompTime) this.lvlCompTime.textContent = `${mins}:${secs}`;

      // Rating calculation
      if (this.lvlCompRating) {
        if (isPerfect) {
          this.lvlCompRating.textContent = '⭐⭐⭐ FLAWLESS RECALL';
          this.lvlCompRating.style.color = 'var(--gold)';
        } else if (this.moves <= cfg.targetMoves) {
          this.lvlCompRating.textContent = '⭐⭐ EXCELLENT';
          this.lvlCompRating.style.color = 'var(--emerald)';
        } else {
          this.lvlCompRating.textContent = '⭐ CLEARED';
          this.lvlCompRating.style.color = 'var(--diamond)';
        }
      }

      if (this.perfectBonusTag) {
        if (isPerfect) {
          this.perfectBonusTag.textContent = `💎 PERFECT MEMORY BONUS: +${moveBonus} PTS!`;
          this.perfectBonusTag.classList.remove('hidden');
        } else {
          this.perfectBonusTag.classList.add('hidden');
        }
      }

      // Show celebration modal
      this.screenLevelComplete?.classList.remove('hidden');
    }

    triggerVictory() {
      this.state = 'GAMEOVER';
      this.clearAllTimers();
      this.sound.playLevelComplete();

      const isNewRecord = this.score >= this.highScore && this.score > 0;
      if (isNewRecord) {
        this.highScore = this.score;
        localStorage.setItem('memory_master_gem_highscore', this.highScore.toString());
        this.updateRecordsUI();
      }

      if (this.goFinalScore) this.goFinalScore.textContent = this.score;
      if (this.goFinalLevel) this.goFinalLevel.textContent = `${LEVELS.length} (MAX)`;
      if (this.goFinalMoves) this.goFinalMoves.textContent = this.totalMovesSession;
      if (this.goBestRecord) this.goBestRecord.textContent = this.highScore;

      if (this.goRecordBanner) {
        if (isNewRecord) {
          this.goRecordBanner.classList.remove('hidden');
        } else {
          this.goRecordBanner.classList.add('hidden');
        }
      }

      this.screenGameOver?.classList.remove('hidden');
    }
  }

  // Safe DOM ready bootstrap
  function bootstrap() {
    window.memoryMasterGame = new MemoryMasterGame();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();
