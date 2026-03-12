/* ════════════════════════════════════════
   iSteer — Frontend JS v2
════════════════════════════════════════ */
'use strict';

/* ── CURSOR ── */
function initCursor() {
  const cur  = document.getElementById('cursor');
  const ring = document.getElementById('cursor-ring');
  if (!cur || !ring) return;

  let mx=0,my=0,rx=0,ry=0;
  document.addEventListener('mousemove', e => { mx=e.clientX; my=e.clientY; });

  (function tick(){
    cur.style.left  = mx+'px'; cur.style.top  = my+'px';
    rx += (mx-rx)*.13; ry += (my-ry)*.13;
    ring.style.left = rx+'px'; ring.style.top = ry+'px';
    requestAnimationFrame(tick);
  })();

  document.querySelectorAll('a, button, input, label').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cur.style.cssText  += ';width:18px;height:18px;background:#9f7aea';
      ring.style.cssText += ';width:50px;height:50px;border-color:rgba(159,122,234,.5)';
    });
    el.addEventListener('mouseleave', () => {
      cur.style.cssText  += ';width:10px;height:10px;background:#63b3ed';
      ring.style.cssText += ';width:34px;height:34px;border-color:rgba(99,179,237,.4)';
    });
  });
}

/* ── PARTICLE CANVAS ── */
function initCanvas() {
  const cv = document.getElementById('canvas');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  let W, H, pts = [], mouse = {x:-9999,y:-9999};

  function resize() { W = cv.width = innerWidth; H = cv.height = innerHeight; }
  resize();
  window.addEventListener('resize', () => { resize(); init(); });
  document.addEventListener('mousemove', e => { mouse.x=e.clientX; mouse.y=e.clientY; });

  const COLS = ['#63b3ed','#9f7aea','#f687b3','#fbd38d','#68d391'];

  class P {
    constructor() { this.reset(true); }
    reset(init) {
      this.x   = Math.random()*W;
      this.y   = init ? Math.random()*H : H+10;
      this.r   = Math.random()*1.3+.3;
      this.col = COLS[Math.floor(Math.random()*COLS.length)];
      this.vx  = (Math.random()-.5)*.3;
      this.vy  = -(Math.random()*.5+.15);
      this.life= 1;
      this.dec = Math.random()*.0022+.0007;
    }
    update() {
      const dx=this.x-mouse.x, dy=this.y-mouse.y, d=Math.hypot(dx,dy);
      if (d < 100) { const f=.25*(1-d/100); this.x+=dx/d*f*2; this.y+=dy/d*f*2; }
      this.x+=this.vx; this.y+=this.vy; this.life-=this.dec;
      if (this.life<=0||this.y<-10) this.reset(false);
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.life*.42;
      ctx.fillStyle   = this.col;
      ctx.shadowColor = this.col;
      ctx.shadowBlur  = 5;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
    }
  }

  function init() { pts = Array.from({length:140}, ()=>new P()); }
  init();

  (function loop(){
    ctx.clearRect(0,0,W,H);
    /* connections */
    for (let i=0;i<pts.length;i++) {
      for (let j=i+1;j<pts.length;j++) {
        const d = Math.hypot(pts[i].x-pts[j].x, pts[i].y-pts[j].y);
        if (d < 72) {
          ctx.save();
          ctx.globalAlpha = (1-d/72)*.05;
          ctx.strokeStyle = '#63b3ed';
          ctx.lineWidth   = .4;
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
    pts.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  })();
}

/* ── TOAST ── */
let _toastTimer;
function showToast(msg, type='success') {
  const t   = document.getElementById('toast');
  const ico = t.querySelector('.t-icon');
  const txt = t.querySelector('.t-msg');
  t.className = `toast ${type}`;
  ico.textContent = type === 'success' ? '✓' : '✕';
  txt.textContent = msg;
  clearTimeout(_toastTimer);
  requestAnimationFrame(() => t.classList.add('show'));
  _toastTimer = setTimeout(() => t.classList.remove('show'), 4200);
}

/* ── HELPERS ── */
const $ = id => document.getElementById(id);
const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

function setErr(fieldId, errSuffix, show) {
  const inp = $(fieldId);
  if (inp) { inp.classList.toggle('has-error', show); inp.classList.toggle('valid', !show && inp.value.trim()); }
  const err = $(errSuffix);
  if (err) err.classList.toggle('show', show);
}

function clearAllErrors() {
  document.querySelectorAll('input').forEach(i => { i.classList.remove('has-error','valid'); });
  document.querySelectorAll('.ferr').forEach(e => e.classList.remove('show'));
}

/* Inline real-time validation */
function attachRealtime(inputId, validate) {
  const inp = $(inputId);
  if (!inp) return;
  inp.addEventListener('blur', () => {
    const bad = !validate(inp.value);
    inp.classList.toggle('has-error', bad);
    inp.classList.toggle('valid', !bad && inp.value.trim());
  });
  inp.addEventListener('input', () => {
    if (inp.classList.contains('has-error')) {
      const bad = !validate(inp.value);
      inp.classList.toggle('has-error', bad);
      inp.classList.toggle('valid', !bad && inp.value.trim());
    }
  });
}

/* ── PASSWORD VISIBILITY ── */
document.querySelectorAll('.eye-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const inp = $(btn.dataset.t);
    if (!inp) return;
    const show = inp.type === 'password';
    inp.type = show ? 'text' : 'password';
    btn.innerHTML = show
      ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`
      : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
  });
});

/* ── PASSWORD STRENGTH ── */
function calcStrength(pw) {
  let s=0;
  if (pw.length>=8)  s++;
  if (pw.length>=12) s++;
  if (/[A-Z]/.test(pw)&&/[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(4, Math.ceil(s*.85));
}
const STR_CLASSES = ['','w','f','g','s'];
const STR_LABELS  = ['Too short','Weak','Fair','Good','Strong'];

const passInp = $('password');
const strWrap = $('strengthWrap');

if (passInp && strWrap) {
  passInp.addEventListener('input', () => {
    const v = passInp.value;
    strWrap.style.display = v ? 'flex' : 'none';
    const lv = calcStrength(v);
    for (let i=1;i<=4;i++) {
      const b = $('sb'+i);
      if (b) { b.className = 'sb'; if(i<=lv) b.classList.add(STR_CLASSES[lv]); }
    }
    const sl = $('strLabel');
    if (sl) sl.textContent = STR_LABELS[lv] || 'Too short';
  });
}

/* ─────────────────────────────────────────
   LOGIN FORM
───────────────────────────────────────── */
(function() {
  const form = $('loginForm');
  if (!form) return;

  attachRealtime('email', v => isEmail(v));

  form.addEventListener('submit', async e => {
    e.preventDefault();
    clearAllErrors();

    const email    = $('email').value.trim();
    const password = $('password').value;
    let ok = true;

    if (!isEmail(email))  { setErr('email','',true); $('email').nextElementSibling.nextElementSibling?.classList.add('show'); ok=false; }
    if (!password)        { setErr('password','',true); ok=false; }

    /* Simpler: check visible error spans */
    document.querySelectorAll('#f-email .ferr').forEach(e => { if(!isEmail(email)) e.classList.add('show'); });
    document.querySelectorAll('#f-pass .ferr').forEach(e => { if(!password) e.classList.add('show'); });
    $('email').classList.toggle('has-error', !isEmail(email));
    $('password').classList.toggle('has-error', !password);
    if (!isEmail(email) || !password) return;

    const btn = $('loginBtn');
    btn.classList.add('loading');

    try {
      const res = await fetch('/server/login', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        showToast('Welcome back! Redirecting…', 'success');
        setTimeout(() => window.location.href='index.html', 1600);
      } else {
        const d = await res.json().catch(()=>({}));
        showToast(d.message || 'Invalid email or password.', 'error');
      }
    } catch {
      /* Demo fallback */
      showToast('Signed in! Welcome back to iSteer ✦', 'success');
      setTimeout(() => window.location.href='index.html', 1800);
    } finally {
      btn.classList.remove('loading');
    }
  });
})();

/* ─────────────────────────────────────────
   SIGNUP STEPS
───────────────────────────────────────── */
function initSignupSteps() {
  const form = $('signupForm');
  if (!form) return;

  /* Step navigation */
  function goStep(n) {
    document.querySelectorAll('.step-panel').forEach((p,i) => {
      p.classList.toggle('active', i===n-1);
    });
    document.querySelectorAll('.step').forEach((s,i) => {
      s.classList.remove('active','done');
      if (i < n-1) s.classList.add('done');
      if (i === n-1) s.classList.add('active');
    });
    document.querySelectorAll('.step-line').forEach((l,i) => {
      l.classList.toggle('done', i < n-1);
    });
    /* hide social on step 2/3 */
    const so = $('socialOr'), sb = $('socialBtns');
    if (so) so.style.display = n===1 ? 'flex' : 'none';
    if (sb) sb.style.display = n===1 ? 'grid' : 'none';
  }

  /* Step 1 → 2 */
  const s1btn = $('step1Btn');
  if (s1btn) {
    s1btn.addEventListener('click', () => {
      clearAllErrors();
      const fn = $('firstName')?.value.trim();
      const ln = $('lastName')?.value.trim();
      const em = $('email')?.value.trim();
      let ok = true;

      if (!fn) { $('firstName').classList.add('has-error'); document.querySelectorAll('#f-fn .ferr').forEach(e=>e.classList.add('show')); ok=false; }
      if (!ln) { $('lastName').classList.add('has-error');  document.querySelectorAll('#f-ln .ferr').forEach(e=>e.classList.add('show')); ok=false; }
      if (!isEmail(em)) { $('email').classList.add('has-error'); document.querySelectorAll('#f-email .ferr').forEach(e=>e.classList.add('show')); ok=false; }
      if (ok) goStep(2);
    });
  }

  /* Back */
  const backBtn = $('backBtn');
  if (backBtn) { backBtn.addEventListener('click', () => goStep(1)); }

  /* Submit */
  form.addEventListener('submit', async e => {
    e.preventDefault();
    clearAllErrors();

    const pw  = $('password')?.value || '';
    const cpw = $('confirmPassword')?.value || '';
    const terms = $('terms')?.checked;
    let ok = true;

    if (pw.length < 8) { $('password').classList.add('has-error'); document.querySelectorAll('#f-pass .ferr').forEach(e=>e.classList.add('show')); ok=false; }
    if (pw !== cpw)   { $('confirmPassword').classList.add('has-error'); document.querySelectorAll('#f-cpass .ferr').forEach(e=>e.classList.add('show')); ok=false; }
    if (!terms) {
      const te = $('termsErr');
      if (te) { te.textContent='You must accept the terms.'; te.classList.add('show'); }
      ok=false;
    }
    if (!ok) return;

    const btn = $('signupBtn');
    btn.classList.add('loading');

    try {
      const res = await fetch('/server/register', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          firstName:  $('firstName')?.value.trim(),
          lastName:   $('lastName')?.value.trim(),
          email:      $('email')?.value.trim(),
          password:   pw,
          phone:      $('phone')?.value.trim(),
          newsletter: $('newsletter')?.checked
        })
      });
      if (res.ok) {
        goStep(3);
        setTimeout(() => window.location.href='login.html', 2500);
      } else {
        const d = await res.json().catch(()=>({}));
        showToast(d.message || 'Registration failed. Try again.', 'error');
      }
    } catch {
      /* Demo fallback */
      goStep(3);
      setTimeout(() => window.location.href='login.html', 2500);
    } finally {
      btn.classList.remove('loading');
    }
  });

  attachRealtime('email', v => isEmail(v));
}

/* ── SOCIAL BUTTON PLACEHOLDERS ── */
document.querySelectorAll('#googleBtn, #fbBtn, .soc-btn').forEach(btn => {
  btn.addEventListener('click', () => showToast('Social login coming soon!', 'success'));
});