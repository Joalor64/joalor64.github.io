(function () {
    const canvas = document.createElement('canvas');
    canvas.id = 'bubbleCanvas';

    const wrapper = document.createElement('div');
    wrapper.id = 'bubble-game-wrapper';
    wrapper.style.cssText = 'position:relative;width:90%;max-width:900px;height:500px;margin:20px auto;border-radius:24px;overflow:hidden;box-shadow:0 8px 32px rgba(58,124,255,0.2);border:3px solid #fff;background:linear-gradient(135deg,#a1c4fd 0%,#3a7cff 100%);';
    wrapper.appendChild(canvas);

    const firstScript = document.querySelector('script');
    if (firstScript) {
        firstScript.parentNode.insertBefore(wrapper, firstScript);
    } else {
        document.body.appendChild(wrapper);
    }

    const ui = document.createElement('div');
    ui.id = 'bubble-ui';
    ui.innerHTML = `
        <div style="position:absolute;top:12px;left:20px;font-family:'Poppins','Jua',sans-serif;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,0.3);pointer-events:none;user-select:none;">
            <div style="font-size:2em;font-weight:bold;">Score: <span id="bubbleScore">0</span></div>
            <div style="font-size:1.1em;opacity:0.9;">Best: <span id="bubbleBest">0</span></div>
            <div id="comboDisplay" style="font-size:1.3em;color:#ffeb3b;opacity:0;transition:opacity 0.3s;font-weight:bold;margin-top:4px;">x1 Combo</div>
        </div>
        <div style="position:absolute;top:12px;right:20px;font-family:'Poppins','Jua',sans-serif;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,0.3);pointer-events:none;user-select:none;text-align:right;">
            <div style="font-size:0.9em;opacity:0.8;">Click bubbles to pop!</div>
            <div id="frenzyDisplay" style="font-size:1.2em;color:#ff4081;font-weight:bold;opacity:0;transition:opacity 0.3s;margin-top:4px;">🔥 FRENZY MODE 🔥</div>
        </div>
    `;
    wrapper.appendChild(ui);

    const ctx = canvas.getContext('2d');
    let W, H;

    function resize() {
        const rect = wrapper.getBoundingClientRect();
        W = canvas.width = rect.width;
        H = canvas.height = rect.height;
    }
    resize();
    window.addEventListener('resize', resize);

    const state = {
        score: 0,
        best: 0,
        combo: 0,
        comboTimer: 0,
        bubbles: [],
        particles: [],
        floatingTexts: [],
        trailBubbles: [],
        shake: 0,
        bgHue: 200,
        spawnTimer: 0,
        frenzyMode: false,
        frenzyTimer: 0,
        rainbowReady: false,
        popsUntilRainbow: 10,
        totalPops: 0
    };

    document.getElementById('bubbleBest').textContent = state.best;

    const bubbleImg = new Image();
    bubbleImg.src = '../img/bubble.png';
    let imgReady = false;
    bubbleImg.onload = () => { imgReady = true; };

    function drawFallbackBubble(ctx, x, y, size, rotation, opacity, tint) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.globalAlpha = opacity;

        const r = size / 2;
        const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
        grad.addColorStop(0, 'rgba(255,255,255,0.8)');
        grad.addColorStop(0.5, tint || 'rgba(100,200,255,0.6)');
        grad.addColorStop(1, 'rgba(50,150,255,0.3)');

        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(-r * 0.3, -r * 0.3, r * 0.25, r * 0.15, -0.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fill();

        ctx.restore();
    }

    class Bubble {
        constructor(type = 'basic') {
            this.type = type;
            this.size = 40 + Math.random() * 60;
            if (type === 'rainbow') this.size = 70 + Math.random() * 30;
            this.radius = this.size / 2;

            const edge = Math.floor(Math.random() * 4);
            if (edge === 0) { this.x = Math.random() * W; this.y = -this.radius; }
            else if (edge === 1) { this.x = W + this.radius; this.y = Math.random() * H; }
            else if (edge === 2) { this.x = Math.random() * W; this.y = H + this.radius; }
            else { this.x = -this.radius; this.y = Math.random() * H; }

            const speed = type === 'speedy' ? 2 + Math.random() * 2 :
                type === 'rainbow' ? 1.5 + Math.random() :
                    0.5 + Math.random() * 1.5;
            const angle = Math.random() * Math.PI * 2;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;

            this.rotation = Math.random() * Math.PI * 2;
            this.rotationSpeed = (Math.random() - 0.5) * 0.04;

            this.wobbleOffset = Math.random() * Math.PI * 2;
            this.wobbleSpeed = 0.02 + Math.random() * 0.03;
            this.wobbleAmp = 0.5 + Math.random() * 1.5;

            this.orbitCenter = { x: this.x, y: this.y };
            this.orbitAngle = Math.random() * Math.PI * 2;
            this.orbitRadius = 30 + Math.random() * 50;
            this.orbitSpeed = 0.03 + Math.random() * 0.04;

            this.opacity = 0;
            this.fadeIn = true;
            this.life = 0;
            this.maxLife = 600 + Math.random() * 600;

            this.popped = false;
            this.trailTimer = 0;

            this.tint = null;
            if (type === 'zigzag') this.tint = 'rgba(255,200,100,0.5)';
            else if (type === 'speedy') this.tint = 'rgba(255,100,100,0.5)';
            else if (type === 'orbiter') this.tint = 'rgba(150,255,150,0.5)';
            else if (type === 'rainbow') this.tint = 'rgba(255,255,255,0.3)';
        }

        update() {
            if (this.popped) return;
            this.life++;

            if (this.fadeIn) {
                this.opacity += 0.03;
                if (this.opacity >= 1) { this.opacity = 1; this.fadeIn = false; }
            } else if (this.life > this.maxLife - 60 && this.type !== 'rainbow') {
                this.opacity -= 0.015;
                if (this.opacity <= 0) this.popped = true;
            }

            this.rotation += this.rotationSpeed;

            if (this.type === 'basic') {
                this.x += this.vx + Math.sin(this.life * this.wobbleSpeed + this.wobbleOffset) * this.wobbleAmp;
                this.y += this.vy + Math.cos(this.life * this.wobbleSpeed * 0.7 + this.wobbleOffset) * this.wobbleAmp * 0.5;
            } else if (this.type === 'zigzag') {
                this.x += this.vx + Math.sin(this.life * 0.08) * 3;
                this.y += this.vy;
                this.rotationSpeed += Math.sin(this.life * 0.05) * 0.002;
            } else if (this.type === 'speedy') {
                this.x += this.vx * (1 + Math.sin(this.life * 0.1) * 0.5);
                this.y += this.vy * (1 + Math.cos(this.life * 0.1) * 0.5);
                if (this.x < this.radius || this.x > W - this.radius) this.vx *= -1;
                if (this.y < this.radius || this.y > H - this.radius) this.vy *= -1;
            } else if (this.type === 'orbiter') {
                this.orbitAngle += this.orbitSpeed;
                this.x = this.orbitCenter.x + Math.cos(this.orbitAngle) * this.orbitRadius + this.vx * 0.3;
                this.y = this.orbitCenter.y + Math.sin(this.orbitAngle) * this.orbitRadius + this.vy * 0.3;
                this.orbitCenter.x += this.vx * 0.2;
                this.orbitCenter.y += this.vy * 0.2;
            } else if (this.type === 'rainbow') {
                this.x += this.vx + Math.sin(this.life * 0.06) * 2;
                this.y += this.vy + Math.cos(this.life * 0.04) * 2;
                this.rotation += 0.02;

                this.trailTimer++;
                if (this.trailTimer % 3 === 0) {
                    state.trailBubbles.push({
                        x: this.x + (Math.random() - 0.5) * 10,
                        y: this.y + (Math.random() - 0.5) * 10,
                        size: this.size * 0.3,
                        opacity: 0.6,
                        hue: (this.life * 2) % 360
                    });
                }
            }

            if (this.type !== 'speedy') {
                const margin = this.radius + 50;
                if (this.x < -margin) this.x = W + margin;
                if (this.x > W + margin) this.x = -margin;
                if (this.y < -margin) this.y = H + margin;
                if (this.y > H + margin) this.y = -margin;
            }
        }

        draw(ctx) {
            if (this.popped || this.opacity <= 0) return;

            if (this.type === 'rainbow') {
                const hue = (this.life * 2) % 360;
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotation);
                ctx.globalAlpha = this.opacity;

                const glow = ctx.createRadialGradient(0, 0, this.radius * 0.5, 0, 0, this.radius * 1.5);
                glow.addColorStop(0, `hsla(${hue}, 100%, 70%, 0.4)`);
                glow.addColorStop(1, `hsla(${hue}, 100%, 50%, 0)`);
                ctx.fillStyle = glow;
                ctx.beginPath();
                ctx.arc(0, 0, this.radius * 1.5, 0, Math.PI * 2);
                ctx.fill();

                if (imgReady) {
                    ctx.globalCompositeOperation = 'source-atop';
                    ctx.drawImage(bubbleImg, -this.radius, -this.radius, this.size, this.size);
                    ctx.globalCompositeOperation = 'source-over';
                    ctx.fillStyle = `hsla(${hue}, 80%, 60%, 0.3)`;
                    ctx.beginPath();
                    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    drawFallbackBubble(ctx, 0, 0, this.size, 0, 1, `hsla(${hue}, 80%, 60%, 0.3)`);
                }
                ctx.restore();
            } else {
                if (imgReady) {
                    ctx.save();
                    ctx.translate(this.x, this.y);
                    ctx.rotate(this.rotation);
                    ctx.globalAlpha = this.opacity;
                    if (this.tint) {
                        ctx.globalCompositeOperation = 'source-atop';
                    }
                    ctx.drawImage(bubbleImg, -this.radius, -this.radius, this.size, this.size);
                    if (this.tint) {
                        ctx.globalCompositeOperation = 'source-over';
                        ctx.fillStyle = this.tint;
                        ctx.beginPath();
                        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    ctx.restore();
                } else {
                    drawFallbackBubble(ctx, this.x, this.y, this.size, this.rotation, this.opacity, this.tint);
                }
            }
        }

        contains(mx, my) {
            const dx = mx - this.x;
            const dy = my - this.y;
            return Math.sqrt(dx * dx + dy * dy) < this.radius;
        }
    }

    class Particle {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 4;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            this.size = 3 + Math.random() * 6;
            this.life = 1;
            this.decay = 0.02 + Math.random() * 0.03;
            this.color = color || `rgba(150,220,255,${this.life})`;
            this.gravity = 0.05;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vy += this.gravity;
            this.life -= this.decay;
            this.size *= 0.98;
        }
        draw(ctx) {
            if (this.life <= 0) return;
            ctx.globalAlpha = this.life;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }

    class FloatingText {
        constructor(x, y, text, color, size = 20) {
            this.x = x;
            this.y = y;
            this.text = text;
            this.color = color || '#fff';
            this.size = size;
            this.life = 1;
            this.vy = -2;
        }
        update() {
            this.y += this.vy;
            this.life -= 0.015;
        }
        draw(ctx) {
            if (this.life <= 0) return;
            ctx.save();
            ctx.globalAlpha = this.life;
            ctx.fillStyle = this.color;
            ctx.font = `bold ${this.size}px 'Poppins','Jua',sans-serif`;
            ctx.textAlign = 'center';
            ctx.shadowColor = 'rgba(0,0,0,0.3)';
            ctx.shadowBlur = 4;
            ctx.fillText(this.text, this.x, this.y);
            ctx.restore();
        }
    }

    function spawnBubble() {
        const types = ['basic'];
        if (state.score >= 5) types.push('zigzag');
        if (state.score >= 10) types.push('speedy');
        if (state.score >= 15) types.push('orbiter');

        if (state.rainbowReady) {
            state.bubbles.push(new Bubble('rainbow'));
            state.rainbowReady = false;
            state.popsUntilRainbow = 10 + Math.floor(state.score / 20);
            return;
        }

        const type = types[Math.floor(Math.random() * types.length)];
        state.bubbles.push(new Bubble(type));
    }

    function popBubble(index, mx, my) {
        const b = state.bubbles[index];
        if (!b || b.popped) return;
        b.popped = true;

        state.totalPops++;
        state.popsUntilRainbow--;
        if (state.popsUntilRainbow <= 0) state.rainbowReady = true;

        const now = Date.now();
        if (now - state.comboTimer < 1500) {
            state.combo++;
        } else {
            state.combo = 1;
        }
        state.comboTimer = now;

        let points = 10;
        if (b.type === 'zigzag') points = 15;
        if (b.type === 'speedy') points = 20;
        if (b.type === 'orbiter') points = 25;
        if (b.type === 'rainbow') points = 100;
        points *= Math.min(state.combo, 10);
        state.score += points;

        if (state.score > state.best) {
            state.best = state.score;
        }

        document.getElementById('bubbleScore').textContent = state.score;
        document.getElementById('bubbleBest').textContent = state.best;

        const comboEl = document.getElementById('comboDisplay');
        if (state.combo > 1) {
            comboEl.textContent = `x${Math.min(state.combo, 10)} Combo!`;
            comboEl.style.opacity = '1';
            comboEl.style.transform = 'scale(1.2)';
            setTimeout(() => { comboEl.style.transform = 'scale(1)'; }, 100);
        } else {
            comboEl.style.opacity = '0';
        }

        const particleCount = b.type === 'rainbow' ? 60 : 15 + Math.random() * 10;
        const colors = b.type === 'rainbow' ?
            ['#ff4081', '#ffeb3b', '#69f0ae', '#40c4ff', '#e040fb'] :
            ['rgba(150,220,255,', 'rgba(200,240,255,', 'rgba(100,200,255,'];

        for (let i = 0; i < particleCount; i++) {
            const color = b.type === 'rainbow' ?
                colors[Math.floor(Math.random() * colors.length)] :
                colors[Math.floor(Math.random() * colors.length)] + '1)';
            state.particles.push(new Particle(b.x, b.y, color));
        }

        const textColor = b.type === 'rainbow' ? '#ffeb3b' : '#fff';
        const textSize = b.type === 'rainbow' ? 32 : 18 + Math.min(state.combo * 2, 20);
        state.floatingTexts.push(new FloatingText(b.x, b.y, `+${points}`, textColor, textSize));

        if (b.type === 'rainbow') {
            state.shake = 20;
            state.floatingTexts.push(new FloatingText(W / 2, H / 2, 'BUBBLE BLAST!', '#ffeb3b', 42));

            for (let i = state.bubbles.length - 1; i >= 0; i--) {
                if (i === index) continue;
                const other = state.bubbles[i];
                if (other.popped) continue;
                const dx = other.x - b.x;
                const dy = other.y - b.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 250) {
                    setTimeout(() => {
                        if (!other.popped) {
                            const idx = state.bubbles.indexOf(other);
                            if (idx !== -1) popBubble(idx, other.x, other.y);
                        }
                    }, dist * 2);
                }
            }

            for (let i = 0; i < 30; i++) {
                state.particles.push(new Particle(W / 2, H / 2, colors[Math.floor(Math.random() * colors.length)]));
            }
        } else {
            state.shake = Math.max(state.shake, 3);
        }

        if (state.score >= 50 && !state.frenzyMode) {
            state.frenzyMode = true;
            state.frenzyTimer = 600;
            document.getElementById('frenzyDisplay').style.opacity = '1';
        }
    }

    function getMousePos(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }

    function handleInput(e) {
        e.preventDefault();
        const pos = getMousePos(e);
        let popped = false;

        for (let i = state.bubbles.length - 1; i >= 0; i--) {
            if (state.bubbles[i].contains(pos.x, pos.y)) {
                popBubble(i, pos.x, pos.y);
                popped = true;
                break;
            }
        }

        if (!popped) {
            for (let i = 0; i < 5; i++) {
                state.particles.push(new Particle(pos.x, pos.y, 'rgba(255,255,255,0.5)'));
            }
        }
    }

    canvas.addEventListener('mousedown', handleInput);
    canvas.addEventListener('touchstart', handleInput, { passive: false });

    function loop() {
        state.bgHue += 0.2;
        const hue = state.bgHue % 360;
        wrapper.style.background = `linear-gradient(135deg, hsl(${hue}, 70%, 85%) 0%, hsl(${(hue + 60) % 360}, 80%, 65%) 100%)`;

        let shakeX = 0, shakeY = 0;
        if (state.shake > 0) {
            shakeX = (Math.random() - 0.5) * state.shake;
            shakeY = (Math.random() - 0.5) * state.shake;
            state.shake *= 0.9;
            if (state.shake < 0.5) state.shake = 0;
        }

        ctx.clearRect(0, 0, W, H);
        ctx.save();
        ctx.translate(shakeX, shakeY);

        if (state.frenzyMode) {
            state.frenzyTimer--;
            const pulse = Math.sin(Date.now() * 0.01) * 0.1 + 0.1;
            ctx.fillStyle = `rgba(255, 64, 129, ${pulse})`;
            ctx.fillRect(0, 0, W, H);
            if (state.frenzyTimer <= 0) {
                state.frenzyMode = false;
                document.getElementById('frenzyDisplay').style.opacity = '0';
            }
        }

        state.spawnTimer++;
        const spawnRate = state.frenzyMode ? 15 : Math.max(30, 90 - state.score * 0.5);
        const maxBubbles = state.frenzyMode ? 25 : Math.min(15, 5 + Math.floor(state.score / 10));

        if (state.spawnTimer >= spawnRate && state.bubbles.length < maxBubbles) {
            spawnBubble();
            state.spawnTimer = 0;
        }

        if (state.bubbles.length < 3 && state.spawnTimer > 10) {
            spawnBubble();
            state.spawnTimer = 0;
        }

        for (let i = state.trailBubbles.length - 1; i >= 0; i--) {
            const t = state.trailBubbles[i];
            t.opacity -= 0.02;
            t.size *= 0.98;
            if (t.opacity <= 0) {
                state.trailBubbles.splice(i, 1);
                continue;
            }
            ctx.save();
            ctx.globalAlpha = t.opacity;
            ctx.fillStyle = `hsla(${t.hue}, 100%, 70%, 0.5)`;
            ctx.beginPath();
            ctx.arc(t.x, t.y, t.size / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        for (let i = state.bubbles.length - 1; i >= 0; i--) {
            const b = state.bubbles[i];
            b.update();
            if (b.popped || b.opacity <= 0) {
                state.bubbles.splice(i, 1);
                continue;
            }
            b.draw(ctx);
        }

        for (let i = state.particles.length - 1; i >= 0; i--) {
            const p = state.particles[i];
            p.update();
            if (p.life <= 0) {
                state.particles.splice(i, 1);
                continue;
            }
            p.draw(ctx);
        }

        for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
            const t = state.floatingTexts[i];
            t.update();
            if (t.life <= 0) {
                state.floatingTexts.splice(i, 1);
                continue;
            }
            t.draw(ctx);
        }

        ctx.restore();
        requestAnimationFrame(loop);
    }

    for (let i = 0; i < 5; i++) {
        setTimeout(() => spawnBubble(), i * 300);
    }

    loop();
})();