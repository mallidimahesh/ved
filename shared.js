/* shared nav injection + bg particle canvas */
const NAV_ITEMS = [
  { href: 'index.html',    icon: '🏠', label: 'Home' },
  { href: 'wishes.html',   icon: '🌸', label: 'Wishes' },
  { href: 'cake.html',     icon: '🎂', label: 'Cake' },
  { href: 'letter.html',   icon: '💌', label: 'Letter' },
  { href: 'memories.html', icon: '🖼️', label: 'Memories' },
];

function injectNav() {
  const current = location.pathname.split('/').pop() || 'index.html';
  const nav = document.createElement('nav');
  nav.className = 'top-nav';
  nav.innerHTML = NAV_ITEMS.map(n =>
    `<a href="${n.href}" class="nav-link ${current === n.href ? 'active' : ''}">
       <span class="nav-icon">${n.icon}</span><span>${n.label}</span>
     </a>`
  ).join('');
  document.body.prepend(nav);
}

function initBgCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, stars = [];

  const resize = () => {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener('resize', resize);

  const colors = ['#ffffff', '#fdf2f8', '#fbcfe8', '#e9d5ff'];

  for (let i = 0; i < 150; i++) {
    stars.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.8 + 0.4,
      vx: (Math.random() - 0.5) * 0.3, // slight drift left/right
      vy: Math.random() * -0.6 - 0.1,  // drift upwards
      color: colors[Math.floor(Math.random() * colors.length)],
      twinkleSpeed: Math.random() * 0.05 + 0.01,
      twinklePhase: Math.random() * Math.PI * 2
    });
  }

  (function loop() {
    ctx.clearRect(0, 0, W, H);
    stars.forEach(s => {
      s.x += s.vx; 
      s.y += s.vy;
      s.twinklePhase += s.twinkleSpeed;
      
      // Wrap around screen
      if (s.x < 0) s.x = W;
      if (s.x > W) s.x = 0;
      if (s.y < 0) s.y = H;
      if (s.y > H) s.y = 0;

      // Twinkle effect
      const alpha = 0.5 + Math.sin(s.twinklePhase) * 0.5;
      
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = s.color;
      
      // Glow for larger stars
      if (s.r > 1.2) {
        ctx.shadowBlur = s.r * 2.5;
        ctx.shadowColor = s.color;
      }

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    requestAnimationFrame(loop);
  })();
}

let confettiRaf = null;

/* ── Confetti burst ── */
function burstConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  // Set canvas size
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  // Prevent multiple overlapping animation loops causing lag
  if (confettiRaf) cancelAnimationFrame(confettiRaf);

  const colors = ['#ff6eb4','#a855f7','#fbbf24','#34d399','#60a5fa','#f87171','#fff'];
  const pieces = Array.from({ length: 150 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * -100 - 10,
    w: Math.random() * 12 + 5, 
    h: Math.random() * 8 + 4,
    color: colors[Math.floor(Math.random() * colors.length)],
    vx: (Math.random() - 0.5) * 8, // Wider spread
    vy: Math.random() * 10 + 6,    // Faster fall (gravity)
    angle: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.4, // Faster rotation
    alpha: 1
  }));
  
  (function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    
    pieces.forEach(p => {
      p.x += p.vx; 
      p.y += p.vy; 
      p.angle += p.spin; 
      
      // Start fading out when near the bottom of the screen
      if (p.y > canvas.height * 0.7) {
        p.alpha -= 0.02;
      }
      
      if (p.alpha > 0 && p.y < canvas.height + 20) {
        alive = true;
        ctx.save(); 
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y); 
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
        ctx.restore();
      }
    });
    
    if (alive) {
      confettiRaf = requestAnimationFrame(draw);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  })();
}

/* ── Scroll reveal ── */
function initScrollReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const d = e.target.dataset.delay || 0;
        setTimeout(() => e.target.classList.add('visible'), +d);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

document.addEventListener('DOMContentLoaded', () => {
  injectNav();
  initBgCanvas();
  initScrollReveal();
  initAudio();
});

/* ── Background Music ── */
function initAudio() {
  const musicBtn = document.createElement('button');
  musicBtn.id = 'music-toggle';
  musicBtn.title = "Play / Pause Music";
  musicBtn.style.cssText = `
    position: fixed;
    bottom: 25px;
    right: 25px;
    z-index: 1000;
    width: 45px;
    height: 45px;
    border-radius: 50%;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.2);
    backdrop-filter: blur(10px);
    color: white;
    font-size: 1.2rem;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    transition: transform 0.3s, background 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  
  musicBtn.onmouseover = () => musicBtn.style.transform = 'scale(1.1)';
  musicBtn.onmouseleave = () => musicBtn.style.transform = 'scale(1)';
  document.body.appendChild(musicBtn);

  const isPlaying = sessionStorage.getItem('bgMusicPlaying') !== 'false';
  const initialTime = parseFloat(sessionStorage.getItem('bgMusicTime')) || 0;

  // Fetch as blob to bypass Python http.server lack of byte-range support
  fetch('birthday.mp3')
    .then(response => response.blob())
    .then(blob => {
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      audio.loop = true;

      let jumpSuccessful = false;
      const performJump = () => {
        if (!jumpSuccessful && initialTime > 0) {
          audio.currentTime = initialTime;
          jumpSuccessful = true;
        }
      };

      audio.addEventListener('loadedmetadata', performJump);
      audio.addEventListener('canplay', performJump);
      if (audio.readyState >= 2) performJump();

      function tryPlay() {
        audio.play().then(() => {
          if (!jumpSuccessful && initialTime > 0) {
            audio.currentTime = initialTime;
            jumpSuccessful = true;
          }
          musicBtn.innerHTML = '🎵';
          sessionStorage.setItem('bgMusicPlaying', 'true');
        }).catch(e => {
          if (!document.getElementById('start-overlay')) {
            const overlay = document.createElement('div');
            overlay.id = 'start-overlay';
            overlay.innerHTML = `
              <div style="background:rgba(255,255,255,0.05);backdrop-filter:blur(15px);padding:3rem;border-radius:24px;border:1px solid rgba(255,182,193,0.3);text-align:center;box-shadow:0 15px 35px rgba(0,0,0,0.3)">
                <div style="font-size:4rem;margin-bottom:1rem;animation:pulse 2s infinite">🌸</div>
                <h2 style="font-family:'Dancing Script',cursive;font-size:3rem;color:#ffb6c1;margin-bottom:1rem">A magical surprise awaits...</h2>
                <p style="color:#fff;font-size:1.2rem;letter-spacing:1px;opacity:0.8">Tap anywhere to enter ✨</p>
              </div>
            `;
            overlay.style.cssText = 'position:fixed;inset:0;z-index:999999;background:var(--dark);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:opacity 0.6s ease;';
            document.body.appendChild(overlay);

            overlay.addEventListener('click', () => {
              performJump();
              audio.play();
              musicBtn.innerHTML = '🎵';
              sessionStorage.setItem('bgMusicPlaying', 'true');
              overlay.style.opacity = '0';
              setTimeout(() => overlay.remove(), 600);
            });
          }
        });
      }

      if (isPlaying) {
        tryPlay();
      } else {
        musicBtn.innerHTML = '🔇';
      }

      musicBtn.addEventListener('click', () => {
        if (audio.paused) {
          audio.play();
          sessionStorage.setItem('bgMusicPlaying', 'true');
          musicBtn.innerHTML = '🎵';
        } else {
          audio.pause();
          sessionStorage.setItem('bgMusicPlaying', 'false');
          musicBtn.innerHTML = '🔇';
        }
      });

      setInterval(() => {
        if (!audio.paused && audio.currentTime > 0) {
          if (initialTime > 0 && !jumpSuccessful) return;
          sessionStorage.setItem('bgMusicTime', audio.currentTime);
        }
      }, 250);
    })
    .catch(err => console.error("Error loading audio blob:", err));
}
