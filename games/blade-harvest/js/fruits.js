/**
 * Fruit and Bomb Types, Physics, and Procedural Vector Canvas Rendering
 */

const FRUIT_TYPES = {
    WATERMELON: {
        id: 'watermelon',
        name: 'Watermelon',
        radius: 46,
        points: 1,
        color: '#2ecc71',
        juiceColor: '#e74c3c',
        seedsColor: '#2c3e50',
        weight: 25
    },
    ORANGE: {
        id: 'orange',
        name: 'Orange',
        radius: 38,
        points: 1,
        color: '#f39c12',
        juiceColor: '#ff9f1a',
        seedsColor: '#ffffff',
        weight: 25
    },
    STRAWBERRY: {
        id: 'strawberry',
        name: 'Strawberry',
        radius: 32,
        points: 2,
        color: '#e74c3c',
        juiceColor: '#ff5252',
        seedsColor: '#f1c40f',
        weight: 20
    },
    GREEN_APPLE: {
        id: 'green_apple',
        name: 'Green Apple',
        radius: 38,
        points: 1,
        color: '#27ae60',
        juiceColor: '#2ecc71',
        seedsColor: '#5d4037',
        weight: 20
    },
    KIWI: {
        id: 'kiwi',
        name: 'Kiwi',
        radius: 34,
        points: 2,
        color: '#8d6e63',
        juiceColor: '#7cb342',
        seedsColor: '#212121',
        weight: 15
    },
    PINEAPPLE: {
        id: 'pineapple',
        name: 'Pineapple',
        radius: 42,
        points: 3,
        color: '#f1c40f',
        juiceColor: '#ffeaa7',
        seedsColor: '#d35400',
        weight: 10
    },
    BOMB: {
        id: 'bomb',
        name: 'Bomb',
        radius: 36,
        isBomb: true,
        color: '#2c3e50',
        juiceColor: '#e74c3c',
        weight: 0 // dynamically chosen by game wave
    }
};

class FruitItem {
    constructor(typeId, x, y, vx, vy, gravity) {
        this.type = FRUIT_TYPES[typeId.toUpperCase()] || FRUIT_TYPES.WATERMELON;
        this.isBomb = !!this.type.isBomb;
        this.radius = this.type.radius;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.gravity = gravity;

        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.08;

        this.sliced = false;
        this.sliceAngle = 0;
        this.halves = null;

        this.outOfBounds = false;
        this.missed = false; // For classic 3-lives mode tracking

        // Bomb spark timer
        this.fuseTimer = 0;
    }

    update(dtFactor = 1) {
        if (!this.sliced) {
            this.x += this.vx * dtFactor;
            this.y += this.vy * dtFactor;
            this.vy += this.gravity * dtFactor;
            this.rotation += this.rotationSpeed * dtFactor;
            this.fuseTimer += 0.1 * dtFactor;
        } else if (this.halves) {
            // Update the two sliced halves
            this.halves.forEach(half => {
                half.x += half.vx * dtFactor;
                half.y += half.vy * dtFactor;
                half.vy += this.gravity * 1.15 * dtFactor;
                half.rotation += half.rotationSpeed * dtFactor;
                half.opacity -= 0.008 * dtFactor;
                if (half.opacity < 0) half.opacity = 0;
            });
        }
    }

    slice(sliceAngle) {
        if (this.sliced) return false;
        this.sliced = true;
        this.sliceAngle = sliceAngle;

        if (this.isBomb) {
            return true; // Bomb handled specially
        }

        const impulse = 3.5 + Math.random() * 2.0;
        const perpAngle = sliceAngle + Math.PI / 2;

        const cosP = Math.cos(perpAngle);
        const sinP = Math.sin(perpAngle);

        this.halves = [
            {
                side: -1, // Left half
                x: this.x - cosP * 8,
                y: this.y - sinP * 8,
                vx: this.vx - cosP * impulse,
                vy: this.vy - sinP * impulse,
                rotation: this.rotation,
                rotationSpeed: this.rotationSpeed - 0.07,
                opacity: 1
            },
            {
                side: 1, // Right half
                x: this.x + cosP * 8,
                y: this.y + sinP * 8,
                vx: this.vx + cosP * impulse,
                vy: this.vy + sinP * impulse,
                rotation: this.rotation,
                rotationSpeed: this.rotationSpeed + 0.07,
                opacity: 1
            }
        ];

        return true;
    }

    draw(ctx) {
        if (!this.sliced) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);

            if (this.isBomb) {
                this.drawBomb(ctx);
            } else {
                this.drawWholeFruit(ctx);
            }

            ctx.restore();
        } else if (this.halves && !this.isBomb) {
            // Draw both halves
            this.halves.forEach(half => {
                ctx.save();
                ctx.globalAlpha = Math.max(0, half.opacity);
                ctx.translate(half.x, half.y);
                ctx.rotate(this.sliceAngle); // Align with slice cut
                ctx.rotate(half.side * (half.rotation - this.rotation));

                this.drawHalfFruit(ctx, half.side);
                ctx.restore();
            });
        }
    }

    // ================= PROCEDURAL FRUIT RENDERING ================= //

    drawWholeFruit(ctx) {
        const r = this.radius;

        switch (this.type.id) {
            case 'watermelon':
                this.drawWholeWatermelon(ctx, r);
                break;
            case 'orange':
                this.drawWholeOrange(ctx, r);
                break;
            case 'strawberry':
                this.drawWholeStrawberry(ctx, r);
                break;
            case 'green_apple':
                this.drawWholeGreenApple(ctx, r);
                break;
            case 'kiwi':
                this.drawWholeKiwi(ctx, r);
                break;
            case 'pineapple':
                this.drawWholePineapple(ctx, r);
                break;
            default:
                this.drawWholeWatermelon(ctx, r);
        }
    }

    drawHalfFruit(ctx, side) {
        const r = this.radius;

        switch (this.type.id) {
            case 'watermelon':
                this.drawHalfWatermelon(ctx, r, side);
                break;
            case 'orange':
                this.drawHalfOrange(ctx, r, side);
                break;
            case 'strawberry':
                this.drawHalfStrawberry(ctx, r, side);
                break;
            case 'green_apple':
                this.drawHalfGreenApple(ctx, r, side);
                break;
            case 'kiwi':
                this.drawHalfKiwi(ctx, r, side);
                break;
            case 'pineapple':
                this.drawHalfPineapple(ctx, r, side);
                break;
            default:
                this.drawHalfWatermelon(ctx, r, side);
        }
    }

    // 1. WATERMELON
    drawWholeWatermelon(ctx, r) {
        // Outer dark green rind
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
        grad.addColorStop(0, '#2ecc71');
        grad.addColorStop(0.7, '#1b5e20');
        grad.addColorStop(1, '#0d3813');
        ctx.fillStyle = grad;
        ctx.fill();

        // Striped pattern
        ctx.save();
        ctx.clip();
        ctx.strokeStyle = '#05240b';
        ctx.lineWidth = r * 0.18;
        ctx.lineCap = 'round';
        for (let i = -r; i <= r; i += r * 0.45) {
            ctx.beginPath();
            ctx.moveTo(i, -r * 1.1);
            ctx.quadraticCurveTo(i + r * 0.25, 0, i, r * 1.1);
            ctx.stroke();
        }
        ctx.restore();

        // Shine
        this.drawShine(ctx, -r * 0.3, -r * 0.3, r * 0.35);
    }

    drawHalfWatermelon(ctx, r, side) {
        // side: -1 (left half), 1 (right half)
        // Cut is along x = 0 vertical
        ctx.beginPath();
        if (side === -1) {
            ctx.arc(0, 0, r, Math.PI * 0.5, Math.PI * 1.5, false);
        } else {
            ctx.arc(0, 0, r, Math.PI * 1.5, Math.PI * 0.5, false);
        }
        ctx.closePath();

        // Rind border
        ctx.fillStyle = '#1b5e20';
        ctx.fill();

        // Inner flesh (crimson)
        ctx.beginPath();
        const innerR = r * 0.88;
        if (side === -1) {
            ctx.arc(0, 0, innerR, Math.PI * 0.5, Math.PI * 1.5, false);
        } else {
            ctx.arc(0, 0, innerR, Math.PI * 1.5, Math.PI * 0.5, false);
        }
        ctx.closePath();
        ctx.fillStyle = '#ff3838';
        ctx.fill();

        // White rind pith ring
        ctx.lineWidth = r * 0.08;
        ctx.strokeStyle = '#e8f5e9';
        ctx.stroke();

        // Seeds
        ctx.fillStyle = '#111111';
        const seedAngles = side === -1 ? [2.1, 2.7, 3.4, 4.0] : [-0.9, -0.3, 0.4, 0.9];
        seedAngles.forEach(ang => {
            const sx = Math.cos(ang) * (r * 0.55);
            const sy = Math.sin(ang) * (r * 0.55);
            ctx.beginPath();
            ctx.ellipse(sx, sy, r * 0.07, r * 0.12, ang, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    // 2. ORANGE
    drawWholeOrange(ctx, r) {
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
        grad.addColorStop(0, '#ffa726');
        grad.addColorStop(0.7, '#f57c00');
        grad.addColorStop(1, '#e65100');
        ctx.fillStyle = grad;
        ctx.fill();

        // Orange stem calyx
        ctx.fillStyle = '#2e7d32';
        ctx.beginPath();
        ctx.arc(0, -r * 0.92, r * 0.14, 0, Math.PI * 2);
        ctx.fill();

        this.drawShine(ctx, -r * 0.3, -r * 0.3, r * 0.35);
    }

    drawHalfOrange(ctx, r, side) {
        ctx.beginPath();
        if (side === -1) {
            ctx.arc(0, 0, r, Math.PI * 0.5, Math.PI * 1.5, false);
        } else {
            ctx.arc(0, 0, r, Math.PI * 1.5, Math.PI * 0.5, false);
        }
        ctx.closePath();
        ctx.fillStyle = '#e65100'; // Peel
        ctx.fill();

        // Inner orange segments
        const innerR = r * 0.88;
        ctx.beginPath();
        if (side === -1) {
            ctx.arc(0, 0, innerR, Math.PI * 0.5, Math.PI * 1.5, false);
        } else {
            ctx.arc(0, 0, innerR, Math.PI * 1.5, Math.PI * 0.5, false);
        }
        ctx.closePath();
        ctx.fillStyle = '#fff3e0'; // Pith
        ctx.fill();

        // Segments
        const segmentCount = 4;
        const startA = side === -1 ? Math.PI * 0.55 : -Math.PI * 0.45;
        const step = (Math.PI * 0.9) / segmentCount;

        for (let i = 0; i < segmentCount; i++) {
            const a1 = startA + i * step + 0.05;
            const a2 = a1 + step - 0.1;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, innerR * 0.88, a1, a2);
            ctx.closePath();
            ctx.fillStyle = '#ff9100';
            ctx.fill();
        }

        // Center hub
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.14, 0, Math.PI * 2);
        ctx.fillStyle = '#fff3e0';
        ctx.fill();
    }

    // 3. STRAWBERRY
    drawWholeStrawberry(ctx, r) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, r * 1.05);
        ctx.bezierCurveTo(-r * 1.1, r * 0.4, -r * 1.1, -r * 0.8, 0, -r * 0.85);
        ctx.bezierCurveTo(r * 1.1, -r * 0.8, r * 1.1, r * 0.4, 0, r * 1.05);
        ctx.closePath();

        const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.2, r * 0.1, 0, 0, r * 1.1);
        grad.addColorStop(0, '#ff5252');
        grad.addColorStop(0.7, '#d50000');
        grad.addColorStop(1, '#8b0000');
        ctx.fillStyle = grad;
        ctx.fill();

        // Seeds
        ctx.fillStyle = '#ffeb3b';
        const seedPoints = [
            [-r * 0.4, -r * 0.3], [0, -r * 0.4], [r * 0.4, -r * 0.3],
            [-r * 0.5, 0.1 * r], [-r * 0.1, 0], [r * 0.4, 0.1 * r],
            [-r * 0.25, 0.45 * r], [r * 0.2, 0.45 * r], [0, 0.75 * r]
        ];
        seedPoints.forEach(([sx, sy]) => {
            ctx.beginPath();
            ctx.ellipse(sx, sy, r * 0.05, r * 0.09, 0.2, 0, Math.PI * 2);
            ctx.fill();
        });

        // Leaf crown
        this.drawStrawberryCrown(ctx, r);
        ctx.restore();
    }

    drawStrawberryCrown(ctx, r) {
        ctx.fillStyle = '#43a047';
        for (let a = -0.7; a <= 0.7; a += 0.35) {
            ctx.beginPath();
            ctx.ellipse(Math.sin(a) * r * 0.4, -r * 0.85, r * 0.16, r * 0.36, a, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawHalfStrawberry(ctx, r, side) {
        ctx.beginPath();
        if (side === -1) {
            ctx.moveTo(0, -r * 0.85);
            ctx.bezierCurveTo(-r * 1.1, -r * 0.8, -r * 1.1, r * 0.4, 0, r * 1.05);
        } else {
            ctx.moveTo(0, -r * 0.85);
            ctx.bezierCurveTo(r * 1.1, -r * 0.8, r * 1.1, r * 0.4, 0, r * 1.05);
        }
        ctx.closePath();
        ctx.fillStyle = '#d50000';
        ctx.fill();

        // Inner lighter flesh
        ctx.beginPath();
        if (side === -1) {
            ctx.moveTo(0, -r * 0.6);
            ctx.bezierCurveTo(-r * 0.6, -r * 0.5, -r * 0.6, r * 0.3, 0, r * 0.75);
        } else {
            ctx.moveTo(0, -r * 0.6);
            ctx.bezierCurveTo(r * 0.6, -r * 0.5, r * 0.6, r * 0.3, 0, r * 0.75);
        }
        ctx.closePath();
        ctx.fillStyle = '#ff8a80';
        ctx.fill();

        // Pale core
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 0.15, r * 0.45, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#ffebee';
        ctx.fill();
    }

    // 4. GREEN APPLE
    drawWholeGreenApple(ctx, r) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, -r * 0.7);
        ctx.bezierCurveTo(r * 0.6, -r * 1.1, r * 1.2, -r * 0.2, r * 0.9, r * 0.8);
        ctx.bezierCurveTo(r * 0.6, r * 1.1, -r * 0.6, r * 1.1, -r * 0.9, r * 0.8);
        ctx.bezierCurveTo(-r * 1.2, -r * 0.2, -r * 0.6, -r * 1.1, 0, -r * 0.7);
        ctx.closePath();

        const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
        grad.addColorStop(0, '#aeea00');
        grad.addColorStop(0.7, '#64dd17');
        grad.addColorStop(1, '#2e7d32');
        ctx.fillStyle = grad;
        ctx.fill();

        // Stem
        ctx.strokeStyle = '#4e342e';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, -r * 0.7);
        ctx.quadraticCurveTo(r * 0.2, -r * 1.1, r * 0.3, -r * 1.25);
        ctx.stroke();

        // Green leaf
        ctx.fillStyle = '#1b5e20';
        ctx.beginPath();
        ctx.ellipse(r * 0.25, -r * 1.05, r * 0.2, r * 0.1, -0.6, 0, Math.PI * 2);
        ctx.fill();

        this.drawShine(ctx, -r * 0.35, -r * 0.25, r * 0.3);
        ctx.restore();
    }

    drawHalfGreenApple(ctx, r, side) {
        ctx.beginPath();
        if (side === -1) {
            ctx.moveTo(0, -r * 0.75);
            ctx.bezierCurveTo(-r * 0.6, -r * 1.1, -r * 1.2, -r * 0.2, -r * 0.9, r * 0.8);
            ctx.bezierCurveTo(-r * 0.6, r * 1.1, 0, r * 0.9, 0, r * 0.9);
        } else {
            ctx.moveTo(0, -r * 0.75);
            ctx.bezierCurveTo(r * 0.6, -r * 1.1, r * 1.2, -r * 0.2, r * 0.9, r * 0.8);
            ctx.bezierCurveTo(r * 0.6, r * 1.1, 0, r * 0.9, 0, r * 0.9);
        }
        ctx.closePath();
        ctx.fillStyle = '#388e3c'; // Apple peel
        ctx.fill();

        // Crisp white/cream flesh
        ctx.beginPath();
        if (side === -1) {
            ctx.arc(0, 0, r * 0.85, Math.PI * 0.5, Math.PI * 1.5, false);
        } else {
            ctx.arc(0, 0, r * 0.85, Math.PI * 1.5, Math.PI * 0.5, false);
        }
        ctx.closePath();
        ctx.fillStyle = '#fffde7';
        ctx.fill();

        // Apple core seed
        ctx.fillStyle = '#3e2723';
        ctx.beginPath();
        const sx = side * r * 0.2;
        ctx.ellipse(sx, 0, r * 0.08, r * 0.16, side * 0.3, 0, Math.PI * 2);
        ctx.fill();
    }

    // 5. KIWI
    drawWholeKiwi(ctx, r) {
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 0.9, r * 1.05, 0, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r * 1.1);
        grad.addColorStop(0, '#8d6e63');
        grad.addColorStop(0.8, '#5d4037');
        grad.addColorStop(1, '#3e2723');
        ctx.fillStyle = grad;
        ctx.fill();

        // Subtle fuzzy specks
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        for (let i = 0; i < 8; i++) {
            ctx.beginPath();
            ctx.arc((Math.random() - 0.5) * r * 1.2, (Math.random() - 0.5) * r * 1.2, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
        this.drawShine(ctx, -r * 0.3, -r * 0.3, r * 0.3);
    }

    drawHalfKiwi(ctx, r, side) {
        ctx.beginPath();
        if (side === -1) {
            ctx.arc(0, 0, r, Math.PI * 0.5, Math.PI * 1.5, false);
        } else {
            ctx.arc(0, 0, r, Math.PI * 1.5, Math.PI * 0.5, false);
        }
        ctx.closePath();
        ctx.fillStyle = '#5d4037'; // Skin
        ctx.fill();

        // Emerald pulp
        const innerR = r * 0.9;
        ctx.beginPath();
        if (side === -1) {
            ctx.arc(0, 0, innerR, Math.PI * 0.5, Math.PI * 1.5, false);
        } else {
            ctx.arc(0, 0, innerR, Math.PI * 1.5, Math.PI * 0.5, false);
        }
        ctx.closePath();
        ctx.fillStyle = '#7cb342';
        ctx.fill();

        // Pale creamy core
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 0.25, r * 0.45, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#e8f5e9';
        ctx.fill();

        // Kiwi black seeds radiating
        ctx.fillStyle = '#212121';
        const startA = side === -1 ? Math.PI * 0.55 : -Math.PI * 0.45;
        for (let i = 0; i < 6; i++) {
            const a = startA + i * ((Math.PI * 0.9) / 5);
            const sx = Math.cos(a) * (r * 0.48);
            const sy = Math.sin(a) * (r * 0.6);
            ctx.beginPath();
            ctx.ellipse(sx, sy, 2, 4, a, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // 6. PINEAPPLE
    drawWholePineapple(ctx, r) {
        // Oval body
        ctx.beginPath();
        ctx.ellipse(0, r * 0.1, r * 0.85, r * 1.05, 0, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(-r * 0.2, -r * 0.2, r * 0.1, 0, 0, r * 1.2);
        grad.addColorStop(0, '#fbc02d');
        grad.addColorStop(0.7, '#f57f17');
        grad.addColorStop(1, '#e65100');
        ctx.fillStyle = grad;
        ctx.fill();

        // Diamond scale lines
        ctx.save();
        ctx.clip();
        ctx.strokeStyle = 'rgba(110, 40, 0, 0.4)';
        ctx.lineWidth = 2.5;
        for (let d = -r * 2; d <= r * 2; d += r * 0.4) {
            ctx.beginPath();
            ctx.moveTo(d, -r * 1.5);
            ctx.lineTo(d + r * 1.8, r * 1.5);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(d, r * 1.5);
            ctx.lineTo(d + r * 1.8, -r * 1.5);
            ctx.stroke();
        }
        ctx.restore();

        // Spiky green crown leaves
        ctx.fillStyle = '#2e7d32';
        for (let la = -0.6; la <= 0.6; la += 0.3) {
            ctx.beginPath();
            ctx.moveTo(0, -r * 0.8);
            ctx.lineTo(Math.sin(la) * r * 0.6, -r * 1.4);
            ctx.lineTo(Math.sin(la + 0.15) * r * 0.3, -r * 0.8);
            ctx.closePath();
            ctx.fill();
        }
    }

    drawHalfPineapple(ctx, r, side) {
        ctx.beginPath();
        if (side === -1) {
            ctx.arc(0, 0, r, Math.PI * 0.5, Math.PI * 1.5, false);
        } else {
            ctx.arc(0, 0, r, Math.PI * 1.5, Math.PI * 0.5, false);
        }
        ctx.closePath();
        ctx.fillStyle = '#e65100'; // Rind
        ctx.fill();

        // Golden juicy flesh
        const innerR = r * 0.88;
        ctx.beginPath();
        if (side === -1) {
            ctx.arc(0, 0, innerR, Math.PI * 0.5, Math.PI * 1.5, false);
        } else {
            ctx.arc(0, 0, innerR, Math.PI * 1.5, Math.PI * 0.5, false);
        }
        ctx.closePath();
        ctx.fillStyle = '#fff176';
        ctx.fill();

        // Tough inner core
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = '#fbc02d';
        ctx.fill();
    }

    // 7. BOMB
    drawBomb(ctx) {
        const r = this.radius;

        // Shadow / Outer sphere
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.08, 0, 0, r);
        grad.addColorStop(0, '#546e7a');
        grad.addColorStop(0.4, '#263238');
        grad.addColorStop(1, '#0a0d0e');
        ctx.fillStyle = grad;
        ctx.fill();

        // Skull or warning red hazard ring
        ctx.strokeStyle = '#ff1744';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.58, 0, Math.PI * 2);
        ctx.stroke();

        // Exclamation mark
        ctx.fillStyle = '#ff1744';
        ctx.fillRect(-r * 0.08, -r * 0.36, r * 0.16, r * 0.44);
        ctx.beginPath();
        ctx.arc(0, r * 0.24, r * 0.09, 0, Math.PI * 2);
        ctx.fill();

        // Metal neck cap
        ctx.fillStyle = '#78909c';
        ctx.fillRect(-r * 0.25, -r * 1.15, r * 0.5, r * 0.25);

        // Fuse rope
        ctx.strokeStyle = '#8d6e63';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, -r * 1.15);
        ctx.quadraticCurveTo(r * 0.4, -r * 1.4, r * 0.3, -r * 1.65);
        ctx.stroke();

        // Glowing burning fuse spark
        const sparkX = r * 0.3;
        const sparkY = -r * 1.65;

        const sparkR = 7 + Math.sin(this.fuseTimer * 20) * 3;
        const sparkGrad = ctx.createRadialGradient(sparkX, sparkY, 1, sparkX, sparkY, sparkR);
        sparkGrad.addColorStop(0, '#ffffff');
        sparkGrad.addColorStop(0.3, '#ffeb3b');
        sparkGrad.addColorStop(0.8, '#ff5722');
        sparkGrad.addColorStop(1, 'rgba(255, 87, 34, 0)');

        ctx.fillStyle = sparkGrad;
        ctx.beginPath();
        ctx.arc(sparkX, sparkY, sparkR, 0, Math.PI * 2);
        ctx.fill();

        // Extra dynamic spark particles
        ctx.fillStyle = '#fff700';
        for (let i = 0; i < 4; i++) {
            const sa = this.fuseTimer * 15 + i * 1.6;
            const dist = 5 + (i * 3) % 9;
            ctx.beginPath();
            ctx.arc(sparkX + Math.cos(sa) * dist, sparkY + Math.sin(sa) * dist, 1.8, 0, Math.PI * 2);
            ctx.fill();
        }

        // Specular highlight on bomb body
        this.drawShine(ctx, -r * 0.35, -r * 0.35, r * 0.3);
    }

    drawShine(ctx, x, y, radius) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        const shineGrad = ctx.createRadialGradient(x, y, 0, x, y, radius);
        shineGrad.addColorStop(0, 'rgba(255, 255, 255, 0.55)');
        shineGrad.addColorStop(0.6, 'rgba(255, 255, 255, 0.15)');
        shineGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = shineGrad;
        ctx.fill();
        ctx.restore();
    }
}
