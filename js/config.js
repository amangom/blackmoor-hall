// ─── CONFIG.JS ────────────────────────────────────────────────────────────────

const Config = {
  _paso: 0,
  _casoId: 'caso_1',
  _modoVariante: 'aleatoria',
  _numJug: 3,
  _jugadores: [],   // [{nombre, personaje}]
  _distribId: null,

  TITULOS: [
    ['Paso 1 de 4', 'Selección de caso'],
    ['Paso 2 de 4', 'Variante'],
    ['Paso 3 de 4', 'Investigadores'],
    ['Paso 4 de 4', 'Distribución de losetas'],
  ],

  inicializar() {
    this._paso = 0; this._casoId = 'caso_1'; this._modoVariante = 'aleatoria'; this._varianteManual = null;
    this._numJug = 3; this._jugadores = []; this._distribId = null;
    // Limpiar selección visual de variante
    document.querySelectorAll('#cfg-variante .opcion').forEach(e => e.classList.remove('sel'));
    const optAleatoria = document.getElementById('opt-aleatoria');
    if (optAleatoria) optAleatoria.classList.add('sel');
    document.getElementById('sel-variante-manual').style.display = 'none';
    ['A','B','C'].forEach(x => {
      const b = document.getElementById('vbtn-' + x);
      if (b) b.classList.remove('sel');
    });
    this._renderPaso();
  },

  _renderPaso() {
    document.getElementById('cfg-paso-lbl').textContent   = this.TITULOS[this._paso][0];
    document.getElementById('cfg-titulo-lbl').textContent = this.TITULOS[this._paso][1];

    // Botón volver: en paso 0 vuelve al inicio; en pasos siguientes al paso anterior
    const btnVolver = document.getElementById('cfg-btn-volver');
    if (btnVolver) btnVolver.textContent = this._paso === 0 ? '← Inicio' : '← Volver';

    document.querySelectorAll('.paso-dot').forEach((d, i) => {
      d.className = 'paso-dot';
      if (i < this._paso)      d.classList.add('done');
      else if (i === this._paso) d.classList.add('active');
    });

    document.querySelectorAll('.cfg-section').forEach(s => s.classList.remove('activa'));
    const ids = ['cfg-caso','cfg-variante','cfg-jugadores','cfg-distrib'];
    document.getElementById(ids[this._paso]).classList.add('activa');

    if (this._paso === 2) this._renderJugadores();
    if (this._paso === 3) this._renderDistrib();
  },

  seleccionarCaso(id, el) {
    this._casoId = id;
    document.querySelectorAll('#cfg-caso .caso-btn').forEach(e => e.classList.remove('sel'));
    el.classList.add('sel');
    setTimeout(() => this.siguientePaso(), 220);
  },

  selVariante(v, avanzar = true) {
    this._varianteManual = v;
    ['A','B','C'].forEach(x => {
      const b = document.getElementById('vbtn-' + x);
      if (b) b.classList.toggle('sel', x === v);
    });
    if (avanzar && this._paso === 1 && this._modoVariante === 'manual') {
      setTimeout(() => this.siguientePaso(), 180);
    }
  },

  setVariante(modo, el) {
    this._modoVariante = modo;
    document.querySelectorAll('#cfg-variante .opcion').forEach(e => e.classList.remove('sel'));
    el.classList.add('sel');
    document.getElementById('sel-variante-manual').style.display = modo === 'manual' ? 'block' : 'none';
    if (modo === 'manual') {
      if (!this._varianteManual) this.selVariante('A', false);
    } else {
      // Aleatoria: avance automático siempre
      setTimeout(() => this.siguientePaso(), 180);
    }
  },

  volverPaso() {
    if (this._paso === 0) {
      UI.irAInicio();
    } else {
      this._paso--;
      this._renderPaso();
    }
  },

  siguientePaso() {
    if (!this._validar()) return;
    if (this._paso === 2) {
      // Avanzar directamente al paso 3
      this._paso++;
      this._renderPaso();
      return;
    }
    if (this._paso < 3) { this._paso++; this._renderPaso(); }
  },

  _continuarTrasPJ() {
    this._paso++;
    this._renderPaso();
  },

  _validar() {
    if (this._paso === 2) {
      const slots = document.querySelectorAll('.jug-slot');
      const personajes = [];
      for (const slot of slots) {
        const pjSel = slot.querySelector('.pj-card.sel');
        if (!pjSel) {
          this._notif('Elige un personaje para cada jugador.');
          return false;
        }
        personajes.push(pjSel.dataset.pj);
      }
      this._jugadores = personajes.map(pj => ({ personaje: pj }));
    }
    if (this._paso === 3 && !this._distribId) {
      this._notif('Selecciona una distribución de losetas.');
      return false;
    }
    return true;
  },

  cambiarNum(delta) {
    const n = this._numJug + delta;
    if (n < 2 || n > 5) return;
    this._numJug = n;
    document.getElementById('num-jug').textContent = n;
    this._renderJugadores();
  },

  _renderJugadores() {
    const cont = document.getElementById('lista-jug');
    cont.innerHTML = '';
    document.getElementById('num-jug').textContent = this._numJug;

    for (let i = 0; i < this._numJug; i++) {
      const guardado = this._jugadores[i];
      const slot = document.createElement('div');
      slot.className = 'jug-slot';

      // ─ Número + nombre ─────────────────────────────────────────────────
      const top = document.createElement('div');
      top.className = 'jug-slot-top';

      const num = document.createElement('span');
      num.className = 'jug-num'; num.textContent = i + 1;
      top.appendChild(num);
      slot.appendChild(top);

      // ─ Grid de personajes ───────────────────────────────────────────────
      const grid = document.createElement('div');
      grid.className = 'pj-grid';

      PERSONAJES_LISTA.forEach(pj => {
        const card = document.createElement('div');
        card.className = 'pj-card';
        card.dataset.pj = pj.id;

        const img = document.createElement('img');
        img.alt = pj.nombre;
        img.style.cssText = 'width:56px;height:56px;border-radius:50%;object-fit:cover;';
        // Usar imagen propia si existe, sino avatar generado
        // Cargar imagen real; si no existe, usar canvas generado
        const _tryLoad = () => {
          const testImg = new Image();
          testImg.onload = () => {
            // Recortar en círculo
            const c = document.createElement('canvas');
            c.width = c.height = 112;
            const ctx = c.getContext('2d');
            ctx.save();
            ctx.beginPath(); ctx.arc(56, 56, 56, 0, Math.PI*2); ctx.clip();
            ctx.drawImage(testImg, 0, 0, 112, 112);
            ctx.restore();
            img.src = c.toDataURL('image/png');
          };
          testImg.onerror = () => {
            // Fallback: canvas generado
            if (typeof getAvatarPJ === 'function') img.src = getAvatarPJ(pj.id, 112);
          };
          testImg.src = 'assets/personajes/' + pj.id + '.png';
        };
        _tryLoad();
        card.appendChild(img);

        const nom = document.createElement('span');
        nom.className = 'pj-card-nom';
        nom.textContent = pj.nombre.replace('El ', '').replace('La ', '');
        card.appendChild(nom);

        // Marcar seleccionado
        if (guardado?.personaje === pj.id) card.classList.add('sel');

        card.addEventListener('click', () => this._selPJ(i, pj.id, grid));
        grid.appendChild(card);
      });

      slot.appendChild(grid);
      cont.appendChild(slot);

      // Auto-seleccionar PJ disponible si no hay guardado
      if (!guardado?.personaje) {
        const ocupados = this._getPJsOcupados(i);
        const libre = PERSONAJES_LISTA.find(p => !ocupados.includes(p.id));
        if (libre) this._selPJ(i, libre.id, grid);
      }
    }

    // Actualizar estado "taken" de todos los slots
    this._actualizarTaken();
  },

  _selPJ(slotIdx, pjId, grid) {
    // Desmarcar todo en este grid
    grid.querySelectorAll('.pj-card').forEach(c => c.classList.remove('sel'));
    grid.querySelector(`[data-pj="${pjId}"]`)?.classList.add('sel');

    // Actualizar datos guardados
    if (!this._jugadores[slotIdx]) this._jugadores[slotIdx] = { nombre: '', personaje: pjId };
    else this._jugadores[slotIdx].personaje = pjId;

    // Actualizar "taken" en todos los slots
    this._actualizarTaken();
  },

  _getPJsOcupados(excepto) {
    // Recoge qué PJs están seleccionados en los slots distintos al indicado
    const ocupados = [];
    document.querySelectorAll('.jug-slot').forEach((slot, idx) => {
      if (idx === excepto) return;
      const sel = slot.querySelector('.pj-card.sel');
      if (sel) ocupados.push(sel.dataset.pj);
    });
    return ocupados;
  },

  _actualizarTaken() {
    // Para cada slot, marcar como .taken los PJs elegidos por OTROS slots
    document.querySelectorAll('.jug-slot').forEach((slot, slotIdx) => {
      const ocupados = this._getPJsOcupados(slotIdx);
      slot.querySelectorAll('.pj-card').forEach(card => {
        const pjId = card.dataset.pj;
        if (ocupados.includes(pjId)) {
          card.classList.add('taken');
          // Si este slot tenía este PJ seleccionado por un conflicto anterior, desmarcar
          // (no ocurre en flujo normal, pero por si acaso)
        } else {
          card.classList.remove('taken');
        }
      });
    });
  },

  async _renderDistrib() {
    const cont = document.getElementById('lista-distrib');
    cont.innerHTML = '<p class="cfg-desc" style="color:var(--txt3);">Cargando distribuciones…</p>';

    if (!datosDistribuciones) {
      try { await cargarDatosBase(); }
      catch(e) { cont.innerHTML = '<p style="color:#ef9a9a;">Error al cargar datos. Recarga la página.</p>'; return; }
    }

    cont.innerHTML = '';
    const lista = getDistribucionesCaso(this._casoId);

    lista.forEach(d => {
      const div = document.createElement('div');
      div.className = 'opcion' + (d.id === this._distribId ? ' sel' : '');

      const numLos = Object.keys(d.losetas || {}).length;
      const numPue = d.num_puertas || d.conexiones?.length || '?';
      const dif    = d.dificultad || '';

      div.innerHTML = `<p class="opcion-tit">${d.nombre || d.id}</p>
        <p class="opcion-meta">${dif}${dif?' · ':''}${numPue} puertas · ${numLos} losetas</p>`;

      div.onclick = () => {
        this._distribId = d.id;
        cont.querySelectorAll('.opcion').forEach(e => e.classList.remove('sel'));
        div.classList.add('sel');
        // Avance automático al comenzar
        setTimeout(() => this.comenzar(), 220);
      };
      cont.appendChild(div);
    });
  },

  async comenzar() {
    if (!this._validar()) return;

    // Recoger datos finales de jugadores
    document.querySelectorAll('.jug-slot').forEach((slot, i) => {
      const pj = slot.querySelector('.pj-card.sel')?.dataset.pj;
      this._jugadores[i] = { personaje: pj };
    });

    let variante = this._modoVariante === 'aleatoria'
      ? ['A','B','C'][Math.floor(Math.random()*3)]
      : (Config._varianteManual || 'A');

    try {
      await cargarDatosBase();
      await cargarDatosCaso(this._casoId);
      await cargarVariante(this._casoId, variante);
    } catch(e) {
      this._notif('Error cargando datos del caso.'); console.error(e); return;
    }

    iniciarPartida({ caso_id: this._casoId, variante, distribucion_id: this._distribId, jugadores: this._jugadores });
    UI._premisaPendiente = {
      casoNum: this._casoId.replace('caso_', ''),
      titulo: datosCaso?.comun?.titulo || '',
      premisa: datosCaso?.comun?.premisa || ''
    };
    UI.mostrarMontajeTablero();
  },

  _mostrarPortada() {
    const casoNumInt = this._casoNumInt || 1;
    const premisa = UI._premisaPendiente;
    if (premisa) {
      const portadaImg = document.getElementById('portada-img');
      portadaImg.src = `assets/Portada_Caso_${casoNumInt}.png`;
      portadaImg.onerror = () => { UI.mostrarPremisa(); };
      document.getElementById('overlay-portada').style.display = 'flex';
    } else {
      UI.irAPartida();
    }
  },

  _continuarTrasPrep() {
    this._mostrarPortada();
  },

  _notif(msg) { UI._mostrarNotificacion('Aviso', msg); }
};
