/* ===== GLOBAL ANIMATIONS & SCROLL REVEAL ===== */
document.addEventListener('DOMContentLoaded', () => {

  /* ── Loading Screen ── */
  setTimeout(() => {
    const ls = document.getElementById('loading-screen');
    ls.classList.add('fade-out');
    setTimeout(() => {
      ls.remove();
      document.getElementById('main-site').classList.remove('hidden');
      initParticles();
      initFireflies();
      spawnConfetti(false); // gentle entry confetti
    }, 800);
  }, 2400);

  /* ── Letter Modal ── */
  const overlay  = document.getElementById('letter-overlay');
  const openBtn  = document.getElementById('open-letter-btn');
  const closeBtn = document.getElementById('close-letter');

  openBtn.addEventListener('click', () => {
    overlay.classList.add('open');
    spawnLetterConfetti();
    spawnConfetti(true);
  });
  closeBtn.addEventListener('click', () => overlay.classList.remove('open'));
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('open'); });

  /* ── Candles ── */
  const NUM_CANDLES = 8;
  const candlesRow = document.getElementById('candles-row');
  let blown = 0;

  for (let i = 0; i < NUM_CANDLES; i++) {
    const wrap = document.createElement('div');
    wrap.className = 'candle-wrapper';
    wrap.innerHTML = `<div class="candle-flame"></div><div class="candle-body"></div>`;
    wrap.addEventListener('click', () => {
      if (!wrap.classList.contains('out')) {
        wrap.classList.add('out');
        blown++;
        if (blown === NUM_CANDLES) {
          document.getElementById('wish-message').classList.add('show');
          spawnConfetti(true);
        }
      }
    });
    candlesRow.appendChild(wrap);
  }

  /* ── Affirmation Slider ── */
  const cards = document.querySelectorAll('.affirmation-card');
  const dotsEl = document.getElementById('slider-dots');
  let current = 0;

  cards.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(dot);
  });

  cards[0].classList.add('active');

  function goTo(n) {
    cards[current].classList.remove('active');
    document.querySelectorAll('.dot')[current].classList.remove('active');
    current = (n + cards.length) % cards.length;
    cards[current].classList.add('active');
    document.querySelectorAll('.dot')[current].classList.add('active');
  }

  document.getElementById('prev-btn').addEventListener('click', () => goTo(current - 1));
  document.getElementById('next-btn').addEventListener('click', () => goTo(current + 1));
  setInterval(() => goTo(current + 1), 4000);

  /* ── Scroll Reveal for Wish Cards ── */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => entry.target.classList.add('visible'), parseInt(delay));
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.wish-card').forEach(c => observer.observe(c));
});

/* ── Particle Background ── */
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let W, H;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.r = Math.random() * 2 + 0.5;
      this.alpha = Math.random() * 0.5 + 0.1;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.color = Math.random() > 0.5 ? '#c084fc' : '#ff6eb4';
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      this.alpha += (Math.random() - 0.5) * 0.01;
      if (this.alpha < 0.05) this.alpha = 0.05;
      if (this.alpha > 0.6) this.alpha = 0.6;
      if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < 120; i++) particles.push(new Particle());

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }
  loop();
}

/* ── Fireflies ── */
function initFireflies() {
  const container = document.getElementById('fireflies');
  for (let i = 0; i < 18; i++) {
    const el = document.createElement('div');
    el.className = 'firefly';
    const tx = (Math.random() - 0.5) * 200;
    const ty = (Math.random() - 0.5) * 200;
    el.style.cssText = `
      left:${Math.random()*100}%;
      top:${Math.random()*100}%;
      --dur:${4 + Math.random()*4}s;
      --del:${Math.random()*4}s;
      --tx:${tx}px;
      --ty:${ty}px;
    `;
    container.appendChild(el);
  }
}

/* ── Confetti ── */
function spawnConfetti(burst) {
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#ff6eb4','#a855f7','#fbbf24','#34d399','#60a5fa','#f87171'];
  const pieces = [];
  const count = burst ? 180 : 60;

  for (let i = 0; i < count; i++) {
    pieces.push({
      x: Math.random() * canvas.width,
      y: burst ? -10 : Math.random() * canvas.height * 0.5,
      w: Math.random() * 10 + 4,
      h: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 4 + 1,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.2,
      alpha: 1
    });
  }

  let frame;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    pieces.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      p.angle += p.spin;
      p.alpha -= 0.008;
      if (p.alpha > 0) {
        alive = true;
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
        ctx.restore();
      }
    });
    if (alive) frame = requestAnimationFrame(draw);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  cancelAnimationFrame(frame);
  draw();
}

/* ── Letter Confetti ── */
function spawnLetterConfetti() {
  const container = document.getElementById('letter-confetti');
  container.innerHTML = '';
  const emojis = ['🌸','✨','⭐','🎀','🌷','💫','🎉'];
  for (let i = 0; i < 12; i++) {
    const el = document.createElement('span');
    el.style.cssText = `
      position:absolute;
      left:${Math.random()*100}%;
      top:${Math.random()*100}%;
      font-size:${1 + Math.random()}rem;
      animation:sparkleFloat ${2+Math.random()*2}s ease-in-out ${Math.random()}s infinite;
      pointer-events:none;
      opacity:0.7;
    `;
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    container.appendChild(el);
  }
}
