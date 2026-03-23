// ─── MAPA.JS v6 — Mapa interactivo como pantalla principal ───────────────────
// Sistema: toca token PJ → menú acción → resaltado de destinos → ejecutar

const PJ_ICONO = {
  inspector:   '🔎',
  doctor:      '⚕',
  institutriz: '📖',
  periodista:  '✒',
  medium:      '🔮',
  mayordomo:   '🗝',
};

const PNJ_TOKEN = {
  marsh:     { abrev:'Marsh',     icono:'⚕', color:'#4a8ab5' },
  harold:    { abrev:'Harold',    icono:'🥃', color:'#8b6e2a' },
  catherine: { abrev:'Cath.',     icono:'♛', color:'#9c3a6a' },
  hobbes:    { abrev:'Hobbes',    icono:'⚙', color:'#5a6a3a' },
  pemberton: { abrev:'Pemb.',     icono:'🍴', color:'#7a4a2a' },
  whitfield: { abrev:'Whitfield', icono:'✝', color:'#5a5a8a' },
};

// Colores canónicos por personaje (usados en token SVG, HUD y avatares)
const PJ_COLOR = {
  medium:      '#9c6fba',  // Lila
  inspector:   '#4a8c5c',  // Verde
  doctor:      '#3a72a8',  // Azul
  institutriz: '#d4782a',  // Naranja
  periodista:  '#b83232',  // Rojo
  mayordomo:   '#1a1a1a',  // Negro (token)
};
// Color para UI (texto, rayitas HUD) — el mayordomo usa azul hielo para ser legible
const PJ_COLOR_UI = {
  mayordomo:   '#a8c8e8',
};
function getPJColor(personaje) {
  return PJ_COLOR[personaje] || '#888';
}
function getPJColorUI(personaje) {
  return PJ_COLOR_UI[personaje] || getPJColor(personaje);
}

const Mapa = {
  // Pan/zoom
  _sc: 1, _tx: 0, _ty: 0,
  _drag: false, _lx: 0, _ly: 0, _pinch: 0,

  // Estado de selección/acción
  _jugSelIdx: null,       // índice del jugador seleccionado
  _accionActiva: null,    // 'libre'|'mover'|'explorar'|'interrogar'|'descansar'|'deducir'
  _resaltados: [],        // array de loseta IDs resaltadas como destino posible
  _pnjResaltados: [],     // array de PNJ IDs resaltados para interrogar

  // Constantes del mapa
  CELDA: 120, GAP: 10, PAD: 14,

  renderizar() {
    const container = document.getElementById('mapa-container');
    if (!container || !estado) return;

    const losetas    = getLosetasDistribucion();
    const conexiones = getConexionesDistribucion();
    if (!losetas.length) return;

    const { CELDA, GAP, PAD } = this;
    const SVG_W = 4 * (CELDA + GAP) + PAD * 2;
    const SVG_H = 4 * (CELDA + GAP) + PAD * 2;

    container.innerHTML = '';
    container.style.cssText = 'position:relative;overflow:hidden;background:#0a0806;cursor:grab;flex:1;';

    const wrapper = document.createElement('div');
    wrapper.id = 'mapa-wrapper';
    wrapper.style.cssText = `position:absolute;top:0;left:0;transform-origin:0 0;will-change:transform;`;
    container.appendChild(wrapper);

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = 'mapa-svg';
    svg.setAttribute('viewBox', `0 0 ${SVG_W} ${SVG_H}`);
    svg.setAttribute('width', SVG_W);
    svg.setAttribute('height', SVG_H);
    svg.style.display = 'block';
    wrapper.appendChild(svg);

    svg.innerHTML = `<defs>
      <filter id="fs"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.6"/></filter>
      <filter id="glow-verde">
        <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#4caf50" flood-opacity="0.9"/>
      </filter>
      <filter id="glow-oro">
        <feDropShadow dx="0" dy="0" stdDeviation="5" flood-color="#d4a840" flood-opacity="0.8"/>
      </filter>
      <filter id="glow-rojo">
        <feDropShadow dx="0" dy="0" stdDeviation="5" flood-color="#ef5350" flood-opacity="0.9"/>
      </filter>
    </defs>`;

    const pos = l => ({
      x:  PAD + l.col  * (CELDA + GAP),
      y:  PAD + l.fila * (CELDA + GAP),
      cx: PAD + l.col  * (CELDA + GAP) + CELDA / 2,
      cy: PAD + l.fila * (CELDA + GAP) + CELDA / 2,
    });

    // ── CONEXIONES ────────────────────────────────────────────────────────────
    conexiones.forEach(({ desde, hasta }) => {
      const la = losetas.find(l => l.id === desde);
      const lb = losetas.find(l => l.id === hasta);
      if (!la || !lb) return;
      const pa = pos(la), pb = pos(lb);
      this._el(svg, 'line', { x1:pa.cx, y1:pa.cy, x2:pb.cx, y2:pb.cy, stroke:'#000', 'stroke-width':14, 'stroke-linecap':'round', opacity:0.4 });
      this._el(svg, 'line', { x1:pa.cx, y1:pa.cy, x2:pb.cx, y2:pb.cy, stroke:'#1e1710', 'stroke-width':9, 'stroke-linecap':'round' });
      this._el(svg, 'line', { x1:pa.cx, y1:pa.cy, x2:pb.cx, y2:pb.cy, stroke:'#3d3020', 'stroke-width':3, 'stroke-linecap':'round', 'stroke-dasharray':'6 8' });
      const mx=(pa.cx+pb.cx)/2, my=(pa.cy+pb.cy)/2;
      this._el(svg, 'rect', { x:mx-7, y:my-7, width:14, height:14, rx:3, fill:'#1e1710', stroke:'#8a6818', 'stroke-width':1.5 });
      this._el(svg, 'circle', { cx:mx, cy:my, r:2.5, fill:'#d4a840', opacity:0.9 });
    });

    // ── LOSETAS ───────────────────────────────────────────────────────────────
    losetas.forEach(l => {
      const { x, y, cx, cy } = pos(l);
      const losetaDef = getLoseta(l.id);
      const cerrada   = isCerrada(l.id);
      const esEscena  = l.id === datosCaso.escena_crimen;
      const tipo      = losetaDef?.tipo || 'C';
      const imgSrc    = LOSETA_IMAGEN[l.id];

      const esDestino  = this._resaltados.includes(l.id);
      const esActual   = this._jugSelIdx !== null && estado.jugadores[this._jugSelIdx]?.loseta_actual === l.id;

      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.style.cursor = esDestino ? 'pointer' : 'default';

      if (esDestino) {
        g.addEventListener('click', e => {
          e.stopPropagation();
          if (this._accionActiva === 'abrir_cerradura') this._mostrarOpcionesCerradura(this._jugSelIdx, l.id);
          else this._ejecutarMovimiento(l.id);
        });
      } else {
        g.addEventListener('click', () => this._infoLoseta(l, losetaDef));
      }

      // Clip
      const clipId = `clip-${l.id}`;
      const clip = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
      clip.id = clipId;
      this._el(clip, 'rect', { x, y, width:CELDA, height:CELDA, rx:10 });
      svg.querySelector('defs').appendChild(clip);

      // Imagen — siempre visible
      if (imgSrc) {
        const img = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        img.setAttribute('href', imgSrc);
        img.setAttribute('x', x); img.setAttribute('y', y);
        img.setAttribute('width', CELDA); img.setAttribute('height', CELDA);
        img.setAttribute('preserveAspectRatio', 'xMidYMid slice');
        img.setAttribute('clip-path', `url(#${clipId})`);
        img.setAttribute('opacity', '0.82');
        g.appendChild(img);
      }

      // Overlay — cerradas y escena igual de visibles que el resto
      const fill = imgSrc   ? 'rgba(0,0,0,0.18)'  : 'rgba(18,13,8,0.88)';

      // Borde resaltado
      const strokeColor = esDestino  ? '#4caf50' :
                          esActual   ? '#d4a840'  :
                          esEscena   ? '#c0392b'  : cerrada ? '#2a1e12' : '#4a3828';
      const strokeW = (esDestino || esActual) ? 3 : esEscena ? 3 : 1.5;
      const filterAttr = esDestino ? 'url(#glow-verde)' : esActual ? 'url(#glow-oro)' : 'url(#fs)';

      this._el(g, 'rect', { x, y, width:CELDA, height:CELDA, rx:10, fill, stroke:strokeColor, 'stroke-width':strokeW, filter:filterAttr });

      // Overlay verde pulsante si es destino
      if (esDestino) {
        this._el(g, 'rect', { x, y, width:CELDA, height:CELDA, rx:10, fill:'rgba(76,175,80,0.18)', stroke:'none' });
      }

      // Badge tipo — esquina sup.izq., dentro
      const tipoCols = { C:'#f0c060', P:'#f0c060', S:'#c0a0ff', E:'#80d080', '!':'#ff7070' };
      const tipoBg   = { C:'rgba(0,0,0,0.72)', P:'rgba(0,0,0,0.72)', S:'rgba(30,0,60,0.8)', E:'rgba(0,40,0,0.72)', '!':'rgba(80,0,0,0.8)' };
      this._el(g, 'rect', { x:x+5, y:y+5, width:20, height:17, rx:3, fill:tipoBg[tipo]||tipoBg.C, stroke:tipoCols[tipo]||tipoCols.C, 'stroke-width':1 });
      this._txt(g, tipo, x+15, y+14.5, { anchor:'middle', baseline:'middle', size:11, fill:tipoCols[tipo]||tipoCols.C, family:'Cinzel,serif', weight:'bold' });

      // Las imágenes _P.png ya incluyen el nombre — no sobreimprimir

      // Escena crimen
      if (esEscena) {
        this._el(g, 'rect', { x:cx-34, y:y+CELDA-18, width:68, height:16, rx:3, fill:'rgba(140,0,0,0.92)' });
        this._txt(g, '✝ ESCENA', cx, y+CELDA-7, { anchor:'middle', size:10, fill:'#ffcccc', family:'Cinzel,serif', weight:'bold' });
      }
      const bloqueada = typeof isLosetaBloqueada === 'function' && isLosetaBloqueada(l.id);
      if (bloqueada) {
        // Overlay semitransparente oscuro
        const ovRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        ovRect.setAttribute('x', x); ovRect.setAttribute('y', y);
        ovRect.setAttribute('width', w); ovRect.setAttribute('height', h);
        ovRect.setAttribute('fill', 'rgba(60,20,0,0.55)');
        ovRect.setAttribute('rx', '6');
        g.appendChild(ovRect);
        // Tablones: dos líneas diagonales cruzadas gruesas
        const cx2 = x + w/2, cy2 = y + h/2;
        const margen = 10;
        const lineas = [
          [x+margen, y+margen, x+w-margen, y+h-margen],
          [x+w-margen, y+margen, x+margen, y+h-margen]
        ];
        lineas.forEach(([x1,y1,x2,y2]) => {
          // Sombra del tablón
          const sombra = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          sombra.setAttribute('x1', x1+1); sombra.setAttribute('y1', y1+1);
          sombra.setAttribute('x2', x2+1); sombra.setAttribute('y2', y2+1);
          sombra.setAttribute('stroke', '#1a0800'); sombra.setAttribute('stroke-width', '5');
          sombra.setAttribute('stroke-linecap', 'round');
          g.appendChild(sombra);
          // Tablón
          const ln = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          ln.setAttribute('x1', x1); ln.setAttribute('y1', y1);
          ln.setAttribute('x2', x2); ln.setAttribute('y2', y2);
          ln.setAttribute('stroke', '#a0520a'); ln.setAttribute('stroke-width', '4');
          ln.setAttribute('stroke-linecap', 'round');
          g.appendChild(ln);
        });
        // Tornillos en los extremos
        [[x+margen,y+margen],[x+w-margen,y+margen],[x+margen,y+h-margen],[x+w-margen,y+h-margen]].forEach(([px,py]) => {
          const circ = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          circ.setAttribute('cx', px); circ.setAttribute('cy', py); circ.setAttribute('r', '3');
          circ.setAttribute('fill', '#cd8b30'); circ.setAttribute('stroke', '#1a0800'); circ.setAttribute('stroke-width', '1');
          g.appendChild(circ);
        });
      }
      if (cerrada) {
        this._txt(g, '🔒', x+CELDA-18, y+CELDA-8, { anchor:'middle', size:15 });
      }

      // Destino: flecha pulsante
      if (esDestino) {
        this._txt(g, '▼', cx, y+CELDA-8, { anchor:'middle', size:16, fill:'#4caf50', family:'sans-serif' });
      }

      svg.appendChild(g);
    });

    // ── HERRAMIENTAS COBERTIZO ────────────────────────────────────────────────
    const cobertizo = losetas.find(l => l.id === 'cobertizo');
    if (cobertizo && !estado.herramienta_recogida) {
      const { x, y } = pos(cobertizo);
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      this._el(g, 'rect', { x:x+CELDA-28, y:y+6, width:23, height:23, rx:4, fill:'rgba(180,130,40,0.2)', stroke:'#d4a840', 'stroke-width':1 });
      this._txt(g, '🔧', x+CELDA-17, y+21, { anchor:'middle', size:15 });
      svg.appendChild(g);
    }

    // ── TOKENS PNJ ────────────────────────────────────────────────────────────
    datosCaso.comun.pnj.forEach(pnj => {
      const estPNJ = estado.pnj?.[pnj.id];
      if (!estPNJ || estPNJ.retirado) return;
      const l = losetas.find(l => l.id === estPNJ.loseta_actual);
      if (!l) return;
      const { x, y } = pos(l);

      const enL = datosCaso.comun.pnj.filter(p => estado.pnj?.[p.id]?.loseta_actual === estPNJ.loseta_actual && !estado.pnj?.[p.id]?.retirado);
      const pi = enL.indexOf(pnj);
      const col = pi % 3;
      const row = Math.floor(pi / 3);
      const r = 16;
      // Esquina inferior izquierda
      const cx2 = x + 22 + col * (r*2+5);
      const cy2 = y + this.CELDA - 22 - row * (r*2+5);

      const s   = estPNJ.sospecha;
      const tk  = PNJ_TOKEN[pnj.id] || { abrev: pnj.nombre.split(' ')[0], icono:'?', color:'#666' };
      const esResaltado = this._pnjResaltados.includes(pnj.id);

      const bgColor   = s >= 4 ? 'rgba(100,0,0,0.9)' : s >= 2 ? 'rgba(80,60,0,0.9)' : 'rgba(20,15,10,0.9)';
      const ringColor = esResaltado ? '#f9a825' : s >= 4 ? '#ef5350' : s >= 2 ? '#f9a825' : tk.color;
      const ringW     = esResaltado ? 3 : 2;
      const filterPNJ = esResaltado ? 'url(#glow-rojo)' : 'none';

      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.style.cursor = 'pointer';
      if (esResaltado) {
        g.addEventListener('click', e => { e.stopPropagation(); this._ejecutarInterrogatorio(pnj.id); });
      } else {
        g.addEventListener('click', e => { e.stopPropagation(); UI._mostrarInfoPNJ(pnj.id); });
      }

      // Sombra
      this._el(g, 'polygon', {
        points:`${cx2},${cy2-r-2} ${cx2+r+2},${cy2} ${cx2},${cy2+r+2} ${cx2-r-2},${cy2}`,
        fill:'rgba(0,0,0,0.5)', filter:filterPNJ
      });
      // Diamante
      this._el(g, 'polygon', {
        points:`${cx2},${cy2-r} ${cx2+r},${cy2} ${cx2},${cy2+r} ${cx2-r},${cy2}`,
        fill:bgColor, stroke:ringColor, 'stroke-width':ringW
      });
      // Avatar circular del PNJ (radio pequeño dentro del diamante)
      const rAvatar = r - 4;
      const avatarPNJ = typeof getAvatarPNJ === 'function' ? getAvatarPNJ(pnj.id, rAvatar*2) : null;
      const clipPNJId = `clipPNJ-${pnj.id}-${cx2}-${cy2}`;
      const defsPNJ = svg.querySelector('defs');
      const cpnj = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
      cpnj.id = clipPNJId;
      this._el(cpnj, 'circle', { cx:cx2, cy:cy2-2, r:rAvatar });
      defsPNJ.appendChild(cpnj);
      if (avatarPNJ) {
        const imgPNJ = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        imgPNJ.setAttribute('href', avatarPNJ);
        imgPNJ.setAttribute('x', cx2-rAvatar); imgPNJ.setAttribute('y', cy2-2-rAvatar);
        imgPNJ.setAttribute('width', rAvatar*2); imgPNJ.setAttribute('height', rAvatar*2);
        imgPNJ.setAttribute('clip-path', `url(#${clipPNJId})`);
        imgPNJ.setAttribute('opacity', '0.9');
        g.appendChild(imgPNJ);
      } else {
        this._txt(g, tk.icono, cx2, cy2-2, { anchor:'middle', baseline:'middle', size:12 });
      }
      // Nombre
      this._el(g, 'rect', { x:cx2-r, y:cy2+r+1, width:r*2, height:14, rx:3, fill:'rgba(0,0,0,0.92)' });
      this._txt(g, tk.abrev, cx2, cy2+r+12, {
        anchor:'middle', size:9,
        fill: esResaltado ? '#f9c84a' : s>=4 ? '#ef9a9a' : s>=2 ? '#f9c84a' : '#ddd',
        family:'Cinzel,serif', weight:'bold'
      });
      // Badge sospecha
      if (s > 0) {
        this._el(g, 'circle', { cx:cx2+r-2, cy:cy2-r+2, r:6, fill:s>=4?'#c0392b':'#7b6010', stroke:'#fff', 'stroke-width':1 });
        this._txt(g, s, cx2+r-2, cy2-r+2, { anchor:'middle', baseline:'middle', size:8, fill:'#fff', weight:'bold' });
      }

      svg.appendChild(g);
    });

    // ── TOKENS PJ ─────────────────────────────────────────────────────────────
    estado.jugadores.forEach((j, idx) => {
      const l = losetas.find(l => l.id === j.loseta_actual);
      if (!l) return;
      const { x, y } = pos(l);
      const enL = estado.jugadores.filter(jj => jj.loseta_actual === j.loseta_actual);
      const pi  = enL.indexOf(j);
      const col = pi % 3, row = Math.floor(pi / 3);
      const r   = 18;
      // Esquina superior izquierda (evitar badge tipo)
      const cx2 = x + 26 + col * (r*2+4);
      const cy2 = y + 26 + row * (r*2+4);

      const esSeleccionado = idx === this._jugSelIdx;
      const color  = getPJColor(j.personaje);
      const pjNomCorto = (PERSONAJES[j.personaje]?.nombre || j.personaje).replace(/^(El |La )/,'');
      const nombre = pjNomCorto.length > 7 ? pjNomCorto.slice(0,6)+'.' : pjNomCorto;
      // Avatar ya pre-cargado en _AV por precargarAvatares()
      const avatarUrl = getAvatarPJ(j.personaje, r*2);

      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.style.cursor = 'pointer';
      g.addEventListener('click', e => { e.stopPropagation(); this._seleccionarJugador(idx); });

      // clipPath circular para el avatar
      const clipPJ = `clipPJ-${idx}-${cx2}-${cy2}`;
      const defs2 = svg.querySelector('defs');
      const cpj = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
      cpj.id = clipPJ;
      this._el(cpj, 'circle', { cx:cx2, cy:cy2, r });
      defs2.appendChild(cpj);

      // Sombra + anillo de selección
      this._el(g, 'circle', { cx:cx2, cy:cy2, r:r+3,
        fill:'rgba(0,0,0,0.6)',
        filter: esSeleccionado ? 'url(#glow-oro)' : 'none'
      });
      // Fondo de color (visible si no carga el avatar)
      this._el(g, 'circle', { cx:cx2, cy:cy2, r, fill:color });

      // Avatar circular
      if (avatarUrl) {
        const imgPJ = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        imgPJ.setAttribute('href', avatarUrl);
        imgPJ.setAttribute('x', cx2-r); imgPJ.setAttribute('y', cy2-r);
        imgPJ.setAttribute('width', r*2); imgPJ.setAttribute('height', r*2);
        imgPJ.setAttribute('clip-path', `url(#${clipPJ})`);
        g.appendChild(imgPJ);
      } else {
        this._txt(g, PJ_ICONO[j.personaje]||'?', cx2, cy2+1, { anchor:'middle', baseline:'middle', size:16 });
      }

      // Anillo exterior (color del jugador + selección)
      this._el(g, 'circle', { cx:cx2, cy:cy2, r,
        fill: 'none',
        stroke: esSeleccionado ? '#fff' : color,
        'stroke-width': esSeleccionado ? 3 : 2
      });

      // Etiqueta nombre
      this._el(g, 'rect', { x:cx2-r, y:cy2+r+1, width:r*2, height:14, rx:3, fill:'rgba(0,0,0,0.9)' });
      this._txt(g, nombre, cx2, cy2+r+12, { anchor:'middle', size:9, fill:'#fff', family:'Cinzel,serif' });

      svg.appendChild(g);
    });

    // ── PANEL DE ACCIÓN (si hay jugador seleccionado) ─────────────────────────
    if (this._jugSelIdx !== null && this._accionActiva === null) {
      this._renderPanelAccion(svg, losetas);
    }

    // ── LEYENDA ───────────────────────────────────────────────────────────────
    this._renderLeyenda(svg, SVG_W, SVG_H);

    // ── GESTOS ────────────────────────────────────────────────────────────────
    this._initGestos(container);
    this._aplicarTransform();

    // Centrar solo la primera vez
    if (this._sc === 1 && this._tx === 0 && this._ty === 0) {
      this._centrar(container, SVG_W, SVG_H);
    }
  },

  // ── SELECCIÓN Y ACCIONES ─────────────────────────────────────────────────────

  _seleccionarJugador(idx) {
    if (this._jugSelIdx === idx) {
      // Deseleccionar
      this._jugSelIdx = null;
      this._accionActiva = null;
      this._resaltados = [];
      this._pnjResaltados = [];
    } else {
      this._jugSelIdx = idx;
      this._accionActiva = null;
      this._resaltados = [];
      this._pnjResaltados = [];
    }
    this.renderizar();
  },

  _renderPanelAccion(svg, losetas) {
    const j     = estado.jugadores[this._jugSelIdx];
    const pj    = PERSONAJES[j.personaje];
    const color = getPJColor(j.personaje);

    if (j.incapacitado) {
      this._mostrarMenuIncapacitado(j, pj, color);
    } else {
      this._mostrarMenuAccion(j, pj, color);
    }
  },

  _mostrarMenuIncapacitado(j, pj, color) {
    let menu = document.getElementById('mapa-menu-accion');
    if (menu) menu.remove();

    const container = document.getElementById('mapa-container');
    menu = document.createElement('div');
    menu.id = 'mapa-menu-accion';
    const esDesmayo = j.incapacitado.tipo === 'desmayo';
    menu.style.cssText = `
      position:absolute; bottom:0; left:0; right:0; z-index:20;
      background:linear-gradient(0deg,rgba(13,10,7,0.98),rgba(20,15,10,0.95));
      border-top:1px solid ${esDesmayo ? '#e57373' : '#9c6fba'};
      padding:12px;display:flex;align-items:center;gap:12px;
    `;
    const pjCorto = pj.nombre.replace('El ','').replace('La ','');
    menu.innerHTML = `
      <span style="font-size:2rem;">${esDesmayo ? '😵' : '🌀'}</span>
      <div style="flex:1;">
        <div style="font-family:Cinzel,serif;font-size:.85rem;color:${esDesmayo ? '#e57373' : '#9c6fba'};font-weight:600;">
          ${PERSONAJES[j.personaje]?.nombre || j.personaje} — ${esDesmayo ? 'DESMAYADO' : 'CRISIS NERVIOSA'}
        </div>
        <div style="font-family:'EB Garamond',serif;font-size:.82rem;color:#a09080;margin-top:2px;">
          No puede actuar esta ronda. Recupera ${j.incapacitado.atributo} a 1 al inicio de la siguiente.
        </div>
      </div>
      <button id="mapa-btn-cancelar" style="background:none;border:1px solid #4a3828;border-radius:6px;color:#a09080;font-size:1.1rem;width:36px;height:36px;cursor:pointer;">✕</button>
    `;
    container.appendChild(menu);
    document.getElementById('mapa-btn-cancelar').addEventListener('click', e => {
      e.stopPropagation();
      this._jugSelIdx = null;
      menu.remove();
      this.renderizar();
    });
  },

  _mostrarMenuAccion(j, pj, color) {
    // Quitar menú anterior si existe
    let menu = document.getElementById('mapa-menu-accion');
    if (menu) menu.remove();

    const container = document.getElementById('mapa-container');
    menu = document.createElement('div');
    menu.id = 'mapa-menu-accion';
    menu.style.cssText = `
      position:absolute; bottom:0; left:0; right:0; z-index:20;
      background:linear-gradient(0deg,rgba(13,10,7,0.98) 0%,rgba(20,15,10,0.95) 100%);
      border-top:1px solid ${color};
      padding:10px 12px 12px;
    `;

    const loseta = getLosetasDistribucion().find(l => l.id === j.loseta_actual);
    const losetaNom = loseta?.nombre || j.loseta_actual;
    const pjCorto = pj.nombre.replace('El ','').replace('La ','');

    menu.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
        <div style="display:flex;align-items:center;gap:8px;">
          <div style="width:32px;height:32px;border-radius:50%;background:${color};border:2px solid rgba(255,255,255,0.5);display:flex;align-items:center;justify-content:center;font-size:16px;">
            ${PJ_ICONO[j.personaje]||'?'}
          </div>
          <div>
            <div style="font-family:Cinzel,serif;font-size:.9rem;color:#fff;font-weight:600;">${PERSONAJES[j.personaje]?.nombre || j.personaje} — ${pjCorto}</div>
            <div style="font-family:EB Garamond,serif;font-size:.82rem;color:#a09080;">📍 ${losetaNom}</div>
          </div>
        </div>
        <button id="mapa-btn-cancelar" style="background:none;border:1px solid #4a3828;border-radius:6px;color:#a09080;font-size:1.1rem;width:36px;height:36px;cursor:pointer;display:flex;align-items:center;justify-content:center;">✕</button>
      </div>
      <div id="mapa-stats-pj" style="display:flex;gap:8px;margin-bottom:8px;padding:6px 8px;background:rgba(10,7,4,0.6);border-radius:6px;border:1px solid #2a1e12;"></div>
      <div style="font-family:Cinzel,serif;font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;color:#7a6a58;margin-bottom:8px;">Elige una acción:</div>
      <div id="mapa-acciones-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;"></div>
    `;
    container.appendChild(menu);

    document.getElementById('mapa-btn-cancelar').addEventListener('click', e => {
      e.stopPropagation();
      this._jugSelIdx = null; this._accionActiva = null;
      this._resaltados = []; this._pnjResaltados = [];
      menu.remove(); this.renderizar();
    });

    // Rellenar estadísticas del PJ
    const statsEl = document.getElementById('mapa-stats-pj');
    if (statsEl) {
      const base = PERSONAJES[j.personaje]?.atributos || {};
      const act  = j.atributos || {};
      ['FOR','INT','TEM'].forEach(attr => {
        const maxVal = base[attr] ?? 0;
        const curVal = act[attr]  ?? maxVal;
        const pct    = maxVal > 0 ? (curVal / maxVal) : 0;
        const barColor = pct > 0.5 ? '#81c784' : pct > 0.25 ? '#ffb74d' : '#ef9a9a';
        const wrap = document.createElement('div');
        wrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:2px;flex:1;';
        wrap.innerHTML =
          `<span style="font-family:Cinzel,serif;font-size:.6rem;letter-spacing:.08em;color:#7a6a58;">${attr}</span>`
          + `<span style="font-family:Cinzel,serif;font-size:.9rem;color:${barColor};font-weight:600;">${curVal}</span>`
          + `<div style="width:100%;height:3px;background:#2a1e12;border-radius:2px;">`
          + `<div style="width:${Math.round(pct*100)}%;height:3px;background:${barColor};border-radius:2px;transition:width .3s;"></div>`
          + `</div>`;
        if (j.incapacitado && ((j.incapacitado.tipo === 'desmayo' && attr === 'FOR') || (j.incapacitado.tipo === 'crisis' && attr === 'TEM'))) {
          wrap.style.opacity = '0.5';
        }
        statsEl.appendChild(wrap);
      });
    }

    const acciones = this._getAccionesDisponibles(j, this._jugSelIdx);
    const grid = document.getElementById('mapa-acciones-grid');
    acciones.forEach(acc => {
      const btn = document.createElement('button');
      const bloq = !acc.disponible;
      btn.style.cssText = `
        background:${bloq ? 'rgba(10,7,4,0.7)' : 'rgba(30,22,14,0.9)'};
        border:1px solid ${bloq ? '#2a1e12' : '#4a3828'};border-radius:8px;
        color:${bloq ? '#4a3828' : '#f0e8d8'};font-family:Cinzel,serif;font-size:.75rem;
        letter-spacing:.06em;text-transform:uppercase;padding:8px 4px;cursor:${bloq ? 'not-allowed' : 'pointer'};
        display:flex;flex-direction:column;align-items:center;gap:3px;
        min-height:64px;transition:all .15s;position:relative;
      `;
      btn.innerHTML = `
        <span style="font-size:1.4rem;line-height:1;${bloq ? 'filter:grayscale(1);opacity:.4;' : ''}">${acc.icono}</span>
        <span>${acc.label}</span>
        ${bloq && acc.bloqueado_por ? `<span style="font-size:.6rem;color:#6a5040;letter-spacing:.04em;text-transform:none;">${acc.bloqueado_por}</span>` : ''}
      `;
      if (acc.disponible) {
        btn.addEventListener('click', e => { e.stopPropagation(); this._iniciarAccion(acc.id); });
        btn.addEventListener('mouseenter', () => btn.style.borderColor = color);
        btn.addEventListener('mouseleave', () => btn.style.borderColor = '#4a3828');
      }
      grid.appendChild(btn);
    });

    // ── Botón "Terminar turno" — siempre visible, ocupa toda la anchura ──
    const btnTerminar = document.createElement('button');
    btnTerminar.style.cssText = `
      grid-column:1/-1;
      background:rgba(20,14,8,0.95);
      border:1px solid ${color}88;border-radius:8px;
      color:${color};font-family:Cinzel,serif;font-size:.78rem;
      letter-spacing:.1em;text-transform:uppercase;padding:10px;cursor:pointer;
      display:flex;align-items:center;justify-content:center;gap:6px;
      min-height:48px;margin-top:2px;
    `;
    btnTerminar.innerHTML = `<span style="font-size:1.1rem;">⏭</span><span>Terminar turno</span>`;
    btnTerminar.addEventListener('click', e => {
      e.stopPropagation();
      UI._mostrarBtnDeshacer(false);
      UI._estadoAnterior = null;
      if (typeof pasarTurno === 'function') pasarTurno(this._jugSelIdx);
      this._jugSelIdx = null; this._accionActiva = null;
      this._resaltados = []; this._pnjResaltados = [];
      menu.remove();
      this.renderizar();
      UI.actualizarBtnFinFase();
    });
    grid.appendChild(btnTerminar);
  },

  _getAccionesDisponibles(j, jugIdx) {
    // Jugador incapacitado: sin acciones disponibles
    if (j.incapacitado) return [];

    const losetaId   = j.loseta_actual;
    const conexiones = getConexionesDistribucion();
    const pnjEnLoseta = datosCaso.comun.pnj.filter(p =>
      estado.pnj?.[p.id]?.loseta_actual === losetaId && !estado.pnj?.[p.id]?.retirado
    );
    const losetaDef  = getLoseta(losetaId);
    const turno      = getTurno(jugIdx);
    const esMayordomo = j.personaje === 'mayordomo';
    const hayAdyacente = conexiones.some(c => c.desde === losetaId || c.hasta === losetaId)
                         || esMayordomo; // mayordomo siempre puede moverse

    // Mayordomo puede interrogar PNJ en cualquier loseta (no aplica aquí, pero sí el movimiento)
    const puedeDescansar = !['!','E'].includes(losetaDef?.tipo) &&
                           (losetaId === 'salon_principal' || pnjEnLoseta.length === 0);

    // ── Límite de acciones ────────────────────────────────────────────────────
    // Cada turno: 1 mov libre (gratuito) + 1 acción. Si ambos usados → todo bloqueado.
    const todoAgotado = turno.mov_libre_usado && turno.accion_usada;

    // ── Interrogar: un PNJ es interrogable si tiene declaración sin leer
    //    OR hay pistas disponibles que no se han usado con él aún
    const pistasDisp = [
      ...(estado.pistas_descubiertas  || []),
      ...(estado.pistas_interpretadas || [])
    ];
    const pnjInterrogables = pnjEnLoseta.filter(p => {
      // Ya interrogado sin pista este turno → no elegible
      if (turno.interrogados_sin_pista.includes(p.id)) return false;
      // Declaración inicial sin leer → elegible
      const declLeida = (estado.declaraciones_leidas || []).includes(p.id);
      if (!declLeida) return true;
      // Tiene pistas disponibles no usadas con este PNJ → elegible
      const estPNJ = estado.pnj?.[p.id];
      return pistasDisp.some(pid => {
        if (typeof _encontrarEntrada !== 'function') return true; // asumir disponible
        const found = _encontrarEntrada(p.id, pid);
        if (!found) return false;
        const esResto = found.key.endsWith('_resto');
        if (esResto) return true; // _resto siempre disponible
        return !(estPNJ?.interrogatorios_usados || []).includes(found.key);
      });
    });
    const hayPnjInterrogable = pnjInterrogables.length > 0;

    // ── Condición para Deducir: hay al menos 1 deducción disponible (pistas satisfechas) ──
    const deduccionesVariante = datosVariante?.deducciones || [];
    const pistasInterp = new Set(estado.pistas_interpretadas || []);
    const hayDeduccion = deduccionesVariante.some(d => {
      // Las pistas requeridas tienen formato "pista_X_interpretada" o directamente el id
      const requeridas = (d.pistas || []).map(p => p.replace('_interpretada', ''));
      return requeridas.every(pid => pistasInterp.has(pid) || pistasInterp.has(pid + '_interpretada'));
    });

    // ── Condición para Explorar: hay cartas de exploración no descubiertas en la loseta ──
    // (simplificación: siempre disponible — la app no lleva la cuenta de cartas físicas)
    const puedeExplorar = true;

    // ── Mov libre bloqueado si ya se usó; Mover bloqueado si ya se usó la acción ──
    const terminado = turno.turno_terminado;
    const libBlq  = terminado ? 'Turno terminado' : turno.mov_libre_usado ? 'Ya usado este turno' : !hayAdyacente ? 'Sin salidas' : null;
    const movBlq  = terminado ? 'Turno terminado' : turno.accion_usada    ? 'Acción ya usada'     : !hayAdyacente ? 'Sin salidas' : null;
    const explBlq = terminado ? 'Turno terminado' : turno.accion_usada    ? 'Acción ya usada'     : null;
    const intBlq  = terminado ? 'Turno terminado' : turno.accion_usada ? 'Acción ya usada' : !hayPnjInterrogable ? 'Sin PNJ' : null;
    const dedBlq  = terminado ? 'Turno terminado' : turno.accion_usada ? 'Acción ya usada' : !hayDeduccion ? 'Sin pistas suficientes' : null;
    const descBlq = terminado ? 'Turno terminado' : turno.accion_usada ? 'Acción ya usada' : !puedeDescansar ? 'Zona no válida' : null;

    // Interpretar: pistas descubiertas no interpretadas aún
    const pistasInterpretables = (estado.pistas_descubiertas || [])
      .filter(pid => !(estado.pistas_interpretadas || []).includes(pid));
    const hayPistaInterp = pistasInterpretables.length > 0;
    const interpBlq = terminado ? 'Turno terminado' : turno.accion_usada ? 'Acción ya usada' : !hayPistaInterp ? 'Sin pistas' : null;

    // ── Abrir cerradura: adyacente a loseta cerrada por puerta ─────────────
    const esCerrada = id => isCerrada(id);
    const cerradasAdyacentes = this._adyacentes(losetaId, conexiones).filter(id => esCerrada(id));
    let abrirBlq = null;
    if (terminado)                           abrirBlq = 'Turno terminado';
    else if (turno.accion_usada)             abrirBlq = 'Acción ya usada';
    else if (cerradasAdyacentes.length === 0) abrirBlq = 'Sin cerraduras adyacentes';

    return [
      { id:'libre',       icono:'🏃', label:'Mov. libre',        disponible: !libBlq,    bloqueado_por: libBlq    },
      { id:'mover',       icono:'👣', label:'Mover',             disponible: !movBlq,    bloqueado_por: movBlq    },
      { id:'explorar',    icono:'🕯', label:'Explorar',          disponible: !explBlq,   bloqueado_por: explBlq   },
      { id:'interrogar',  icono:'🔍', label:'Interrogar',        disponible: !intBlq,    bloqueado_por: intBlq    },
      { id:'interpretar', icono:'🧩', label:'Interpretar',       disponible: !interpBlq, bloqueado_por: interpBlq },
      { id:'deducir',     icono:'📜', label:'Deducir',           disponible: !dedBlq,    bloqueado_por: dedBlq    },
      { id:'abrir_cerradura', icono:'🗝', label:'Abrir cerradura', disponible: !abrirBlq, bloqueado_por: abrirBlq },
      { id:'descansar',   icono:'🛌', label:'Descansar',         disponible: !descBlq,   bloqueado_por: descBlq   },
    ];
  },

  _iniciarAccion(accionId) {
    const menu = document.getElementById('mapa-menu-accion');
    if (menu) menu.remove();

    const jugIdx   = this._jugSelIdx;
    const j        = estado.jugadores[jugIdx];
    const losetaId = j.loseta_actual;
    const conexiones = getConexionesDistribucion();
    const esMayordomo = j.personaje === 'mayordomo';
    const losetas = getLosetasDistribucion();

    this._accionActiva = accionId;
    this._resaltados   = [];
    this._pnjResaltados = [];

    // Comprobar si la loseta actual tiene movimiento_especial (Pasadizos)
    const tieneMvEspecial = typeof getLoseta === 'function' &&
      getLoseta(losetaId)?.efectos?.some(e => e.tipo === 'movimiento_especial');

    if (accionId === 'libre') {
      if (esMayordomo || tieneMvEspecial) {
        this._resaltados = losetas
          .filter(l => l.id !== losetaId)
          .filter(l => !isCerrada(l.id))
          .filter(l => !(typeof isLosetaBloqueada === 'function' && isLosetaBloqueada(l.id)))
          .map(l => l.id);
      } else {
        const noAcc = id => isCerrada(id) || (typeof isLosetaBloqueada === 'function' && isLosetaBloqueada(id));
        const dist1 = this._adyacentes(losetaId, conexiones).filter(id => !noAcc(id));
        const dist2 = [];
        dist1.forEach(id => this._adyacentes(id, conexiones).forEach(id2 => {
          if (id2 !== losetaId && !dist1.includes(id2) && !dist2.includes(id2) && !noAcc(id2)) dist2.push(id2);
        }));
        this._resaltados = [...new Set([...dist1, ...dist2])];
      }
    } else if (accionId === 'mover') {
      if (esMayordomo || tieneMvEspecial) {
        this._resaltados = losetas
          .filter(l => l.id !== losetaId)
          .filter(l => !isCerrada(l.id))
          .filter(l => !(typeof isLosetaBloqueada === 'function' && isLosetaBloqueada(l.id)))
          .map(l => l.id);
      } else {
        this._resaltados = this._adyacentes(losetaId, conexiones)
          .filter(id => !isCerrada(id) && !(typeof isLosetaBloqueada === 'function' && isLosetaBloqueada(id)));
      }
    } else if (accionId === 'interrogar') {
      const turno = getTurno(jugIdx);
      this._pnjResaltados = datosCaso.comun.pnj
        .filter(p =>
          estado.pnj?.[p.id]?.loseta_actual === losetaId &&
          !estado.pnj?.[p.id]?.retirado &&
          !turno.interrogados_sin_pista.includes(p.id)
        )
        .map(p => p.id);
    } else if (accionId === 'explorar') {
      const losetaJug = j.loseta_actual;
      // Comprobar si hay cartas ANTES de gastar la acción
      const cartasDisp = typeof getCartasDisponibles === 'function' ? getCartasDisponibles(losetaJug) : null;
      if (cartasDisp !== null && cartasDisp.length === 0) {
        this._accionActiva = null; this._jugSelIdx = null;
        this.renderizar();
        UI._mostrarNotificacion('Sin cartas disponibles', 'No quedan cartas de exploración en esta sala.');
        return;
      }
      usarAccion(jugIdx, 'explorar');
      guardarEstado();
      this._accionActiva = null; this._jugSelIdx = null;
      this.renderizar(); UI.abrirExplorar(losetaJug, jugIdx); return;
    } else if (accionId === 'deducir') {
      this._accionActiva = null; this._jugSelIdx = null;
      this.renderizar();
      UI.abrirPistasConAccion(jugIdx); return;
    } else if (accionId === 'interpretar') {
      this._accionActiva = null; this._jugSelIdx = null;
      this.renderizar();
      // setTimeout: esperar a que el re-render del mapa finalice antes de abrir el overlay
      setTimeout(() => {
        UI.abrirInterpretacion(jugIdx, () => {
          this.renderizar();
          UI.renderizarPartida();
        });
      }, 50);
      return;
    } else if (accionId === 'abrir_cerradura') {
      const candidatas = this._adyacentes(losetaId, conexiones).filter(id => isCerrada(id));
      if (candidatas.length === 1) {
        this._mostrarOpcionesCerradura(jugIdx, candidatas[0]);
      } else {
        this._accionActiva = 'abrir_cerradura';
        this._resaltados = candidatas;
      }
      return;
    } else if (accionId === 'descansar') {
      UI._snapshot();
      UI._mostrarBtnDeshacer(true);
      usarAccion(jugIdx, 'descansar');
      guardarEstado();
      this._accionActiva = null; this._jugSelIdx = null;
      this.renderizar(); this._confirmarDescanso(j); return;
    }

    if (this._resaltados.length === 0 && this._pnjResaltados.length === 0) {
      this._accionActiva = null; this._jugSelIdx = null;
    }

    this.renderizar();

    if (this._resaltados.length > 0) {
      const label = accionId === 'libre'
        ? (esMayordomo ? 'Toca la sala de destino (cualquiera — Mayordomo)'
          : tieneMvEspecial ? 'Toca la sala de destino (Pasadizos — cualquiera)'
          : 'Toca la sala de destino (hasta 2 pasos)')
        : (esMayordomo || tieneMvEspecial ? 'Toca la sala de destino (cualquiera)' : 'Toca la sala de destino (1 paso)');
      this._mostrarInstruccion(label, () => this._cancelarAccion());
    } else if (this._pnjResaltados.length > 0) {
      this._mostrarInstruccion('Toca el PNJ a interrogar', () => this._cancelarAccion());
    }
  },

  _adyacentes(losetaId, conexiones) {
    const res = [];
    conexiones.forEach(c => {
      if (c.desde === losetaId) res.push(c.hasta);
      if (c.hasta  === losetaId) res.push(c.desde);
    });
    return res;
  },

  _mostrarInstruccion(texto, onCancel) {
    let bar = document.getElementById('mapa-instruccion');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'mapa-instruccion';
      bar.style.cssText = `
        position:absolute;top:8px;left:50%;transform:translateX(-50%);z-index:30;
        background:rgba(0,0,0,0.88);border:1px solid #d4a840;border-radius:20px;
        padding:8px 16px;display:flex;align-items:center;gap:10px;white-space:nowrap;
      `;
      document.getElementById('mapa-container').appendChild(bar);
    }
    bar.innerHTML = `
      <span style="font-family:EB Garamond,serif;font-size:.95rem;color:#f0e8d8;">${texto}</span>
      <button style="background:none;border:1px solid #4a3828;border-radius:4px;color:#a09080;font-size:.85rem;padding:2px 8px;cursor:pointer;">Cancelar</button>
    `;
    bar.querySelector('button').addEventListener('click', () => { onCancel(); bar.remove(); });
  },

  _cancelarAccion() {
    this._accionActiva = null;
    this._jugSelIdx = null;
    this._resaltados = [];
    this._pnjResaltados = [];
    const bar = document.getElementById('mapa-instruccion');
    if (bar) bar.remove();
    this.renderizar();
  },

  _ejecutarMovimiento(losetaId) {
    UI._snapshot();
    UI._mostrarBtnDeshacer(true);
    const bar = document.getElementById('mapa-instruccion');
    if (bar) bar.remove();
    const jugIdx = this._jugSelIdx;
    const tipo   = this._accionActiva; // 'libre' o 'mover'
    if (tipo === 'libre') usarMovLibre(jugIdx);
    else                  usarAccion(jugIdx, 'mover');
    moverJugador(jugIdx, losetaId);

    // Aplicar pasivas de entrada
    if (typeof aplicarPasivaEntrada === 'function') {
      const res = aplicarPasivaEntrada(jugIdx, losetaId);
      if (res.requierePrueba) {
        // Pasadizos: limpiar selección y abrir diálogo en el siguiente tick
        // para que el SVG no interfiera con el overlay recién abierto
        this._accionActiva = null; this._jugSelIdx = null; this._resaltados = [];
        this.renderizar();
        UI.renderizarPartida();
        setTimeout(() => {
          UI.pedirResultadoPruebaPasadizos(jugIdx);
        }, 50);
        return;
      }
      if (res.logs?.length) UI.mostrarNotifPasiva(res.logs);
    }

    this._accionActiva = null;
    this._jugSelIdx = null;
    this._resaltados = [];
    this.renderizar();
    UI.renderizarPartida();
  },

  _ejecutarInterrogatorio(pnjId) {
    const bar = document.getElementById('mapa-instruccion');
    if (bar) bar.remove();
    const jugIdx = this._jugSelIdx;

    // Comprobar si hay algo útil que hacer con este PNJ ANTES de marcar la acción
    // Caso: declaración ya leída + alerta 9 (bloqueo) + sin pistas disponibles → no ejecutar
    const estPNJ  = estado.pnj?.[pnjId];
    const declLeida = estado.declaraciones_leidas?.includes(pnjId);
    const alertaBloqueada = estado.alerta >= 9;
    // Toda pista disponible puede usarse (hay siempre entrada _resto como fallback)
    // Solo excluir si la entrada específica ya fue usada Y no hay _resto disponible
    const todasPistasDisp = [
      ...new Set([...(estado.pistas_descubiertas || []), ...(estado.pistas_interpretadas || [])])
    ];
    const pistasDisponibles = todasPistasDisp.filter(pid => {
      if (typeof _encontrarEntrada !== 'function') return true;
      const found = _encontrarEntrada(pnjId, pid);
      if (!found) return false;
      // Si la entrada es _resto, solo bloquear si YA se usó una pista sin entrada específica
      // (no bloquear el _resto entero, cada pista se muestra siempre)
      const esResto = found.key.endsWith('_resto');
      if (esResto) return true; // _resto siempre disponible para cualquier pista
      return !estPNJ?.interrogatorios_usados?.includes(found.key);
    });

    const sinNadaUtilQueHacer = declLeida && (alertaBloqueada || pistasDisponibles.length === 0);

    this._accionActiva = null;
    this._jugSelIdx = null;
    this._pnjResaltados = [];

    if (sinNadaUtilQueHacer) {
      // No contar como acción — solo mostrar info del PNJ
      this.renderizar();
      this._mostrarNotificacion(
        'Sin más preguntas posibles',
        'Ya habéis agotado las pistas disponibles con este personaje.'
      );
      return;
    }

    // Hay algo que hacer: pasar el callback de confirmación a UI
    // La acción se marcará SOLO si el jugador llega a ejecutar el interrogatorio
    this.renderizar();
    UI.abrirInterrogatorioDirecto(jugIdx, pnjId, () => {
      // Callback: se llama cuando el interrogatorio fue efectivamente realizado
      registrarInterrogadoSinPista(jugIdx, pnjId);
      usarAccion(jugIdx, 'interrogar');
      // Eco del Salón de Música: +1 Sospecha al PNJ independientemente del resultado
      const losetaJugInterr = estado.jugadores[jugIdx]?.loseta_actual;
      if (losetaJugInterr && typeof tieneEcoInterrogatorio === 'function' && tieneEcoInterrogatorio(losetaJugInterr)) {
        subirSospecha(pnjId, 1);  // notifSospecha se llama automáticamente
      }
      guardarEstado();
    });
  },

  _confirmarDescanso(j) {
    const cont = document.getElementById('reaccion-cont');
    cont.innerHTML = '';
    const p = document.createElement('p');
    p.className = 'drw-titulo';
    p.textContent = 'Un momento de respiro';
    cont.appendChild(p);
    const d = document.createElement('p');
    d.style.cssText = 'font-family:"EB Garamond",serif;font-size:1rem;color:#c8b898;margin-bottom:1rem;';
    d.textContent = `${PERSONAJES[j.personaje]?.nombre || j.personaje} se retira un momento. El tiempo en calma hace maravillas.`;
    cont.appendChild(d);
    // Pasiva de loseta al descansar
    const jugIdx = estado.jugadores.findIndex(jj => jj === j);
    const losetaDesc = j.loseta_actual;
    const bonDesc = typeof getPasivaDescanso === 'function' ? getPasivaDescanso(losetaDesc) : null;
    if (bonDesc) {
      const bonTxt = document.createElement('p');
      bonTxt.style.cssText = 'font-family:"EB Garamond",serif;font-size:1rem;color:#d4a840;margin-bottom:1rem;';
      bonTxt.textContent = `Este lugar ayuda a recuperarse: ${bonDesc.atributo} +${bonDesc.modificador}`;
      cont.appendChild(bonTxt);
    }

    // Instrucción de cartas al descansar
    const instrCartas = document.createElement('p');
    instrCartas.style.cssText = 'font-family:"EB Garamond",serif;font-size:.95rem;color:#d4a840;background:rgba(180,140,40,.1);border:1px solid rgba(180,140,40,.25);border-radius:8px;padding:.6rem .85rem;margin-bottom:1rem;';
    instrCartas.textContent = 'Descarta toda tu mano y roba 6 cartas nuevas del mazo de Resolución.';
    cont.appendChild(instrCartas);

    const btn = document.createElement('button');
    btn.className = 'btn btn-p btn-bloque';
    btn.textContent = 'Confirmar descanso';
    btn.onclick = () => {
      UI._snapshot();
      UI._mostrarBtnDeshacer(true);
      if (jugIdx >= 0 && bonDesc && typeof aplicarPasivaDescanso === 'function') {
        const logsD = aplicarPasivaDescanso(jugIdx, losetaDesc);
        if (logsD.length) UI.mostrarNotifPasiva(logsD);
      }
      UI.cerrarOverlay('reaccion');
      UI.renderizarPartida();
    };
    cont.appendChild(btn);
    UI._abrirOverlay('reaccion');
  },

  _infoLoseta(loseta, losetaDef) {
    const panel = document.getElementById('loseta-info');
    if (!panel) return;
    panel.style.display = 'block';
    const tipos = { C:'Común', P:'Privada', S:'Sagrada', E:'Exterior', '!':'Peligrosa' };
    document.getElementById('loseta-info-nom').textContent = loseta.nombre;
    const pnjs = datosCaso.comun.pnj.filter(p => estado.pnj?.[p.id]?.loseta_actual === loseta.id).map(p=>p.nombre).join(', ');
    const jugs = estado.jugadores.filter(j => j.loseta_actual === loseta.id).map(j => PERSONAJES[j.personaje]?.nombre || j.personaje).join(', ');
    const cerrada = isCerrada(loseta.id);
    let desc = `Tipo: ${tipos[losetaDef?.tipo]||'Común'}`;
    if (pnjs)    desc += `  ·  PNJ: ${pnjs}`;
    if (jugs)    desc += `  ·  Aquí: ${jugs}`;
    if (cerrada) desc += '  ·  🔒 Cerrada';
    document.getElementById('loseta-info-desc').textContent = desc;
  },

  // ── LEYENDA ───────────────────────────────────────────────────────────────────
  _renderLeyenda(svg, svgW, svgH) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const lx = svgW - 96, ly = 8;
    this._el(g, 'rect', { x:lx-4, y:ly-4, width:98, height:82, rx:6, fill:'rgba(0,0,0,0.78)', stroke:'#3a2e20', 'stroke-width':1 });
    this._txt(g, 'LEYENDA', lx+45, ly+10, { anchor:'middle', size:8, fill:'#d4a840', family:'Cinzel,serif', weight:'bold' });

    this._el(g, 'circle', { cx:lx+10, cy:ly+25, r:8, fill:'#4a90c4', stroke:'rgba(255,255,255,0.4)', 'stroke-width':1.5 });
    this._txt(g, '🔎', lx+10, ly+26, { anchor:'middle', baseline:'middle', size:10 });
    this._txt(g, '= Investigador', lx+23, ly+29, { anchor:'start', size:8.5, fill:'#ddd' });

    const dx=lx+10, dy=ly+44, dr=8;
    this._el(g, 'polygon', { points:`${dx},${dy-dr} ${dx+dr},${dy} ${dx},${dy+dr} ${dx-dr},${dy}`, fill:'rgba(20,15,10,0.9)', stroke:'#5a6a3a', 'stroke-width':1.5 });
    this._txt(g, '⚙', dx, dy-1, { anchor:'middle', baseline:'middle', size:9 });
    this._txt(g, '= PNJ', lx+23, ly+48, { anchor:'start', size:8.5, fill:'#ddd' });

    this._el(g, 'rect', { x:lx+3, y:ly+57, width:14, height:14, rx:3, fill:'rgba(76,175,80,0.2)', stroke:'#4caf50', 'stroke-width':1.5 });
    this._txt(g, '= Destino posible', lx+23, ly+67, { anchor:'start', size:8.5, fill:'#a5d6a7' });

    svg.appendChild(g);
  },

  // ── PAN / ZOOM ─────────────────────────────────────────────────────────────────
  _centrar(container, w, h) {
    const cW = container.clientWidth  || 360;
    const cH = container.clientHeight || 480;
    const esc = Math.min((cH-20)/h, (cW-20)/w);
    this._sc = esc;
    this._tx = (cW - w*esc) / (2*esc);
    this._ty = (cH - h*esc) / (2*esc);
    this._aplicarTransform();
  },

  _aplicarTransform() {
    const w = document.getElementById('mapa-wrapper');
    if (w) w.style.transform = `scale(${this._sc}) translate(${this._tx}px,${this._ty}px)`;
  },

  _initGestos(container) {
    let lt = null;
    container.addEventListener('touchstart', e => {
      if (e.touches.length === 2) {
        const dx=e.touches[0].clientX-e.touches[1].clientX, dy=e.touches[0].clientY-e.touches[1].clientY;
        this._pinch = Math.sqrt(dx*dx+dy*dy);
        this._pinchMid = {
          x: (e.touches[0].clientX+e.touches[1].clientX)/2,
          y: (e.touches[0].clientY+e.touches[1].clientY)/2
        };
      }
      lt = [...e.touches].map(t=>({x:t.clientX,y:t.clientY}));
    }, {passive:true});

    container.addEventListener('touchmove', e => {
      e.preventDefault();
      if (e.touches.length === 1 && lt?.length===1) {
        this._tx += (e.touches[0].clientX-lt[0].x)/this._sc;
        this._ty += (e.touches[0].clientY-lt[0].y)/this._sc;
        this._aplicarTransform();
      } else if (e.touches.length === 2 && lt?.length===2) {
        const dx=e.touches[0].clientX-e.touches[1].clientX, dy=e.touches[0].clientY-e.touches[1].clientY;
        const d = Math.sqrt(dx*dx+dy*dy);
        const ratio = d / this._pinch;
        // Punto focal del gesto en coordenadas del contenedor
        const mx = (e.touches[0].clientX+e.touches[1].clientX)/2 - container.getBoundingClientRect().left;
        const my = (e.touches[0].clientY+e.touches[1].clientY)/2 - container.getBoundingClientRect().top;
        // Ajustar tx/ty para que el punto bajo los dedos no se mueva
        this._tx -= mx / this._sc * (ratio - 1);
        this._ty -= my / this._sc * (ratio - 1);
        this._sc = Math.max(0.35, Math.min(3.5, this._sc * ratio));
        this._pinch = d;
        this._aplicarTransform();
      }
      lt = [...e.touches].map(t=>({x:t.clientX,y:t.clientY}));
    }, {passive:false});

    container.addEventListener('touchend', e => {
      lt = [...e.touches].map(t=>({x:t.clientX,y:t.clientY}));
    }, {passive:true});

    container.addEventListener('mousedown', e => {
      this._drag=true; this._lx=e.clientX; this._ly=e.clientY;
      container.style.cursor='grabbing';
    });
    container.addEventListener('mousemove', e => {
      if (!this._drag) return;
      this._tx+=(e.clientX-this._lx)/this._sc; this._ty+=(e.clientY-this._ly)/this._sc;
      this._lx=e.clientX; this._ly=e.clientY;
      this._aplicarTransform();
    });
    container.addEventListener('mouseup',    () => { this._drag=false; container.style.cursor='grab'; });
    container.addEventListener('mouseleave', () => { this._drag=false; container.style.cursor='grab'; });
    container.addEventListener('wheel', e => {
      e.preventDefault();
      this._sc = Math.max(0.35, Math.min(3.5, this._sc * (e.deltaY<0?1.1:0.9)));
      this._aplicarTransform();
    }, {passive:false});

    container.style.cursor = 'grab';

    // Recentrar automáticamente al rotar pantalla o cambiar tamaño
    const _recentrar = () => {
      const svg = document.getElementById('mapa-svg');
      if (svg && container.offsetParent !== null) {
        this._centrar(container, +svg.getAttribute('width'), +svg.getAttribute('height'));
      }
    };
    window.addEventListener('resize', _recentrar);
    screen.orientation?.addEventListener('change', _recentrar);

    // Botón centrar
    const b = document.createElement('button');
    b.textContent='⊙ Centrar';
    b.style.cssText='position:absolute;bottom:10px;right:10px;z-index:25;background:rgba(0,0,0,0.8);color:#d4a840;border:1px solid #8a6818;border-radius:6px;padding:8px 14px;font-family:Cinzel,serif;font-size:13px;cursor:pointer;';
    b.addEventListener('click', e => {
      e.stopPropagation();
      const svg = document.getElementById('mapa-svg');
      if (svg) this._centrar(container, +svg.getAttribute('width'), +svg.getAttribute('height'));
    });
    container.appendChild(b);
  },

  // ── HELPERS ───────────────────────────────────────────────────────────────────
  _el(parent, tag, attrs) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.entries(attrs).forEach(([k,v]) => el.setAttribute(k,v));
    parent.appendChild(el); return el;
  },
  _txt(parent, text, x, y, o={}) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    el.setAttribute('x',x); el.setAttribute('y',y);
    if(o.anchor)   el.setAttribute('text-anchor',o.anchor);
    if(o.baseline) el.setAttribute('dominant-baseline',o.baseline);
    el.setAttribute('font-size',   o.size   || 10);
    el.setAttribute('font-family', o.family || 'sans-serif');
    el.setAttribute('fill',        o.fill   || '#fff');
    if(o.weight)   el.setAttribute('font-weight',o.weight);
    el.textContent = text;
    parent.appendChild(el); return el;
  },
  _wrap(texto, max) {
    max = Math.max(5,max);
    if (texto.length<=max) return [texto];
    const palabras=texto.split(' '); const lineas=[]; let l='';
    palabras.forEach(p => {
      if ((l+' '+p).trim().length<=max) l=(l+' '+p).trim();
      else { if(l) lineas.push(l); l=p; }
    });
    if(l) lineas.push(l);
    return lineas;
  },

  _mostrarOpcionesCerradura(jugIdx, losetaId) {
    const bar = document.getElementById('mapa-instruccion');
    if (bar) bar.remove();
    this._accionActiva = null; this._resaltados = []; this._jugSelIdx = null;
    this.renderizar();

    const j          = estado.jugadores[jugIdx];
    const esMayord   = j.personaje === 'mayordomo';
    const nomLoseta  = getLoseta(losetaId)?.nombre || losetaId;
    const difBase    = getDifCerradura(losetaId);
    const difHerram  = Math.max(1, difBase - 2);
    const difMayord  = 4;

    const difForzarConH = esMayord ? Math.min(difMayord, difHerram) : difHerram;
    const difForzarSinH = esMayord ? difMayord : difBase;

    const mayordomoYaIntento = (estado.mayordomo_intentos_cerradura || {})[losetaId];
    const sinAlertaMayord    = esMayord && !mayordomoYaIntento;

    const tieneLlave = !!(estado.tokens_llave?.[jugIdx]);
    const opcionesCerradura = [
      ...(tieneLlave ? [{
          label: '🔑 Usar llave (sin prueba, sin Alerta)',
          disponible: true,
          accion: () => this._ejecutarAbrirConLlave(jugIdx, losetaId)
      }] : []),
      {
          label: `🔧 Forzar con herramienta (FOR dif ${difForzarConH}, sin +Alerta)`,
          disponible: !!estado.herramienta_recogida,
          accion: () => this._ejecutarForzarCerradura(jugIdx, losetaId, true)
      },
      {
          label: sinAlertaMayord
            ? `💪 Forzar sin herramienta (FOR dif ${difForzarSinH}, sin +Alerta — 1er intento)`
            : `💪 Forzar sin herramienta (FOR dif ${difForzarSinH}${esMayord ? '' : ' · fracaso: +1 Alerta'})`,
          disponible: true,
          accion: () => this._ejecutarForzarCerradura(jugIdx, losetaId, false)
      }
    ];

    UI._mostrarConfirmacion(
      `🗝 Abrir "${nomLoseta}"`,
      `¿Cómo abrís la cerradura?`,
      null,
      opcionesCerradura
    );
  },

  _ejecutarAbrirConLlave(jugIdx, losetaId) {
    usarAccion(jugIdx, 'abrir_cerradura');
    // Consumir llave
    if (!estado.tokens_llave) estado.tokens_llave = {};
    delete estado.tokens_llave[jugIdx];
    this._abrirCerradura(losetaId);
    const nomLoseta = getLoseta(losetaId)?.nombre || losetaId;
    UI._mostrarNotificacion(`${nomLoseta} — entrada libre`, 'La cerradura cede. Podéis entrar.');
  },

  _ejecutarForzarCerradura(jugIdx, losetaId, conHerramientas) {
    UI._snapshot();
    UI._mostrarBtnDeshacer(true);
    const j         = estado.jugadores[jugIdx];
    const esMayord  = j.personaje === 'mayordomo';
    const difBase   = getDifCerradura(losetaId);
    const difHerram = Math.max(1, difBase - 2);
    const difMayord = 4;
    const mayordomoYaIntento = (estado.mayordomo_intentos_cerradura || {})[losetaId];
    const sinAlerta = conHerramientas || (esMayord && !mayordomoYaIntento);

    let dif = conHerramientas
      ? (esMayord ? Math.min(difMayord, difHerram) : difHerram)
      : (esMayord ? difMayord : difBase);

    // Registrar intento del mayordomo
    if (esMayord) {
      if (!estado.mayordomo_intentos_cerradura) estado.mayordomo_intentos_cerradura = {};
      estado.mayordomo_intentos_cerradura[losetaId] = true;
    }

    usarAccion(jugIdx, 'abrir_cerradura');
    guardarEstado();
    this._accionActiva = null; this._jugSelIdx = null; this._resaltados = [];
    this.renderizar();

    const nomLoseta = getLoseta(losetaId)?.nombre || losetaId;
    // Mostrar panel de prueba FOR
    setTimeout(() => {
      UI.abrirPruebaCerradura(jugIdx, losetaId, dif, sinAlerta, nomLoseta, (resultado) => {
        if (resultado === 'exito' || resultado === 'critico') {
          this._abrirCerradura(losetaId);
          UI._mostrarNotificacion(`${nomLoseta} — forzada`, 'La cerradura cede con un chasquido. Podéis entrar.');
        } else {
          // Fracaso
          if (!sinAlerta) {
            subirAlerta(1, `Fracaso al forzar "${nomLoseta}"`);
          }
          UI._mostrarNotificacion(
            `${nomLoseta} — sin resultado`,
            sinAlerta
              ? 'No conseguís forzar la cerradura. Podéis intentarlo de nuevo.'
              : 'No conseguís forzar la cerradura. El ruido no pasa desapercibido.'
          );
        }
        guardarEstado();
        this.renderizar();
        UI.renderizarPartida();
      });
    }, 80);
  },

  _abrirCerradura(losetaId) {
    if (!estado.cerraduras_abiertas) estado.cerraduras_abiertas = [];
    if (!estado.cerraduras_abiertas.includes(losetaId)) {
      estado.cerraduras_abiertas.push(losetaId);
    }
    guardarEstado();
    this.renderizar();
    UI.renderizarPartida();
  }
};
