// ─── UI.JS — Lógica de interfaz ──────────────────────────────────────────────

const UI = {

  // ─── NAVEGACIÓN ────────────────────────────────────────────────────────────

  mostrarPremisa() {
    document.getElementById('overlay-portada').style.display = 'none';
    const d = this._premisaPendiente;
    if (!d) { this.irAPartida(); return; }
    document.getElementById('premisa-caso-num').textContent = d.casoNum;
    document.getElementById('premisa-titulo').textContent   = d.titulo;
    document.getElementById('premisa-texto').textContent    = d.premisa;
    document.getElementById('overlay-premisa').style.display = 'flex';
  },

  mostrarMontajeTablero() {
    const caso = datosCaso || {};
    const comun = caso.comun || {};
    const pnjs = comun.pnj || [];
    const losetasDistrib = typeof getLosetasDistribucion === 'function' ? getLosetasDistribucion() : [];

    const nom = (id) => {
      const l = datosLosetas?.losetas?.find(x => x.id === id);
      return l ? l.nombre : id;
    };

    // Construir pasos
    const pasos = [];

    // Paso 1: Losetas
    let htmlLosetas = `<p style="font-family:var(--f2);font-size:.75rem;letter-spacing:.12em;text-transform:uppercase;color:var(--oro);margin:0 0 .75rem;">Losetas del caso</p>`;
    if (losetasDistrib.length > 0) {
      htmlLosetas += `<p style="font-family:var(--f3);font-size:.95rem;color:var(--txt2);line-height:1.6;margin:0 0 .75rem;">Colocad las siguientes losetas según el diagrama de distribución:</p>`;
      htmlLosetas += `<ul style="font-family:var(--f3);font-size:.95rem;color:var(--txt2);line-height:1.9;margin:0;padding-left:1.2rem;">`;
      losetasDistrib.forEach(l => { htmlLosetas += `<li>${nom(l.id)}</li>`; });
      htmlLosetas += `</ul>`;
    } else {
      htmlLosetas += `<p style="font-family:var(--f3);font-size:.95rem;color:var(--txt2);">Consultad el diagrama de distribución de puertas del caso.</p>`;
    }
    pasos.push(htmlLosetas);

    // Paso 2: Escena del crimen + PJs
    const escena = caso.escena_crimen;
    const inicio = caso.punto_inicio;
    let htmlEscena = `<p style="font-family:var(--f2);font-size:.75rem;letter-spacing:.12em;text-transform:uppercase;color:var(--oro);margin:0 0 .75rem;">Escena y posiciones iniciales</p>`;
    if (escena) htmlEscena += `<p style="font-family:var(--f3);font-size:.95rem;color:var(--txt2);line-height:1.7;margin:0 0 .75rem;">Colocad el token de cadáver en: <strong style="color:var(--oro2);">${nom(escena)}</strong></p>`;
    if (inicio) htmlEscena += `<p style="font-family:var(--f3);font-size:.95rem;color:var(--txt2);line-height:1.7;margin:0;">Todos los jugadores comienzan en: <strong style="color:var(--oro2);">${nom(inicio)}</strong></p>`;
    pasos.push(htmlEscena);

    // Paso 3: PNJs
    const pnjsConPos = pnjs.filter(p => p.posicion_inicial);
    if (pnjsConPos.length > 0) {
      let htmlPnj = `<p style="font-family:var(--f2);font-size:.75rem;letter-spacing:.12em;text-transform:uppercase;color:var(--oro);margin:0 0 .75rem;">Posición inicial de los PNJ</p>`;
      htmlPnj += `<ul style="font-family:var(--f3);font-size:.95rem;color:var(--txt2);line-height:1.9;margin:0;padding-left:1.2rem;">`;
      pnjsConPos.forEach(p => {
        htmlPnj += `<li><strong style="color:var(--txt);">${p.nombre}</strong> — ${nom(p.posicion_inicial)}</li>`;
      });
      htmlPnj += `</ul>`;
      pasos.push(htmlPnj);
    }

    // Paso 4: Cerraduras + Herramienta
    const cerraduras = caso.losetas_cerradas_inicial || [];
    const herramienta = caso.herramienta_ganzua;
    let htmlCerr = `<p style="font-family:var(--f2);font-size:.75rem;letter-spacing:.12em;text-transform:uppercase;color:var(--oro);margin:0 0 .75rem;">Cerraduras y herramienta</p>`;
    if (cerraduras.length > 0) {
      htmlCerr += `<p style="font-family:var(--f3);font-size:.95rem;color:var(--txt2);margin:0 0 .5rem;">Colocad un token de cerradura en:</p>`;
      htmlCerr += `<ul style="font-family:var(--f3);font-size:.95rem;color:var(--txt2);line-height:1.9;margin:0 0 .75rem;padding-left:1.2rem;">`;
      cerraduras.forEach(c => {
        htmlCerr += `<li><strong style="color:var(--txt);">${nom(c.id)}</strong> (FOR ${c.dificultad_for} para forzar)</li>`;
      });
      htmlCerr += `</ul>`;
    }
    if (herramienta) htmlCerr += `<p style="font-family:var(--f3);font-size:.95rem;color:var(--txt2);line-height:1.7;margin:0;">Colocad el token de herramienta en: <strong style="color:var(--oro2);">${nom(herramienta)}</strong></p>`;
    pasos.push(htmlCerr);

    // Mostrar pasos secuencialmente
    this._montajePasos = pasos;
    this._montajePasoActual = 0;
    this._mostrarPasoMontaje();
  },

  _mostrarPasoMontaje() {
    const pasos = this._montajePasos || [];
    const idx = this._montajePasoActual || 0;
    const cont = document.getElementById('montaje-contenido');
    const btn  = document.getElementById('montaje-btn');
    if (!cont || !btn) { console.warn('[Montaje] elementos no encontrados'); return; }

    cont.innerHTML = pasos[idx] || '';

    const esUltimo = idx >= pasos.length - 1;
    btn.textContent = esUltimo ? '✓ Hecho, preparar las cartas' : 'Siguiente →';
    btn.onclick = () => {
      if (esUltimo) {
        document.getElementById('overlay-montaje').classList.remove('activo'); document.getElementById('overlay-montaje').style.display = '';
        UI.mostrarPrepMaterial();
      } else {
        this._montajePasoActual++;
        this._mostrarPasoMontaje();
      }
    };

    // Indicador de paso
    const ind = document.getElementById('montaje-indicador');
    if (ind) ind.textContent = `${idx + 1} / ${pasos.length}`;

    document.getElementById('overlay-montaje').classList.add('activo');
  },

  mostrarPrepMaterial() {
    const pasos = [
      `<p style="font-family:var(--f2);font-size:.75rem;letter-spacing:.12em;text-transform:uppercase;color:var(--oro);margin:0 0 .75rem;">Cartas de Pista</p>
       <p style="font-family:var(--f3);font-size:.95rem;color:var(--txt2);line-height:1.7;margin:0;">Preparad las cartas de Pista del caso en dos mazos boca abajo: el mazo de <strong>pistas descubiertas</strong> y el mazo de <strong>pistas interpretadas</strong>.</p>`,

      `<p style="font-family:var(--f2);font-size:.75rem;letter-spacing:.12em;text-transform:uppercase;color:var(--oro);margin:0 0 .75rem;">Cartas de Exploración</p>
       <p style="font-family:var(--f3);font-size:.95rem;color:var(--txt2);line-height:1.7;margin:0;">Sacad las cartas de Exploración del caso. Colocad cada carta <strong>boca abajo en su loseta correspondiente</strong>, ordenadas de menor a mayor dificultad — la de menor dificultad queda arriba del todo. Incluye las cartas de la escena del crimen.</p>`,

      `<p style="font-family:var(--f2);font-size:.75rem;letter-spacing:.12em;text-transform:uppercase;color:var(--oro);margin:0 0 .75rem;">Mazo de Resolución</p>
       <p style="font-family:var(--f3);font-size:.95rem;color:var(--txt2);line-height:1.7;margin:0;">Barajad el mazo de Resolución. Cada jugador roba <strong>6 cartas</strong> (límite de mano: 6).</p>`,

      `<p style="font-family:var(--f2);font-size:.75rem;letter-spacing:.12em;text-transform:uppercase;color:var(--oro);margin:0 0 .75rem;">Reloj y Alerta</p>
       <p style="font-family:var(--f3);font-size:.95rem;color:var(--txt2);line-height:1.7;margin:0;">Colocad el Reloj en posición <strong>1 (Anochecer)</strong>. Alerta en <strong>0</strong>.</p>`,
    ];

    this._prepPasos = pasos;
    this._prepPasoActual = 0;
    this._mostrarPasoPrep();
  },

  _mostrarPasoPrep() {
    const pasos = this._prepPasos || [];
    const idx = this._prepPasoActual || 0;
    const cont = document.getElementById('prep-contenido');
    const btn  = document.getElementById('prep-btn');
    const ind  = document.getElementById('prep-indicador');
    if (!cont || !btn) { console.warn('[Prep] elementos no encontrados'); return; }

    cont.innerHTML = pasos[idx] || '';
    if (ind) ind.textContent = `${idx + 1} / ${pasos.length}`;

    const esUltimo = idx >= pasos.length - 1;
    btn.textContent = esUltimo ? '✓ Hecho, comenzar investigación' : 'Siguiente →';
    btn.onclick = () => {
      if (esUltimo) {
        document.getElementById('overlay-prep-cartas').classList.remove('activo');
        document.getElementById('overlay-prep-cartas').style.display = '';
        this.irAPartida();
      } else {
        this._prepPasoActual++;
        this._mostrarPasoPrep();
      }
    };

    document.getElementById('overlay-prep-cartas').classList.add('activo');
  },

  // ─── DESHACER ÚLTIMA ACCIÓN ────────────────────────────────────────────────
  _snapshot() {
    try {
      this._estadoAnterior = JSON.parse(JSON.stringify(estado));
    } catch(e) {
      this._estadoAnterior = null;
    }
  },

  _mostrarBtnDeshacer(visible) {
    const btn = document.getElementById('btn-deshacer');
    if (btn) btn.style.display = visible ? 'flex' : 'none';
  },

  deshacerAccion() {
    if (!this._estadoAnterior) return;
    if (!confirm('¿Deshacer la última acción?')) return;
    estado = this._estadoAnterior;
    this._estadoAnterior = null;
    guardarEstado();
    this._mostrarBtnDeshacer(false);
    this.cerrarOverlay('resultado');
    this.cerrarOverlay('interrogatorio');
    this.cerrarOverlay('pistas');
    this.renderizarPartida();
    this._renderAlerta();
    this._renderSospecha();
    Mapa.renderizar();
  },

  irAInicio() {
    document.querySelectorAll('.overlay-modal').forEach(o => {
      o.style.display = '';
      o.classList.remove('activo');
    });
    this._mostrarPantalla('inicio');
  },

  irAConfig() {
    document.querySelectorAll('.overlay-modal').forEach(o => {
      o.style.display = '';
      o.classList.remove('activo');
    });
    Config.inicializar();
    this._mostrarPantalla('config');
  },

  irAPartida() {
    this._mostrarPantalla('partida');
    Promise.all([
      typeof cargarSucesos === 'function' ? cargarSucesos() : Promise.resolve(),
      typeof precargarAvatares === 'function' ? precargarAvatares() : Promise.resolve(),
      typeof cargarCartasExploracion === 'function' ? cargarCartasExploracion(estado?.caso_id) : Promise.resolve()
    ]).then(() => {
      this.renderizarPartida();
      setTimeout(() => Mapa.renderizar(), 80);
    });
  },

  continuarPartida() {
    const guardado = cargarEstadoGuardado();
    if (!guardado) return;
    estado = guardado;
    Promise.all([
      cargarDatosBase(),
      cargarDatosCaso(estado.caso_id)
    ]).then(() => cargarVariante(estado.caso_id, estado.variante))
      .then(() => { cargarDatosPistasSync(); asegurarTurno(); this.irAPartida(); });
  },

  _mostrarPantalla(id) {
    document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
    document.getElementById(`pantalla-${id}`).classList.add('activa');
  },

  // ─── RENDER PARTIDA PRINCIPAL ───────────────────────────────────────────────

  renderizarPartida() {
    this._renderHUDReloj();
    this._renderHUDAlerta();
    this._renderHUDSospecha();
    this._renderHUDJugadores();
    this._renderClimax();
    this.actualizarBtnFinFase();
    // Actualizar título
    const titulo = datosCaso?.comun?.titulo || estado?.caso_id || '';
    const el = document.getElementById('hud-fase-txt');
    if (el) {
      const faseNom = { anochecer:'Anochecer', medianoche:'Medianoche', madrugada:'Madrugada' };
      el.textContent = faseNom[estado.fase] || estado.fase;
    }
  },

  _renderReloj() {
    const container = document.getElementById('reloj-celdas');
    const label = document.getElementById('reloj-fase');
    const numero = document.getElementById('reloj-num');
    const badge = document.getElementById('p-fase-badge');

    const faseNombres = { anochecer: 'Anochecer', medianoche: 'Medianoche', madrugada: 'Madrugada' };
    const faseClases  = { anochecer: 'badge-oro', medianoche: 'badge-rojo', madrugada: '' };

    label.textContent = faseNombres[estado.fase];
    numero.textContent = estado.ronda;
    badge.textContent = faseNombres[estado.fase];
    badge.className = `badge ${faseClases[estado.fase]}`;

    container.innerHTML = '';
    for (let i = 1; i <= 12; i++) {
      const div = document.createElement('div');
      div.className = 'reloj-celda';
      const fase = i <= 4 ? 'anochecer' : i <= 8 ? 'medianoche' : 'madrugada';
      if (i <= estado.ronda) div.classList.add(fase);
      if (i === estado.ronda) div.classList.add('actual');
      container.appendChild(div);
    }
  },

  _renderAlerta() {
    const container = document.getElementById('alerta-celdas');
    const estadoLabel = document.getElementById('alerta-estado');
    const efecto = getEfectoAlerta();

    container.innerHTML = '';
    for (let i = 1; i <= 10; i++) {
      const div = document.createElement('div');
      div.className = 'casilla-alerta';
      if (i <= estado.alerta) {
        if (i <= 2)       div.classList.add('a-verde');
        else if (i <= 4)  div.classList.add('a-lima');
        else if (i <= 6)  div.classList.add('a-ambar');
        else if (i <= 8)  div.classList.add('a-naranja');
        else if (i === 9) div.classList.add('a-rojo');
        else              div.classList.add('a-critico');
      }
      container.appendChild(div);
    }

    estadoLabel.textContent = efecto.nombre;
  },

  _renderSospecha() {
    const grid = document.getElementById('sosp-grid');
    grid.innerHTML = '';

    datosCaso.comun.pnj.forEach(pnj => {
      const estPNJ = estado.pnj[pnj.id];
      const card = document.createElement('div');
      card.className = 'sosp-card';
      if (estPNJ.bloqueado) card.classList.add('bloqueado');
      if (estPNJ.sospecha >= (pnj.sospecha_max || 5)) card.classList.add('max-alcanzado');

      const nombre = document.createElement('div');
      nombre.className = 'sosp-nom';
      nombre.textContent = pnj.nombre;

      const casillas = document.createElement('div');
      casillas.className = 'sosp-celdas';

      for (let i = 1; i <= 5; i++) {
        const c = document.createElement('div');
        c.className = 'sosp-celda';
        if (i <= estPNJ.sospecha) {
          const lvl = i<=3?'s'+i:i===4?'s4':'s5'; c.classList.add(lvl);
          if (i === 4) c.classList.add('s4');
          if (i === 5) c.classList.add('s5');
        }
        // Tap para ajustar manualmente
        c.addEventListener('click', () => this._ajustarSospecha(pnj.id, i));
        casillas.appendChild(c);
      }

      // Indicador sospecha máx
      if (pnj.sospecha_max && pnj.sospecha_max < 5) {
        const maxInd = document.createElement('div');
        maxInd.style.cssText = 'font-size:0.6rem; color:var(--oro-oscuro); text-align:right; margin-top:2px;';
        maxInd.textContent = `máx ${pnj.sospecha_max}`;
        card.appendChild(nombre);
        card.appendChild(casillas);
        card.appendChild(maxInd);
      } else {
        card.appendChild(nombre);
        card.appendChild(casillas);
      }

      card.addEventListener('click', (e) => {
        if (!e.target.classList.contains('sosp-celda')) {
          this._mostrarInfoPNJ(pnj.id);
        }
      });

      grid.appendChild(card);
    });
  },

  _ajustarSospecha(pnj_id, nivel) {
    const estPNJ = estado.pnj[pnj_id];
    if (estPNJ.sospecha === nivel) {
      // Click en el nivel actual → bajar uno
      bajarSospecha(pnj_id, 1);
    } else {
      const anterior = estPNJ.sospecha;
      const res = subirSospecha(pnj_id, nivel - estPNJ.sospecha);
      if (res && res.reaccionesNuevas.length > 0) {
        this._mostrarReacciones(pnj_id, res.reaccionesNuevas);
      }
    }
    this._renderAlerta();
    this._renderSospecha();
    guardarEstado();
  },

  _renderJugadores() {
    const container = document.getElementById('lista-jug-partida');
    container.innerHTML = '';
    estado.jugadores.forEach((j, idx) => {
      const pj = PERSONAJES[j.personaje];
      const color   = getPJColor(j.personaje);
      const colorUI = (typeof getPJColorUI === 'function') ? getPJColorUI(j.personaje) : color;
      const pjCorto = pj.nombre.replace('El ','').replace('La ','');
      const div = document.createElement('div');
      div.className = 'jug-card';
      div.innerHTML = `
        <img src="assets/personajes/${pj.imagen}"
             onerror="this.style.display='none'"
             style="width:42px;height:42px;border-radius:50%;object-fit:cover;border:2px solid ${colorUI};flex-shrink:0;">
        <div class="jug-info">
          <p class="jug-nombre">${pjCorto}</p>
          <p class="jug-pj" style="color:${colorUI};">${pjCorto}</p>
          <p class="jug-hab">${pj.habilidad_nombre}</p>
          <p class="jug-loseta">📍 ${this._nombreLoseta(j.loseta_actual)}</p>
        </div>
        <div class="jug-attrs">
          <div class="attr-chip">
            <span class="attr-chip-val">${j.atributos.FOR}</span>
            <span class="attr-chip-lbl">FOR</span>
          </div>
          <div class="attr-chip">
            <span class="attr-chip-val">${j.atributos.INT}</span>
            <span class="attr-chip-lbl">INT</span>
          </div>
          <div class="attr-chip">
            <span class="attr-chip-val">${j.atributos.TEM}</span>
            <span class="attr-chip-lbl">TEM</span>
          </div>
        </div>
      `;
      container.appendChild(div);
    });
  },

  _renderClimax() {
    const container = document.getElementById('btn-climax');
    container.style.display = estado.acusacion_desbloqueada ? 'block' : 'none';
  },

  _nombreLoseta(id) {
    const loseta = getLoseta(id);
    return loseta ? loseta.nombre : id;
  },

  // ─── REACCIONES PNJ ────────────────────────────────────────────────────────

  // Muestra todas las reacciones de la transición de fase en una sola pantalla
  _mostrarReaccionesFase(fase, reacciones_por_pnj) {
    const pasos = [];
    pasos.push({ tipo: 'intro', fase });
    reacciones_por_pnj.forEach(({ pnj_id, reacciones }) => {
      reacciones.forEach(({ nivel, reaccion }) => {
        if (!reaccion?.texto) return;
        pasos.push({ tipo: 'reaccion', pnj_id, nivel, reaccion });
      });
    });

    let idx = 0;
    const nomFase = { medianoche: 'Medianoche', madrugada: 'Madrugada' };
    const _faseTextos = {
      medianoche: 'La oscuridad se instala en Blackmoor Hall. Los ánimos se crispan.',
      madrugada:  'Las horas avanzan sin piedad. Nadie puede ya disimular sus nervios.'
    };

    const renderPaso = () => {
      const container = document.getElementById('reaccion-cont');
      container.innerHTML = '';
      const paso = pasos[idx];
      const esUltimo = idx === pasos.length - 1;

      if (paso.tipo === 'intro') {
        const tit = document.createElement('p');
        tit.className = 'drw-titulo';
        tit.textContent = `Cambio de fase \u2014 ${nomFase[paso.fase] || paso.fase}`;
        container.appendChild(tit);

        const mec = document.createElement('p');
        mec.style.cssText = 'font-family:var(--f2);font-size:.72rem;letter-spacing:.1em;color:#a08060;margin:0 0 .75rem;text-align:center;';
        mec.textContent = 'Sospecha +1 a todos los personajes';
        container.appendChild(mec);

        const intro = document.createElement('p');
        intro.style.cssText = 'font-family:var(--f3);font-size:.95rem;color:#a09080;font-style:italic;margin:0 0 1rem;text-align:center;';
        intro.textContent = _faseTextos[paso.fase] || 'La tensión se intensifica.';
        container.appendChild(intro);

        if (pasos.length === 1) {
          const noReac = document.createElement('p');
          noReac.style.cssText = 'font-family:var(--f3);color:#a09080;font-style:italic;margin-top:.5rem;';
          noReac.textContent = 'Los personajes encajan la noticia en silencio.';
          container.appendChild(noReac);
        }

      } else {
        const pnjDef = getPNJ(paso.pnj_id);
        const badge = document.createElement('div');
        badge.style.cssText = 'margin-bottom:.5rem;';
        badge.innerHTML = `<span class="badge badge-rojo">${pnjDef?.nombre || paso.pnj_id}</span>`;
        container.appendChild(badge);

        const box = document.createElement('div');
        box.className = 'interrog-texto';
        box.innerHTML = this._renderTextoNarrativo(paso.reaccion.texto);
        container.appendChild(box);

        const efectos = paso.reaccion.efectos || paso.reaccion.efectos_inmediatos || [];
        if (efectos.length > 0) {
          const efDiv = document.createElement('div');
          efDiv.className = 'respuesta-efectos';
          efectos.forEach(ef => {
            const txt = this._textoEfecto(ef);
            if (!txt) return;
            const chip = document.createElement('span');
            chip.className = 'badge badge-rojo';
            chip.textContent = txt;
            efDiv.appendChild(chip);
          });
          container.appendChild(efDiv);
        }
      }

      if (pasos.length > 1) {
        const prog = document.createElement('p');
        prog.style.cssText = 'font-family:var(--f2);font-size:.7rem;color:#6a5a40;text-align:center;margin:.75rem 0 0;';
        prog.textContent = `${idx + 1} / ${pasos.length}`;
        container.appendChild(prog);
      }

      const btn = document.createElement('button');
      btn.className = 'btn btn-primario btn-bloque mt-md';
      btn.textContent = esUltimo ? 'Continuar' : 'Siguiente \u2192';
      btn.onclick = () => {
        if (esUltimo) {
          this.cerrarOverlay('reaccion');
          // Si venimos de un cambio de fase, mostrar el overlay de inicio de fase ahora
          setTimeout(() => this.mostrarInicioFase(estado.ronda, estado.fase), 150);
        }
        else { idx++; renderPaso(); }
      };
      container.appendChild(btn);
    };

    renderPaso();
    this._abrirOverlay('reaccion');
  },


  _mostrarReacciones(pnj_id, reacciones) {
    const pnjDef = getPNJ(pnj_id);
    const container = document.getElementById('reaccion-cont');
    container.innerHTML = '';

    reacciones.forEach(({ nivel, reaccion }) => {
      const div = document.createElement('div');
      div.className = 'flex-col gap-sm';

      const badge = document.createElement('div');
      badge.innerHTML = `<span class="badge badge-rojo">${pnjDef.nombre}</span>`;
      div.appendChild(badge);

      if (reaccion.texto) {
        const box = document.createElement('div');
        box.className = 'interrog-texto';
        box.innerHTML = this._renderTextoNarrativo(reaccion.texto);
        div.appendChild(box);
      }

      // Efectos
      const efectosDiv = document.createElement('div');
      efectosDiv.className = 'respuesta-efectos';
      const efectos = reaccion.efectos || reaccion.efectos_inmediatos || [];
      efectos.forEach(ef => {
        const chip = document.createElement('span');
        const _efTxt5 = this._textoEfecto(ef);
        if (!_efTxt5) return;
        chip.className = 'badge badge-rojo';
        chip.textContent = _efTxt5;
        efectosDiv.appendChild(chip);
      });
      if (efectos.length > 0) div.appendChild(efectosDiv);

      container.appendChild(div);
    });

    const btnCerrar = document.createElement('button');
    btnCerrar.className = 'btn btn-primario btn-bloque mt-md';
    btnCerrar.textContent = 'Entendido';
    btnCerrar.onclick = () => this.cerrarOverlay('reaccion');
    container.appendChild(btnCerrar);

    this._abrirOverlay('reaccion');
  },

  // Devuelve texto legible para un chip de efecto, o null si no debe mostrarse
  _textoEfecto(ef) {
    if (!ef) return null;
    const nomLoseta = id => (typeof getLoseta === 'function' ? (getLoseta(id)?.nombre || id) : id);
    const nomPNJ    = id => {
      const def = datosCaso?.comun?.pnj?.find(p => p.id === id);
      return def?.nombre || id;
    };
    switch (ef.tipo) {
      case 'sin_efecto':
        return null; // Sin chip
      case 'movimiento_puertas':
        return 'Se retira';
      case 'activar_implicado':
        return '⚠ Colocar token Implicado';
      case 'bloqueo_interrogatorio':
        return 'No responderá más preguntas';
      case 'mod_interrogatorio_propio': {
        const s = ef.modificador > 0 ? '+' : '';
        const attr = ef.atributo ? ` ${ef.atributo}` : '';
        return ef.modificador > 0
          ? `Más difícil de interrogar (${s}${ef.modificador}${attr})`
          : `Más dispuesto a hablar (${s}${ef.modificador}${attr})`;
      }
      case 'mod_interrogatorio_contexto': {
        const s = ef.modificador > 0 ? '+' : '';
        const sala = ef.loseta ? ` en ${nomLoseta(ef.loseta)}` : '';
        return ef.modificador < 0
          ? `Más fácil interrogar${sala} (${s}${ef.modificador})`
          : `Más difícil interrogar${sala} (${s}${ef.modificador})`;
      }
      case 'atributo_jugadores_presentes': {
        const s = ef.modificador > 0 ? '+' : '';
        return `${ef.atributo} ${s}${ef.modificador} (todos presentes)`;
      }
      case 'mover_a_loseta':
        return `Se dirige a ${nomLoseta(ef.destino || '')}`;
      case 'retirar_token': {
        const dest = ef.reaparece_en ? nomLoseta(ef.reaparece_en) : '?';
        return `Abandona la escena — reaparece en ${dest}`;
      }
      case 'prueba_para_detener': {
        const s = ef.atributo || 'FOR';
        return `Prueba ${s} dif. ${ef.dificultad || '?'} para retenerle`;
      }
      case 'mod_atributo_al_interrogar': {
        const s = ef.modificador > 0 ? '+' : '';
        return `${ef.atributo} ${s}${ef.modificador} al interrogador`;
      }
      default:
        return null; // Tipos desconocidos: silencio
    }
  },

  // ─── DRAWER ALERTA ─────────────────────────────────────────────────────────

  mostrarInfoAlerta() {
    const efecto = getEfectoAlerta();
    document.getElementById('alerta-drw-tit').textContent = `Alerta ${estado.alerta} — ${efecto.nombre}`;

    const TABLA = [
      [0,  'Calma',         'Sin efectos.'],
      [3,  'Desconfianza',  '+1 a todos los interrogatorios.'],
      [5,  'Nerviosismo',   'Al final de cada ronda: 1 PNJ se mueve.'],
      [7,  'Pánico',        'Al final de cada ronda: 1 PNJ se mueve dos veces.'],
      [9,  'Crisis',        'Alerta 9 inmediato: el PNJ con mayor Sospecha destruye la carta de Exploración no descubierta más cercana. Sin interrogatorios con pista mientras dure.'],
      [10, 'Desastre',      'Fracaso automático. El crimen queda sin resolver.']
    ];

    const container = document.getElementById('alerta-drw-cont');
    container.innerHTML = '<div class="flex-col gap-sm">';
    TABLA.forEach(([nivel, nombre, desc]) => {
      const activo = estado.alerta >= nivel;
      const esActual = (nivel === 0 && estado.alerta < 3) ||
                       (nivel === 3 && estado.alerta >= 3 && estado.alerta < 5) ||
                       (nivel === 5 && estado.alerta >= 5 && estado.alerta < 7) ||
                       (nivel === 7 && estado.alerta >= 7 && estado.alerta < 9) ||
                       (nivel === 9 && estado.alerta === 9) ||
                       (nivel === 10 && estado.alerta >= 10);
    const row = document.createElement('div');
      row.style.cssText = `display:flex; gap:0.75rem; align-items:flex-start; padding:0.5rem; border-radius:4px; background:${esActual ? 'rgba(201,168,76,0.08)' : 'transparent'}; border:${esActual ? '1px solid var(--oro-oscuro)' : '1px solid transparent'};`;
      row.innerHTML = `
        <span style="font-family:var(--fuente-titulo); color:${activo ? 'var(--oro)' : 'var(--gris-claro)'}; min-width:1.5rem; font-size:0.85rem;">${nivel}</span>
        <div>
          <div style="font-family:var(--fuente-texto); font-size:0.8rem; color:${activo ? 'var(--pergamino)' : 'var(--gris-claro)'}; letter-spacing:0.08em;">${nombre}</div>
          <div style="font-size:0.8rem; color:var(--gris-claro); margin-top:2px;">${desc}</div>
        </div>
      `;
      container.appendChild(row);
    });

    // Botones +/- Alerta
    const controles = document.createElement('div');
    controles.style.cssText = 'display:flex; gap:0.5rem; margin-top:1rem;';
    controles.innerHTML = `
      <button class="btn btn-s" style="flex:1;" onclick="UI._cambiarAlerta(-1)">− Alerta</button>
      <button class="btn btn-d" style="flex:1;" onclick="UI._cambiarAlerta(+1)">+ Alerta</button>
    `;
    container.appendChild(controles);

    this._abrirOverlay('alerta');
  },

  _cambiarAlerta(delta) {
    if (delta > 0) subirAlerta(delta, 'Ajuste manual');
    else bajarAlerta(-delta, 'Ajuste manual');
    this._renderAlerta();
    this.cerrarOverlay('alerta');
    setTimeout(() => this.mostrarInfoAlerta(), 50);
  },

  // ─── INTERROGATORIO ────────────────────────────────────────────────────────

  abrirInterrogatorio(jugIdxOpt, pnjIdOpt) {
    const container = document.getElementById('interrog-cont');
    container.innerHTML = '';
    // Si viene del mapa con PNJ directo, saltar al paso 2
    if (pnjIdOpt !== undefined) {
      this._abrirOverlay('interrogatorio');
      this._seleccionarPNJInterrogatorio(pnjIdOpt);
      return;
    }

    // Paso 1: Seleccionar PNJ
    const tituloPNJ = document.createElement('p');
    tituloPNJ.className = 'subtitulo';
    tituloPNJ.style.marginBottom = '0.5rem';
    tituloPNJ.style.display = 'none';
    container.appendChild(tituloPNJ);

    datosCaso.comun.pnj.forEach(pnj => {
      const estPNJ = estado.pnj[pnj.id];
      const btn = document.createElement('button');
      btn.className = 'btn btn-secundario btn-bloque';
      btn.style.marginBottom = '0.375rem';
      btn.textContent = estPNJ.bloqueado ? `${pnj.nombre} — ${pnj.rol}` : `${pnj.nombre} — ${pnj.rol}`;
      if (estPNJ.bloqueado) { btn.disabled = true; btn.title = 'No responderá más preguntas'; }
      btn.onclick = () => this._seleccionarPNJInterrogatorio(pnj.id);
      container.appendChild(btn);
    });

    this._abrirOverlay('interrogatorio');
  },

  _seleccionarPNJInterrogatorio(pnj_id, accionYaConsumida = false) {
    const pnjDef = getPNJ(pnj_id);
    const container = document.getElementById('interrog-cont');
    container.innerHTML = '';

    // Declaración inicial
    const decl_leida = estado.declaraciones_leidas.includes(pnj_id);

    if (!decl_leida) {
      // Nombre del PNJ
      const nomElDecl = document.createElement('div');
      nomElDecl.className = 'interrog-pnj-nom';
      nomElDecl.textContent = pnjDef?.nombre || pnj_id;
      container.appendChild(nomElDecl);

      const tipoElDecl = document.createElement('span');
      tipoElDecl.className = 'interrog-tipo';
      tipoElDecl.textContent = 'Declaración inicial';
      container.appendChild(tipoElDecl);

      const declBox = document.createElement('div');
      declBox.className = 'interrog-texto';
      declBox.style.marginBottom = '0.75rem';
      const declText = datosCaso.comun.declaraciones_espontaneas[pnj_id];
      declBox.innerHTML = this._renderTextoNarrativo(declText);
      container.appendChild(declBox);

      const btnMarcar = document.createElement('button');
      btnMarcar.className = 'btn btn-primario btn-bloque';
      btnMarcar.style.marginBottom = '0.75rem';
      btnMarcar.textContent = 'Entendido — continuar';
      btnMarcar.onclick = () => {
        estado.declaraciones_leidas.push(pnj_id);
        guardarEstado();
        if (this._pendienteAccionInterrogatorio) {
          this._pendienteAccionInterrogatorio();
          this._pendienteAccionInterrogatorio = null;
        }
        this.cerrarOverlay('interrogatorio');
        this.renderizarPartida();
        Mapa.renderizar();
      };
      container.appendChild(btnMarcar);

      return; // La declaración es la acción completa — no mostrar sección de pistas
    }

    // Nombre del PNJ en grande
    const nomEl = document.createElement('div');
    nomEl.className = 'interrog-pnj-nom';
    nomEl.textContent = pnjDef?.nombre || pnj_id;
    container.appendChild(nomEl);

    const tipoEl = document.createElement('span');
    tipoEl.className = 'interrog-tipo';
    tipoEl.textContent = 'Interrogar con pista';
    container.appendChild(tipoEl);

    if (estado.alerta >= 9) {
      const bloqueo = document.createElement('div');
      bloqueo.className = 'respuesta-box';
      bloqueo.style.borderColor = 'var(--sangre)';
      bloqueo.textContent = 'La tensión es tan extrema que esta noche nadie responderá más preguntas.';
      container.appendChild(bloqueo);
      return;
    }

    // Lista de pistas disponibles
    if (estado.pistas_interpretadas.length === 0) {
      const aviso = document.createElement('p');
      aviso.className = 'texto-sutil italica';
      aviso.textContent = estado.pistas_descubiertas.length > 0
        ? 'Tenéis pistas descubiertas, pero hay que interpretarlas antes de usarlas en un interrogatorio.'
        : 'No hay pistas interpretadas todavía. Explorad e interpretad primero.';
      container.appendChild(aviso);
      return;
    }

    // Solo las pistas interpretadas pueden usarse en interrogatorios
    const todasPistas = [...estado.pistas_interpretadas];
    const _cartas_btn = (typeof _CARTAS_DATOS !== 'undefined' && _CARTAS_DATOS)
      ? (_CARTAS_DATOS[estado.caso_id]?.cartas || []) : [];

    todasPistas.forEach(pista_id => {
      // Verificar si ya se usó esta pista con este PNJ
      const entradaFound = typeof _encontrarEntrada === 'function' ? _encontrarEntrada(pnj_id, pista_id) : null;
      if (!entradaFound) return; // Sin entrada ni _resto: no mostrar
      // Bloquear si ya se usó la entrada específica para esta pista con este PNJ
      const esResto = entradaFound.key.endsWith('_resto');
      const yaUsada = !esResto && estado.pnj[pnj_id].interrogatorios_usados.includes(entradaFound.key);
      if (yaUsada) return;

      const btn = document.createElement('button');
      btn.className = 'btn btn-secundario btn-bloque';
      btn.style.marginBottom = '0.375rem';
      const nomPistaBtn = (() => {
        const c = _cartas_btn.find(x => x.pista_id === pista_id);
        return c ? (c.pista_nombre || c.titulo || pista_id) : pista_id;
      })();
      btn.innerHTML = `<span class="pista-chip interpretada">${nomPistaBtn}</span>`;
      btn.onclick = () => this._resolverInterrogatorioUI(pnj_id, pista_id);
      container.appendChild(btn);
    });

    const btnVolver = document.createElement('button');
    btnVolver.className = 'btn btn-secundario btn-bloque mt-md';
    btnVolver.textContent = 'Cerrar';
    btnVolver.onclick = () => { this.cerrarOverlay('interrogatorio'); this.renderizarPartida(); Mapa.renderizar(); };
    container.appendChild(btnVolver);
  },

  _resolverInterrogatorioUI(pnj_id, pista_id) {
    this._snapshot();
    const calc = calcularDificultad(pnj_id, pista_id);
    if (!calc || calc.bloqueado) {
      this._mostrarNotificacion('Bloqueado', calc?.razon || 'No hay entrada para esta combinación.');
      return;
    }

    // Respuesta sin prueba (entrada _resto u otras sin atributo): ir directo al resultado
    if (calc.sinPrueba) {
      const res = resolverInterrogatorio(pnj_id, pista_id, 'exito');
      if (res) this._mostrarResultadoInterrogatorio(pnj_id, pista_id, res);
      return;
    }

    const jugIdx = this._jugIdxInterrogatorio ?? 0;
    const jug = estado.jugadores[jugIdx];
    const pjNombre = PERSONAJES[jug?.personaje]?.nombre || jug?.personaje || '';

    const container = document.getElementById('interrog-cont');
    container.innerHTML = '';

    // Nombre PNJ + tipo
    const nomEl = document.createElement('div');
    nomEl.className = 'interrog-pnj-nom';
    nomEl.textContent = getPNJ(pnj_id)?.nombre || pnj_id;
    container.appendChild(nomEl);

    const tipoEl = document.createElement('span');
    tipoEl.className = 'interrog-tipo';
    tipoEl.textContent = `Interrogatorio — ${pjNombre}`;
    container.appendChild(tipoEl);

    // Bloque dificultad
    const infoDiv = document.createElement('div');
    infoDiv.className = 'dificultad-display';
    infoDiv.innerHTML = `
      <div class="dificultad-numero">${calc.dificultad}</div>
      <div class="dificultad-desglose">
        <div><strong>${calc.atributo}</strong> dif. base ${calc.entrada.dificultad}</div>
        ${calc.mods.map(m => `<div class="${m.valor > 0 ? 'mod-positivo' : 'mod-negativo'}">${m.valor > 0 ? '+' : ''}${m.valor} ${m.texto}</div>`).join('')}
      </div>
    `;
    container.appendChild(infoDiv);

    // 4 botones de resultado
    const instrEl = document.createElement('p');
    instrEl.className = 'texto-sutil';
    instrEl.style.cssText = 'margin:.75rem 0 .5rem; font-style:normal;';
    instrEl.textContent = '¿Cuál es el resultado de la prueba?';
    container.appendChild(instrEl);

    // Selector de enfoque
    let _enfoqueDecididoInt = false;
    const enfoqueWrapInt = document.createElement('div');
    enfoqueWrapInt.style.cssText = 'display:flex;gap:.5rem;margin-bottom:.75rem;';
    const mkEBI = (label) => {
      const b = document.createElement('button');
      b.style.cssText = 'flex:1;padding:.5rem .4rem;border-radius:8px;font-family:var(--f2);font-size:.7rem;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;border:1px solid;transition:all .15s;touch-action:manipulation;';
      b.textContent = label;
      return b;
    };
    const btnCautInt = mkEBI('🛡 Cauteloso');
    const btnDecInt  = mkEBI('⚔ Decidido · +1 Alerta');
    const actualizarEnfoqueInt = () => {
      btnCautInt.style.background  = !_enfoqueDecididoInt ? 'rgba(80,160,80,.2)'  : 'rgba(0,0,0,.2)';
      btnCautInt.style.borderColor = !_enfoqueDecididoInt ? 'rgba(80,160,80,.5)'  : 'rgba(255,255,255,.1)';
      btnCautInt.style.color       = !_enfoqueDecididoInt ? '#81c784' : '#555';
      btnDecInt.style.background   =  _enfoqueDecididoInt ? 'rgba(200,80,40,.2)'  : 'rgba(0,0,0,.2)';
      btnDecInt.style.borderColor  =  _enfoqueDecididoInt ? 'rgba(200,80,40,.5)'  : 'rgba(255,255,255,.1)';
      btnDecInt.style.color        =  _enfoqueDecididoInt ? '#e07050' : '#555';
    };
    btnCautInt.onclick = () => { _enfoqueDecididoInt = false; actualizarEnfoqueInt(); };
    btnDecInt.onclick  = () => { _enfoqueDecididoInt = true;  actualizarEnfoqueInt(); };
    actualizarEnfoqueInt();
    enfoqueWrapInt.appendChild(btnCautInt);
    enfoqueWrapInt.appendChild(btnDecInt);
    container.appendChild(enfoqueWrapInt);

    const resultados = [
      { id: 'exito',   label: '✓ Éxito',   color: '#4caf50' },
      { id: 'fracaso', label: '✗ Fracaso', color: '#ef9a9a' },
    ];

    resultados.forEach(({ id, label, color }) => {
      const btn = document.createElement('button');
      btn.className = 'btn btn-s btn-bloque';
      btn.style.borderColor = color;
      btn.style.color = color;
      btn.style.marginBottom = '0.375rem';
      btn.textContent = label;
      btn.onclick = () => {
        if (_enfoqueDecididoInt) subirAlerta(1, 'Enfoque decidido');
        const res = resolverInterrogatorio(pnj_id, pista_id, id);
        if (res) this._mostrarResultadoInterrogatorio(pnj_id, pista_id, res);
      };
      container.appendChild(btn);
    });

    const btnVolver = document.createElement('button');
    btnVolver.className = 'btn btn-secundario btn-bloque mt-md';
    btnVolver.textContent = '← Volver';
    btnVolver.onclick = () => this._seleccionarPNJInterrogatorio(pnj_id);
    container.appendChild(btnVolver);
  },

  _mostrarResultadoInterrogatorio(pnj_id, pista_id, res) {
    this._mostrarBtnDeshacer(true);
    if (!res || res.bloqueado) {
      this._mostrarNotificacion('Bloqueado', res?.razon || 'Error en interrogatorio.');
      return;
    }

    const jugIdx = this._jugIdxInterrogatorio ?? 0;
    const jug = estado.jugadores[jugIdx];
    const personaje = PERSONAJES[jug?.personaje] || {};
    const pnjDef = getPNJ(pnj_id) || {};

    const iconos  = { critico: '★', exito: '✓', fracaso: '✗', pifia: '☠' };
    const colores = { critico: 'var(--oro)', exito: '#81c784', fracaso: '#ef9a9a', pifia: '#b71c1c' };
    const etiquetas = { critico: 'Éxito crítico', exito: 'Éxito', fracaso: 'Fracaso', pifia: 'Pifia' };
    const tr = res.tipo_resultado;

    document.getElementById('resultado-tit').innerHTML =
      `<span style="color:${colores[tr]}">${iconos[tr]}</span> ${etiquetas[tr]} — ${pnjDef.nombre || pnj_id}`;

    const container = document.getElementById('resultado-cont');
    container.innerHTML = '';

    // Dificultad (sin total numérico — el jugador ya sabe su resultado)
    const numDiv = document.createElement('div');
    numDiv.style.cssText = 'text-align:center; margin-bottom:0.75rem;';
    numDiv.innerHTML = `<div style="font-family:var(--fuente-titulo); font-size:2rem; color:${colores[tr]};">${etiquetas[tr]}</div>`;
    container.appendChild(numDiv);

    // Texto de respuesta
    const box = document.createElement('div');
    box.className = 'interrog-texto';
    box.innerHTML = this._renderTextoNarrativo(res.texto);
    container.appendChild(box);

    // Efectos aplicados
    if (res.efectos && res.efectos.length > 0) {
      const efDiv = document.createElement('div');
      efDiv.className = 'respuesta-efectos mt-sm';
      res.efectos.forEach(ef => {
        const chip = document.createElement('span');
        const _efTxt2 = this._textoEfecto(ef);
        if (!_efTxt2) return;
        chip.className = 'badge badge-rojo';
        chip.textContent = _efTxt2;
        efDiv.appendChild(chip);
      });
      container.appendChild(efDiv);
    }

    // Ojo entrenado (solo Inspector — en fracaso o pifia)
    if (res.ojo_entrenado && personaje.habilidad_id === 'ojo_entrenado' && (res.tipo_resultado === 'fracaso' || res.tipo_resultado === 'pifia')) {
      const ojoDiv = document.createElement('div');
      ojoDiv.className = 'interrog-texto';
      ojoDiv.style.borderColor = 'var(--oro-oscuro)';
      ojoDiv.innerHTML = `<div style="font-size:0.65rem; color:var(--oro-oscuro); text-transform:uppercase; letter-spacing:0.1em; margin-bottom:0.25rem;">Ojo entrenado</div>${res.ojo_entrenado}`;
      container.appendChild(ojoDiv);
    }

    // Prensa (solo Periodista en fracaso/pifia)
    if (res.prensa && personaje.habilidad_id === 'olfato_periodistico' && (res.tipo_resultado === 'fracaso' || res.tipo_resultado === 'pifia')) {
      const prensaDiv = document.createElement('div');
      prensaDiv.className = 'interrog-texto';
      prensaDiv.style.borderColor = '#1a5276';
      prensaDiv.innerHTML = `<div style="font-size:0.65rem; color:#4a90c4; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:0.25rem;">Olfato periodístico</div>${res.prensa}`;
      container.appendChild(prensaDiv);
    }

    const btnCerrar = document.createElement('button');
    btnCerrar.className = 'btn btn-primario btn-bloque mt-md';
    btnCerrar.textContent = 'Continuar';
    btnCerrar.onclick = () => {
      // Aplicar efectos AHORA, después de que el jugador ha leído el resultado
      confirmarInterrogatorio(res);

      // Marcar acción como ejecutada
      if (this._pendienteAccionInterrogatorio) {
        this._pendienteAccionInterrogatorio();
        this._pendienteAccionInterrogatorio = null;
      }
      this.cerrarOverlay('resultado');
      this.cerrarOverlay('interrogatorio');
      this.renderizarPartida();
      this._renderAlerta();
      this._renderSospecha();
      Mapa.renderizar();

      // Mostrar reacciones encadenadas si las hay
      const efReacc = (res.efectos || []).find(e => e.tipo === '_reacciones');
      if (efReacc?.reacciones?.length > 0) {
        setTimeout(() => this._mostrarReacciones(efReacc.pnj_id, efReacc.reacciones), 200);
      }
    };
    container.appendChild(btnCerrar);

    this.cerrarOverlay('interrogatorio');
    this._abrirOverlay('resultado');
  },

  // ─── PISTAS & DEDUCCIONES ──────────────────────────────────────────────────

  abrirPistasConAccion(jugIdx) {
    this._pendienteAccionDeducir = jugIdx;
    this.abrirPistas();
  },

  abrirPistas() {
    const container = document.getElementById('pistas-cont');
    container.innerHTML = '';

    // Normalizar: toda pista interpretada debe estar también en descubiertas
    if (!estado.pistas_descubiertas)  estado.pistas_descubiertas  = [];
    if (!estado.pistas_interpretadas) estado.pistas_interpretadas = [];
    estado.pistas_interpretadas.forEach(pid => {
      if (!estado.pistas_descubiertas.includes(pid))
        estado.pistas_descubiertas.push(pid);
    });

    // Pistas descubiertas
    const tituloDesc = document.createElement('p');
    tituloDesc.className = 'subtitulo';
    tituloDesc.style.marginBottom = '0.5rem';
    tituloDesc.textContent = 'Pistas descubiertas';
    container.appendChild(tituloDesc);

    // Nombres legibles — disponibles para todo el scope de la función
    const _cartas = (typeof _CARTAS_DATOS !== 'undefined' && _CARTAS_DATOS)
      ? (_CARTAS_DATOS[estado.caso_id]?.cartas || []) : [];
    const _nomPista = (pid) => {
      const c = _cartas.find(x => x.pista_id === pid);
      return c ? c.pista_nombre || c.titulo : pid;
    };

    if (estado.pistas_descubiertas.length === 0) {
      container.appendChild(this._textoVacio('Sin pistas descubiertas todavía.'));
    } else {
      const pendientesInterp = estado.pistas_descubiertas.filter(p => !estado.pistas_interpretadas.includes(p));
      if (pendientesInterp.length === 0) {
        container.appendChild(this._textoVacio('Todas las pistas descubiertas ya están interpretadas.'));
      } else {
        const flex = document.createElement('div');
        flex.style.cssText = 'display:flex; flex-wrap:wrap; gap:0.375rem; margin-bottom:1rem;';
        pendientesInterp.forEach(p_id => {
          const color = typeof getColorPista === 'function' ? getColorPista(p_id) : null;
          const chip = document.createElement('span');
          chip.className = 'pista-chip descubierta' + (color ? ` pista-${color}` : '');
          chip.textContent = (color ? '◆ ' : '') + _nomPista(p_id);
          flex.appendChild(chip);
        });
        container.appendChild(flex);
      }
    }

    // Pistas interpretadas
    const tituloInt = document.createElement('p');
    tituloInt.className = 'subtitulo';
    tituloInt.style.marginBottom = '0.5rem';
    tituloInt.textContent = 'Pistas interpretadas';
    container.appendChild(tituloInt);

    if (estado.pistas_interpretadas.length === 0) {
      container.appendChild(this._textoVacio('Sin pistas interpretadas todavía.'));
    } else {
      const flex2 = document.createElement('div');
      flex2.style.cssText = 'display:flex; flex-wrap:wrap; gap:0.375rem; margin-bottom:1rem;';
      estado.pistas_interpretadas.forEach(p_id => {
        const color = typeof getColorPista === 'function' ? getColorPista(p_id) : null;
        const chip = document.createElement('span');
        chip.className = 'pista-chip interpretada' + (color ? ` pista-${color}` : '');
        chip.textContent = `◆ ${_nomPista(p_id)}`;
        flex2.appendChild(chip);
      });
      container.appendChild(flex2);
    }

    // Deducciones
    if (estado.pistas_interpretadas.length >= 2) {
      const linea = document.createElement('div');
      linea.className = 'linea-oro';
      container.appendChild(linea);

      const tituloDed = document.createElement('p');
      tituloDed.className = 'subtitulo';
      tituloDed.style.marginBottom = '0.5rem';
      tituloDed.textContent = 'Formular deducción';
      container.appendChild(tituloDed);

      const desc = document.createElement('p');
      desc.className = 'texto-sutil italica';
      desc.style.marginBottom = '0.75rem';
      desc.textContent = `Selecciona dos pistas interpretadas para combinarlas. (Variante ${estado.variante || '?'})`;
      container.appendChild(desc);

      this._renderSelectorDeduccion(container);
    }

    this._abrirOverlay('pistas');
  },

  _renderSelectorDeduccion(container) {
    if (this._pendienteAccionDeducir == null) return;

    let seleccionadas = [];
    const _cartasDed = (typeof _CARTAS_DATOS !== 'undefined' && _CARTAS_DATOS)
      ? (_CARTAS_DATOS[estado.caso_id]?.cartas || []) : [];
    const _nomPista = (pid) => {
      const c = _cartasDed.find(x => x.pista_id === pid);
      return c ? (c.pista_nombre || c.titulo || pid) : pid;
    };
    const _color = (pid) => typeof getColorPista === 'function' ? getColorPista(pid) : null;

    const avisoColor = document.createElement('p');
    avisoColor.className = 'texto-sutil italica';
    avisoColor.style.cssText = 'margin-bottom:0.5rem; min-height:1.2em;';
    avisoColor.textContent = '';

    const flex = document.createElement('div');
    flex.style.cssText = 'display:flex; flex-wrap:wrap; gap:0.375rem; margin-bottom:0.75rem;';
    estado.pistas_interpretadas.forEach(p_id => {
      const col = _color(p_id);
      const chip = document.createElement('button');
      chip.className = 'pista-chip interpretada' + (col ? ` pista-${col}` : '');
      chip.textContent = '◆ ' + _nomPista(p_id);
      chip.dataset.id = p_id;
      chip.onclick = () => {
        if (chip.classList.contains('seleccionada')) {
          chip.classList.remove('seleccionada');
          seleccionadas = seleccionadas.filter(p => p !== p_id);
        } else if (seleccionadas.length < 2) {
          chip.classList.add('seleccionada');
          seleccionadas.push(p_id);
        }
        if (seleccionadas.length === 2) {
          const c0 = _color(seleccionadas[0]);
          const c1 = _color(seleccionadas[1]);
          if (c0 && c1 && c0 !== c1) {
            avisoColor.textContent = '⚠ Para deducir necesitas dos pistas del mismo color.';
            avisoColor.style.color = '#c87c50';
            btnDeducir.disabled = true;
          } else {
            const pluralColor = c0 === 'azul' ? 'azules' : 'rojas';
            avisoColor.textContent = c0 ? `Deducción de ${pluralColor} lista.` : '';
            avisoColor.style.color = c0 === 'roja' ? '#c85050' : '#5080c8';
            btnDeducir.disabled = false;
          }
        } else {
          avisoColor.textContent = '';
          btnDeducir.disabled = seleccionadas.length !== 2;
        }
      };
      flex.appendChild(chip);
    });
    container.appendChild(flex);
    container.appendChild(avisoColor);

    const btnDeducir = document.createElement('button');
    btnDeducir.className = 'btn btn-primario btn-bloque';
    btnDeducir.textContent = 'Deducir';
    btnDeducir.disabled = true;
    btnDeducir.onclick = () => {
      this._snapshot();
      // Consumir acción ahora que se ejecuta la deducción
      if (this._pendienteAccionDeducir != null) {
        usarAccion(this._pendienteAccionDeducir, 'deducir');
        guardarEstado();
        this._pendienteAccionDeducir = null;
      }
      const res = resolverDeduccion(seleccionadas[0], seleccionadas[1]);
      const nomsSel = seleccionadas.map(pid => {
        const c = (typeof _CARTAS_DATOS !== 'undefined' && _CARTAS_DATOS)
          ? (_CARTAS_DATOS[estado.caso_id]?.cartas || []).find(x => x.pista_id === pid) : null;
        return c ? (c.pista_nombre || c.titulo || pid) : pid;
      });
      this._mostrarResultadoDeduccion(res, seleccionadas, nomsSel);
    };
    container.appendChild(btnDeducir);
  },

  _mostrarResultadoDeduccion(res, pistas, noms) {
    this._mostrarBtnDeshacer(true);
    const container = document.getElementById('resultado-cont');
    const etiquetas = noms || pistas;
    document.getElementById('resultado-tit').textContent = `Deducción: ${etiquetas.join(' + ')}`;
    container.innerHTML = '';

    if (!res || !res.encontrada) {
      const box = document.createElement('div');
      box.className = 'interrog-texto';
      box.style.borderColor = 'var(--gris-claro)';
      box.textContent = `Esta combinación no tiene relación en la Variante ${estado.variante || '?'}. Comprueba que estás consultando el libro de caso correcto.`;
      container.appendChild(box);
    } else {
      const box = document.createElement('div');
      box.className = 'interrog-texto';
      box.innerHTML = this._renderTextoNarrativo(res.texto);
      container.appendChild(box);

      if (res.efectos && res.efectos.length > 0) {
        const efDiv = document.createElement('div');
        efDiv.className = 'respuesta-efectos mt-sm';
        res.efectos.forEach(ef => {
          const chip = document.createElement('span');
          const _efTxt4 = this._textoEfecto(ef);
          if (!_efTxt4) return;
          chip.className = 'badge badge-oro';
          chip.textContent = _efTxt4;
          efDiv.appendChild(chip);
        });
        container.appendChild(efDiv);
      }

      if (estado.acusacion_desbloqueada) {
        const aviso = document.createElement('div');
        aviso.className = 'badge badge-oro mt-sm';
        aviso.style.display = 'block; text-align:center; padding:0.5rem;';
        aviso.textContent = '⚖ ¡Acusación desbloqueada!';
        container.appendChild(aviso);
      } else {
        // Mostrar progreso: qué colores faltan
        const tieneRoja = estado.deducciones_resueltas?.some(d => d.color === 'roja');
        const tieneAzul = estado.deducciones_resueltas?.some(d => d.color === 'azul');
        if (tieneRoja || tieneAzul) {
          const progreso = document.createElement('p');
          progreso.style.cssText = 'font-family:var(--f2);font-size:.75rem;letter-spacing:.08em;color:#a09060;text-align:center;margin-top:.75rem;';
          const falta = !tieneRoja ? '🔴 Falta una deducción roja' : '🔵 Falta una deducción azul';
          progreso.textContent = falta;
          container.appendChild(progreso);
        }
      }
    }

    const btnCerrar = document.createElement('button');
    btnCerrar.className = 'btn btn-primario btn-bloque mt-md';
    btnCerrar.textContent = 'Continuar';
    btnCerrar.onclick = () => {
      this.cerrarOverlay('resultado');
      this.cerrarOverlay('pistas');
      this.renderizarPartida();
    };
    container.appendChild(btnCerrar);

    this.cerrarOverlay('pistas');
    this._abrirOverlay('resultado');
  },

  // ─── SUCESO ────────────────────────────────────────────────────────────────

  abrirSuceso() {
    const carta = robarSuceso();
    if (!carta) {
      this._mostrarNotificacion('Mazo agotado', 'No quedan cartas de Suceso disponibles para esta fase.');
      return;
    }

    // Registrar como jugada
    if (!estado.sucesos_jugados.includes(carta.id)) {
      estado.sucesos_jugados.push(carta.id);
    }

    // Fase 1: calcular resultados para mostrar (sin tocar estado)
    calcularResultadosSuceso(carta);

    // Mostrar overlay
    const overlay = document.getElementById('overlay-suceso');
    const faseNom = { anochecer:'Anochecer', medianoche:'Medianoche', madrugada:'Madrugada', todas:'Todas las fases' };

    document.getElementById('suc-titulo').textContent     = carta.titulo;
    document.getElementById('suc-fase-badge').textContent = faseNom[carta.fase] || carta.fase;
    document.getElementById('suc-narrativa').textContent  = carta.narrativa || '';

    // Texto de mecánica: construido dinámicamente cuando hay resultado calculado
    let mecaTexto = carta.mecanica || carta.texto_completo || '';
    if (carta._resultado_lluvia) {
      const r = carta._resultado_lluvia;
      if (r.pnjs.length === 0) {
        mecaTexto = '+1 dificultad en el Jardín hasta final de la próxima ronda. No había nadie en el Jardín.';
      } else {
        const nombres = r.pnjs.map(p => p.nombre).join(', ');
        mecaTexto = `+1 dificultad en el Jardín hasta final de la próxima ronda. ${nombres} se ${r.pnjs.length === 1 ? 'refugia' : 'refugian'} en ${r.nomDest}.`;
      }
    } else if (carta._resultado_loseta) {
      const rl = carta._resultado_loseta;
      const efLoseta = carta.efectos?.find(e => e.tipo === 'loseta_mas_jugadores');
      const descEfecto = efLoseta?.descripcion_efecto || '';
      if (rl.jugadores?.length > 0) {
        const lista = rl.jugadores.length === 1
          ? rl.jugadores[0]
          : rl.jugadores.slice(0, -1).join(', ') + ' y ' + rl.jugadores[rl.jugadores.length - 1];
        mecaTexto = descEfecto
          ? `${descEfecto} en ${rl.losetaNom}. Afecta a ${lista}.`
          : `${rl.losetaNom}: ${lista}.`;
      } else {
        mecaTexto = descEfecto
          ? `${descEfecto} en ${rl.losetaNom}. No había nadie allí.`
          : `No había nadie en ${rl.losetaNom}.`;
      }
    } else if (carta._resultado_rumores) {
      const r = carta._resultado_rumores;
      const umbral = carta.efectos?.find(e => e.tipo === 'alerta_si_sospecha')?.umbral || 2;
      mecaTexto = `${r.pnjNombre}: +1 Sospecha (${r.sosp_antes} → ${r.sosp_despues}).`;
      if (r.sosp_despues >= umbral) mecaTexto += ` Sospecha ≥${umbral}: +1 Alerta.`;
    } else if (carta._resultado_puerta_bloqueada) {
      const r = carta._resultado_puerta_bloqueada;
      mecaTexto = `${r.losetaNombre} queda bloqueada hasta final de la próxima ronda. +1 Alerta.`;
    }
    document.getElementById('suc-mecanica').textContent = mecaTexto;

    const logEl = document.getElementById('suc-efectos-log');
    this._montarLogSuceso(carta, logEl);

    overlay.classList.add('activo');

    // Si la carta tiene efecto pendiente de resolución interactiva
    if (carta._resultado_bloqueo) {
      this._resolverEfectoBloqueoSuceso(carta, overlay, () => {
        aplicarEfectosSuceso(carta);
        overlay.classList.remove('activo');
        if (typeof onCerrar === 'function') onCerrar();
      });
    } else if (carta._pendiente_loseta) {
      this._resolverEfectoLosetaSuceso(carta, overlay, () => {
        overlay.classList.remove('activo');
        this.renderizarPartida();
        Mapa.renderizar();
      });
    } else {
      document.getElementById('suc-btn-confirmar').onclick = () => {
        aplicarEfectosSuceso(carta);
        overlay.classList.remove('activo');
        this.renderizarPartida();
        Mapa.renderizar();
      };
      overlay.onclick = (e) => {
        if (e.target === overlay) { aplicarEfectosSuceso(carta); overlay.classList.remove('activo'); this.renderizarPartida(); Mapa.renderizar(); }
      };
    }
  },

  // Monta el contenido del log del overlay de suceso (compartido por abrirSuceso y _resolverSucesoYFinRonda)
  _montarLogSuceso(carta, logEl) {
    logEl.style.display = 'none';
    logEl.innerHTML = '';

    if (carta._resultado_bloqueo) {
      const rb = carta._resultado_bloqueo;
      logEl.style.display = 'block';
      logEl.innerHTML =
        `<p style="font-family:var(--f3);font-size:1.05rem;color:#e8dcc8;line-height:1.7;">
           <strong>${rb.jugNom}</strong> debe elegir qué sala quedará bloqueada.
         </p>`;

    } else if (carta._resultado_loseta) {
      const rl = carta._resultado_loseta;
      logEl.style.display = 'block';
      const lista = Array.isArray(rl.jugadores)
        ? (rl.jugadores.length === 1 ? rl.jugadores[0]
          : rl.jugadores.slice(0, -1).join(', ') + ' y ' + rl.jugadores[rl.jugadores.length - 1])
        : rl.jugadores;
      // Buscar descripción del efecto
      const efLoseta = carta.efectos?.find(e => e.tipo === 'loseta_mas_jugadores');
      const descEfecto = efLoseta?.descripcion_efecto || 'sufre los efectos del suceso';
      const verbo = (Array.isArray(rl.jugadores) && rl.jugadores.length === 1) ? 'debe' : 'deben';
      logEl.innerHTML = lista
        ? `<p style="font-family:var(--f3);font-size:1.05rem;color:#e8dcc8;line-height:1.7;">
             En la <strong>${rl.losetaNom}</strong>, ${lista} ${verbo} ${descEfecto}.
           </p>`
        : `<p style="font-family:var(--f3);font-size:1.05rem;color:var(--txt3);line-height:1.7;">
             La <strong>${rl.losetaNom}</strong> se ve afectada, pero no hay nadie allí en este momento.
           </p>`;

    } else if (carta._resultado_hobbes) {
      const hob = carta._resultado_hobbes;
      logEl.style.display = 'block';
      if (hob.afecta) {
        const lista = hob.jugadores.join(' y ');
        logEl.innerHTML =
          `<p style="font-family:var(--f3);font-size:1.05rem;color:#e8dcc8;line-height:1.7;">Hobbes recorre las estancias privadas y descubre a <strong>${lista}</strong> en territorio vedado. La indiscreción tiene un precio.</p>`;
      } else {
        logEl.innerHTML = `<p style="font-family:var(--f3);font-size:1.05rem;color:#c8d8b8;line-height:1.7;">Hobbes completa su ronda sin novedades. Esta noche no hay nada que reprocharos.</p>`;
      }

    } else if (carta._resultado_lluvia) {
      const r = carta._resultado_lluvia;
      logEl.style.display = 'block';
      if (r.pnjs.length === 0) {
        logEl.innerHTML = `<p style="font-family:var(--f3);font-size:1.05rem;color:var(--txt3);line-height:1.7;">No había nadie en el Jardín. El efecto de dificultad se aplica igualmente hasta final de la próxima ronda.</p>`;
      } else {
        const nombres = r.pnjs.map(p => `<strong>${p.nombre}</strong>`).join(', ');
        const verbo = r.pnjs.length === 1 ? 'se refugia' : 'se refugian';
        logEl.innerHTML = `<p style="font-family:var(--f3);font-size:1.05rem;color:#e8dcc8;line-height:1.7;">${nombres} ${verbo} en <em>${r.nomDest}</em>.</p>`;
      }

    } else if (carta._resultado_viento) {
      const mov = carta._resultado_viento;
      logEl.style.display = 'block';
      if (mov.hasta) {
        logEl.innerHTML = `<p style="font-family:var(--f3);font-size:1.05rem;color:#e8dcc8;line-height:1.7;"><strong>${mov.pnjNombre}</strong> se desplaza de <em>${mov.nomDesde}</em> a <em>${mov.nomHasta}</em>.</p>`;
      } else {
        logEl.innerHTML = `<p style="font-family:var(--f3);font-size:1.05rem;color:#e8dcc8;line-height:1.7;"><strong>${mov.pnjNombre}</strong> permanece inmóvil.</p>`;
      }

    } else if (carta._resultado_rumores) {
      const r = carta._resultado_rumores;
      logEl.style.display = 'block';
      const sosp_umbral = carta.efectos?.find(e => e.tipo === 'alerta_si_sospecha')?.umbral || 2;
      const subeAlerta = r.sosp_despues >= sosp_umbral;
      let html = `<p style="font-family:var(--f3);font-size:1.05rem;color:#e8dcc8;line-height:1.7;">`;
      html += `<strong>${r.pnjNombre}</strong> se agita: +1 Sospecha (${r.sosp_antes} → ${r.sosp_despues}).`;
      if (subeAlerta) html += ` Sospecha ≥${sosp_umbral}: +1 Alerta.`;
      html += `</p>`;
      logEl.innerHTML = html;

    } else if (carta._resultado_movimiento_general) {
      const r = carta._resultado_movimiento_general;
      logEl.style.display = 'block';
      const lineas = r.movs.map(m => {
        if (m.yaEstaba) return `<strong>${m.nombre}</strong> ya está en ${r.nomDestino}.`;
        if (m.hasta)    return `<strong>${m.nombre}</strong>: ${m.nomDesde} → <em>${m.nomHasta}</em>.`;
        return `<strong>${m.nombre}</strong> no puede moverse.`;
      });
      logEl.innerHTML = `<p style="font-family:var(--f3);font-size:1.05rem;color:#e8dcc8;line-height:1.9;">${lineas.join('<br>')}</p>`;

    } else if (carta._resultado_puerta_bloqueada) {
      const r = carta._resultado_puerta_bloqueada;
      logEl.style.display = 'block';
      logEl.innerHTML = `<p style="font-family:var(--f3);font-size:1.05rem;color:#e8dcc8;line-height:1.7;">
        <strong>${r.losetaNombre}</strong> queda bloqueada hasta final de la próxima ronda.<br>
        Nadie puede entrar ni salir. Aparece en el mapa con el icono de tablones.
      </p>`;
    }
  },

  // Resuelve interactivamente el efecto bloqueo_loseta_adyacente (Corriente de aire)
  _resolverEfectoBloqueoSuceso(carta, overlay, onFin) {
    const rb      = carta._resultado_bloqueo;
    const logEl   = document.getElementById('suc-efectos-log');
    const btnConf = document.getElementById('suc-btn-confirmar');
    btnConf.style.display = 'none';

    // Obtener losetas adyacentes al jugador con más TEM (excluye cerradas y ya bloqueadas)
    const conexiones = typeof getConexionesDistribucion === 'function' ? getConexionesDistribucion() : {};
    const adyIds = (conexiones[rb.losetaActual] || [])
      .filter(id => {
        const cerrada  = isCerrada(id);
        const bloqueada = typeof isLosetaBloqueada === 'function' && isLosetaBloqueada(id);
        return !cerrada && !bloqueada;
      });

    logEl.style.display = 'block';
    logEl.innerHTML = '';

    const tit = document.createElement('p');
    tit.style.cssText = 'font-family:var(--f2);font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;color:var(--oro);margin-bottom:.75rem;';
    tit.textContent = `${rb.jugNom} elige qué acceso cierra la corriente:`;
    logEl.appendChild(tit);

    if (!adyIds.length) {
      const vacio = document.createElement('p');
      vacio.style.cssText = 'font-family:var(--f3);color:var(--txt3);font-style:italic;';
      vacio.textContent = 'No hay losetas adyacentes disponibles para bloquear.';
      logEl.appendChild(vacio);
      btnConf.style.display = '';
      btnConf.onclick = onFin;
      return;
    }

    adyIds.forEach(id => {
      const nom = getLoseta(id)?.nombre || id;
      const btn = document.createElement('button');
      btn.className = 'btn btn-bloque';
      btn.style.cssText = 'margin-bottom:6px;background:rgba(80,30,10,0.5);border-color:#8b4513;color:#f0c8a0;';
      btn.textContent = `🚫 ${nom}`;
      btn.addEventListener('click', () => {
        carta._losetaBloqueadaElegida = id;
        // Feedback
        logEl.innerHTML = '';
        const conf = document.createElement('p');
        conf.style.cssText = 'font-family:var(--f3);font-size:.95rem;color:var(--txt);';
        conf.innerHTML = `La entrada a <strong>${nom}</strong> queda sellada por la corriente.`;
        logEl.appendChild(conf);
        btnConf.style.display = '';
        btnConf.onclick = onFin;
      });
      logEl.appendChild(btn);
    });
  },

  // Resuelve el efecto loseta_mas_jugadores — empate resuelto automáticamente
  _resolverEfectoLosetaSuceso(carta, overlay, onFin) {
    const ef      = carta._pendiente_loseta;
    const logEl   = document.getElementById('suc-efectos-log');
    const btnConf = document.getElementById('suc-btn-confirmar');
    const motivo  = `Suceso: ${carta.titulo}`;

    const res = typeof calcularLosetasMasJugadores === 'function'
      ? calcularLosetasMasJugadores() : null;

    if (!res?.losetaId) { btnConf.onclick = onFin; return; }

    const losetaNom  = getLoseta(res.losetaId)?.nombre || res.losetaId;
    const jPresentes = estado.jugadores.filter(j => j.loseta_actual === res.losetaId);

    // Construir texto narrativo de afectados
    const nombresAf = jPresentes.map(j => {
      const pjNom = PERSONAJES[j.personaje]?.nombre || j.personaje;
      return pjNom;
    });
    const listaAf = nombresAf.length === 0 ? null
      : nombresAf.length === 1 ? nombresAf[0]
      : nombresAf.slice(0, -1).join(', ') + ' y ' + nombresAf[nombresAf.length - 1];

    // Construir texto narrativo de efectos mecánicos
    const efectoTextos = (ef.efecto_sobre_jugadores || []).map(eaf => {
      if (eaf.tipo === 'carta_resolucion') {
        const signo = eaf.modificador > 0 ? '+' : '';
        return `<span style="color:${eaf.modificador < 0 ? '#ef9a9a' : '#81c784'};">Carta de Resolución ${signo}${eaf.modificador}</span>`;
      }
      const signo = eaf.modificador > 0 ? '+' : '';
      return `<span style="color:${eaf.modificador < 0 ? '#ef9a9a' : '#81c784'};">${eaf.atributo} ${signo}${eaf.modificador}</span>`;
    }).join(' · ');

    logEl.style.display = 'block';
    logEl.innerHTML = listaAf
      ? `<p style="font-family:var(--f3);font-size:1.05rem;color:#e8dcc8;line-height:1.7;margin-bottom:.5rem;">
           En la <strong>${losetaNom}</strong>, ${listaAf} ${nombresAf.length === 1 ? 'sufre' : 'sufren'} los efectos del suceso.
         </p>`
        + (efectoTextos ? `<p style="font-family:var(--f3);font-size:.95rem;line-height:1.6;">${efectoTextos}</p>` : '')
      : `<p style="font-family:var(--f3);font-size:1.05rem;color:var(--txt3);line-height:1.7;">
           La <strong>${losetaNom}</strong> se ve afectada, pero no hay nadie allí en este momento.
         </p>`;

    btnConf.style.display = '';
    btnConf.onclick = () => {
      if (typeof aplicarEfectoLosetaJugadores === 'function') aplicarEfectoLosetaJugadores(res.losetaId, ef, motivo);
      onFin();
    };
  },

  // ─── EXPLORACIÓN ───────────────────────────────────────────────────────────

  abrirExplorar(losetaId, jugIdx) {
    const loseta     = losetaId || (estado.jugadores[0]?.loseta_actual) || '';
    const losetaDef  = getLoseta(loseta);
    const nombreSala = losetaDef?.nombre || loseta || 'Sala actual';

    // Cargar cartas lazy si no están en caché
    const _mostrar = () => {
      const overlay  = document.getElementById('overlay-exploracion');
      const salaEl   = document.getElementById('expl-sala');
      const instrEl  = document.getElementById('expl-instruccion');
      const cartasEl = document.getElementById('expl-cartas');
      if (!overlay) return;

      salaEl.textContent = nombreSala;
      cartasEl.innerHTML = '';
      instrEl.textContent = '';

      const cartas = typeof getCartasDisponibles === 'function'
        ? getCartasDisponibles(loseta) : [];

      if (cartas.length === 0) {
        // Usar notificación toast — no tiene sentido abrir el drawer vacío
        this._mostrarNotificacion(
          'Sin cartas disponibles',
          'Esta sala ya ha revelado todo lo que tenía.'
        );
        return;
      }

      const carta   = cartas[0];
      const jugador = estado.jugadores[jugIdx != null ? jugIdx : 0];
      const nomJug  = PERSONAJES[jugador?.personaje]?.nombre || jugador?.personaje || 'Jugador';

      // Ajuste especial (Doctor: dif. X, etc.)
      let difDisplay = carta.dificultad;
      let notaEsp    = carta.nota_especial || '';
      if (notaEsp && jugador) {
        const m = notaEsp.match(/^(\w+):\s*(?:dif\.\s*(\d+)|automático)/i);
        if (m && jugador.personaje === m[1].toLowerCase()) {
          difDisplay = m[2] ? parseInt(m[2]) : 0;
          notaEsp = '★ ' + notaEsp;
        }
      }

      // Modificadores de pasiva de loseta
      const jugIdxReal = jugIdx != null ? jugIdx : 0;
      if (typeof getPasivaExploracion === 'function') {
        const pas = getPasivaExploracion(jugIdxReal, loseta, carta.atributo);
        if (pas.modDif !== 0) {
          difDisplay = Math.max(0, difDisplay + pas.modDif);
        }
        if (pas.notas.length) {
          notaEsp = (notaEsp ? notaEsp + ' · ' : '') + pas.notas.join(' · ');
        }
        if (pas.anulaAlerta) {
          notaEsp = (notaEsp ? notaEsp + ' · ' : '') + 'Alerta no sube';
        }
      }

      // Bonus de confidencia
      if (typeof getBonusConfidenciaExploracion === 'function') {
        const bonusConf = getBonusConfidenciaExploracion(jugIdxReal, loseta);
        if (bonusConf !== 0) {
          difDisplay = Math.max(0, difDisplay + bonusConf);
          notaEsp = (notaEsp ? notaEsp + ' · ' : '') + '★ Confidencia −2 dif.';
        }
      }

      // Cabecera — solo lo que la app aporta: atributo, dificultad, modificadores y quién explora
      const cab = document.createElement('div');
      cab.style.cssText = 'margin-bottom:1.25rem;';
      const difColor = difDisplay <= 2 ? '#81c784' : difDisplay <= 4 ? '#ffd54f' : '#ef9a9a';
      cab.innerHTML =
        // Atributo + dificultad destacada
        '<div style="display:flex;gap:.6rem;align-items:center;margin-bottom:.6rem;">' +
          '<span style="font-family:var(--f2);font-size:.8rem;letter-spacing:.12em;text-transform:uppercase;' +
            'color:#a08040;background:rgba(160,128,64,.15);border:1px solid rgba(160,128,64,.35);' +
            'border-radius:5px;padding:4px 11px;">' + carta.atributo + '</span>' +
          '<span style="font-family:var(--f1);font-size:1.9rem;font-weight:700;color:' + difColor + ';' +
            'text-shadow:0 0 12px ' + difColor + '44;">Dif. ' + difDisplay + '</span>' +
        '</div>' +
        // Modificadores activos
        (notaEsp
          ? '<div style="font-family:var(--f3);font-size:.95rem;color:#ddc87a;' +
              'background:rgba(200,175,80,.09);border:1px solid rgba(200,175,80,.22);' +
              'border-radius:7px;padding:.5rem .85rem;margin-bottom:.5rem;">' +
              '<span style="font-family:var(--f2);font-size:.65rem;letter-spacing:.12em;' +
                'text-transform:uppercase;color:#a08840;display:block;margin-bottom:.2rem;">Modificadores</span>' +
              notaEsp + '</div>'
          : '') +
        // Quién explora
        '<div style="font-family:var(--f3);font-size:.8rem;color:var(--txt3);">' + carta.reverso + ' · ' + nomJug + '</div>';
      cartasEl.appendChild(cab);

      instrEl.textContent = '';

      // Selector de enfoque cauteloso/decidido
      let _enfoqueDecidido = false;
      const enfoqueWrap = document.createElement('div');
      enfoqueWrap.style.cssText = 'display:flex;gap:.5rem;margin-bottom:1rem;';
      const mkEB = (label, esDec) => {
        const b = document.createElement('button');
        b.style.cssText = 'flex:1;padding:.55rem .4rem;border-radius:8px;font-family:var(--f2);font-size:.7rem;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;border:1px solid;transition:all .15s;touch-action:manipulation;';
        b.innerHTML = label;
        return b;
      };
      const btnCaut = mkEB('🛡 Cauteloso', false);
      const btnDec  = mkEB('⚔ Decidido · +1 Alerta', true);
      const actualizarEnfoque = () => {
        btnCaut.style.cssText = btnCaut.style.cssText.replace(/background:[^;]+;/,'');
        btnCaut.style.background  = !_enfoqueDecidido ? 'rgba(80,160,80,.2)'  : 'rgba(0,0,0,.2)';
        btnCaut.style.borderColor = !_enfoqueDecidido ? 'rgba(80,160,80,.5)'  : 'rgba(255,255,255,.1)';
        btnCaut.style.color       = !_enfoqueDecidido ? '#81c784' : '#555';
        btnDec.style.background   =  _enfoqueDecidido ? 'rgba(200,80,40,.2)'  : 'rgba(0,0,0,.2)';
        btnDec.style.borderColor  =  _enfoqueDecidido ? 'rgba(200,80,40,.5)'  : 'rgba(255,255,255,.1)';
        btnDec.style.color        =  _enfoqueDecidido ? '#e07050' : '#555';
      };
      btnCaut.onclick = () => { _enfoqueDecidido = false; actualizarEnfoque(); };
      btnDec.onclick  = () => { _enfoqueDecidido = true;  actualizarEnfoque(); };
      actualizarEnfoque();
      enfoqueWrap.appendChild(btnCaut);
      enfoqueWrap.appendChild(btnDec);
      cartasEl.appendChild(enfoqueWrap);

      // Botones de resultado — sin texto de carta (el jugador ya tiene la carta física)
      const resultados = [
        { key:'critico', icono:'★', label:'Crítico',  color:'#ffd54f' },
        { key:'exito',   icono:'✓', label:'Éxito',    color:'#81c784' },
        { key:'fracaso', icono:'✗', label:'Fracaso',  color:'#ef9a9a' },
        { key:'pifia',   icono:'☠', label:'Pifia',    color:'#e57373' },
      ];

      resultados.forEach(r => {
        const btn = document.createElement('button');
        btn.style.cssText =
          'display:flex;gap:.75rem;align-items:center;width:100%;padding:.875rem 1rem;' +
          'margin-bottom:.5rem;background:rgba(0,0,0,.3);' +
          'border:1px solid ' + r.color + '44;border-left:4px solid ' + r.color + ';' +
          'border-radius:0 10px 10px 0;cursor:pointer;text-align:left;';
        btn.innerHTML =
          '<span style="font-size:1.5rem;flex-shrink:0;color:' + r.color + ';line-height:1;">' + r.icono + '</span>' +
          '<span style="font-family:var(--f2);font-size:.9rem;letter-spacing:.1em;text-transform:uppercase;color:' + r.color + ';">' + r.label + '</span>';
        btn.onclick = () => {
          if (_enfoqueDecidido) subirAlerta(1, 'Enfoque decidido');
          this._aplicarResultadoExploracion(carta, r.key, jugIdx != null ? jugIdx : 0);
        };
        cartasEl.appendChild(btn);
      });

      this._abrirOverlay('exploracion');
    };

    // Si las cartas ya están en caché, mostrar directamente; si no, cargar primero
    if (typeof _cartasExpl !== 'undefined' && _cartasExpl?.caso_id === estado.caso_id) {
      _mostrar();
    } else if (typeof cargarCartasExploracion === 'function') {
      cargarCartasExploracion(estado.caso_id).then(_mostrar).catch(() => {
        // Si falla la carga, mostrar igual con cartas vacías
        _mostrar();
      });
    } else {
      _mostrar();
    }
  },
  _aplicarResultadoExploracion(carta, resultado, jugIdx) {
    this._snapshot();
    this._mostrarBtnDeshacer(true);
    // Marcar carta como jugada
    if (!estado.exploraciones_jugadas) estado.exploraciones_jugadas = [];
    if (!estado.exploraciones_jugadas.includes(carta.id)) {
      estado.exploraciones_jugadas.push(carta.id);
    }

    // Aplicar efectos
    const efectos = carta[resultado]?.efectos || [];
    const log = typeof aplicarEfectosExploracion === 'function'
      ? aplicarEfectosExploracion(efectos, jugIdx, undefined, carta.pista_id || null) : [];

    // Aplicar pasivas de la loseta (Alerta, TEM por PNJ, etc.)
    const losetaJug = estado.jugadores[jugIdx]?.loseta_actual;
    if (losetaJug && typeof aplicarPasivaPostExploracion === 'function') {
      const logsP = aplicarPasivaPostExploracion(jugIdx, losetaJug);
      if (logsP.length) log.push(...logsP);
    }

    guardarEstado();

    // Cerrar overlay de exploración
    this.cerrarOverlay('exploracion');

    // Mostrar overlay de resultado — solo efectos mecánicos
    const cont = document.getElementById('resultado-cont');
    if (cont) cont.innerHTML = '';
    const titEl = document.getElementById('resultado-tit');
    if (titEl) {
      const etiquetas = { critico:'★ Crítico', exito:'✓ Éxito', fracaso:'✗ Fracaso', pifia:'☠ Pifia' };
      titEl.textContent = `Exploración — ${etiquetas[resultado] || resultado}`;
    }

    // Efectos mecánicos aplicados
    if (cont && log.length > 0) {
      const logDiv = document.createElement('div');
      logDiv.style.cssText = 'background:rgba(0,0,0,.4);border:1px solid var(--gris2);border-radius:10px;padding:.875rem 1rem;margin-bottom:1rem;';
      logDiv.innerHTML = ``
        + log.map(l => `<div style="font-family:var(--f3);font-size:clamp(.95rem,3vw,1.05rem);color:var(--txt);padding:.2rem 0;line-height:1.5;">${l}</div>`).join('');
      cont.appendChild(logDiv);
    }

    // Fracaso: carta disponible de nuevo
    if (resultado === 'fracaso') {
      estado.exploraciones_jugadas = estado.exploraciones_jugadas.filter(id => id !== carta.id);
      if (cont) {
        const nota = document.createElement('p');
        nota.style.cssText = 'font-family:var(--f3);font-size:.9rem;color:var(--txt3);font-style:italic;margin-top:.25rem;';
        nota.textContent = 'Nada que destacar por ahora. Podéis intentarlo de nuevo.';
        cont.appendChild(nota);
      }
      guardarEstado();
    }

    // Botón cerrar resultado
    if (cont) {
      const btnCerrar = document.createElement('button');
      btnCerrar.className = 'btn btn-p btn-bloque';
      btnCerrar.style.cssText = 'min-height:52px;font-size:1rem;margin-top:.5rem;';
      btnCerrar.textContent = 'Continuar';
      btnCerrar.onclick = () => {
        this.cerrarOverlay('resultado');
        this.renderizarPartida();
        Mapa.renderizar();
      };
      cont.appendChild(btnCerrar);
    }

    this._abrirOverlay('resultado');
  },

  // ─── AVANZAR RONDA ─────────────────────────────────────────────────────────

  // Llamado desde el botón "Fin ronda" en el HUD
  avanzarRonda() {
    // Paso 1: mostrar y resolver suceso
    this._resolverSucesoYFinRonda();
  },

  _resolverSucesoYFinRonda() {
    const carta = robarSuceso();

    // Registrar carta como jugada
    if (carta && !estado.sucesos_jugados.includes(carta.id)) {
      estado.sucesos_jugados.push(carta.id);
    }

    // Fase 1: calcular resultados (para mostrar en overlay, sin tocar estado)
    if (carta) calcularResultadosSuceso(carta);

    // Mostrar overlay de suceso
    const overlay = document.getElementById('overlay-suceso');
    const faseNom = { anochecer:'Anochecer', medianoche:'Medianoche', madrugada:'Madrugada', todas:'Todas las fases' };

    if (carta) {
      document.getElementById('suc-titulo').textContent     = carta.titulo;
      document.getElementById('suc-fase-badge').textContent = faseNom[carta.fase] || carta.fase;
      document.getElementById('suc-narrativa').textContent  = carta.narrativa || '';
      document.getElementById('suc-mecanica').textContent   = carta.mecanica || carta.texto_completo || '';
    } else {
      document.getElementById('suc-titulo').textContent     = 'Sin suceso';
      document.getElementById('suc-fase-badge').textContent = '';
      document.getElementById('suc-narrativa').textContent  = 'No quedan cartas de Suceso disponibles para esta fase.';
      document.getElementById('suc-mecanica').textContent   = 'La ronda avanza igualmente.';
    }

    const logEl = document.getElementById('suc-efectos-log');
    if (carta) this._montarLogSuceso(carta, logEl);
    else { logEl.style.display = 'none'; logEl.innerHTML = ''; }

    overlay.classList.add('activo');

    const onCerrar = () => {
      // Aplicar efectos al confirmar (jugador ya leyó la carta)
      if (carta) aplicarEfectosSuceso(carta);
      overlay.classList.remove('activo');
      overlay.onclick = null;
      this._ejecutarAvanceRonda();
    };

    if (carta?._pendiente_loseta) {
      this._resolverEfectoLosetaSuceso(carta, overlay, onCerrar);
    } else {
      document.getElementById('suc-btn-confirmar').onclick = onCerrar;
      overlay.onclick = (e) => { if (e.target === overlay) onCerrar(); };
    }
  },

  _ejecutarAvanceRonda() {
    this._snapshot();
    this._mostrarBtnDeshacer(true);
    if (!avanzarRonda()) {
      this._mostrarNotificacion('El tiempo se ha agotado', 'Las doce campanadas resuenan en Blackmoor Hall. Ya es demasiado tarde.');
      this.renderizarPartida(); Mapa.renderizar(); return;
    }

    // Nerviosismo/Pánico al final de la ronda anterior
    if (estado.alerta >= 5) {
      const veces = estado.alerta >= 7 ? 2 : 1;
      for (let v = 0; v < veces; v++) {
        const pnj_id = _mayorSospecha();
        if (pnj_id) {
          const res = resolverMovimientoPatrulla(pnj_id);
          if (res.movio) {
            const pnjDef = getPNJ(pnj_id);
            const _motPNJ = estado.alerta >= 7
              ? `${pnjDef.nombre} huye despavorido hacia ${this._nombreLoseta(res.destino)}.`
              : `${pnjDef.nombre} se retira nerviosamente a ${this._nombreLoseta(res.destino)}.`;
            this._mostrarNotificacion(pnjDef.nombre, _motPNJ);
          }
        }
      }
    }

    // Cambio de fase (rondas 5 y 9 — ya aplicado por avanzarRonda en state.js)
    if (estado.ronda === 5 || estado.ronda === 9) {
      const reacciones_pendientes = [];
      datosCaso.comun.pnj.forEach(pnj => {
        const res = subirSospecha(pnj.id, 1);
        if (res?.reaccionesNuevas?.length > 0)
          reacciones_pendientes.push({ pnj_id: pnj.id, reacciones: res.reaccionesNuevas });
      });

      // Mover PNJs a su loseta de fase
      const claveMovimiento = estado.ronda === 5 ? 'anochecer_medianoche' : 'medianoche_madrugada';
      const movsFase = [];
      datosCaso.comun.pnj.forEach(pnjDef => {
        const mov = pnjDef.movimiento?.[claveMovimiento];
        if (!mov) return;
        const actual = estado.pnj?.[pnjDef.id]?.loseta_actual || pnjDef.posicion_inicial;

        let destino = null;

        if (mov === 'patrulla' || pnjDef.movimiento?.patrulla === true) {
          // Movimiento aleatorio por loseta conectada
          const res = resolverMovimientoPatrulla(pnjDef.id);
          if (res.movio) {
            movsFase.push({ nombre: pnjDef.nombre, nomDesde: this._nombreLoseta(actual), nomHasta: this._nombreLoseta(res.destino) });
          }
          return;
        }

        if (typeof mov === 'object' && mov.condicion) {
          // Movimiento condicional: evaluar condición
          const cond = mov.condicion;
          let cumple = true;
          if (cond.sospecha_min !== undefined) {
            cumple = (estado.pnj?.[pnjDef.id]?.sospecha || 0) >= cond.sospecha_min;
          }
          destino = cumple ? mov.destino : (mov.fallback || null);
        } else if (typeof mov === 'string') {
          destino = mov;
        }

        if (!destino || destino === actual) return;
        if (typeof moverPNJ === 'function') moverPNJ(pnjDef.id, destino);
        movsFase.push({ nombre: pnjDef.nombre, nomDesde: this._nombreLoseta(actual), nomHasta: this._nombreLoseta(destino) });
      });

      if (movsFase.length > 0) {
        const faseNom = { medianoche: 'Medianoche', madrugada: 'Madrugada' };
        const titulo = `Cambio de fase — ${faseNom[estado.fase] || estado.fase}`;
        const lineas = movsFase.map(m => `${m.nombre} se retira a ${m.nomHasta}.`).join('\n');
        setTimeout(() => this._mostrarNotificacion(titulo, lineas), 200);
      }

      // Notificación: todos los jugadores roban 2 cartas de Resolución
      const faseNomCartas = { medianoche: 'Medianoche', madrugada: 'Madrugada' };
      setTimeout(() => this._mostrarNotificacion(
        `${faseNomCartas[estado.fase] || 'Nueva fase'} — Cartas de Resolución`,
        'Todos los jugadores roban 2 cartas del mazo de Resolución.'
      ), 250);

      // Mostrar todas las reacciones en una sola pantalla (no una por PNJ)
      setTimeout(() => this._mostrarReaccionesFase(estado.fase, reacciones_pendientes), 350);
    }

    this.renderizarPartida();
    Mapa.renderizar();
    // Mostrar overlay de inicio de nueva fase de jugadores
    // En cambio de fase, se encadena DESPUÉS de las reacciones (ver _mostrarReaccionesFase)
    if (estado.ronda !== 5 && estado.ronda !== 9) {
      setTimeout(() => this.mostrarInicioFase(estado.ronda, estado.fase), 300);
    }
  },


  // ──────────────────────────────────────────────────────────────────────────
  // HUD — Pantalla partida con mapa integrado
  // ──────────────────────────────────────────────────────────────────────────

  toggleHUD() {
    const panel = document.getElementById('hud-panel');
    if (!panel) return;
    const abierto = panel.classList.contains('abierto');
    panel.classList.toggle('abierto', !abierto);
    // Forzar re-render del mapa al cambiar tamaño
    setTimeout(() => Mapa.renderizar(), 320);
    document.getElementById('hud-toggle').textContent = abierto ? '⊞' : '⊟';
  },

  _renderHUDReloj() {
    const celdas = document.getElementById('hud-celdas');
    const ronda  = document.getElementById('hud-ronda-num');
    if (!celdas || !estado) return;
    celdas.innerHTML = '';
    for (let i = 1; i <= 12; i++) {
      const d = document.createElement('div');
      d.className = 'hud-celda';
      const fase = i <= 4 ? 'anoc' : i <= 8 ? 'medi' : 'madr';
      if (i <= estado.ronda) d.classList.add(fase);
      celdas.appendChild(d);
    }
    ronda.textContent = `${estado.ronda}/12`;
    const faseNom = { anochecer:'Anochecer', medianoche:'Medianoche', madrugada:'Madrugada' };
    const faseTxt = document.getElementById('hud-fase-txt');
    if (faseTxt) faseTxt.textContent = faseNom[estado.fase] || estado.fase;
  },

  _renderHUDAlerta() {
    const bar   = document.getElementById('hud-alerta-bar');
    const est   = document.getElementById('hud-alerta-est');
    if (!bar || !estado) return;
    bar.innerHTML = '';
    const efecto = getEfectoAlerta();
    for (let i = 1; i <= 10; i++) {
      const d = document.createElement('div');
      d.className = 'hud-alerta-pip';
      if (i <= estado.alerta) {
        if      (i <= 2)  d.classList.add('a-verde');
        else if (i <= 4)  d.classList.add('a-lima');
        else if (i <= 6)  d.classList.add('a-ambar');
        else if (i <= 8)  d.classList.add('a-naranja');
        else if (i === 9) d.classList.add('a-rojo');
        else              d.classList.add('a-critico');
      }
      bar.appendChild(d);
    }
    if (est) est.textContent = efecto.nombre;
  },

  _renderHUDSospecha() {
    const grid = document.getElementById('hud-sosp-grid');
    if (!grid || !datosCaso) return;
    grid.innerHTML = '';
    datosCaso.comun.pnj.forEach(pnj => {
      const estPNJ = estado.pnj?.[pnj.id];
      const s = estPNJ?.sospecha || 0;
      const card = document.createElement('div');
      card.className = 'hud-sosp-card';
      if (s >= (pnj.sospecha_max||5)) card.style.borderColor = 'var(--sangre)';
      card.addEventListener('click', () => this._mostrarInfoPNJ(pnj.id));

      const nom = document.createElement('div');
      nom.className = 'hud-sosp-nom';
      nom.textContent = pnj.nombre.split(' ').pop(); // Apellido corto

      const tag = document.createElement('div');
      tag.className = 'hud-sosp-tag';
      tag.textContent = 'Sospecha';

      const bar = document.createElement('div');
      bar.className = 'hud-sosp-bar';
      for (let i = 1; i <= 5; i++) {
        const p = document.createElement('div');
        p.className = 'hud-sosp-pip';
        if (i <= s) p.classList.add('s'+i);
        bar.appendChild(p);
      }
      card.appendChild(nom);
      card.appendChild(tag);
      card.appendChild(bar);
      grid.appendChild(card);
    });
  },

  _renderHUDJugadores() {
    const cont = document.getElementById('hud-jugs');
    if (!cont || !estado) return;
    cont.innerHTML = '';
    // Colores por personaje (definidos en mapa.js como PJ_COLOR)
    estado.jugadores.forEach((j, jugIdx) => {
      const pj    = PERSONAJES[j.personaje] || PERSONAJES['inspector'] || Object.values(PERSONAJES)[0] || {};
      const color   = getPJColor(j.personaje);    // color token (mapa)
      const colorUI = (typeof getPJColorUI === 'function') ? getPJColorUI(j.personaje) : color; // color UI (texto, rayitas)
      const base  = pj?.atributos || { FOR:4, INT:4, TEM:4 };
      const act   = j.atributos   || { ...base };

      const chip  = document.createElement('div');
      chip.className = 'hud-jug-chip';
      chip.style.borderColor = colorUI + '60';

      const url = typeof getAvatarPJ === 'function' ? getAvatarPJ(j.personaje, 56) : null;
      const img = document.createElement('img');
      img.style.cssText = `width:32px;height:32px;border-radius:50%;border:2px solid ${colorUI};flex-shrink:0;object-fit:cover;`;
      if (url) img.src = url;

      // Info principal
      const info = document.createElement('div');
      info.style.cssText = 'flex:1;min-width:0;display:flex;flex-direction:column;gap:2px;';
      const pjCorto = pj.nombre.replace('El ','').replace('La ','');
      info.innerHTML =
        '<span style="font-family:Cinzel,serif;font-size:.8rem;color:#fff;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + pjCorto + '</span>' +
        '<span style="font-family:Cinzel,serif;font-size:.7rem;color:' + colorUI + ';">' + pjCorto + '</span>' +
        '<span style="font-family:\"EB Garamond\",serif;font-size:.75rem;color:#a09080;">📍 ' + this._nombreLoseta(j.loseta_actual) + '</span>';

      // Barras de atributos FOR / INT / TEM
      const attrs = document.createElement('div');
      attrs.style.cssText = 'display:flex;gap:6px;margin-top:3px;flex-wrap:wrap;';
      ['FOR','INT','TEM'].forEach(attr => {
        const maxVal = base[attr] ?? 0;
        const curVal = act[attr]  ?? maxVal;
        const lost   = maxVal - curVal;
        const barW   = 14;

        const wrap = document.createElement('div');
        wrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:1px;';

        const lbl = document.createElement('span');
        lbl.style.cssText = 'font-family:Cinzel,serif;font-size:.58rem;letter-spacing:.06em;color:#8a7a68;';
        lbl.textContent = attr;

        const bar = document.createElement('div');
        bar.style.cssText = 'display:flex;gap:1px;';

        for (let i = 0; i < maxVal; i++) {
          const pip = document.createElement('div');
          const filled = i < curVal;
          pip.style.cssText =
            'width:' + barW + 'px;height:7px;border-radius:2px;' +
            'background:' + (filled ? colorUI : 'rgba(255,255,255,.12)') + ';' +
            'border:' + (filled ? '1.5px' : '1px') + ' solid ' + (filled ? colorUI : '#4a3e2e') + ';' +
            (filled ? 'box-shadow:0 0 6px ' + colorUI + 'cc;' : '');
          bar.appendChild(pip);
        }

        const num = document.createElement('span');
        num.style.cssText = 'font-family:Cinzel,serif;font-size:.65rem;color:' +
          (lost > 0 ? '#ef9a9a' : '#d4a840') + ';font-weight:bold;';
        num.textContent = curVal + (lost > 0 ? '/' + maxVal : '');

        wrap.appendChild(lbl);
        wrap.appendChild(bar);
        wrap.appendChild(num);
        attrs.appendChild(wrap);
      });

      // Badge de incapacitado
      if (j.incapacitado) {
        const badge = document.createElement('div');
        const esDesmayo = j.incapacitado.tipo === 'desmayo';
        badge.style.cssText = `
          position:absolute;inset:0;border-radius:inherit;
          background:rgba(0,0,0,0.75);
          display:flex;flex-direction:column;align-items:center;justify-content:center;
          gap:2px;border:1px solid ${esDesmayo ? '#e57373' : '#9c6fba'};border-radius:8px;
        `;
        badge.innerHTML = `
          <span style="font-size:1.2rem;">${esDesmayo ? '😵' : '🌀'}</span>
          <span style="font-family:Cinzel,serif;font-size:.6rem;color:${esDesmayo ? '#e57373' : '#9c6fba'};letter-spacing:.06em;text-transform:uppercase;">
            ${esDesmayo ? 'Desmayado' : 'Crisis'}
          </span>
        `;
        chip.style.position = 'relative';
        chip.appendChild(badge);
      }

      chip.appendChild(img);
      chip.appendChild(info);
      chip.appendChild(attrs);
      chip.addEventListener('click', () => Mapa._seleccionarJugador(jugIdx));
      cont.appendChild(chip);
    });
  },

  _renderClimax() {
    const btn = document.getElementById('btn-climax-hud');
    if (btn) btn.style.display = estado?.acusacion_desbloqueada ? 'flex' : 'none';
  },

  // Abrir interrogatorio directo desde el mapa (jugador idx + PNJ id)
  abrirInterrogatorioDirecto(jugIdx, pnjId, onAccionEjecutada) {
    // Guardar callback y jugIdx para cuando el interrogatorio sea efectivamente realizado
    this._pendienteAccionInterrogatorio = onAccionEjecutada || null;
    this._jugIdxInterrogatorio = jugIdx;
    this.abrirInterrogatorio(jugIdx, pnjId);
  },

    // ─── MAPA ──────────────────────────────────────────────────────────────────
  // El mapa está siempre visible como vista principal de la partida
  abrirMapa() {
    // ya estamos en el mapa — simplemente resalta el mapa o no hace nada
  },

  // Actualizar HUD sin re-renderizar el mapa completo
  _renderHUDMapa() {
    this._renderHUDReloj();
    this._renderHUDAlerta();
    this._renderHUDSospecha();
    this._renderHUDJugadores();
    this._renderClimax();
  },

  // ─── CLÍMAX ────────────────────────────────────────────────────────────────

  abrirClimax() {
    // Resetear a paso 1
    document.getElementById('climax-paso1').style.display  = 'block';
    document.getElementById('climax-paso2').style.display  = 'none';
    document.getElementById('climax-paso3').style.display  = 'none';
    document.getElementById('climax-paso4').style.display  = 'none';
    document.getElementById('climax-paso4b').style.display = 'none';
    document.getElementById('climax-paso5').style.display  = 'none';
    document.getElementById('overlay-climax').style.display = 'flex';
  },

  climaxRevelarVerdad() {
    const ac = datosVariante?.acusacion;
    if (!ac) return;
    document.getElementById('climax-texto-verdad').textContent = ac.texto_verdad || '';
    document.getElementById('climax-texto-resultado').textContent = ac.texto_victoria || '';
    document.getElementById('climax-paso1').style.display = 'none';
    document.getElementById('climax-paso2').style.display = 'block';
  },

  climaxMostrarEpilogos() {
    document.getElementById('climax-variante').textContent = estado.variante || '';
    document.getElementById('climax-paso2').style.display = 'none';
    document.getElementById('climax-paso3').style.display = 'block';
  },

  climaxMostrarPuntuacion() {
    document.getElementById('climax-paso3').style.display = 'none';
    document.getElementById('climax-paso4').style.display = 'block';
  },

  climaxElementos(pts) {
    estado._pts_resolucion = pts;
    guardarEstado();
    document.getElementById('climax-paso4').style.display  = 'none';
    document.getElementById('climax-paso4b').style.display = 'block';
  },

  climaxImplicado(opcion) {
    // Puntos por cada categoría
    // — Resolución del caso
    const ptsResolucion = estado._pts_resolucion || 0;

    // — Implicado
    const ptsImplicado = {
      'no_token':        0,
      'token_correcto':  3,
      'token_nadie':     0,
      'token_equivocado': -2,
      'token_no_habia':  -2,
    }[opcion] ?? 0;

    // — Alerta final
    const alerta = estado.alerta || 0;
    const ptsAlerta = alerta <= 2 ? 3 : alerta <= 4 ? 2 : alerta <= 6 ? 1 : 0;

    // — Ronda de resolución
    const ronda = estado.ronda || 1;
    const ptsRonda = estado.partida_terminada && !estado._alerta10
      ? (ronda <= 8 ? 3 : ronda <= 10 ? 2 : 1)
      : 0;

    const total = Math.max(0, ptsResolucion + ptsImplicado + ptsAlerta + ptsRonda);

    // Escala de resultado
    const escala = total <= 4  ? { etiqueta: 'Fiasco',                desc: 'La verdad queda enterrada. El culpable escapa.' }
                 : total <= 9  ? { etiqueta: 'Investigación mediocre', desc: 'Demasiados cabos sueltos. El caso se cierra con sombras de duda.' }
                 : total <= 13 ? { etiqueta: 'Buena investigación',    desc: 'El caso se cierra con dignidad. Quedan algunos misterios sin resolver.' }
                 : total <= 16 ? { etiqueta: 'Investigación brillante', desc: 'Pocos cabos sueltos. Blackmoor Hall puede respirar.' }
                 :               { etiqueta: 'Resolución magistral',   desc: 'Scotland Yard os quiere en su plantilla. La verdad ha triunfado.' };

    // Textos descriptivos de implicado
    const textoImplicado = {
      'no_token':         'Sin token de Implicado',
      'token_correcto':   'Token en mesa · acusación correcta',
      'token_nadie':      'Token en mesa · sin acusación',
      'token_equivocado': 'Token en mesa · jugador equivocado',
      'token_no_habia':   'Token en mesa · sin Implicado real',
    }[opcion] || '';

    // Desglose
    const desglose = document.getElementById('climax-puntos-desglose');
    desglose.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr auto;gap:.4rem .75rem;font-family:var(--f3);font-size:.9rem;">
        <span style="color:var(--txt2);">Resolución del caso</span>
        <span style="color:var(--oro);font-weight:700;text-align:right;">${ptsResolucion} pts</span>
        <span style="color:var(--txt2);">Implicado <span style="font-size:.78rem;color:#8a7a5a;">(${textoImplicado})</span></span>
        <span style="color:${ptsImplicado < 0 ? '#c85050' : 'var(--oro)'};font-weight:700;text-align:right;">${ptsImplicado >= 0 ? '+' : ''}${ptsImplicado} pts</span>
        <span style="color:var(--txt2);">Alerta final <span style="font-size:.78rem;color:#8a7a5a;">(nivel ${alerta})</span></span>
        <span style="color:var(--oro);font-weight:700;text-align:right;">+${ptsAlerta} pts</span>
        <span style="color:var(--txt2);">Ronda de resolución <span style="font-size:.78rem;color:#8a7a5a;">(ronda ${ronda})</span></span>
        <span style="color:var(--oro);font-weight:700;text-align:right;">+${ptsRonda} pts</span>
        <span style="color:var(--txt2);border-top:1px solid rgba(138,104,24,.3);padding-top:.4rem;font-weight:700;">TOTAL</span>
        <span style="color:var(--oro);border-top:1px solid rgba(138,104,24,.3);padding-top:.4rem;font-weight:700;text-align:right;">${total} pts</span>
      </div>`;

    document.getElementById('climax-puntos-total').textContent = `${total} puntos`;
    document.getElementById('climax-puntos-escala').textContent = escala.etiqueta.toUpperCase();
    document.getElementById('climax-puntos-desc').textContent = escala.desc;

    document.getElementById('climax-paso4b').style.display = 'none';
    document.getElementById('climax-paso5').style.display = 'block';
  },

  // ─── MENÚ ──────────────────────────────────────────────────────────────────

  // ─── INTERPRETACIÓN DE PISTAS ─────────────────────────────────────────────

  abrirInterpretacion(jugIdx, onFin) {
    // Asegurarse de que los datos de pistas están cargados
    // Carga síncrona de datos de pistas (embebidos)
    if (!_PISTAS_DATOS) cargarDatosPistasSync();

    const cont  = document.getElementById('reaccion-cont');
    if (!cont) { console.error('reaccion-cont no encontrado'); return; }
    cont.innerHTML = '';
    const j     = estado.jugadores[jugIdx];
    const pj    = PERSONAJES[j.personaje];
    const color = getPJColor(j.personaje);

    if (!estado.pistas_descubiertas)  estado.pistas_descubiertas  = [];
    if (!estado.pistas_interpretadas) estado.pistas_interpretadas = [];
    const pendientes = estado.pistas_descubiertas
      .filter(pid => !estado.pistas_interpretadas.includes(pid));

    if (!pendientes.length) {
      // Mostrar en el propio overlay para que sea visible
      const tit = document.createElement('p');
      tit.className = 'drw-titulo';
      tit.textContent = 'Sin pistas disponibles';
      cont.appendChild(tit);
      const msg = document.createElement('p');
      msg.style.cssText = 'font-family:var(--f3);color:var(--txt3);font-style:italic;margin:.5rem 0 1rem;';
      msg.textContent = 'No hay pistas descubiertas pendientes de interpretar. Descubreid primero pistas explorando las losetas.';
      cont.appendChild(msg);
      const btnC = document.createElement('button');
      btnC.className = 'btn btn-bloque';
      btnC.style.cssText = 'background:rgba(10,7,4,0.5);border-color:#3a2e20;color:#a09080;';
      btnC.textContent = 'Cerrar';
      btnC.onclick = () => this.cerrarOverlay('reaccion');
      cont.appendChild(btnC);
      this._abrirOverlay('reaccion');
      return;
    }

    const tit = document.createElement('p');
    tit.className = 'drw-titulo';
    tit.textContent = 'Interpretar una pista';
    cont.appendChild(tit);

    const quien = document.createElement('div');
    quien.style.cssText = `font-family:var(--f2);font-size:.8rem;color:${color};letter-spacing:.08em;margin-bottom:.75rem;`;
    quien.textContent = pj?.nombre || j.personaje;
    cont.appendChild(quien);

    pendientes.forEach(pid => {
      let info, metodos;
      try {
        info    = this._getDatosInterpretacion(pid);
        metodos = getMetodosPista(pid);
      } catch(e) {
        console.error('[Interpretar] Error cargando datos de pista', pid, e);
        info    = { nombre: `Pista #${pid.replace('pista_','')}`, atributo:'INT', dificultad:4 };
        metodos = [];
      }
      const bloque  = document.createElement('div');
      bloque.style.cssText = 'background:rgba(30,22,14,0.9);border:1px solid #4a3828;border-radius:10px;padding:12px 14px;margin-bottom:10px;';

      const nombPista = document.createElement('div');
      nombPista.style.cssText = 'font-family:Cinzel,serif;font-size:.95rem;color:#f0e8d8;font-weight:600;margin-bottom:8px;';
      nombPista.textContent = `${info.nombre}  [Pista #${pid.replace('pista_','')}]`;
      bloque.appendChild(nombPista);

      if (!metodos.length) {
        // Sin datos de métodos aún (casos 2–5 pendientes)
        const fallback = document.createElement('div');
        fallback.style.cssText = 'display:flex;align-items:center;gap:.75rem;margin-bottom:8px;';
        const fbColor = info.dificultad <= 2 ? '#81c784' : info.dificultad <= 4 ? '#ffd54f' : '#ef9a9a';
        fallback.innerHTML =
          `<span style="font-family:var(--f2);font-size:.8rem;letter-spacing:.12em;text-transform:uppercase;` +
          `color:#a08040;background:rgba(160,128,64,.15);border:1px solid rgba(160,128,64,.35);` +
          `border-radius:5px;padding:4px 11px;">${info.atributo}</span>` +
          `<span style="font-family:var(--f1);font-size:1.9rem;font-weight:700;color:${fbColor};` +
          `text-shadow:0 0 12px ${fbColor}44;line-height:1;">Dif. ${info.dificultad}</span>`;
        bloque.appendChild(fallback);
        bloque.appendChild(this._crearBotonesResultado(jugIdx, pid, info, { atributo: info.atributo, dificultad: info.dificultad }, null, onFin));
      } else {
        metodos.forEach(m => {
          try {
            // Ocultar método si la condición oculto_si se cumple
            if (m.oculto_si) {
              const os = m.oculto_si;
              if (os.pista_descubierta && (estado.pistas_descubiertas || []).includes(os.pista_descubierta)) return;
              if (os.pista_interpretada && (estado.pistas_interpretadas || []).includes(os.pista_interpretada)) return;
            }
            // Inyectar pista_id para calcular bonus_interpretacion
            m._pista_id = pid;
            const disp  = evaluarDisponibilidadMetodo(m, jugIdx);
            const calc  = disp.disponible ? calcularDifMetodo(m, jugIdx) : null;
            bloque.appendChild(this._renderMetodoInterpretacion(jugIdx, pid, info, m, disp, calc, onFin));
          } catch(e) {
            console.error('[Interpretar] Error renderizando método', m.id, e);
          }
        });
      }

      cont.appendChild(bloque);
    });

    const btnCanc = document.createElement('button');
    btnCanc.className = 'btn btn-bloque';
    btnCanc.style.cssText = 'margin-top:.5rem;background:rgba(10,7,4,0.5);border-color:#3a2e20;color:#a09080;';
    btnCanc.textContent = 'Cancelar';
    btnCanc.onclick = () => this.cerrarOverlay('reaccion');
    cont.appendChild(btnCanc);

    this._abrirOverlay('reaccion');
  },

  _renderMetodoInterpretacion(jugIdx, pid, info, metodo, disp, calc, onFin) {
    const wrap = document.createElement('div');
    wrap.style.cssText = `border-left:2px solid ${disp.disponible ? '#6a5538' : '#3a2e20'};padding:6px 10px;margin-bottom:8px;`;

    // Descripción del método
    const desc = document.createElement('div');
    desc.style.cssText = `font-family:var(--f3);font-size:.88rem;color:${disp.disponible ? '#d0c8b8' : '#5a4a38'};margin-bottom:4px;`;
    desc.textContent = metodo.descripcion;
    wrap.appendChild(desc);

    if (!disp.disponible) {
      // Método bloqueado — mostrar motivo
      const razon = document.createElement('div');
      razon.style.cssText = 'font-family:var(--f3);font-size:.88rem;color:#c09060;margin-top:3px;';
      razon.textContent = `⛔ ${disp.razon}`;
      wrap.appendChild(razon);
      return wrap;
    }

    if (calc.automatico) {
      // Automático disponible
      const badge = document.createElement('div');
      badge.style.cssText = 'font-family:var(--f2);font-size:.7rem;letter-spacing:.08em;color:#81c784;margin-bottom:6px;';
      badge.textContent = calc.mods.length ? calc.mods.join(' · ') : '✓ No requiere prueba';
      wrap.appendChild(badge);

      const btn = document.createElement('button');
      btn.className = 'btn btn-bloque';
      btn.style.cssText = 'background:rgba(20,60,20,0.6);border-color:#81c784;color:#81c784;min-height:42px;font-size:.9rem;';
      btn.textContent = '✓ Interpretar automáticamente';
      btn.addEventListener('click', () => {
        this._resolverInterpretacion(jugIdx, pid, info, metodo, 'exito', onFin);
      });
      wrap.appendChild(btn);
      return wrap;
    }

    // Bloque de dificultad destacado
    const difBlock = document.createElement('div');
    difBlock.style.cssText = 'display:flex;align-items:center;gap:.75rem;margin-bottom:10px;flex-wrap:wrap;';

    const difColor = calc.dif <= 2 ? '#81c784' : calc.dif <= 4 ? '#ffd54f' : '#ef9a9a';

    // Píldora atributo
    const attrPill = document.createElement('span');
    attrPill.style.cssText = 'font-family:var(--f2);font-size:.8rem;letter-spacing:.12em;text-transform:uppercase;' +
      'color:#a08040;background:rgba(160,128,64,.15);border:1px solid rgba(160,128,64,.35);' +
      'border-radius:5px;padding:4px 11px;white-space:nowrap;';
    attrPill.textContent = calc.attr;
    difBlock.appendChild(attrPill);

    // Número de dificultad grande
    const difNum = document.createElement('span');
    difNum.style.cssText = `font-family:var(--f1);font-size:1.9rem;font-weight:700;color:${difColor};` +
      `text-shadow:0 0 12px ${difColor}44;line-height:1;`;
    difNum.textContent = `Dif. ${calc.dif}`;
    difBlock.appendChild(difNum);

    // Modificadores si los hay
    if (calc.mods.length) {
      const modSpan = document.createElement('span');
      modSpan.style.cssText = 'font-family:var(--f3);font-size:.8rem;color:#ddc87a;' +
        'background:rgba(200,175,80,.09);border:1px solid rgba(200,175,80,.22);' +
        'border-radius:5px;padding:3px 8px;white-space:nowrap;';
      modSpan.textContent = calc.mods.join(' · ');
      difBlock.appendChild(modSpan);
    }

    wrap.appendChild(difBlock);

    // Efectos en éxito/fracaso (línea secundaria)
    const efectosLinea = [];
    if (metodo.efecto_adicional) {
      const ea = metodo.efecto_adicional;
      if (ea.tipo === 'sospecha_pnj') efectosLinea.push(`Éxito: +${ea.valor} Sospecha ${ea.pnj}`);
      else if (ea.tipo === 'alerta') efectosLinea.push(`Éxito: +${ea.valor} Alerta`);
    }
    if (metodo.efecto_fracaso) {
      const ef = metodo.efecto_fracaso;
      if (ef.tipo === 'sospecha_pnj') efectosLinea.push(`Fracaso: +${ef.valor} Sospecha ${ef.pnj}`);
      else if (ef.tipo === 'alerta') efectosLinea.push(`Fracaso: +${ef.valor} Alerta`);
    }
    if (efectosLinea.length) {
      const efLine = document.createElement('div');
      efLine.style.cssText = 'font-family:var(--f2);font-size:.72rem;letter-spacing:.07em;color:#c08050;margin-bottom:6px;';
      efLine.textContent = efectosLinea.join('  ·  ');
      wrap.appendChild(efLine);
    }

    wrap.appendChild(this._crearBotonesResultado(jugIdx, pid, info, calc, metodo, onFin));
    return wrap;
  },

  _crearBotonesResultado(jugIdx, pid, info, calc, metodo, onFin) {
    const wrapper = document.createElement('div');

    // Selector de enfoque cauteloso/decidido
    let _enfoqueDecididoInterp = false;
    const enfoqueWrapInterp = document.createElement('div');
    enfoqueWrapInterp.style.cssText = 'display:flex;gap:.5rem;margin-bottom:.6rem;';
    const mkEBInterp = (label) => {
      const b = document.createElement('button');
      b.style.cssText = 'flex:1;padding:.45rem .3rem;border-radius:8px;font-family:var(--f2);font-size:.65rem;letter-spacing:.07em;text-transform:uppercase;cursor:pointer;border:1px solid;transition:all .15s;touch-action:manipulation;';
      b.textContent = label;
      return b;
    };
    const btnCautInterp = mkEBInterp('🛡 Cauteloso');
    const btnDecInterp  = mkEBInterp('⚔ Decidido · +1 Alerta');
    const actualizarEnfoqueInterp = () => {
      btnCautInterp.style.background  = !_enfoqueDecididoInterp ? 'rgba(80,160,80,.2)'  : 'rgba(0,0,0,.2)';
      btnCautInterp.style.borderColor = !_enfoqueDecididoInterp ? 'rgba(80,160,80,.5)'  : 'rgba(255,255,255,.1)';
      btnCautInterp.style.color       = !_enfoqueDecididoInterp ? '#81c784' : '#555';
      btnDecInterp.style.background   =  _enfoqueDecididoInterp ? 'rgba(200,80,40,.2)'  : 'rgba(0,0,0,.2)';
      btnDecInterp.style.borderColor  =  _enfoqueDecididoInterp ? 'rgba(200,80,40,.5)'  : 'rgba(255,255,255,.1)';
      btnDecInterp.style.color        =  _enfoqueDecididoInterp ? '#e07050' : '#555';
    };
    btnCautInterp.onclick = () => { _enfoqueDecididoInterp = false; actualizarEnfoqueInterp(); };
    btnDecInterp.onclick  = () => { _enfoqueDecididoInterp = true;  actualizarEnfoqueInterp(); };
    actualizarEnfoqueInterp();
    enfoqueWrapInterp.appendChild(btnCautInterp);
    enfoqueWrapInterp.appendChild(btnDecInterp);
    wrapper.appendChild(enfoqueWrapInterp);

    const row = document.createElement('div');
    row.style.cssText = 'display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:5px;';
    [
      { key:'critico', icon:'★', label:'Crítico',  color:'#ffd700' },
      { key:'exito',   icon:'✓', label:'Éxito',    color:'#81c784' },
      { key:'fracaso', icon:'✗', label:'Fracaso',  color:'#ef9a9a' },
      { key:'pifia',   icon:'☠', label:'Pifia',    color:'#cf6679' },
    ].forEach(res => {
      const btn = document.createElement('button');
      btn.style.cssText = `background:rgba(10,7,4,0.8);border:1px solid ${res.color}55;border-radius:8px;` +
        `color:${res.color};font-family:Cinzel,serif;font-size:.7rem;padding:8px 2px;cursor:pointer;` +
        `display:flex;flex-direction:column;align-items:center;gap:2px;min-height:50px;touch-action:manipulation;`;
      btn.innerHTML = `<span style="font-size:1.1rem;">${res.icon}</span><span>${res.label}</span>`;
      btn.addEventListener('click', () => {
        if (_enfoqueDecididoInterp) subirAlerta(1, 'Enfoque decidido');
        this._resolverInterpretacion(jugIdx, pid, info, metodo, res.key, onFin);
      });
      row.appendChild(btn);
    });
    return row;
  },

  _getDatosInterpretacion(pista_id) {
    const caso_id = datosCaso?.id || 'caso_1';
    const cartas  = typeof _CARTAS_DATOS !== 'undefined'
      ? (_CARTAS_DATOS[caso_id]?.cartas || []) : [];
    const carta   = cartas.find(c => c.pista_id === pista_id);
    if (carta) {
      return {
        nombre:     carta.pista_nombre || carta.titulo,
        atributo:   carta.atributo || 'INT',
        dificultad: carta.dificultad || 4
      };
    }
    return { nombre: `Pista #${pista_id.replace('pista_','')}`, atributo: 'INT', dificultad: 4 };
  },

  _resolverInterpretacion(jugIdx, pid, info, metodo, resultado, onFin) {
    this.cerrarOverlay('reaccion');

    // Salvaguarda: jugIdx debe ser un índice válido
    const jugIdxSafe = (typeof jugIdx === 'number' && jugIdx >= 0 && jugIdx < estado.jugadores.length)
      ? jugIdx : 0;
    jugIdx = jugIdxSafe;

    const j = estado.jugadores[jugIdx];
    if (!j) { console.error('[Interpretar] jugador no encontrado:', jugIdx); return; }
    let titulo, texto, refLibro = null;

    if (resultado === 'critico' || resultado === 'exito') {
      if (!estado.pistas_descubiertas.includes(pid)) {
        estado.pistas_descubiertas.push(pid);
      }
      if (!estado.pistas_interpretadas.includes(pid)) {
        estado.pistas_interpretadas.push(pid);
      }
      if (estado.bonus_interpretacion?.[pid]) {
        delete estado.bonus_interpretacion[pid][jugIdx];
        if (Object.keys(estado.bonus_interpretacion[pid]).length === 0) {
          delete estado.bonus_interpretacion[pid];
        }
      }

      // Efectos adicionales del método (Sospecha PNJ, Alerta) — campo legacy
      if (metodo?.efecto_adicional) {
        const ea = metodo.efecto_adicional;
        const motivo = `Interpretar ${info.nombre}`;
        if (ea.tipo === 'sospecha_pnj') subirSospecha(ea.pnj, ea.valor, motivo);
        else if (ea.tipo === 'alerta')   subirAlerta(ea.valor, motivo);
      }

      // Efectos en éxito — nuevo formato (array)
      // Se guardan como pendientes para aplicar DESPUÉS de mostrar el texto
      this._efectosPendientesInterpretacion = null;
      const efectosExitoBase = metodo?.efecto_exito || [];

      // Efectos variante-dependientes: se aplican DESPUÉS de mostrar el texto
      if (metodo?.exito_variante) {
        const varLetra = (estado.variante || 'A').toUpperCase();
        const vd = metodo.exito_variante[varLetra];
        const efectosCombinados = [...efectosExitoBase, ...(vd?.efectos || [])];
        if (efectosCombinados.length) {
          this._efectosPendientesInterpretacion = { efectos: efectosCombinados, motivo: `Registro — ${info.nombre}` };
        }
      } else if (efectosExitoBase.length) {
        // Efectos sin variante — también diferidos
        this._efectosPendientesInterpretacion = { efectos: efectosExitoBase, motivo: `Interpretar ${info.nombre}` };
      }

      usarAccion(jugIdx, 'interpretar');
      guardarEstado();
      if (typeof _verificarDesbloqueoAcusacion === 'function') _verificarDesbloqueoAcusacion();

      titulo = resultado === 'critico' ? '★ Interpretación brillante' : '✓ Pista interpretada';

      if (metodo?.exito_variante) {
        const varLetra = (estado.variante || 'A').toUpperCase();
        const vd = metodo.exito_variante[varLetra];
        const textoComun = metodo.exito_variante.texto_comun || '';
        texto = textoComun + (textoComun && vd?.texto ? '\n\n' : '') + (vd?.texto || '');
      } else {
        texto = resultado === 'critico'
          ? `La mente de ${PERSONAJES[j.personaje]?.nombre || j.personaje} encaja todas las piezas. "${info.nombre}" revela su significado con absoluta claridad.`
          : `Tras reflexionar detenidamente, ${PERSONAJES[j.personaje]?.nombre || j.personaje} comprende el alcance de "${info.nombre}".`;
      }
      // Confirmar pista obtenida al final del texto
      const _numPista = pid.replace('pista_', '#');
      texto = (texto ? texto + '\n\n' : '') + `❆ Has obtenido la Pista ${_numPista} Interpretada.`;
      refLibro  = metodo?.ref_libro || null;

    } else if (resultado === 'fracaso') {
      // Efectos adicionales en fracaso
      if (metodo?.efecto_fracaso) {
        const ef = metodo.efecto_fracaso;
        const motivo = `Fracaso al interpretar ${info.nombre}`;
        if (ef.tipo === 'sospecha_pnj') subirSospecha(ef.pnj, ef.valor, motivo);
        else if (ef.tipo === 'alerta')   subirAlerta(ef.valor, motivo);
      }
      // Si el método permite reintento en fracaso, no consumir acción
      if (!metodo?.fracaso_reintento) {
        usarAccion(jugIdx, 'interpretar');
      }
      guardarEstado();
      titulo = '✗ El significado se resiste';
      if (metodo?.fracaso_texto) {
        texto = metodo.fracaso_texto;
      } else {
        texto = `Por más que lo intenta, ${PERSONAJES[j.personaje]?.nombre || j.personaje} no logra extraer conclusiones de "${info.nombre}". Quizás otro enfoque, o más tiempo, lo aclare.`;
      }

    } else { // pifia
      // Efectos adicionales en pifia (también se aplica efecto_fracaso si existe)
      if (metodo?.efecto_fracaso) {
        const ef = metodo.efecto_fracaso;
        const motivo = `Pifia al interpretar ${info.nombre}`;
        if (ef.tipo === 'sospecha_pnj') subirSospecha(ef.pnj, ef.valor, motivo);
        else if (ef.tipo === 'alerta')   subirAlerta(ef.valor, motivo);
      }
      subirAlerta(1, `Pifia al interpretar ${info.nombre}`);
      usarAccion(jugIdx, 'interpretar');
      guardarEstado();
      titulo = '☠ Un error grave';
      texto  = `La torpeza de ${PERSONAJES[j.personaje]?.nombre || j.personaje} al examinar "${info.nombre}" llama la atención. Voces indiscretas, un ruido inapropiado... la guardia se eleva.`;
    }

    const cont  = document.getElementById('resultado-cont');
    const titEl = document.getElementById('resultado-tit');
    if (cont && titEl) {
      cont.innerHTML = '';
      titEl.textContent = `Interpretación — ${titulo}`;

      const p = document.createElement('div');
      p.className = 'interrog-texto';
      p.style.cssText = 'margin-bottom:1rem;white-space:pre-line;';
      p.textContent = texto;
      cont.appendChild(p);

      // Indicador mecánico de pifia: Alerta ↑
      if (resultado === 'pifia') {
        const mecPifia = document.createElement('div');
        mecPifia.style.cssText = 'font-family:var(--f2);font-size:.72rem;letter-spacing:.1em;color:#ef9a9a;margin-bottom:.75rem;';
        mecPifia.textContent = 'Alerta ↑';
        cont.appendChild(mecPifia);
      }

      // Indicador mecánico de efecto_fracaso en fracaso o pifia
      if ((resultado === 'fracaso' || resultado === 'pifia') && metodo?.efecto_fracaso) {
        const ef = metodo.efecto_fracaso;
        const mecFrac = document.createElement('div');
        mecFrac.style.cssText = 'font-family:var(--f2);font-size:.72rem;letter-spacing:.1em;color:#ef9a9a;margin-bottom:.75rem;';
        if (ef.tipo === 'sospecha_pnj') mecFrac.textContent = `Sospecha ${ef.pnj} +${ef.valor}`;
        else if (ef.tipo === 'alerta')  mecFrac.textContent = `Alerta +${ef.valor}`;
        cont.appendChild(mecFrac);
      }

      // Referencia al Libro de Caso si la hay
      if (refLibro) {
        const ref = document.createElement('div');
        ref.style.cssText = 'font-family:Cinzel,serif;font-size:.82rem;color:#ffd700;' +
          'border:1px solid #ffd70044;border-radius:8px;padding:8px 12px;margin-bottom:1rem;';
        ref.textContent = `📖 Consulta el Libro de Caso: ${refLibro}`;
        cont.appendChild(ref);
      }

      // Estado de pistas
      const total  = estado.pistas_descubiertas?.length || 0;
      const interp = estado.pistas_interpretadas?.length || 0;
      const stat   = document.createElement('div');
      stat.style.cssText = 'font-family:Cinzel,serif;font-size:.75rem;color:#a09080;letter-spacing:.06em;margin-bottom:1rem;';
      stat.textContent   = `Pistas interpretadas: ${interp} / ${total} descubiertas`;
      cont.appendChild(stat);

      if (estado.acusacion_desbloqueada) {
        const aviso = document.createElement('div');
        aviso.style.cssText = 'font-family:Cinzel,serif;font-size:.8rem;color:#ffd700;letter-spacing:.08em;margin-bottom:1rem;';
        aviso.textContent = '⚖ ¡Acusación desbloqueada!';
        cont.appendChild(aviso);
      }

      const btnCerrar = document.createElement('button');
      btnCerrar.className = 'btn btn-p btn-bloque';
      btnCerrar.style.cssText = 'min-height:52px;font-size:1rem;margin-top:.5rem;';
      btnCerrar.textContent = 'Continuar';
      btnCerrar.onclick = () => {
        // Aplicar efectos diferidos (sospecha, alerta) del registro de habitación
        if (this._efectosPendientesInterpretacion) {
          const { efectos, motivo } = this._efectosPendientesInterpretacion;
          for (const ef of efectos) {
            if (ef.tipo === 'sospecha_pnj') {
              if (ef.condicional === 'si_tiene') {
                if ((estado.pnj?.[ef.pnj]?.sospecha || 0) > 0) subirSospecha(ef.pnj, ef.valor, motivo);
              } else {
                subirSospecha(ef.pnj, ef.valor, motivo);
              }
            } else if (ef.tipo === 'alerta') {
              subirAlerta(ef.valor, motivo);
            }
          }
          this._efectosPendientesInterpretacion = null;
        }
        this.cerrarOverlay('resultado');
        if (typeof onFin === 'function') onFin();
      };
      cont.appendChild(btnCerrar);
    }
    this._abrirOverlay('resultado');
  },


  mostrarMenu() { this._abrirOverlay('menu'); },

  exportarPartida() {
    if (!estado) return;
    const json = JSON.stringify(estado, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blackmoor_partida_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  importarPartida() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const importado = JSON.parse(ev.target.result);
          estado = importado;
          guardarEstado();
          this.cerrarOverlay('menu');
          this.irAPartida();
        } catch(err) {
          alert('Fichero de partida inválido.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  },

  confirmarAbandonar() {
    if (confirm('¿Seguro que quieres abandonar la partida? Se perderá el progreso.')) {
      borrarPartidaGuardada();
      estado = null;
      this.cerrarOverlay('menu');
      this.irAInicio();
    }
  },

  // ─── INFO PNJ ──────────────────────────────────────────────────────────────

  _mostrarInfoPNJ(pnj_id) {
    const pnjDef = getPNJ(pnj_id);
    const estPNJ = estado.pnj[pnj_id];
    const container = document.getElementById('reaccion-cont');
    container.innerHTML = '';

    const titulo = document.createElement('div');
    titulo.className = 'drw-titulo';
    titulo.textContent = `${pnjDef.nombre} — ${pnjDef.rol}`;
    container.appendChild(titulo);

    const atributos = document.createElement('div');
    atributos.style.cssText = 'display:flex; gap:0.75rem; margin-bottom:0.75rem;';
    ['FOR', 'INT', 'TEM'].forEach(attr => {
      const div = document.createElement('div');
      div.style.textAlign = 'center';
      div.innerHTML = `<div style="font-family:var(--fuente-titulo); color:var(--oro); font-size:1.2rem;">${pnjDef.atributos[attr]}</div><div class="texto-sutil" style="font-size:0.65rem;">${attr}</div>`;
      atributos.appendChild(div);
    });
    container.appendChild(atributos);

    const ubicacion = document.createElement('p');
    ubicacion.className = 'cfg-desc';
    ubicacion.textContent = `Ubicación actual: ${this._nombreLoseta(estPNJ.loseta_actual)}`;
    container.appendChild(ubicacion);

    // Controles de Sospecha
    const sospLabel = document.createElement('p');
    sospLabel.className = 'subtitulo';
    sospLabel.style.marginTop = '0.75rem';
    sospLabel.textContent = 'Sospecha';
    container.appendChild(sospLabel);

    const controles = document.createElement('div');
    controles.style.cssText = 'display:flex; gap:0.5rem; align-items:center; margin-top:0.375rem;';
    controles.innerHTML = `
      <button class="btn btn-s" style="padding:0.3rem 0.75rem;" onclick="UI._ajustarSospecha('${pnj_id}', ${Math.max(0, estPNJ.sospecha - 1)}); UI.cerrarOverlay('reaccion');">−</button>
      <span style="font-family:var(--fuente-titulo); color:var(--oro); font-size:1.5rem; flex:1; text-align:center;">${estPNJ.sospecha}</span>
      <button class="btn btn-d" style="padding:0.3rem 0.75rem;" onclick="UI._ajustarSospecha('${pnj_id}', ${Math.min(pnjDef.sospecha_max || 5, estPNJ.sospecha + 1)}); UI.cerrarOverlay('reaccion');">+</button>
    `;
    container.appendChild(controles);

    // Mover PNJ
    const moverLabel = document.createElement('p');
    moverLabel.className = 'subtitulo';
    moverLabel.style.marginTop = '0.75rem';
    moverLabel.textContent = 'Mover a loseta';
    container.appendChild(moverLabel);

    const selectLoseta = document.createElement('select');
    selectLoseta.style.marginTop = '0.375rem';
    const distrib = getDistribucion();
    if (distrib) {
      distrib.losetas.forEach(l => {
        const opt = document.createElement('option');
        opt.value = l.id;
        opt.textContent = l.nombre || l.id;
        opt.selected = l.id === estPNJ.loseta_actual;
        selectLoseta.appendChild(opt);
      });
    }
    container.appendChild(selectLoseta);

    const btnMover = document.createElement('button');
    btnMover.className = 'btn btn-secundario btn-bloque mt-sm';
    btnMover.textContent = 'Confirmar posición';
    btnMover.onclick = () => {
      moverPNJ(pnj_id, selectLoseta.value);
      this.cerrarOverlay('reaccion');
      this.renderizarPartida();
      if (document.getElementById('mapa-container')) {
        Mapa.renderizar();
      }
    };
    container.appendChild(btnMover);

    this._abrirOverlay('reaccion');
  },

  // ─── UTILIDADES ────────────────────────────────────────────────────────────

  _abrirOverlay(id) {
    document.getElementById(`overlay-${id}`).classList.add('activo');
  },

  cerrarOverlay(id) {
    document.getElementById(`overlay-${id}`).classList.remove('activo');
    if (id === 'pistas') this._pendienteAccionDeducir = null;
  },

  // ── Visiones de la Médium ──────────────────────────────────────────────────
  // Llamada desde state.js cuando la Médium pierde Temple
  _mostrarSiguienteVision() {
    if (!this._colaVisiones || this._colaVisiones.length === 0) return;
    const jugIdx = this._colaVisiones[0];
    this._activarVisionMedium_impl(jugIdx);
  },

  _activarVisionMedium_impl(jugIdx) {
    // Las visiones están en datosVariante (la variante activa del caso)
    const visiones = (typeof datosVariante !== 'undefined' && datosVariante?.visiones)
      ? datosVariante.visiones
      : [];
    if (!visiones.length) { if (this._colaVisiones) this._colaVisiones.shift(); return; }

    const idx = estado.visiones_activadas || 0;
    if (idx >= visiones.length) { if (this._colaVisiones) this._colaVisiones.shift(); return; }

    const textoVision = visiones[idx];
    estado.visiones_activadas = idx + 1;
    guardarEstado();

    const j = estado.jugadores[jugIdx];
    const pjNom = (typeof PERSONAJES !== 'undefined' ? (PERSONAJES[j.personaje]?.nombre || j.personaje) : j.personaje);

    // Mostrar en overlay-reaccion (z-index:210)
    const container = document.getElementById('reaccion-cont');
    if (!container) return;
    container.innerHTML = '';

    const badge = document.createElement('div');
    badge.style.cssText = 'margin-bottom:.75rem;';
    badge.innerHTML = `<span class="badge badge-rojo" style="font-size:.75rem;letter-spacing:.1em;">✦ VISIÓN — ${pjNom}</span>`;
    container.appendChild(badge);

    const num = document.createElement('p');
    num.style.cssText = 'font-family:var(--f2);font-size:.7rem;letter-spacing:.12em;color:#a08060;margin-bottom:.5rem;text-transform:uppercase;';
    num.textContent = `Visión ${idx + 1} de ${visiones.length}`;
    container.appendChild(num);

    const sep = document.createElement('div');
    sep.style.cssText = 'border-top:1px solid #5a4030;margin-bottom:.75rem;';
    container.appendChild(sep);

    const txt = document.createElement('p');
    txt.style.cssText = 'font-family:"EB Garamond",serif;font-size:clamp(1rem,3.5vw,1.15rem);color:#e8dcc8;line-height:1.75;margin-bottom:1rem;';
    txt.textContent = textoVision;
    container.appendChild(txt);

    const nota = document.createElement('p');
    nota.style.cssText = 'font-family:var(--f2);font-size:.72rem;letter-spacing:.08em;color:#a09060;margin-bottom:1rem;';
    nota.textContent = 'Leed esta visión en voz alta. Solo la Médium sabe de qué se trata.';
    container.appendChild(nota);

    const btn = document.createElement('button');
    btn.className = 'btn btn-primario btn-bloque';
    // Si hay más visiones en cola, el botón lo indica
    const masVisiones = this._colaVisiones && this._colaVisiones.length > 1;
    btn.textContent = masVisiones ? 'Siguiente visión →' : 'Entendido';
    btn.onclick = () => {
      // Quitar esta visión de la cola y mostrar la siguiente si existe
      if (this._colaVisiones) this._colaVisiones.shift();
      if (this._colaVisiones && this._colaVisiones.length > 0) {
        // Hay más visiones pendientes — mostrar la siguiente
        this._mostrarSiguienteVision();
      } else {
        this.cerrarOverlay('reaccion');
      }
    };
    container.appendChild(btn);

    this._abrirOverlay('reaccion');
  },

  abrirPruebaCerradura(jugIdx, losetaId, dificultad, sinAlerta, nomLoseta, callback) {
    const j      = estado.jugadores[jugIdx];
    const pj     = PERSONAJES[j.personaje];
    const colorUI = (typeof getPJColorUI === 'function') ? getPJColorUI(j.personaje) : getPJColor(j.personaje);
    const forVal  = j.atributos?.FOR ?? 0;
    const difColor = dificultad <= 2 ? '#4caf50' : dificultad <= 4 ? '#f9a825' : '#ef5350';

    document.getElementById('resultado-tit').textContent = '🗝 Forzar cerradura';
    const cont = document.getElementById('resultado-cont');
    cont.innerHTML = '';

    // Habitación y personaje
    const sub = document.createElement('p');
    sub.style.cssText = "font-family:'EB Garamond',serif;font-size:.95rem;color:#c8b89a;margin-bottom:.5rem;";
    sub.textContent = `${nomLoseta}`;
    cont.appendChild(sub);

    const pjEl = document.createElement('p');
    pjEl.style.cssText = `font-family:Cinzel,serif;font-size:.85rem;color:${colorUI};margin-bottom:.75rem;`;
    pjEl.textContent = `${pj.nombre} · FOR ${forVal}`;
    cont.appendChild(pjEl);

    // Dificultad grande
    const difEl = document.createElement('div');
    difEl.style.cssText = `font-family:Cinzel,serif;font-size:2rem;color:${difColor};font-weight:700;margin-bottom:.5rem;text-align:center;`;
    difEl.textContent = `FOR · Dif. ${dificultad}`;
    cont.appendChild(difEl);

    // Nota alerta
    const nota = document.createElement('p');
    nota.style.cssText = `font-family:'EB Garamond',serif;font-size:.88rem;color:${sinAlerta ? '#4caf50' : '#ef9a9a'};margin-bottom:1.25rem;text-align:center;`;
    nota.textContent = sinAlerta
      ? 'El fracaso no levantará sospechas'
      : 'Fracaso: el ruido llama la atención — Alerta ↑';
    cont.appendChild(nota);

    // Selector de enfoque cauteloso/decidido
    let _enfoqueDecididoCerr = false;
    const enfoqueWrapCerr = document.createElement('div');
    enfoqueWrapCerr.style.cssText = 'display:flex;gap:.5rem;margin-bottom:.75rem;';
    const mkEBC = (label) => {
      const b = document.createElement('button');
      b.style.cssText = 'flex:1;padding:.5rem .4rem;border-radius:8px;font-family:var(--f2);font-size:.7rem;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;border:1px solid;transition:all .15s;touch-action:manipulation;';
      b.textContent = label;
      return b;
    };
    const btnCautCerr = mkEBC('🛡 Cauteloso');
    const btnDecCerr  = mkEBC('⚔ Decidido · +1 Alerta');
    const actualizarEnfoqueCerr = () => {
      btnCautCerr.style.background  = !_enfoqueDecididoCerr ? 'rgba(80,160,80,.2)'  : 'rgba(0,0,0,.2)';
      btnCautCerr.style.borderColor = !_enfoqueDecididoCerr ? 'rgba(80,160,80,.5)'  : 'rgba(255,255,255,.1)';
      btnCautCerr.style.color       = !_enfoqueDecididoCerr ? '#81c784' : '#555';
      btnDecCerr.style.background   =  _enfoqueDecididoCerr ? 'rgba(200,80,40,.2)'  : 'rgba(0,0,0,.2)';
      btnDecCerr.style.borderColor  =  _enfoqueDecididoCerr ? 'rgba(200,80,40,.5)'  : 'rgba(255,255,255,.1)';
      btnDecCerr.style.color        =  _enfoqueDecididoCerr ? '#e07050' : '#555';
    };
    btnCautCerr.onclick = () => { _enfoqueDecididoCerr = false; actualizarEnfoqueCerr(); };
    btnDecCerr.onclick  = () => { _enfoqueDecididoCerr = true;  actualizarEnfoqueCerr(); };
    actualizarEnfoqueCerr();
    enfoqueWrapCerr.appendChild(btnCautCerr);
    enfoqueWrapCerr.appendChild(btnDecCerr);
    cont.appendChild(enfoqueWrapCerr);

    // Botones de resultado
    const resultados = [
      { id:'critico', label:'⭐ Crítico',  desc:'' },
      { id:'exito',   label:'✓ Éxito',    desc:'' },
      { id:'fracaso', label:'✗ Fracaso',  desc:'' },
      { id:'pifia',   label:'💀 Pifia',   desc:'' },
    ];
    resultados.forEach(r => {
      const btn = document.createElement('button');
      btn.className = 'btn btn-secundario btn-bloque';
      btn.style.marginBottom = '.5rem';
      btn.innerHTML = `<strong>${r.label}</strong> <span style="font-size:.82rem;color:#8a7a68;">(${r.desc})</span>`;
      btn.onclick = () => {
        if (_enfoqueDecididoCerr) subirAlerta(1, 'Enfoque decidido');
        this._abrirOverlay('resultado'); // mantener abierto — callback lo cierra
        this.cerrarOverlay('resultado');
        callback(r.id);
      };
      cont.appendChild(btn);
    });

    // Cancelar — devuelve la acción
    const btnCancel = document.createElement('button');
    btnCancel.className = 'btn btn-secundario btn-bloque mt-md';
    btnCancel.style.color = '#7a6a58';
    btnCancel.textContent = '← Cancelar';
    btnCancel.onclick = () => {
      const turno = getTurno(jugIdx);
      if (turno) turno.accion_usada = false;
      guardarEstado();
      this.cerrarOverlay('resultado');
      if (typeof Mapa !== 'undefined') Mapa.renderizar();
      this.renderizarPartida();
    };
    cont.appendChild(btnCancel);

    this._abrirOverlay('resultado');
  },

  _mostrarConfirmacion(titulo, texto, onConfirmar, opciones) {
    // opciones: array de { label, disponible, razon, accion } — si se pasa, sustituye al botón confirmar/cancelar
    let prev = document.getElementById('overlay-confirmacion');
    if (prev) prev.remove();
    const ov = document.createElement('div');
    ov.id = 'overlay-confirmacion';
    ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:300;display:flex;align-items:center;justify-content:center;padding:1rem;';

    const inner = document.createElement('div');
    inner.style.cssText = 'background:#1e1610;border:1px solid #6a5538;border-radius:12px;padding:1.5rem;max-width:400px;width:100%;';

    const tit = document.createElement('p');
    tit.style.cssText = 'font-family:Cinzel,serif;font-size:1.05rem;color:#d4a840;margin-bottom:.6rem;text-align:center;';
    tit.textContent = titulo;
    inner.appendChild(tit);

    if (texto) {
      const txt = document.createElement('p');
      txt.style.cssText = "font-family:'EB Garamond',serif;font-size:.95rem;color:#c8b89a;margin-bottom:1rem;line-height:1.5;text-align:center;";
      txt.textContent = texto;
      inner.appendChild(txt);
    }

    if (opciones && opciones.length) {
      // Modo multi-opción
      opciones.forEach(op => {
        const btn = document.createElement('button');
        btn.style.cssText = `display:block;width:100%;text-align:left;padding:.65rem .9rem;margin-bottom:.5rem;border-radius:8px;font-family:'EB Garamond',serif;font-size:.95rem;cursor:${op.disponible ? 'pointer' : 'default'};` +
          (op.disponible
            ? 'background:#2a1e12;border:1px solid #6a5538;color:#d0c8b8;'
            : 'background:#1a1510;border:1px solid #3a2e20;color:#5a4a38;');
        btn.textContent = op.label;
        if (!op.disponible && op.razon) {
          const r = document.createElement('div');
          r.style.cssText = "font-size:.8rem;color:#7a5a40;margin-top:2px;font-family:'EB Garamond',serif;";
          r.textContent = '⛔ ' + op.razon;
          btn.appendChild(r);
        }
        if (op.disponible) {
          btn.onclick = () => { ov.remove(); op.accion(); };
        }
        inner.appendChild(btn);
      });
      // Botón cancelar
      const cancel = document.createElement('button');
      cancel.style.cssText = 'display:block;width:100%;text-align:center;padding:.5rem;margin-top:.25rem;border-radius:8px;font-family:Cinzel,serif;font-size:.8rem;background:transparent;border:1px solid #3a2e20;color:#7a6a58;cursor:pointer;';
      cancel.textContent = 'Cancelar';
      cancel.onclick = () => ov.remove();
      inner.appendChild(cancel);
    } else {
      // Modo confirmación simple
      const btns = document.createElement('div');
      btns.style.cssText = 'display:flex;gap:.75rem;justify-content:center;margin-top:.5rem;';
      const si = document.createElement('button');
      si.style.cssText = 'font-family:Cinzel,serif;font-size:.85rem;padding:.5rem 1.25rem;background:#6a4020;border:1px solid #d4a840;border-radius:8px;color:#d4a840;cursor:pointer;';
      si.textContent = 'Confirmar';
      si.onclick = () => { ov.remove(); onConfirmar && onConfirmar(); };
      const no = document.createElement('button');
      no.style.cssText = 'font-family:Cinzel,serif;font-size:.85rem;padding:.5rem 1.25rem;background:#2a2218;border:1px solid #5a4a38;border-radius:8px;color:#a09080;cursor:pointer;';
      no.textContent = 'Cancelar';
      no.onclick = () => ov.remove();
      btns.appendChild(si); btns.appendChild(no);
      inner.appendChild(btns);
    }

    ov.appendChild(inner);
    document.body.appendChild(ov);
  },

  _mostrarNotificacion(titulo, texto, badge) {
    const ov  = document.getElementById('overlay-aviso');
    const tit = document.getElementById('aviso-titulo');
    const txt = document.getElementById('aviso-texto');
    const bdg = document.getElementById('aviso-badge');
    const btn = document.getElementById('aviso-btn-ok');
    if (!ov) return;
    tit.textContent = titulo || '';
    txt.textContent = texto  || '';
    if (badge) { bdg.textContent = badge; bdg.style.display = 'inline-block'; }
    else        { bdg.style.display = 'none'; }
    ov.classList.add('activo');
    btn.onclick = () => { ov.classList.remove('activo'); };
  },


  // ── Muestra/oculta el botón flotante "Finalizar fase de jugadores"
  actualizarBtnFinFase() {
    const btn = document.getElementById('btn-fin-fase');
    if (!btn || !estado?.jugadores) return;
    // Un jugador ha terminado si: gastó su acción O terminó turno voluntariamente
    const todosFin = estado.jugadores.every((_, i) => {
      const t = getTurno(i);
      return t && (t.accion_usada || t.turno_terminado);
    });
    btn.style.display = todosFin ? 'block' : 'none';
    // También actualizar el texto del botón "Fin ronda" del HUD para consistencia
    const btnHud = document.querySelector('.hud-acc-btn');
  },

  // ── Muestra el overlay de inicio de nueva fase de jugadores
  mostrarInicioFase(ronda, fase) {
    const faseNom = { anochecer:'Anochecer', medianoche:'Medianoche', madrugada:'Madrugada' };
    const overlay = document.getElementById('overlay-inicio-fase');
    document.getElementById('ini-fase-badge').textContent  = faseNom[fase] || fase;
    document.getElementById('ini-fase-titulo').textContent = `Ronda ${ronda}`;
    document.getElementById('ini-fase-texto').textContent  =
      (() => {
        const textosFase = {
          anochecer:   'La noche acaba de empezar. Cada minuto cuenta.',
          medianoche:  'La medianoche pesa sobre la mansión. Obrad con cuidado.',
          madrugada:   'El amanecer está cerca, pero el crimen aún sin resolver.'
        };
        return textosFase[fase] || 'Es vuestro momento. Actuad.';
      })();
    overlay.style.display = 'flex';
  },


  // ── Notificación breve de efecto pasivo ────────────────────────────────────
  mostrarNotifPasiva(textoOArr) {
    const el = document.getElementById('notif');
    const tit = document.getElementById('notif-tit');
    const txt = document.getElementById('notif-txt');
    if (!el) return;
    tit.textContent = '';
    // Acepta string o array — si es array muestra cada entrada en línea separada
    const lineas = Array.isArray(textoOArr) ? textoOArr : textoOArr.split(' · ');
    if (lineas.length === 1) {
      txt.textContent = lineas[0];
    } else {
      txt.innerHTML = lineas.map(l => `<div>${l}</div>`).join('');
    }
    el.style.display = 'block';
    el.classList.add('visible');
    // Sin auto-dismiss — el jugador debe cerrarlo manualmente
  },

  // ── Prueba de Pasadizos: pedir resultado al jugador ─────────────────────────
  pedirResultadoPruebaPasadizos(jugIdx, onFin) {
    const cont = document.getElementById('reaccion-cont');
    cont.innerHTML = '';
    const j = estado.jugadores[jugIdx];
    const pjNom = PERSONAJES[j?.personaje]?.nombre || j?.personaje || 'Jugador';

    const tit = document.createElement('p');
    tit.className = 'drw-titulo';
    tit.textContent = 'Los Pasadizos';
    cont.appendChild(tit);

    const quien = document.createElement('div');
    quien.style.cssText = 'font-family:var(--f2);font-size:.8rem;color:var(--oro);letter-spacing:.08em;margin-bottom:.75rem;';
    quien.textContent = `${pjNom} (${j?.nombre || ''})`;
    cont.appendChild(quien);

    const desc = document.createElement('p');
    desc.className = 'interrog-texto';
    desc.innerHTML = 'Los pasadizos son angostos y peligrosos. Solo los más fuertes los atraviesan sin dificultad.';
    cont.appendChild(desc);

    const difPas = document.createElement('div');
    difPas.style.cssText = 'display:flex;align-items:center;gap:.75rem;margin-bottom:1rem;';
    difPas.innerHTML =
      '<span style="font-family:var(--f2);font-size:.8rem;letter-spacing:.12em;text-transform:uppercase;' +
      'color:#a08040;background:rgba(160,128,64,.15);border:1px solid rgba(160,128,64,.35);' +
      'border-radius:5px;padding:4px 11px;">FOR</span>' +
      '<span style="font-family:var(--f1);font-size:1.9rem;font-weight:700;color:#ffd54f;' +
      'text-shadow:0 0 12px #ffd54f44;line-height:1;">Dif. 3</span>';
    cont.appendChild(difPas);

    ['exito', 'fracaso'].forEach(res => {
      const btn = document.createElement('button');
      btn.className = 'btn btn-bloque';
      btn.style.cssText = `margin-bottom:.5rem;min-height:52px;background:${res === 'exito' ? 'rgba(40,80,40,.4)' : 'rgba(80,20,20,.4)'};border-color:${res === 'exito' ? '#81c784' : '#ef9a9a'};color:${res === 'exito' ? '#81c784' : '#ef9a9a'};`;
      btn.textContent = res === 'exito' ? '✓ Éxito' : '✗ Fracaso — FOR −2';
      btn.onclick = () => {
        const logs = typeof aplicarResultadoPruebaPasadizos === 'function'
          ? aplicarResultadoPruebaPasadizos(jugIdx, res === 'exito') : [];
        if (logs.length) this.mostrarNotifPasiva(logs);
        this.cerrarOverlay('reaccion');
        if (typeof onFin === 'function') onFin();
        else { this.renderizarPartida(); Mapa.renderizar(); }
      };
      cont.appendChild(btn);
    });

    this._abrirOverlay('reaccion');
  },


  // Renderiza texto narrativo con diálogos <<...>> en cursiva y resto en normal
  // Devuelve HTML string
  _renderTextoNarrativo(texto) {
    if (!texto) return '';
    // Partir por <<...>> — diálogo entre comillas angulares
    const partes = texto.split(/(<<[^>]*>>)/g);
    return partes.map(p => {
      if (p.startsWith('<<') && p.endsWith('>>')) {
        // Diálogo: cursiva, sin los <<>>
        const dialogo = p.slice(2, -2);
        return `<em>«${dialogo}»</em>`;
      }
      // Narrativa: normal, preservar espacios
      return p.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }).join('');
  },

  _textoVacio(texto) {
    const p = document.createElement('p');
    p.className = 'texto-sutil italica';
    p.style.marginBottom = '0.75rem';
    p.textContent = texto;
    return p;
  }
};

// Cerrar overlays con Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    ['menu','interrogatorio','pistas','alerta','reaccion','resultado'].forEach(id => {
      const el = document.getElementById('overlay-' + id);
      if (el && el.classList.contains('activo')) UI.cerrarOverlay(id);
    });
    this.cerrarOverlay('exploracion');
    const elIni = document.getElementById('overlay-inicio-fase');
    if (elIni) elIni.style.display = 'none';
    const elSuc = document.getElementById('overlay-suceso');
    if (elSuc && elSuc.classList.contains('activo')) elSuc.classList.remove('activo');
  }
});
