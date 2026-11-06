/**
 * Particle System: Juice Splatters, Sparks, Floating Text, and Explosions
 */

class ParticleSystem {
    constructor() {
        this.particles = [];
        this.floatingTexts = [];
        this.splashes = [];
        this.shockwaves = [];
        this.screenFlashAlpha = 0;
        this.shakeTime = 0;
        this.shakeIntensity = 0;
    }

    reset() {
        this.particles = [];
        this.floatingTexts = [];
        this.splashes = [];
        this.shockwaves = [];
        this.screenFlashAlpha = 0;
        this.shakeTime = 0;
        this.shakeIntensity = 0;
    }

    // Trigger juice splatter when fruit is sliced
    createJuiceSplash(x, y, color, count = 22, sliceAngle = 0) {
        // Splat on background
        this.splashes.push({
            x,
            y,
            radius: 20 + Math.random() * 25,
            color,
            alpha: 0.38,
            decay: 0.003
        });

        // Directional juice droplets
        const perp = sliceAngle + Math.PI / 2;
        for (let i = 0; i < count; i++) {
            const side = Math.random() > 0.5 ? 1 : -1;
            const spread = (Math.random() - 0.5) * 1.2;
            const speed = 3.5 + Math.random() * 6.5;
            const dir = perp * side + spread;

            this.particles.push({
                x,
                y,
                vx: Math.cos(dir) * speed,
                vy: Math.sin(dir) * speed,
                radius: 2.5 + Math.random() * 4,
                color,
                alpha: 1,
                decay: 0.02 + Math.random() * 0.015,
                gravity: 0.28,
                drag: 0.98
            });
        }
    }

    // Trigger bomb explosion
    createExplosion(x, y) {
        this.screenFlashAlpha = 0.85;
        this.shakeTime = 22; // frames
        this.shakeIntensity = 18;

        // Expanding shockwave ring
        this.shockwaves.push({
            x,
            y,
            radius: 10,
            maxRadius: 180,
            speed: 9,
            alpha: 1,
            color: '#ff5722'
        });

        // Fire & smoke particles
        const colors = ['#ffffff', '#ffeb3b', '#ff9800', '#f44336', '#424242', '#212121'];
        for (let i = 0; i < 55; i++) {
            const ang = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 11;
            const col = colors[Math.floor(Math.random() * colors.length)];

            this.particles.push({
                x,
                y,
                vx: Math.cos(ang) * speed,
                vy: Math.sin(ang) * speed,
                radius: 4 + Math.random() * 8,
                color: col,
                alpha: 1,
                decay: 0.015 + Math.random() * 0.02,
                gravity: 0.08,
                drag: 0.96
            });
        }
    }

    // Add floating text (+1, COMBO x3, etc.)
    addFloatingText(text, x, y, options = {}) {
        this.floatingTexts.push({
            text,
            x,
            y,
            color: options.color || '#ffffff',
            size: options.size || 24,
            glow: options.glow || null,
            vy: -2.2,
            alpha: 1,
            decay: 0.022,
            scale: 0.6,
            targetScale: options.targetScale || 1.15
        });
    }

    update(dtFactor = 1) {
        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dtFactor;
            p.y += p.vy * dtFactor;
            p.vy += p.gravity * dtFactor;
            p.vx *= Math.pow(p.drag, dtFactor);
            p.vy *= Math.pow(p.drag, dtFactor);
            p.alpha -= p.decay * dtFactor;

            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // Update floating texts
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const ft = this.floatingTexts[i];
            ft.y += ft.vy * dtFactor;
            ft.alpha -= ft.decay * dtFactor;
            if (ft.scale < ft.targetScale) {
                ft.scale += 0.08 * dtFactor;
            }
            if (ft.alpha <= 0) {
                this.floatingTexts.splice(i, 1);
            }
        }

        // Update splashes
        for (let i = this.splashes.length - 1; i >= 0; i--) {
            const sp = this.splashes[i];
            sp.alpha -= sp.decay * dtFactor;
            if (sp.alpha <= 0) {
                this.splashes.splice(i, 1);
            }
        }

        // Update shockwaves
        for (let i = this.shockwaves.length - 1; i >= 0; i--) {
            const sw = this.shockwaves[i];
            sw.radius += sw.speed * dtFactor;
            sw.alpha = 1 - (sw.radius / sw.maxRadius);
            if (sw.radius >= sw.maxRadius || sw.alpha <= 0) {
                this.shockwaves.splice(i, 1);
            }
        }

        // Screen flash
        if (this.screenFlashAlpha > 0) {
            this.screenFlashAlpha -= 0.04 * dtFactor;
            if (this.screenFlashAlpha < 0) this.screenFlashAlpha = 0;
        }

        // Screen shake
        if (this.shakeTime > 0) {
            this.shakeTime -= dtFactor;
            if (this.shakeTime <= 0) {
                this.shakeTime = 0;
                this.shakeIntensity = 0;
            }
        }
    }

    getShakeOffset() {
        if (this.shakeTime <= 0) return { x: 0, y: 0 };
        const factor = this.shakeTime / 22;
        const currentIntensity = this.shakeIntensity * factor;
        return {
            x: (Math.random() - 0.5) * currentIntensity * 2,
            y: (Math.random() - 0.5) * currentIntensity * 2
        };
    }

    drawSplashes(ctx) {
        ctx.save();
        for (const sp of this.splashes) {
            ctx.globalAlpha = Math.max(0, sp.alpha);
            ctx.fillStyle = sp.color;
            ctx.beginPath();
            ctx.arc(sp.x, sp.y, sp.radius, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    drawParticles(ctx) {
        ctx.save();
        for (const p of this.particles) {
            ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, Math.max(0.5, p.radius), 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    drawShockwaves(ctx) {
        ctx.save();
        for (const sw of this.shockwaves) {
            ctx.globalAlpha = Math.max(0, sw.alpha);
            ctx.lineWidth = 6;
            ctx.strokeStyle = sw.color;
            ctx.beginPath();
            ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();
    }

    drawFloatingTexts(ctx) {
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (const ft of this.floatingTexts) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, ft.alpha);
            ctx.translate(ft.x, ft.y);
            ctx.scale(ft.scale, ft.scale);

            ctx.font = `900 ${ft.size}px 'Montserrat', 'Segoe UI', sans-serif`;

            // Text stroke / outline for readability
            ctx.lineWidth = 5;
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.strokeText(ft.text, 0, 0);

            if (ft.glow) {
                ctx.shadowColor = ft.glow;
                ctx.shadowBlur = 14;
            }

            ctx.fillStyle = ft.color;
            ctx.fillText(ft.text, 0, 0);

            ctx.restore();
        }
        ctx.restore();
    }

    drawFlash(ctx, width, height) {
        if (this.screenFlashAlpha > 0) {
            ctx.save();
            ctx.fillStyle = `rgba(255, 230, 200, ${this.screenFlashAlpha})`;
            ctx.fillRect(0, 0, width, height);
            ctx.restore();
        }
    }
}
