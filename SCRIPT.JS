/* =============================================
   CARTA PARA ELIANA — SCRIPT.js
   Tema: Hatsune Miku × Kasane Teto
   ============================================= */

// ===== CONFIG MÚSICA =====
const VIDEO_ID    = 'htMJl6hBuqA';
const MUSIC_START = 305;   // 5:05
const MUSIC_END   = 379;   // 6:19

// ===== ESTADO =====
let journeyStarted = false;
let ytPlayer       = null;
let musicPlaying   = false;
let monitorInterval = null;

/* ─────────────────────────────────────────
   CURSOR PERSONALIZADO
───────────────────────────────────────── */
const cursorEl  = document.getElementById('cursor');
const cursorRing = document.getElementById('cursorRing');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursorEl.style.left = mx + 'px';
  cursorEl.style.top  = my + 'px';
});

(function animateRing() {
  rx += (mx - rx) * 0.13;
  ry += (my - ry) * 0.13;
  cursorRing.style.left = rx + 'px';
  cursorRing.style.top  = ry + 'px';
  requestAnimationFrame(animateRing);
})();

// Cambiar cursor a color Teto al hover en elementos teto
document.querySelectorAll('.teto-color, .teto-frame, .teto-card, .teto-eq').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursorEl.style.color = '#ff6b6b';
    cursorEl.style.textShadow = '0 0 10px #ff6b6b';
    cursorRing.style.borderColor = '#ff6b6b';
  });
  el.addEventListener('mouseleave', () => {
    cursorEl.style.color = '';
    cursorEl.style.textShadow = '';
    cursorRing.style.borderColor = '';
  });
});

/* ─────────────────────────────────────────
   CANVAS DE PARTÍCULAS (notas musicales)
───────────────────────────────────────── */
const canvas = document.getElementById('bgCanvas');
const ctx    = canvas.getContext('2d');

const SYMBOLS = ['♪', '♫', '♩', '♬', '✦', '·', '⋆'];
const COLORS  = ['#39c5bb', '#ff6b6b', '#7986cb', '#80cbc4'];

let particles = [];
let W, H;

function resizeCanvas() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}

function initParticles() {
  particles = [];
  const count = Math.floor(W / 30);
  for (let i = 0; i < count; i++) {
    particles.push(makeParticle(true));
  }
}

function makeParticle(random = false) {
  return {
    x:    Math.random() * W,
    y:    random ? Math.random() * H : H + 20,
    vy:   -(0.3 + Math.random() * 0.7),
    vx:   (Math.random() - 0.5) * 0.3,
    sym:  SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
    col:  COLORS[Math.floor(Math.random() * COLORS.length)],
    size: 10 + Math.random() * 14,
    alpha: 0.1 + Math.random() * 0.35,
    rot:  Math.random() * Math.PI * 2,
    rotV: (Math.random() - 0.5) * 0.01,
  };
}

function drawParticles() {
  ctx.clearRect(0, 0, W, H);
  particles.forEach((p, i) => {
    p.y   += p.vy;
    p.x   += p.vx;
    p.rot += p.rotV;

    if (p.y < -20) particles[i] = makeParticle(false);

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle   = p.col;
    ctx.font        = `${p.size}px serif`;
    ctx.textAlign   = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(p.sym, 0, 0);
    ctx.restore();
  });
  requestAnimationFrame(drawParticles);
}

window.addEventListener('resize', () => { resizeCanvas(); initParticles(); });
resizeCanvas();
initParticles();
drawParticles();

/* ─────────────────────────────────────────
   PARTÍCULAS PORTADA (CSS)
───────────────────────────────────────── */
function createCoverParticles() {
  const container = document.getElementById('coverParticles');
  if (!container) return;
  const syms = ['♪', '♫', '✦', '·', '🎵', '♩'];
  const colors = ['#39c5bb', '#ff6b6b'];
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.classList.add('cp');
    p.textContent = syms[Math.floor(Math.random() * syms.length)];
    p.style.left  = Math.random() * 100 + '%';
    p.style.color = colors[Math.floor(Math.random() * colors.length)];
    p.style.fontSize = (0.6 + Math.random() * 1) + 'rem';
    p.style.animationDuration = (8 + Math.random() * 14) + 's';
    p.style.animationDelay    = (Math.random() * 12) + 's';
    p.style.textShadow = `0 0 8px ${p.style.color}`;
    container.appendChild(p);
  }
}

/* ─────────────────────────────────────────
   INICIO DEL VIAJE
───────────────────────────────────────── */
function startJourney() {
  if (journeyStarted) return;
  journeyStarted = true;

  const story1 = document.getElementById('story1');
  story1.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Mostrar reproductor
  setTimeout(() => {
    document.getElementById('musicPlayer').classList.add('show');
  }, 700);

  // Intentar play automático
  setTimeout(() => {
    if (ytPlayer && ytPlayer.playVideo) {
      ytPlayer.seekTo(MUSIC_START, true);
      ytPlayer.playVideo();
    }
  }, 1400);
}

/* ─────────────────────────────────────────
   YOUTUBE API
───────────────────────────────────────── */
function onYouTubeIframeAPIReady() {
  ytPlayer = new YT.Player('yt-player', {
    height: '1', width: '1',
    videoId: VIDEO_ID,
    playerVars: {
      autoplay: 0, controls: 0,
      start: MUSIC_START, end: MUSIC_END,
      loop: 1, playlist: VIDEO_ID,
      modestbranding: 1, rel: 0,
    },
    events: {
      onReady:       e => e.target.setVolume(60),
      onStateChange: onStateChange,
    }
  });
}

function onStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING) {
    musicPlaying = true;
    updateUI(true);
    startMonitor();
  }
  if (event.data === YT.PlayerState.PAUSED) {
    musicPlaying = false;
    updateUI(false);
  }
  if (event.data === YT.PlayerState.ENDED) {
    ytPlayer.seekTo(MUSIC_START, true);
    ytPlayer.playVideo();
  }
}

function startMonitor() {
  if (monitorInterval) clearInterval(monitorInterval);
  monitorInterval = setInterval(() => {
    if (!ytPlayer || !ytPlayer.getCurrentTime) return;
    const t = ytPlayer.getCurrentTime();
    if (t >= MUSIC_END) {
      ytPlayer.seekTo(MUSIC_START, true);
    }
  }, 800);
}

/* ─────────────────────────────────────────
   TOGGLE MÚSICA
───────────────────────────────────────── */
function toggleMusic() {
  if (!ytPlayer || !ytPlayer.playVideo) return;
  if (musicPlaying) {
    ytPlayer.pauseVideo();
    if (monitorInterval) clearInterval(monitorInterval);
  } else {
    ytPlayer.seekTo(ytPlayer.getCurrentTime() < MUSIC_START ? MUSIC_START : ytPlayer.getCurrentTime(), true);
    ytPlayer.playVideo();
  }
}

function updateUI(playing) {
  const btn  = document.getElementById('musicToggle');
  const bars = document.getElementById('mpBars');
  const led  = document.querySelector('.mp-led');

  if (btn)  btn.textContent = playing ? '⏸' : '▶';
  if (bars) bars.classList.toggle('playing', playing);
  if (led)  led.style.background = playing ? '#39c5bb' : '#ff6b6b';
}

/* ─────────────────────────────────────────
   SCROLL REVEAL
───────────────────────────────────────── */
function setupReveal() {
  const els = document.querySelectorAll('[data-reveal]');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(el => obs.observe(el));
}

/* ─────────────────────────────────────────
   CARGAR FOTOS + GUARDAR EN MEMORIA
───────────────────────────────────────── */
const photosData = { photo1: null, photo2: null, photo3: null };

function loadPhoto(input, containerId) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const base64 = e.target.result;

    // Guardar en memoria para exportar luego
    photosData[containerId] = base64;

    // Mostrar imagen en pantalla
    showPhoto(containerId, base64);

    // Verificar si todas las fotos están cargadas para mostrar botón exportar
    checkExportReady();
  };
  reader.readAsDataURL(file);
}

function showPhoto(containerId, base64) {
  const cont = document.getElementById(containerId);
  if (!cont) return;
  const placeholder = cont.querySelector('.ph-placeholder');
  if (placeholder) placeholder.style.display = 'none';

  let img = cont.querySelector('img');
  if (!img) {
    img = document.createElement('img');
    cont.appendChild(img);
  }
  img.src = base64;
  Object.assign(img.style, {
    position: 'absolute', inset: '0',
    width: '100%', height: '100%',
    objectFit: 'cover', zIndex: '2',
    opacity: '0', transition: 'opacity 0.6s ease',
    borderRadius: '3px',
  });
  setTimeout(() => { img.style.opacity = '1'; }, 50);
}

function checkExportReady() {
  const loaded = Object.values(photosData).filter(Boolean).length;
  const btn = document.getElementById('exportBtn');
  if (!btn) return;

  // Mostrar botón cuando al menos 1 foto esté cargada
  if (loaded >= 1) {
    btn.style.opacity = '1';
    btn.style.transform = 'translateY(0)';
    btn.style.pointerEvents = 'auto';
    btn.textContent = loaded === 3
      ? '💾 Exportar carta (lista para subir)'
      : `💾 Exportar carta (${loaded}/3 fotos)`;
  }
}

/* ─────────────────────────────────────────
   EXPORTAR CARTA — genera HTML autónomo con
   fotos incrustadas y música de YouTube
───────────────────────────────────────── */
async function exportCarta() {
  const btn = document.getElementById('exportBtn');
  btn.textContent = '⏳ Generando archivo...';
  btn.style.opacity = '0.7';

  try {
    // ── 1. Leer CSS ──
    let css = '';
    try {
      const r = await fetch('STYLE.css');
      css = await r.text();
    } catch {
      css = '/* Abre con Live Server para exportar correctamente */';
    }

    // ── 2. Leer JS ──
    let js = '';
    try {
      const r = await fetch('SCRIPT.js');
      js = await r.text();
    } catch { js = ''; }

    // ── 3. Construir el bloque de imágenes para cada foto ──
    const photoBlocks = {};
    ['photo1','photo2','photo3'].forEach(id => {
      if (photosData[id]) {
        photoBlocks[id] = `<img src="${photosData[id]}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:2;border-radius:3px;" alt="foto ${id}">`;
      }
    });

    // ── 4. Armar el HTML de la sección de música ──
    //    La API de YouTube siempre se carga externamente — eso está bien.
    //    El reproductor funciona en cualquier hosting con internet.
    const musicScript = `
    <script>
      // CONFIG MÚSICA — cargada directamente para la versión exportada
      const VIDEO_ID    = '${VIDEO_ID}';
      const MUSIC_START = ${MUSIC_START};
      const MUSIC_END   = ${MUSIC_END};
    <\/script>
    <script src="https://www.youtube.com/iframe_api"><\/script>`;

    // ── 5. Construir HTML final completo ──
    let html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Para Eliana 🎵✨</title>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Noto+Sans+JP:wght@300;400;700&family=Dancing+Script:wght@600;700&family=Share+Tech+Mono&display=swap" rel="stylesheet">
  <style>${css}</style>
</head>
<body>`;

    // Tomar el body actual del DOM y procesarlo
    let bodyHTML = document.body.innerHTML;

    // Insertar fotos en los contenedores correspondientes
    ['photo1','photo2','photo3'].forEach(id => {
      if (!photoBlocks[id]) return;
      // Reemplazar el contenido del photo-inner con id="photoX"
      const regex = new RegExp(
        `(<div class="photo-inner" id="${id}">)[\\s\\S]*?(<div class="ph-scan)`,
        'g'
      );
      bodyHTML = bodyHTML.replace(regex, `$1\n${photoBlocks[id]}\n$2`);
    });

    // Quitar inputs de archivo
    bodyHTML = bodyHTML.replace(/<input[^>]*type="file"[^>]*>/g, '');

    // Quitar el bloque del botón exportar
    bodyHTML = bodyHTML.replace(
      /<div class="export-wrapper">[\s\S]*?<\/div>\s*<\/div>/,
      ''
    );

    // Quitar el script src de SCRIPT.js y YouTube (los reemplazamos abajo)
    bodyHTML = bodyHTML.replace(/<script src="SCRIPT\.js"><\/script>/g, '');
    bodyHTML = bodyHTML.replace(/<script src="https:\/\/www\.youtube\.com\/iframe_api"><\/script>/g, '');
    bodyHTML = bodyHTML.replace(/<!--[\s\S]*?-->/g, ''); // limpiar comentarios

    html += bodyHTML;

    // Agregar scripts al final: primero la config, luego YouTube API, luego el JS
    html += `
  ${musicScript}
  <script>
    // ── SCRIPT CARTA PARA ELIANA ──
    // Variables de música ya definidas arriba
    const _VIDEO_ID    = typeof VIDEO_ID    !== 'undefined' ? VIDEO_ID    : '${VIDEO_ID}';
    const _MUSIC_START = typeof MUSIC_START !== 'undefined' ? MUSIC_START : ${MUSIC_START};
    const _MUSIC_END   = typeof MUSIC_END   !== 'undefined' ? MUSIC_END   : ${MUSIC_END};
  <\/script>
  <script>
${js}
  <\/script>
</body>
</html>`;

    // ── 6. Descargar ──
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'carta-para-eliana.html';
    a.click();
    URL.revokeObjectURL(url);

    btn.textContent = '✅ ¡Lista! Súbela a Netlify';
    btn.style.opacity = '1';
    setTimeout(() => {
      btn.textContent = '💾 Exportar carta';
    }, 5000);

  } catch (err) {
    console.error('Export error:', err);
    btn.textContent = '❌ Error — ¿usas Live Server?';
    btn.style.opacity = '1';
    setTimeout(() => {
      btn.textContent = '💾 Exportar carta';
      btn.style.opacity = '1';
    }, 4000);
  }
}

/* ─────────────────────────────────────────
   EFECTO CLICK — explosión de partículas
───────────────────────────────────────── */
document.addEventListener('click', e => {
  const syms  = ['♪', '♫', '✦', '♩'];
  const cols  = ['#39c5bb', '#ff6b6b'];
  const count = 5;

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.textContent = syms[Math.floor(Math.random() * syms.length)];
    const col = cols[Math.floor(Math.random() * cols.length)];
    const angle = (Math.PI * 2 / count) * i;
    const dist  = 40 + Math.random() * 40;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;

    Object.assign(el.style, {
      position: 'fixed',
      left: e.clientX + 'px',
      top:  e.clientY + 'px',
      color: col,
      fontSize: (0.8 + Math.random() * 0.8) + 'rem',
      textShadow: `0 0 8px ${col}`,
      pointerEvents: 'none',
      zIndex: '9997',
      transform: 'translate(-50%, -50%)',
      transition: 'all 0.7s cubic-bezier(.17,.67,.63,1)',
      opacity: '1',
    });
    document.body.appendChild(el);

    requestAnimationFrame(() => {
      el.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.3)`;
      el.style.opacity = '0';
    });

    setTimeout(() => el.remove(), 700);
  }
});

/* ─────────────────────────────────────────
   BOTÓN HOVER EFFECTS
───────────────────────────────────────── */
const btnStart = document.querySelector('.btn-start');
if (btnStart) {
  btnStart.addEventListener('mouseenter', () => {
    cursorEl.style.transform = 'translate(-50%, -50%) scale(1.5)';
    cursorRing.style.width  = '50px';
    cursorRing.style.height = '50px';
    cursorRing.style.borderColor = '#39c5bb';
  });
  btnStart.addEventListener('mouseleave', () => {
    cursorEl.style.transform = '';
    cursorRing.style.width  = '';
    cursorRing.style.height = '';
  });
}

/* ─────────────────────────────────────────
   INIT
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  createCoverParticles();
  setupReveal();
});