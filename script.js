/* ============================================================
   script.js — VoiceCtrl
   IT329 Advanced Web Technologies · King Saud University
   ============================================================ */

// ════════════════════════════════════════
// PARTICLE SPHERE INTRO
// Draws rotating 3D particle ball on canvas,
// then morphs smoothly into the glowing ring
// ════════════════════════════════════════
(function initParticleSphere() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H / 2, R = 110;
  const TOTAL = 520;
  const DURATION = 3200; // ms before transition starts

  // Generate particles on sphere surface using Fibonacci sphere
  const particles = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < TOTAL; i++) {
    const y    = 1 - (i / (TOTAL - 1)) * 2;
    const r    = Math.sqrt(1 - y * y);
    const theta = goldenAngle * i;
    particles.push({
      ox: Math.cos(theta) * r,  // original x on unit sphere
      oy: y,
      oz: Math.sin(theta) * r,
      size: Math.random() * 1.6 + 0.4,
      speed: Math.random() * 0.3 + 0.7,
    });
  }

  let startTime = null;
  let rotY = 0, rotX = 0.3;
  let morphProgress = 0; // 0 = sphere, 1 = ring
  let morphing = false;
  let rafId;

  function draw(ts) {
    if (!startTime) startTime = ts;
    const elapsed = ts - startTime;

    // start morphing to ring at DURATION
    if (elapsed > DURATION && !morphing) morphing = true;
    if (morphing) morphProgress = Math.min(1, morphProgress + 0.012);

    ctx.clearRect(0, 0, W, H);

    rotY += 0.008;

    particles.forEach(p => {
      // rotate around Y axis
      const cosY = Math.cos(rotY * p.speed);
      const sinY = Math.sin(rotY * p.speed);
      const x1 = p.ox * cosY - p.oz * sinY;
      const z1 = p.ox * sinY + p.oz * cosY;
      const y1 = p.oy;

      // rotate around X axis
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const y2 = y1 * cosX - z1 * sinX;
      const z2 = y1 * sinX + z1 * cosX;

      // sphere position
      const sx = cx + x1 * R;
      const sy = cy + y2 * R;

      // ring target position (project onto ring circumference)
      const angle = Math.atan2(p.oy, p.ox);
      const ringRadius = 118;
      const rx = cx + Math.cos(angle) * ringRadius;
      const ry = cy + Math.sin(angle) * ringRadius;

      // lerp between sphere and ring
      const px = sx + (rx - sx) * morphProgress;
      const py = sy + (ry - sy) * morphProgress;

      // depth-based brightness (z2 goes -1 to 1)
      const depth = (z2 + 1) / 2;  // 0 = back, 1 = front
      const alpha = morphing
        ? 0.4 + depth * 0.6
        : 0.25 + depth * 0.75;

      // color: navy blue dots on light bg
      const r = Math.round(26  + depth * 20);
      const g = Math.round(80  + depth * 40);
      const b = Math.round(200 + depth * 30);

      ctx.beginPath();
      ctx.arc(px, py, p.size * (0.6 + depth * 0.4), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
      ctx.fill();
    });

    // when fully morphed, stop canvas and show glowing ring CSS
    if (morphProgress >= 1) {
      cancelAnimationFrame(rafId);
      canvas.style.transition = 'opacity 0.5s';
      canvas.style.opacity = '0';
      return;
    }

    rafId = requestAnimationFrame(draw);
  }

  rafId = requestAnimationFrame(draw);
})();

// ── DOM refs ─────────────────────────────────────────────────
const introScreen = document.getElementById('introScreen');
const appScreen   = document.getElementById('appScreen');
const ring        = document.getElementById('ring');
const ringText    = document.getElementById('ringText');
const ringSub     = document.getElementById('ringSub');
const micBtn      = document.getElementById('micBtn');
const micIcon     = document.getElementById('micIcon');
const micLabel    = document.getElementById('micLabel');
const msgBar      = document.getElementById('msgBar');
const pr1         = document.getElementById('pr1');
const pr2         = document.getElementById('pr2');

// ── Show app after intro ──────────────────────────────────────
setTimeout(showApp, 4200);

function showApp() {
  appScreen.style.display = 'flex';
  appScreen.classList.remove('hidden');
  // double rAF ensures the browser has painted before adding visible
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      appScreen.classList.add('visible');
    });
  });
}

// ── Speech Recognition ───────────────────────────────────────
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition, isListening = false;

if (!SR) {
  setRing('✕', 'NOT SUPPORTED');
  setMsg('Please open in Google Chrome.', 'alert');
} else {
  recognition = new SR();
  recognition.continuous     = false;
  recognition.interimResults = false;
  recognition.lang           = 'en-US';

  recognition.onresult = function(e) {
    const t = e.results[0][0].transcript.toLowerCase().trim();
    setRing(t, 'HEARD');           // show spoken text in ring
    processCommand(t);
  };

  recognition.onerror = function(e) {
    stopListening();
    if (e.error === 'not-allowed') {
      setRing('✕', 'MIC DENIED');
      setMsg('Please allow microphone access.', 'alert');
    } else if (e.error === 'no-speech') {
      setRing('Hi', '');
      setMsg('No speech detected — try again.', 'alert');
    }
  };

  recognition.onend = () => stopListening();
}

// ── Toggle listening ─────────────────────────────────────────
function toggleListening() {
  if (!recognition) return;
  isListening ? (recognition.stop(), stopListening()) : startListening();
}

function startListening() {
  isListening = true;
  recognition.start();
  ring.classList.add('listening');
  pr1.classList.add('active');
  pr2.classList.add('active');
  setRing('Listening…', 'SPEAK NOW');
  micBtn.classList.add('listening');
  micIcon.textContent  = '⏹';
  micLabel.textContent = 'TAP TO STOP';
  setMsg('🎙 Listening for your command…', '');
}

function stopListening() {
  isListening = false;
  ring.classList.remove('listening');
  pr1.classList.remove('active');
  pr2.classList.remove('active');
  micBtn.classList.remove('listening');
  micIcon.textContent  = '🎙';
  micLabel.textContent = 'TAP TO SPEAK';
  // do NOT reset ring text here — let processCommand or resetRingAfter handle it
}

// ── Process voice commands ───────────────────────────────────
function processCommand(t) {

  if (t.includes('hello') || t.includes('hi')) {
    setRing('Hello! 👋', 'GREETING');
    setMsg('👋 Hello! Welcome to the voice-controlled demo!', 'success');
    resetRingAfter(3000);
  }

  else if (t.includes('dark mode') || t.includes('dark')) {
    document.body.classList.remove('light-mode');
    document.body.classList.add('dark-mode');
    setRing('Dark Mode', 'ACTIVATED');
    setMsg('🌙 Dark mode activated!', 'success');
    resetRingAfter(2500);
  }

  else if (t.includes('light mode') || t.includes('light')) {
    document.body.classList.remove('dark-mode');
    document.body.classList.add('light-mode');
    setRing('Light Mode', 'ACTIVATED');
    setMsg('☀️ Light mode activated!', 'success');
    resetRingAfter(2500);
  }

  else if (t.includes('change color') || t.includes('change colour')) {
    const palette = ['#f0f5fc','#f5f0f8','#f0f8f2','#fdf5ee','#f0f4f8','#f8f0f5'];
    document.body.style.backgroundColor = palette[Math.floor(Math.random() * palette.length)];
    document.body.classList.add('color-flash');
    setTimeout(() => document.body.classList.remove('color-flash'), 400);
    setRing('Color!', 'CHANGED');
    setMsg('🎨 Background color changed!', 'success');
    resetRingAfter(2000);
  }

  else if (t.includes('open google')) {
    setRing('Opening…', 'GOOGLE');
    setMsg('🌐 Opening Google in a new tab…', 'success');
    setTimeout(() => window.open('https://www.google.com', '_blank'), 800);
    resetRingAfter(2500);
  }

  else if (t.includes('refresh') || t.includes('reload')) {
    setRing('Refreshing', '...');
    setMsg('🔄 Refreshing…', 'success');
    setTimeout(() => window.location.reload(), 800);
  }

  else if (t.includes('reset')) {
    resetPage();
  }

  else {
    setRing('?', 'UNKNOWN');
    setMsg(`❓ "${t}" — try one of the commands below`, 'alert');
    resetRingAfter(2500);
  }
}

// ── Play intro animation again (for "reload" command) ────────
function playIntroThenReturn() {
  appScreen.classList.remove('visible');
  appScreen.classList.add('hidden');

  introScreen.style.animation  = 'none';
  introScreen.style.opacity    = '1';
  introScreen.style.visibility = 'visible';
  introScreen.style.pointerEvents = 'auto';

  void introScreen.offsetWidth;
  introScreen.style.animation = 'introExit 0.7s ease-in-out 3.4s forwards';

  setTimeout(() => {
    showApp();
    setRing('Hi', '');
    setMsg('Say a voice command to begin', '');
  }, 4300);
}

// ── Reset page ───────────────────────────────────────────────
function resetPage() {
  document.body.classList.remove('dark-mode', 'light-mode', 'color-flash');
  document.body.style.backgroundColor = '';
  setRing('Reset ✓', 'DONE');
  setMsg('✅ Page has been reset!', 'success');
  resetRingAfter(2000);
}

// ── Helpers ──────────────────────────────────────────────────
function setRing(main, sub) {
  ringText.textContent = main;
  ringSub.textContent  = sub || '';
}

function setMsg(text, type) {
  msgBar.textContent = text;
  msgBar.className   = 'msg-bar ' + (type || '');
}

let resetRingTimer = null;
function resetRingAfter(ms) {
  if (resetRingTimer) clearTimeout(resetRingTimer);
  resetRingTimer = setTimeout(() => {
    // only reset if not currently listening
    if (!isListening) setRing('Hi', '');
    resetRingTimer = null;
  }, ms);
}
