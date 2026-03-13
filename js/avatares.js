// ── AVATARES.JS — retratos circulares ────────────────────────────────────────
// Prioridad: assets/personajes/<id>.png → assets/pnj/<id>.png → canvas generado
// Todo se convierte a data-URL base64 (evita restricciones CORS/SVG de Firefox).

const _AV = {};  // cache global: id → data-URL

// Definiciones de color por personaje
const PJ_DEF = {
  doctor:      { bg:'#0d1e30', ring:'#3a72a8', inicial:'D'  },
  institutriz: { bg:'#2e1508', ring:'#d4782a', inicial:'I'  },
  periodista:  { bg:'#2a0808', ring:'#b83232', inicial:'P'  },
  medium:      { bg:'#1e1030', ring:'#9c6fba', inicial:'M'  },
  mayordomo:   { bg:'#111111', ring:'#555555', inicial:'B'  },
  inspector:   { bg:'#0d2010', ring:'#4a8c5c', inicial:'Ins'},
};
const PNJ_DEF = {
  marsh:     { bg:'#0a2030', ring:'#4a8ab5', inicial:'M'  },
  harold:    { bg:'#20130a', ring:'#9b7530', inicial:'H'  },
  catherine: { bg:'#200a10', ring:'#a03060', inicial:'C'  },
  hobbes:    { bg:'#0e160a', ring:'#607840', inicial:'Ho' },
  pemberton: { bg:'#180808', ring:'#804828', inicial:'Pe' },
  whitfield: { bg:'#0a0a18', ring:'#606090', inicial:'W'  },
};

// Dibuja un retrato de fallback en canvas y devuelve data-URL
function _generarCanvas(def, size) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const r = size / 2;

  ctx.save();
  ctx.beginPath(); ctx.arc(r, r, r, 0, Math.PI*2); ctx.clip();

  // Fondo degradado radial
  const g = ctx.createRadialGradient(r, r*.7, r*.05, r, r, r);
  g.addColorStop(0, _lighten(def.bg, 35));
  g.addColorStop(1, def.bg);
  ctx.fillStyle = g; ctx.fillRect(0, 0, size, size);

  // Silueta
  ctx.fillStyle = 'rgba(0,0,0,0.32)';
  ctx.beginPath(); ctx.ellipse(r, r+r*.5, r*.35, r*.6, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(r, r*.95, r*.26, 0, Math.PI*2); ctx.fill();

  ctx.restore();

  // Anillo
  ctx.beginPath(); ctx.arc(r, r, r-2, 0, Math.PI*2);
  ctx.strokeStyle = def.ring; ctx.lineWidth = 2.5; ctx.globalAlpha = .75; ctx.stroke();
  ctx.globalAlpha = 1;

  // Inicial
  const fs = size * (def.inicial.length > 1 ? 0.28 : 0.38);
  ctx.font = `bold ${fs}px Cinzel, serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillText(def.inicial, r+1, r+1);
  const grad = ctx.createLinearGradient(r-fs, r-fs*.5, r+fs, r+fs*.5);
  grad.addColorStop(0, _lighten(def.ring, 50));
  grad.addColorStop(.5, '#ffffff');
  grad.addColorStop(1, def.ring);
  ctx.fillStyle = grad; ctx.fillText(def.inicial, r, r);

  return c.toDataURL('image/png');
}

function _lighten(hex, n) {
  const v = parseInt(hex.replace('#',''), 16);
  const r = Math.min(255, (v>>16)+n);
  const g = Math.min(255, ((v>>8)&0xff)+n);
  const b = Math.min(255, (v&0xff)+n);
  return `rgb(${r},${g},${b})`;
}

// Carga una imagen desde URL, la recorta en círculo y devuelve Promise<data-URL>
function _cargarCircular(src, size) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = c.height = size;
      const ctx = c.getContext('2d');
      ctx.save();
      ctx.beginPath(); ctx.arc(size/2, size/2, size/2, 0, Math.PI*2); ctx.clip();
      ctx.drawImage(img, 0, 0, size, size);
      ctx.restore();
      resolve(c.toDataURL('image/png'));
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

// API pública ─────────────────────────────────────────────────────────────────

// Retorna la URL en caché (síncrono). Puede ser el canvas generado o la imagen real.
function getAvatarPJ(id, size=80) {
  return _AV['pj_'+id] || _generarCanvas(PJ_DEF[id] || {bg:'#1a1a1a', ring:'#888', inicial:id[0].toUpperCase()}, size);
}
function getAvatarPNJ(id, size=80) {
  return _AV['pnj_'+id] || _generarCanvas(PNJ_DEF[id] || {bg:'#1a1a1a', ring:'#888', inicial:id[0].toUpperCase()}, size);
}

// Pre-carga todos los avatares: primero intenta la imagen real, si falla usa canvas.
// Llamar una sola vez al iniciar la partida. Devuelve Promise<void>.
async function precargarAvatares() {
  const size = 160;  // alta resolución para que quede nítido en tokens pequeños

  const tareasPJ = Object.keys(PJ_DEF).map(async id => {
    const url = await _cargarCircular(`assets/personajes/${id}.png`, size);
    _AV['pj_'+id] = url || _generarCanvas(PJ_DEF[id], size);
  });

  const tareasPNJ = Object.keys(PNJ_DEF).map(async id => {
    const url = await _cargarCircular(`assets/pnj/${id}.png`, size);
    _AV['pnj_'+id] = url || _generarCanvas(PNJ_DEF[id], size);
  });

  await Promise.all([...tareasPJ, ...tareasPNJ]);
}

// Compatibilidad con código antiguo que usaba getAvatarPJAsync
function getAvatarPJAsync(id, size=80) {
  return Promise.resolve(getAvatarPJ(id, size));
}
