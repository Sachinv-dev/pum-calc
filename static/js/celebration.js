/*
 * A* Grade Celebration Animation
 * Optimized fountain with wide spread
 * Developed by Sachin V with Perplexity AI
 */

class FountainStream {
    constructor(canvas, x, y, angle) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.baseX = x;
        this.baseY = y;
        this.angle = angle;
        this.stars = [];
        this.active = true;
        this.emissionRate = 2; // Reduced from 3 to 2
        this.frameCount = 0;
        this.maxFrames = 30;
    }

    emitStars() {
        for (let i = 0; i < this.emissionRate; i++) {
            const spreadAngle = this.angle + (Math.random() - 0.5) * 0.6; // Wider: 0.6 instead of 0.2
            const speed = 10 + Math.random() * 12; // More speed variance

            // Add extra horizontal boost for spread
            const horizontalBoost = (Math.random() - 0.5) * 4;

            this.stars.push({
                x: this.baseX + (Math.random() - 0.5) * 30,
                y: this.baseY,
                vx: Math.cos(spreadAngle) * speed + horizontalBoost,
                vy: Math.sin(spreadAngle) * speed,
                size: 4 + Math.random() * 4,
                growthRate: 0.05 + Math.random() * 0.03,
                maxSize: 10 + Math.random() * 6,
                life: 1.5,
                decay: 0.004 + Math.random() * 0.003,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.15,
                brightness: 0.85 + Math.random() * 0.15,
                age: 0,
                trail: [],
                trailLength: 8
            });
        }
    }

    drawStar(x, y, size, rotation, opacity, brightness) {
        const ctx = this.ctx;
        const spikes = 5;
        const outerRadius = size;
        const innerRadius = size * 0.4;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.beginPath();

        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI) / spikes;
            const px = Math.cos(angle) * radius;
            const py = Math.sin(angle) * radius;

            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }

        ctx.closePath();

        const finalOpacity = opacity * brightness;
        ctx.shadowBlur = 20 * brightness;
        ctx.shadowColor = `rgba(255, 255, 255, ${finalOpacity * 0.8})`;
        ctx.fillStyle = `rgba(255, 255, 255, ${finalOpacity})`;
        ctx.fill();

        ctx.shadowBlur = 10;
        ctx.fillStyle = 'rgba(255, 255, 255, 1)';
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.35, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    drawTrail(trail, opacity) {
        if (trail.length < 2) return;

        const ctx = this.ctx;
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(trail[0].x, trail[0].y);

        for (let i = 1; i < trail.length; i++) {
            const alpha = (i / trail.length) * opacity;
            ctx.globalAlpha = alpha;
            ctx.lineTo(trail[i].x, trail[i].y);
        }

        ctx.stroke();
        ctx.restore();
    }

    update() {
        this.frameCount++;

        if (this.frameCount < this.maxFrames) {
            this.emitStars();
        }

        this.stars.forEach(star => {
            star.age++;

            star.trail.push({ x: star.x, y: star.y });
            if (star.trail.length > star.trailLength) {
                star.trail.shift();
            }

            star.x += star.vx;
            star.y += star.vy;
            star.vy += 0.18; // Gravity
            star.vx *= 0.992; // Less air resistance for more spread
            star.rotation += star.rotationSpeed;
            star.life -= star.decay;

            if (star.size < star.maxSize) {
                star.size += star.growthRate;
            }
        });

        this.stars = this.stars.filter(s => s.life > 0);

        this.active = this.stars.length > 0 || this.frameCount < this.maxFrames;
        return this.active;
    }

    draw() {
        this.stars.forEach(star => {
            if (star.life > 0) {
                const opacity = Math.max(0, star.life / 1.5);
                this.drawTrail(star.trail, opacity);
                this.drawStar(star.x, star.y, star.size, star.rotation, opacity, star.brightness);
            }
        });
    }
}

class CelebrationCanvas {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.streams = [];
        this.animationFrame = null;
        this.frameCount = 0;
    }

    init() {
        console.log('🎉 Initializing celebration canvas...');

        const oldCanvas = document.getElementById('celebrationCanvas');
        if (oldCanvas) {
            oldCanvas.remove();
        }

        this.canvas = document.createElement('canvas');
        this.canvas.id = 'celebrationCanvas';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 10000;
            background: transparent;
        `;

        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');

        this.resize();
        window.addEventListener('resize', () => this.resize());

        console.log('✅ Canvas created:', this.canvas.width, 'x', this.canvas.height);
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    getTerrainPosition() {
        const spawnY = window.innerHeight - 80;
        console.log('📍 Spawn at:', spawnY);
        return spawnY;
    }

    triggerBurst() {
        console.log('🌟 Triggering A* celebration!');

        const terrainY = this.getTerrainPosition();
        const centerX = this.canvas.width / 2;

        console.log(`🎯 Launch from: (${centerX}, ${terrainY})`);

        const numStreams = 5 + Math.floor(Math.random() * 2);

        // First stream with wider initial angle
        const firstAngle = -Math.PI / 2 + (Math.random() - 0.5) * 0.5;
        const firstOffsetX = (Math.random() - 0.5) * 300; // Wider spawn spread
        this.streams.push(new FountainStream(
            this.canvas,
            centerX + firstOffsetX,
            terrainY,
            firstAngle
        ));
        console.log('⛲ Stream 1/' + numStreams + ' started');

        for (let i = 1; i < numStreams; i++) {
            setTimeout(() => {
                const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.5;
                const offsetX = (Math.random() - 0.5) * 300;
                this.streams.push(new FountainStream(
                    this.canvas,
                    centerX + offsetX,
                    terrainY,
                    angle
                ));
                console.log(`⛲ Stream ${i + 1}/${numStreams} started`);
            }, i * 120);
        }

        this.animate();
    }

    animate() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }

        this.frameCount = 0;

        const loop = () => {
            this.frameCount++;

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            let totalStars = 0;
            this.streams = this.streams.filter(stream => {
                stream.update();
                stream.draw();
                totalStars += stream.stars.length;
                return stream.active;
            });

            if (this.frameCount % 30 === 0) {
                console.log(`🎬 Frame ${this.frameCount}: ${this.streams.length} streams, ${totalStars} stars`);
            }

            if (this.streams.length > 0 || this.frameCount < 600) {
                this.animationFrame = requestAnimationFrame(loop);
            } else {
                this.animationFrame = null;
                console.log(`✨ Complete after ${this.frameCount} frames`);
            }
        };

        console.log('🎬 Starting animation...');
        loop();
    }

    cleanup() {
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }
}

// Global celebration instance
let celebration = new CelebrationCanvas();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        celebration.init();
    });
} else {
    celebration.init();
}

function triggerAStarCelebration() {
    console.log('🎊 triggerAStarCelebration() called!');

    if (celebration && celebration.canvas) {
        celebration.triggerBurst();
    } else {
        console.error('❌ Canvas not initialized!');
        celebration = new CelebrationCanvas();
        celebration.init();
        setTimeout(() => celebration.triggerBurst(), 100);
    }
}

window.triggerAStarCelebration = triggerAStarCelebration;

console.log('✅ celebration.js loaded successfully');
