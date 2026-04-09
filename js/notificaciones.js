// ── NOTIFICACIONES.JS — sistema central de avisos de cambio de estado ────────
// Reacciones de sospecha del Libro de Casos (embebidas por caso)
const _REACCIONES_SOSPECHA = {"caso_1": {"marsh": {"1": {"subtipo": "continuo", "texto": "Marsh se ajusta las gafas y os mira por encima de la montura. «Soy médico, no sospechoso. Pero si insistís en tratarme como tal, mis respuestas serán acordes.»", "efectos": [{"tipo": "sin_efecto"}]}, "2": {"subtipo": "continuo", "texto": "Marsh cierra su maletín con un chasquido seco. «Disculpad. Necesito revisar unas notas.»", "efectos": [{"tipo": "movimiento_puertas"}]}, "3": {"subtipo": "continuo", "texto": "Marsh se limpia las gafas con lentitud estudiada. Responde, pero sus frases son más cortas, más clínicas. Cada pregunta le cierra un poco más.", "efectos": [{"tipo": "mod_interrogatorio_propio", "modificador": 1, "atributo": null}]}, "4": {"subtipo": "inmediato", "texto": "Marsh recoge su maletín sin mediar palabra. «Tengo que verificar algo.» Se dirige al Sótano con paso firme. Su frialdad resulta perturbadora.", "efectos": [{"tipo": "atributo_jugadores_presentes", "atributo": "TEM", "modificador": -1}, {"tipo": "mover_a_loseta", "destino": "sotano"}]}, "5": {"subtipo": "inmediato", "texto": null, "efectos": [{"tipo": "bloqueo_interrogatorio"}]}}, "harold": {"1": {"subtipo": "continuo", "texto": "Harold da un trago largo y os mira con resentimiento. «Ya empezáis. Igual que mi padre. Siempre culpando al mismo.»", "efectos": [{"tipo": "sin_efecto"}]}, "2": {"subtipo": "continuo", "texto": "Harold se levanta con el vaso en la mano. «Necesito aire. No me sigáis.»", "efectos": [{"tipo": "movimiento_puertas"}]}, "3": {"subtipo": "continuo", "texto": "Harold se sirve otro whisky con manos temblorosas. Está más vulnerable que nunca, pero su amargura es contagiosa. «Todos me señaláis. Como mi padre.»", "efectos": [{"tipo": "mod_interrogatorio_propio", "modificador": -1, "atributo": "TEM"}, {"tipo": "mod_atributo_al_interrogar", "atributo": "TEM", "modificador": -1, "objetivo": "interrogador"}]}, "4": {"subtipo": "inmediato", "texto": "Harold se levanta tambaleándose. «No pienso quedarme aquí a que me acuséis.» Intenta salir de la mansión.", "efectos": [{"tipo": "prueba_para_detener", "atributo": "FOR", "dificultad": 3, "fallo": [{"tipo": "retirar_token", "reaparece_en": "jardin", "reaparece_cuando": "inicio_siguiente_ronda"}]}]}, "5": {"subtipo": "inmediato", "texto": null, "efectos": [{"tipo": "bloqueo_interrogatorio"}]}}, "catherine": {"1": {"subtipo": "continuo", "texto": "Catherine entrecierra los ojos. «Sé lo que estáis haciendo. Elegid mejor vuestras batallas.» Sigue respondiendo, pero su tono se ha enfriado.", "efectos": [{"tipo": "sin_efecto"}]}, "2": {"subtipo": "continuo", "texto": "Catherine recoge sus cosas sin prisa. «No voy a quedarme aquí sentada esperando la siguiente insinuación.»", "efectos": [{"tipo": "movimiento_puertas"}]}, "3": {"subtipo": "continuo", "texto": "Catherine os observa con una calma gélida. Sigue respondiendo, pero pesa cada palabra. «Elegid bien vuestras preguntas. No tengo paciencia infinita.»", "efectos": [{"tipo": "mod_interrogatorio_propio", "modificador": 1, "atributo": null}]}, "4": {"subtipo": ["inmediato", "continuo"], "texto": "Catherine se levanta sin prisa. «He terminado por ahora.» Se dirige a la Biblioteca. No cierra la puerta, pero su actitud deja claro que cada palabra habrá que arrancársela.", "efectos_inmediatos": [{"tipo": "atributo_jugadores_presentes", "atributo": "TEM", "modificador": -1}, {"tipo": "mover_a_loseta", "destino": "biblioteca"}], "efectos_continuos": [{"tipo": "mod_interrogatorio_propio", "modificador": 2, "atributo": null, "reemplaza_nivel": 3}]}, "5": {"subtipo": "inmediato", "texto": null, "efectos": [{"tipo": "bloqueo_interrogatorio"}]}}, "hobbes": {"1": {"subtipo": "continuo", "texto": "Hobbes cuadra los hombros casi imperceptiblemente. Su rostro no cambia, pero sus respuestas se vuelven más medidas, más formales.", "efectos": [{"tipo": "sin_efecto"}]}, "2": {"subtipo": "continuo", "texto": "Hobbes se excusa con una leve inclinación. «Si me disculpan, hay asuntos de la casa que requieren mi atención.»", "efectos": [{"tipo": "movimiento_puertas"}]}, "3": {"subtipo": "continuo", "texto": "Hobbes sigue respondiendo, pero algo ha cambiado. Sus respuestas son más vagas, más cuidadosas. Cuarenta años de lealtad pesan más que cualquier interrogatorio.", "efectos": [{"tipo": "mod_interrogatorio_propio", "modificador": 1, "atributo": null}]}, "4": {"subtipo": "inmediato", "texto": "⚠ Hobbes baja la voz: «Hay algo que no os he dicho. Justo antes de la cena, uno de vosotros me pidió que le acompañara a revisar la plata del comedor de abajo. Estuve fuera quince minutos. Cuando volví, el Lord ya estaba solo con su copa. Alguien me apartó a propósito.»", "efectos": [{"tipo": "activar_implicado"}]}, "5": {"subtipo": "inmediato", "texto": null, "efectos": [{"tipo": "bloqueo_interrogatorio"}]}}, "pemberton": {"1": {"subtipo": "continuo", "texto": "Pemberton baja la mirada y se retuerce el delantal. «Solo soy la cocinera. No sé por qué me hacéis tantas preguntas.»", "efectos": [{"tipo": "sin_efecto"}]}, "2": {"subtipo": "continuo", "texto": "Pemberton se levanta con los ojos húmedos. «Tengo que... tengo cosas que hacer. Dejadme un momento.»", "efectos": [{"tipo": "movimiento_puertas"}]}, "3": {"subtipo": "continuo", "texto": "Pemberton se derrumba. Entre sollozos, parece dispuesta a hablar de lo que sea. «Preguntad, preguntad. Ya da todo igual.»", "efectos": [{"tipo": "mod_interrogatorio_propio", "modificador": -1, "atributo": "TEM"}]}, "4": {"subtipo": ["inmediato", "continuo"], "texto": "Pemberton sufre un ataque de nervios. Cuando se calma, ya no le quedan fuerzas para resistirse. Cooperará con todo lo que le pidáis.", "efectos_inmediatos": [{"tipo": "atributo_jugadores_presentes", "atributo": "TEM", "modificador": -1}], "efectos_continuos": [{"tipo": "mod_interrogatorio_propio", "modificador": -2, "atributo": null, "reemplaza_nivel": 3}]}, "5": {"subtipo": "inmediato", "texto": null, "efectos": [{"tipo": "bloqueo_interrogatorio"}]}}, "whitfield": {"1": {"subtipo": "continuo", "texto": "Whitfield acaricia la cruz que lleva al cuello y cierra brevemente los ojos. «Proseguid. Pero recordad que hay cosas que un párroco no puede revelar.»", "efectos": [{"tipo": "sin_efecto"}]}, "2": {"subtipo": "continuo", "texto": "Whitfield se pone en pie despacio. «Necesito un momento de oración. Perdonad.»", "efectos": [{"tipo": "movimiento_puertas"}]}, "3": {"subtipo": "continuo", "texto": "Whitfield cierra los ojos. «No puedo romper el secreto de confesión. Pero puedo deciros esto: alguien en esta casa cargaba un peso terrible antes de esta noche. No el peso de un crimen. El de una decisión.»", "efectos": [{"tipo": "mod_interrogatorio_contexto", "modificador": -1, "loseta": "capilla"}]}}}};

function getReaccionSospecha(caso_id, pnjId, nivel) {
  const caso = _REACCIONES_SOSPECHA[caso_id];
  if (!caso) return null;
  const pnj  = caso[pnjId];
  if (!pnj)  return null;
  return pnj[String(nivel)] || null;
}
// Todas las modificaciones de Alerta, Sospecha y atributos de PJ pasan por aquí.
// La función muestra un overlay informativo visible para todos los jugadores.

// Cola de mensajes pendientes (para encadenar varios efectos seguidos)
var _notifCola = [];
var _notifMostrando = false;

// ── Construir nombre de PJ con jugador entre paréntesis ─────────────────────
function _nomPJ(jugIdx) {
  if (jugIdx == null || jugIdx < 0) return '';
  const j  = estado.jugadores[jugIdx];
  if (!j) return '';
  const pj = PERSONAJES[j.personaje];
  const nomPJ  = pj?.nombre || j.personaje;
  return `${nomPJ} (${j.nombre})`;
}

// ── Nombre legible de PNJ ────────────────────────────────────────────────────
function _nomPNJ(pnjId) {
  const def = datosCaso?.comun?.pnj?.find(p => p.id === pnjId);
  return def?.nombre || pnjId;
}

// ── Función principal: registrar un cambio de estado ────────────────────────
// tipo: 'alerta' | 'sospecha' | 'atributo'
// opts:
//   alerta:   { anterior, nuevo, motivo }
//   sospecha: { pnjId, anterior, nuevo, motivo }
//   atributo: { jugIdx, attr, anterior, nuevo, motivo }
function registrarCambio(tipo, opts) {
  let lineas = [];
  let icono  = '';
  let _reaccionTexto = null;

  if (tipo === 'alerta') {
    const delta = opts.nuevo - opts.anterior;
    icono = delta > 0 ? '🔔' : '🔕';
    if (delta > 0) {
      const textos = [
        'La tensión en Blackmoor Hall se intensifica.',
        'Los nervios están a flor de piel.',
        'Algo en el ambiente delata vuestra presencia.',
        'Las sospechas crecen entre los habitantes de la mansión.',
        'Un error imperdonable. La guardia se eleva.',
      ];
      lineas.push(textos[Math.min(opts.nuevo - 1, textos.length - 1)] || 'La situación se complica.');
    } else {
      lineas.push('La tensión afloja ligeramente. Quizás nadie notó nada.');
    }
    lineas.push(`Alerta ${delta > 0 ? '↑' : '↓'} ${opts.nuevo}`);

  } else if (tipo === 'sospecha') {
    const delta = opts.nuevo - opts.anterior;
    const nomPNJ = _nomPNJ(opts.pnjId);
    icono = delta > 0 ? '👁' : '👁‍🗨';
    if (delta > 0) {
      const frasesSubida = [
        `${nomPNJ} comienza a observaros con mayor atención.`,
        `${nomPNJ} entrecierra los ojos. Algo no le cuadra.`,
        `${nomPNJ} os mira fijamente. La desconfianza ya es evidente.`,
        `${nomPNJ} está claramente alerta. Cada movimiento vuestro es vigilado.`,
        `${nomPNJ} ha llegado al límite. La situación es crítica.`,
      ];
      lineas.push(frasesSubida[Math.min(opts.nuevo - 1, frasesSubida.length - 1)]);
    } else {
      lineas.push(`${nomPNJ} parece menos receloso. La situación mejora.`);
    }
    lineas.push(`Sospecha ${nomPNJ} ${delta > 0 ? '↑' : '↓'} ${opts.nuevo}`);
    // Reacción del Libro de Casos
    if (delta > 0 && opts.nuevo > opts.anterior) {
      const caso_id = (typeof estado !== 'undefined' && estado?.caso_id) || 'caso_1';
      const reac = getReaccionSospecha(caso_id, opts.pnjId, opts.nuevo);
      if (reac?.texto) {
        _reaccionTexto = reac.texto;
      }
    }

  } else if (tipo === 'atributo') {
    const delta = opts.nuevo - opts.anterior;
    const nomPJ = _nomPJ(opts.jugIdx);
    const attr   = opts.attr;

    // Caso especial: FOR o TEM llega a 0 → desmayo / crisis nerviosa
    if (opts.nuevo === 0 && (attr === 'FOR' || attr === 'TEM')) {
      const esDesmayo = attr === 'FOR';
      icono = esDesmayo ? '😵' : '🌀';
      lineas.push(esDesmayo
        ? `${nomPJ} cae al suelo sin fuerzas.`
        : `Los nervios de ${nomPJ} se quiebran por completo.`);
      lineas.push(esDesmayo
        ? 'Pierde la próxima ronda. Se recupera al inicio de la siguiente.'
        : 'Pierde la próxima ronda. Se recupera al inicio de la siguiente.');
    } else if (opts.anterior === 0 && opts.nuevo === 1 && (attr === 'FOR' || attr === 'TEM')) {
      icono = '🌅';
      lineas.push(attr === 'FOR'
        ? `${nomPJ} recobra fuerzas y puede actuar de nuevo.`
        : `${nomPJ} recobra la compostura y puede actuar de nuevo.`);
    } else if (attr === 'FOR') {
      icono = delta > 0 ? '💪' : '🩸';
      lineas.push(delta > 0
        ? `${nomPJ} recupera fuerzas.`
        : `${nomPJ} acusa el agotamiento físico.`);
      lineas.push(`FOR ${delta > 0 ? '↑' : '↓'} ${opts.nuevo}`);
    } else if (attr === 'INT') {
      icono = delta > 0 ? '🔍' : '🌫';
      lineas.push(delta > 0
        ? `La mente de ${nomPJ} se afila.`
        : `${nomPJ} no consigue concentrarse.`);
      lineas.push(`INT ${delta > 0 ? '↑' : '↓'} ${opts.nuevo}`);
    } else if (attr === 'TEM') {
      icono = delta > 0 ? '🕯' : '😨';
      lineas.push(delta > 0
        ? `${nomPJ} recupera la calma.`
        : `${nomPJ} siente cómo los nervios le consumen.`);
      lineas.push(`TEM ${delta > 0 ? '↑' : '↓'} ${opts.nuevo}`);
    } else {
      icono = delta > 0 ? '💪' : '💔';
      lineas.push(`${nomPJ}: ${attr} ${delta > 0 ? '↑' : '↓'} ${opts.nuevo}`);
    }

  } else if (tipo === 'lote') {
    icono = opts.icono || '⚡';
    lineas = opts.lineas || [];
  }

  _notifCola.push({ icono, lineas, tipo, reaccionTexto: _reaccionTexto });
  _procesarCola();
}

// ── Procesar cola de notificaciones ─────────────────────────────────────────
function _procesarCola() {
  if (_notifMostrando || _notifCola.length === 0) return;

  // Agrupar todos los pendientes en una sola notificación
  const todos = _notifCola.splice(0);
  _notifMostrando = true;

  const overlay = document.getElementById('overlay-notif-estado');
  const cont    = document.getElementById('notif-estado-cont');
  if (!overlay || !cont) { _notifMostrando = false; return; }

  cont.innerHTML = '';

  todos.forEach((n, i) => {
    if (i > 0) {
      const sep = document.createElement('hr');
      sep.style.cssText = 'border:none;border-top:1px solid #3a2e20;margin:.5rem 0;';
      cont.appendChild(sep);
    }
    const bloque = document.createElement('div');
    bloque.style.cssText = 'display:flex;gap:.6rem;align-items:flex-start;';

    const ico = document.createElement('span');
    ico.style.cssText = 'font-size:1.4rem;flex-shrink:0;line-height:1.3;';
    ico.textContent = n.icono;

    const textos = document.createElement('div');
    textos.style.cssText = 'display:flex;flex-direction:column;gap:.15rem;';
    n.lineas.forEach((l, li) => {
      const p = document.createElement('p');
      p.style.cssText = li === 0
        ? 'font-family:Cinzel,serif;font-size:clamp(1rem,3.5vw,1.15rem);color:#f0e8d8;font-weight:600;margin:0;'
        : 'font-family:"EB Garamond",serif;font-size:clamp(.9rem,3vw,1rem);color:#c8b898;margin:0;font-style:italic;';
      p.textContent = l;
      textos.appendChild(p);
    });

    bloque.appendChild(ico);
    bloque.appendChild(textos);
    cont.appendChild(bloque);

    // Bloque especial de reacción del Libro de Casos
    if (n.reaccionTexto) {
      const sepReac = document.createElement('div');
      sepReac.style.cssText = 'margin:.6rem 0 .4rem;border-top:1px solid #5a4030;padding-top:.5rem;';
      const titReac = document.createElement('p');
      titReac.style.cssText = 'font-family:var(--f2);font-size:.7rem;letter-spacing:.12em;color:#a08060;margin:0 0 .4rem;text-transform:uppercase;';
      titReac.style.display = 'none';
      sepReac.appendChild(titReac);
      const txtReac = document.createElement('p');
      txtReac.style.cssText = 'font-family:"EB Garamond",serif;font-size:clamp(1rem,3.5vw,1.1rem);color:#e8dcc8;margin:0;line-height:1.65;font-style:normal;';
      txtReac.textContent = n.reaccionTexto;
      sepReac.appendChild(txtReac);
      cont.appendChild(sepReac);
    }
  });

  overlay.style.display = 'flex';

  // Sin auto-dismiss — el jugador debe pulsar "Entendido"
  clearTimeout(window._notifTimeout);
}

// Llamado desde el botón "Entendido" del overlay
function cerrarNotifEstado() {
  const overlay = document.getElementById('overlay-notif-estado');
  if (overlay) overlay.style.display = 'none';
  _notifMostrando = false;
  // Si hay más en cola, mostrarlos
  if (_notifCola.length > 0) {
    setTimeout(_procesarCola, 150);
  }
}

// ── Wrappers convenientes ────────────────────────────────────────────────────

function notifAlerta(anterior, nuevo, motivo) {
  if (anterior === nuevo) return;
  registrarCambio('alerta', { anterior, nuevo, motivo });
}

function notifSospecha(pnjId, anterior, nuevo, motivo) {
  if (anterior === nuevo) return;
  registrarCambio('sospecha', { pnjId, anterior, nuevo, motivo });
}

function notifAtributo(jugIdx, attr, anterior, nuevo, motivo) {
  if (anterior === nuevo) return;
  registrarCambio('atributo', { jugIdx, attr, anterior, nuevo, motivo });
}

// Lote: varios cambios juntos con un solo "Entendido"
// items: [{ icono, lineas }]
function notifLote(items) {
  if (!items?.length) return;
  items.forEach(it => _notifCola.push(it));
  _procesarCola();
}
