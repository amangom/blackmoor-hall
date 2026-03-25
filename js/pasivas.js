// ── PASIVAS.JS — efectos pasivos de losetas ───────────────────────────────────
// Fuente de verdad: blackmoor_losetas.json
// Se llama desde mapa.js y ui.js en los momentos exactos indicados por el manual.

// Cache de losetas con efectos
var _losetasData = null;

function _getLosetas() {
  // Los datos ya están en LOSETAS_DATA (blackmoor_losetas.json cargado como global)
  // Fallback: usar getLoseta() que ya existe en state.js
  return _losetasData;
}

function _getEfectos(losetaId) {
  const l = getLoseta(losetaId);
  return l?.efectos || [];
}

function _clampAtrib(j, attr) {
  const max = PERSONAJES[j.personaje]?.atributos?.[attr] ?? 99;
  j.atributos[attr] = Math.max(0, Math.min(max, j.atributos[attr]));
}

function _log(msg) {
  return msg; // devuelve el mensaje para mostrarlo en notificación
}

// ── 1. AL ENTRAR A UNA LOSETA ────────────────────────────────────────────────
// Llamar desde _ejecutarMovimiento en mapa.js DESPUÉS de moverJugador
function aplicarPasivaEntrada(jugIdx, losetaId) {
  const j      = estado.jugadores[jugIdx];
  const ef     = _getEfectos(losetaId);
  const logs   = [];

  for (const e of ef) {
    // al_entrar: penalización directa (Jardín −1 FOR, Sótano −1 FOR)
    if (e.tipo === 'al_entrar') {
      const nomLos = getLoseta(losetaId)?.nombre || losetaId;
      if (typeof modificarAtributoJugador === 'function') {
        modificarAtributoJugador(jugIdx, e.atributo, e.modificador, `Al entrar en ${nomLos}`);
      } else {
        j.atributos[e.atributo] += e.modificador; _clampAtrib(j, e.atributo);
      }
    }

    // primera_visita: solo la primera vez (Galería de Retratos)
    if (e.tipo === 'primera_visita') {
      const key = `primera_visita_${losetaId}_${jugIdx}`;
      if (!estado.flags) estado.flags = {};
      if (!estado.flags[key]) {
        estado.flags[key] = true;
        const nomLos2 = getLoseta(losetaId)?.nombre || losetaId;
        if (typeof modificarAtributoJugador === 'function') {
          modificarAtributoJugador(jugIdx, e.atributo, e.modificador, `Primera visita — ${nomLos2}`);
        } else {
          j.atributos[e.atributo] += e.modificador; _clampAtrib(j, e.atributo);
        }
      }
    }

    // al_entrar_prueba: prueba de FOR al entrar (Pasadizos)
    // La prueba la resuelve el jugador físicamente con cartas; la app solo pregunta el resultado
    if (e.tipo === 'al_entrar_prueba') {
      const exento = (e.exento || []).includes(j.personaje);
      if (!exento) {
        // Devolver indicación para que la UI pida el resultado
        return { requierePrueba: true, prueba: e, jugIdx, losetaId, logsAnteriores: logs };
      }
    }
  }

  guardarEstado();
  return { requierePrueba: false, logs };
}

// Aplica el resultado de la prueba de entrada (Pasadizos)
function aplicarResultadoPruebaPasadizos(jugIdx, exito) {
  const j = estado.jugadores[jugIdx];
  if (!exito) {
    const ef = _getEfectos('pasadizos').find(e => e.tipo === 'al_entrar_prueba');
    if (ef?.fallo) {
      j.atributos[ef.fallo.atributo] += ef.fallo.modificador;
      _clampAtrib(j, ef.fallo.atributo);
    }
    guardarEstado();
    return [`Los pasadizos cobran su precio.`];
  }
  return [];
}

// ── 2. AL EXPLORAR — modificador de dificultad ───────────────────────────────
// Llamar ANTES de mostrar la carta de exploración
// Devuelve { modDificultad, alertaExtra, temPenalizacion }
function getPasivaExploracion(jugIdx, losetaId, atributoCarta) {
  const j         = estado.jugadores[jugIdx];
  const ef        = _getEfectos(losetaId);
  const pnjPresente = datosCaso?.comun?.pnj?.some(p =>
    estado.pnj?.[p.id]?.loseta_actual === losetaId && !estado.pnj?.[p.id]?.retirado
  ) ?? false;

  let modDif      = 0;
  let alertaExtra = 0;
  let temPen      = 0;
  let anulaAlerta = false;
  const notas     = [];

  for (const e of ef) {
    if (e.tipo === 'mod_prueba') {
      // Solo aplica si el atributo del efecto coincide con el atributo de la prueba
      if (atributoCarta && e.atributo && e.atributo !== atributoCarta) continue;
      modDif += e.modificador;
      notas.push(`Pasiva loseta: ${e.atributo} ${e.modificador > 0 ? '+' : ''}${e.modificador} dif`);
    }
    if (e.tipo === 'al_explorar' && !e.anula_alerta_base) {
      alertaExtra += (e.alerta ?? 0);
    }
    if (e.tipo === 'al_explorar' && e.anula_alerta_base) {
      anulaAlerta = true;
    }
    if (e.tipo === 'al_explorar_con_pnj' && pnjPresente) {
      if (e.atributo === 'TEM') temPen += e.modificador;
      if (e.alerta)             alertaExtra += e.alerta;
      notas.push(`PNJ presente: TEM ${e.modificador > 0 ? '+' : ''}${e.modificador ?? 0}`);
    }
    // Despacho: primera vez −1 INT (solo primera exploración en la loseta)
    if (e.tipo === 'al_explorar_primera_vez') {
      const key = `explorada_primera_${losetaId}`;
      if (!estado.flags) estado.flags = {};
      if (!estado.flags[key]) {
        modDif += e.modificador;
        notas.push(`Primera exploración: ${e.atributo} ${e.modificador > 0 ? '+' : ''}${e.modificador} dif`);
      }
    }
  }

  // Habilidad pasiva de Institutriz: −1 dif en todas las exploraciones
  if (j.personaje === 'institutriz') {
    modDif -= 1;
    notas.push('Institutriz: −1 dif');
  }

  return { modDif, alertaExtra, temPen, anulaAlerta, notas };
}

// Aplica los efectos POST-exploración (Alerta y TEM)
// Llamar después de que el jugador haya elegido éxito/fracaso/etc.
function aplicarPasivaPostExploracion(jugIdx, losetaId) {
  const j    = estado.jugadores[jugIdx];
  const pas  = getPasivaExploracion(jugIdx, losetaId);
  const logs = [];

  // Marcar primera exploración
  const key = `explorada_primera_${losetaId}`;
  if (!estado.flags) estado.flags = {};
  estado.flags[key] = true;

  const nomLosP = getLoseta(losetaId)?.nombre || losetaId;
  if (pas.alertaExtra > 0 && typeof subirAlerta === 'function') {
    subirAlerta(pas.alertaExtra, `La zona de ${nomLosP} es peligrosa`);
  }
  if (pas.temPen < 0 && typeof modificarAtributoJugador === 'function') {
    modificarAtributoJugador(jugIdx, 'TEM', pas.temPen, `La presencia en ${nomLosP} pesa sobre los nervios`);
  }

  guardarEstado();
  return logs;
}

// ── 3. AL INTERROGAR — Salón de Música ──────────────────────────────────────
// Devuelve true si la loseta añade +1 Sospecha al PNJ independientemente del resultado
function tieneEcoInterrogatorio(losetaId) {
  return _getEfectos(losetaId).some(e => e.tipo === 'al_interrogar');
}

// ── 4. AL DESCANSAR — bonificaciones ────────────────────────────────────────
// Devuelve { atributo, modificador } o null
function getPasivaDescanso(losetaId) {
  const ef = _getEfectos(losetaId).find(e => e.tipo === 'al_descansar');
  return ef ? { atributo: ef.atributo, modificador: ef.modificador } : null;
}

function aplicarPasivaDescanso(jugIdx, losetaId) {
  const bon = getPasivaDescanso(losetaId);
  if (!bon) return [];
  const j = estado.jugadores[jugIdx];
  const nomLosD = getLoseta(losetaId)?.nombre || losetaId;
  if (typeof modificarAtributoJugador === 'function') {
    modificarAtributoJugador(jugIdx, bon.atributo, bon.modificador, `Descansar en ${nomLosD}`);
  } else {
    j.atributos[bon.atributo] = Math.max(0, Math.min(
      PERSONAJES[j.personaje]?.atributos?.[bon.atributo] ?? 99,
      j.atributos[bon.atributo] + bon.modificador
    ));
    guardarEstado();
  }
  return [];
}

// ── 5. HELPERS para la UI ────────────────────────────────────────────────────
// Descripción corta de los efectos de una loseta (para mostrar en exploración)
function getDescPasivaExploracion(jugIdx, losetaId) {
  const p = getPasivaExploracion(jugIdx, losetaId);
  const partes = [];
  if (p.notas.length) partes.push(...p.notas);
  if (p.anulaAlerta)  partes.push('Alerta no sube al explorar');
  return partes;
}
