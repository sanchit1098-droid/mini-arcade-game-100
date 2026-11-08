/**
 * Blade Controller & Trail Visualizer
 * Tracks mouse and touch input, renders the glowing blade ribbon,
 * and performs line-to-circle intersection tests for fruit slicing.
 */

class Blade {
    constructor(canvas, soundCtrl, game = null) {
        this.canvas = canvas;
        this.soundCtrl = soundCtrl;
        this.game = game;

        this.points = []; // [{x, y, time}]
        this.isSwiping = false;
        this.maxTrailAge = 140; // ms
        this.lastSwooshTime = 0;

        // Current input coordinates
        this.currentPos = { x: 0, y: 0 };

        this.bindEvents();
    }

    bindEvents() {
        // Pointer Events unify mouse, pen, and touch input.
        // CSS touch-action:none on the canvas prevents browser gestures.
        const getCanvasCoords = (e) => {
            const rect = this.canvas.getBoundingClientRect();

            // Convert viewport coordinates into the game's logical CSS-pixel
            // coordinate system. Do not multiply by devicePixelRatio here:
            // the game context is already scaled for high-DPI rendering.
            const logicalWidth = (this.game && this.game.width) || rect.width;
            const logicalHeight = (this.game && this.game.height) || rect.height;

            return {
                x: rect.width ? (e.clientX - rect.left) * (logicalWidth / rect.width) : 0,
                y: rect.height ? (e.clientY - rect.top) * (logicalHeight / rect.height) : 0
            };
        };

        const onDown = (e) => {
            if (!e.isPrimary || (e.pointerType === 'mouse' && e.button !== 0)) return;
            e.preventDefault();

            if (this.soundCtrl) this.soundCtrl.init();

            this.isSwiping = true;
            const pos = getCanvasCoords(e);
            this.currentPos = pos;
            this.points = [{ x: pos.x, y: pos.y, time: performance.now() }];

            // Keep receiving move/up events even if the pointer leaves the canvas.
            try {
                this.canvas.setPointerCapture(e.pointerId);
            } catch (_) {
                // Pointer capture may be unavailable in older browsers.
            }
        };

        const onMove = (e) => {
            if (!this.isSwiping) return;
            e.preventDefault();

            const pos = getCanvasCoords(e);
            const now = performance.now();
            const last = this.points[this.points.length - 1];

            if (last) {
                const dx = pos.x - last.x;
                const dy = pos.y - last.y;
                const dist = Math.hypot(dx, dy);

                if (dist > 35 && now - this.lastSwooshTime > 220) {
                    if (this.soundCtrl) this.soundCtrl.playSwoosh();
                    this.lastSwooshTime = now;
                }
            }

            this.currentPos = pos;
            this.points.push({ x: pos.x, y: pos.y, time: now });
        };

        const onUp = (e) => {
            if (this.isSwiping) e.preventDefault();
            this.isSwiping = false;
        };

        this.canvas.addEventListener('pointerdown', onDown, { passive: false });
        this.canvas.addEventListener('pointermove', onMove, { passive: false });
        this.canvas.addEventListener('pointerup', onUp, { passive: false });
        this.canvas.addEventListener('pointercancel', onUp, { passive: false });
        this.canvas.addEventListener('lostpointercapture', onUp);
    }

    update() {
        const now = performance.now();
        // Remove points older than maxTrailAge
        this.points = this.points.filter(p => now - p.time < this.maxTrailAge);
    }

    // Check if recent blade strokes cut a circle (fruit/bomb)
    // Checks up to the last 5 segments in the stroke to eliminate tunneling on fast swipes
    // Returns { cut: true, angle, x, y } or null
    checkCollision(circle) {
        if (this.points.length < 2) return null;

        const maxSegments = Math.min(this.points.length - 1, 5);
        for (let i = this.points.length - 1; i >= this.points.length - maxSegments; i--) {
            const p2 = this.points[i];
            const p1 = this.points[i - 1];

            const segDx = p2.x - p1.x;
            const segDy = p2.y - p1.y;
            const segLenSq = segDx * segDx + segDy * segDy;

            if (segLenSq === 0) continue;

            // Project circle center onto line segment
            const u = ((circle.x - p1.x) * segDx + (circle.y - p1.y) * segDy) / segLenSq;
            const clampedU = Math.max(0, Math.min(1, u));

            const closestX = p1.x + clampedU * segDx;
            const closestY = p1.y + clampedU * segDy;

            const distSq = (circle.x - closestX) * (circle.x - closestX) + (circle.y - closestY) * (circle.y - closestY);

            if (distSq <= circle.radius * circle.radius) {
                const angle = Math.atan2(segDy, segDx);
                return {
                    cut: true,
                    angle,
                    x: closestX,
                    y: closestY
                };
            }
        }

        return null;
    }

    draw(ctx) {
        if (this.points.length < 2) return;

        const now = performance.now();

        // 1. Outer Neon Glow Ribbon
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        for (let i = 1; i < this.points.length; i++) {
            const p1 = this.points[i - 1];
            const p2 = this.points[i];

            const age = now - p2.time;
            const life = 1 - Math.min(1, age / this.maxTrailAge);
            if (life <= 0) continue;

            const width = life * 14;

            // Outer cyan/electric glow
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(0, 242, 254, ${life * 0.75})`;
            ctx.lineWidth = width;
            ctx.shadowColor = '#00f2fe';
            ctx.shadowBlur = 12;
            ctx.stroke();

            // Inner white laser core
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${life * 0.95})`;
            ctx.lineWidth = Math.max(2, width * 0.35);
            ctx.shadowBlur = 0;
            ctx.stroke();
        }

        ctx.restore();
    }
}
