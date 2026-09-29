import './styles.css';
import { saveResponse } from './supabase.js';

const $ = (s) => document.querySelector(s);
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Petals & hearts (canvas) ---------- */
const cv = $('#fx'), ctx = cv.getContext('2d');
let W, H;
function resize() {
  const d = devicePixelRatio || 1;
  W = innerWidth; H = innerHeight;
  cv.width = W * d; cv.height = H * d;
  ctx.setTransform(d, 0, 0, d, 0, 0);
}
addEventListener('resize', resize); resize();

const COLORS = ['#cfe8c8', '#9fd19a', '#f4fff0', '#d9b86a'];
const particles = [];
const spawn = (x, y, burst) => {
  const a = Math.random() * Math.PI * 2, s = 2 + Math.random() * 6;
  return {
    x, y, burst, life: 1,
    vx: burst ? Math.cos(a) * s : (Math.random() - .5) * .4,
    vy: burst ? Math.sin(a) * s - 3 : .4 + Math.random() * .8,
    r: 5 + Math.random() * 8, rot: Math.random() * 6, vr: (Math.random() - .5) * .06,
    c: COLORS[(Math.random() * COLORS.length) | 0],
    heart: burst && Math.random() < .4,
  };
};
// Ambient petals (skipped if the visitor prefers reduced motion)
if (!reduceMotion) for (let i = 0; i < 22; i++) particles.push(spawn(Math.random() * W, Math.random() * H, false));

function burst(x, y, n = 42) { for (let i = 0; i < n; i++) particles.push(spawn(x, y, true)); }

function frame() {
  ctx.clearRect(0, 0, W, H);
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx + (p.burst ? 0 : Math.sin(p.y / 60) * .5);
    p.y += p.vy; p.rot += p.vr;
    if (p.burst) { p.vy += .12; p.life -= .012; if (p.life <= 0) { particles.splice(i, 1); continue; } }
    else if (p.y > H + 20) { p.y = -20; p.x = Math.random() * W; }
    ctx.globalAlpha = p.burst ? p.life : .55;
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
    if (p.heart) { ctx.font = `${p.r * 2}px serif`; ctx.fillText('❤', -p.r, p.r); }
    else { ctx.fillStyle = p.c; ctx.beginPath(); ctx.ellipse(0, 0, p.r, p.r * .6, 0, 0, 6.3); ctx.fill(); }
    ctx.restore();
  }
  requestAnimationFrame(frame);
}
frame();

const center = (el) => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };

/* ---------- Page switching ---------- */
function show(id) {
  const from = document.querySelector('.card:not([hidden])');
  from.classList.add('leave');
  setTimeout(() => {
    from.hidden = true; from.classList.remove('leave');
    const to = $(id); to.hidden = false; to.classList.add('enter');
  }, reduceMotion ? 0 : 450);
}

let answered = false;
function answer(value) {
  if (answered) return; answered = true;
  saveResponse(value);
}

/* ---------- YES ---------- */
$('#yes').addEventListener('click', (e) => {
  answer('yes');
  burst(...center(e.currentTarget), 60);
  setTimeout(() => burst(W / 2, H / 3, 50), 250);
  setTimeout(() => show('#confirmed'), 900);
});
$('#wait').addEventListener('click', (e) => burst(...center(e.currentTarget), 50));

/* ---------- NO: playful dodge, always escapable ---------- */
const arena = $('#arena'), no = $('#no'), yes = $('#yes'), hint = $('#hint');
const MAX_DODGES = 7;          // after this the button stops running
const COOLDOWN = 350;          // ms, keeps hover storms from using up all dodges
const HINTS = ['Oops, slipped away 😄', 'Too slow!', 'Are you sure? 🥺', 'Hehe, try again', 'Almost got it!', 'Okay, one more…', 'Fine, I\'ll stop running 💚'];
let dodges = 0, last = 0;

function dodge() {
  if (dodges >= MAX_DODGES) return false;          // settled: a click now counts as NO
  const now = performance.now();
  if (now - last < COOLDOWN) return true;
  last = now; dodges++;

  const a = arena.getBoundingClientRect(), b = no.getBoundingClientRect(), y = yes.getBoundingClientRect();
  if (no.style.position !== 'absolute') {           // switch from flow to absolute at the current spot
    no.style.left = b.left - a.left + 'px'; no.style.top = b.top - a.top + 'px';
    no.style.position = 'absolute'; void no.offsetWidth;
  }
  let x = 0, t = 0;
  for (let i = 0; i < 25; i++) {                    // pick a spot inside the arena, not on YES
    x = Math.random() * (a.width - b.width); t = Math.random() * (a.height - b.height);
    const L = a.left + x, T = a.top + t;
    if (L + b.width < y.left - 10 || L > y.right + 10 || T + b.height < y.top - 10 || T > y.bottom + 10) break;
  }
  no.style.left = x + 'px'; no.style.top = t + 'px';
  no.classList.remove('wiggle'); void no.offsetWidth; no.classList.add('wiggle');
  hint.textContent = HINTS[dodges - 1];
  if (dodges >= MAX_DODGES) no.classList.add('settled');
  return true;
}

function chooseNo() {
  answer('no');
  show('#declined');
}
// Mouse: dodge on approach. Touch/keyboard: dodge on click. Both fall through to NO once settled.
no.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') dodge(); });
no.addEventListener('click', () => { if (!dodge()) chooseNo(); });
// Always-available way to say no, so nobody is trapped.
$('#no-link').addEventListener('click', chooseNo);

addEventListener('resize', () => { no.style.position = ''; no.style.left = no.style.top = ''; });
