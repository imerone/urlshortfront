const API = 'http://localhost:8080';
let lastShortURL = '';
let pendingDeleteId = null;

// ── STARFIELD ──
(function () {
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  let stars = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function spawn() {
    stars = [];
    for (let i = 0; i < 240; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.4,
        a: Math.random(),
        spd: 0.003 + Math.random() * 0.008,
        phase: Math.random() * Math.PI * 2,
        gold: Math.random() > 0.9,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const t = Date.now() / 1000;
    for (const s of stars) {
      const alpha = 0.1 + 0.9 * Math.abs(Math.sin(t * s.spd + s.phase));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.gold
        ? `rgba(212,168,85,${(alpha * s.a).toFixed(3)})`
        : `rgba(224,218,208,${(alpha * s.a).toFixed(3)})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }

  resize(); spawn(); draw();
  window.addEventListener('resize', () => { resize(); spawn(); });
})();

// ── SHORTEN ──
async function shortenURL() {
  const urlInput = document.getElementById('urlInput');
  const slugInput = document.getElementById('slugInput');
  const btn = document.getElementById('warpBtn');
  const btnText = document.getElementById('warpText');

  let url = urlInput.value.trim();
  const slug = slugInput.value.trim().replace(/\s+/g, '-');

  if (!url) {
    shake(urlInput.closest('.field-row'));
    return;
  }

  // Add https:// if missing
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

  btn.disabled = true;
  btnText.textContent = 'WARPING...';

  try {
    const body = { original_url: url };
    if (slug) body.short_code = slug;

    const res = await fetch(`${API}/api/shorten`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      showError(data.error || 'Something went wrong');
      return;
    }

    lastShortURL = data.short_url;
    document.getElementById('shortLink').textContent = data.short_url;
    document.getElementById('shortLink').href = data.short_url;
    document.getElementById('result').classList.remove('hidden');
    document.getElementById('copyBtn').textContent = '⊕ COPY';
    document.getElementById('copyBtn').classList.remove('copied');

    urlInput.value = '';
    slugInput.value = '';

    loadURLs();
  } catch {
    showError('Cannot connect to server. Is the backend running on localhost:8080?');
  } finally {
    btn.disabled = false;
    btnText.textContent = 'WARP ▶';
  }
}

// ── LOAD ALL ──
async function loadURLs() {
  const list = document.getElementById('linksList');
  const count = document.getElementById('linkCount');

  try {
    const res = await fetch(`${API}/api/urls`);
    const urls = await res.json();

    if (!urls || urls.length === 0) {
      count.textContent = '00';
      list.innerHTML = `
        <div class="empty">
          <div class="empty-icon">🪐</div>
          <p class="empty-title">NO SIGNALS DETECTED</p>
          <p class="empty-sub">Launch your first transmission above</p>
        </div>`;
      return;
    }

    count.textContent = String(urls.length).padStart(2, '0');

    list.innerHTML = urls.map((u, i) => `
      <div class="link-row" id="row-${u.id}" style="animation-delay:${i * 0.05}s">
        <div class="link-main">
          <div class="link-original" title="${esc(u.original_url)}">${esc(u.original_url)}</div>
          <div class="link-short">
            <a href="${API}/${u.short_code}" target="_blank">${API}/${u.short_code}</a>
          </div>
        </div>
        <div class="link-meta">
          <span class="hits-badge ${u.click_count > 0 ? 'active' : ''}">
            ${String(u.click_count).padStart(2, '0')} HITS
          </span>
          <span class="link-date">${fmtDate(u.created_at)}</span>
        </div>
        <div class="delete-col">
          <button class="del-btn" onclick="askDelete(${u.id})" title="Delete">✕</button>
        </div>
      </div>
    `).join('');
  } catch {
    list.innerHTML = `<div class="empty"><p class="empty-title">SIGNAL LOST</p></div>`;
  }
}

// ── DELETE ──
function askDelete(id) {
  pendingDeleteId = id;
  document.getElementById('modal').classList.remove('hidden');
  document.getElementById('destroyBtn').onclick = doDelete;
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
  pendingDeleteId = null;
}

function handleModalClick(e) {
  if (e.target === document.getElementById('modal')) closeModal();
}

async function doDelete() {
  if (!pendingDeleteId) return;
  const id = pendingDeleteId;
  closeModal();

  const row = document.getElementById(`row-${id}`);
  if (row) {
    row.style.transition = 'all .3s ease';
    row.style.opacity = '0';
    row.style.transform = 'translateX(-16px)';
  }

  try {
    await fetch(`${API}/api/urls/${id}`, { method: 'DELETE' });
    setTimeout(loadURLs, 320);
  } catch {
    loadURLs();
  }
}

// ── COPY ──
function copyURL() {
  if (!lastShortURL) return;
  navigator.clipboard.writeText(lastShortURL).then(() => {
    const btn = document.getElementById('copyBtn');
    btn.textContent = '✓ COPIED';
    btn.classList.add('copied');
    showToast();
    setTimeout(() => {
      btn.textContent = '⊕ COPY';
      btn.classList.remove('copied');
    }, 2200);
  });
}

// ── HELPERS ──
function showToast() {
  const t = document.getElementById('toast');
  t.classList.remove('hidden');
  setTimeout(() => t.classList.add('hidden'), 2200);
}

function showError(msg) {
  alert('⚠ ' + msg);
}

function shake(el) {
  el.style.borderColor = '#ff4e4e';
  el.style.boxShadow = '0 0 0 2px #ff4e4e20';
  el.animate([
    {transform:'translateX(0)'},
    {transform:'translateX(-6px)'},
    {transform:'translateX(6px)'},
    {transform:'translateX(-4px)'},
    {transform:'translateX(0)'},
  ], { duration: 300 });
  setTimeout(() => {
    el.style.borderColor = '';
    el.style.boxShadow = '';
  }, 1000);
}

function fmtDate(str) {
  if (!str) return '';
  return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function esc(str) {
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('urlInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('slugInput').focus();
  });
  document.getElementById('slugInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') shortenURL();
  });
  loadURLs();
});
