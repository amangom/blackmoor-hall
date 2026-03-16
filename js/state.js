// ─── STATE.JS — Estado global de la partida ──────────────────────────────

const CLAVE_GUARDADO = 'blackmoor_partida';

// Mapeo nombre de distribución -> id interno de loseta
const NOMBRE_A_ID = {
  'Salón Principal':   'salon_principal',
  'Vestíbulo':         'vestibulo',
  'Biblioteca':        'biblioteca',
  'Despacho':          'despacho',
  'Cocina':            'cocina',
  'Hab. de Invitados': 'hab_invitados',
  'Hab. Invitados':    'hab_invitados',
  'Hab. del Servicio': 'hab_servicio',
  'Hab. Servicio':     'hab_servicio',
  'Galería de Retratos': 'galeria_retratos',
  'Galería Retratos':  'galeria_retratos',
  'Salón de Música':   'salon_musica',
  'Capilla':           'capilla',
  'Jardín':            'jardin',
  'Cobertizo':         'cobertizo',
  'Sótano':            'sotano',
  'Pasadizos':         'pasadizos',
  'Sala de Relojería': 'sala_relojeria',
  'Escenario':         'escenario',
  'Bambalinas':        'bambalinas',
  'Camerinos':         'camerinos',
  'Sala de Utilería':  'sala_utileria',
};

// Mapeo id -> imagen de loseta
const LOSETA_IMAGEN = {
  salon_principal:  'assets/losetas/Salon_principal_P.png',
  vestibulo:        'assets/losetas/Vestibulo_P.png',
  biblioteca:       'assets/losetas/Biblioteca_P.png',
  despacho:         'assets/losetas/Despacho_P.png',
  cocina:           'assets/losetas/Cocina_P.png',
  hab_invitados:    'assets/losetas/Habitacion_de_Invitados_P.png',
  hab_servicio:     'assets/losetas/Habitacion_del_servicio_P.png',
  galeria_retratos: 'assets/losetas/Galeria_de_retratos_P.png',
  salon_musica:     'assets/losetas/Salon_de_musica_P.png',
  capilla:          'assets/losetas/Capilla_P.png',
  jardin:           'assets/losetas/JardinP.png',
  cobertizo:        'assets/losetas/Cobertizo_P.png',
  sotano:           'assets/losetas/Sotano_P.png',
  pasadizos:        'assets/losetas/Pasadizos_P.png',
  sala_relojeria:   'assets/losetas/Sala_de_Relojeria_P.png',
  escenario:        'assets/losetas/Escenario_P.png',
  bambalinas:       'assets/losetas/Bambalinas_P.png',
  camerinos:        'assets/losetas/Camerinos_P.png',
  sala_utileria:    'assets/losetas/Sala_de_Utileria_P.png',
};

let estado = null;
let datosCaso     = null;
let datosVariante = null;
let datosLosetas  = null;
let datosDistribuciones = null;

// ─── PERSISTENCIA ─────────────────────────────────────────────────────────────

function guardarEstado() {
  try { localStorage.setItem(CLAVE_GUARDADO, JSON.stringify(estado)); } catch(e) {}
}
function cargarEstadoGuardado() {
  try {
    const r = localStorage.getItem(CLAVE_GUARDADO);
    if (!r) return null;
    const est = JSON.parse(r);
    // Migración defensiva: reparar atributos faltantes
    if (est?.jugadores && typeof PERSONAJES !== 'undefined') {
      est.jugadores.forEach(j => {
        if (!j.atributos || Object.keys(j.atributos).length === 0) {
          const base = PERSONAJES[j.personaje]?.atributos;
          if (base) j.atributos = { ...base };
        }
      });
    }
    return est;
  } catch(e) { return null; }
}
function hayPartidaGuardada() { return !!localStorage.getItem(CLAVE_GUARDADO); }
function borrarPartidaGuardada() { localStorage.removeItem(CLAVE_GUARDADO); }

// ─── CARGA DE DATOS ────────────────────────────────────────────────────────────

async function cargarDatosBase() {
  const [losetas, distribuciones] = await Promise.all([
    fetch('data/blackmoor_losetas.json').then(r => r.json()),
    fetch('data/blackmoor_distribuciones.json').then(r => r.json())
  ]);
  datosLosetas = losetas;
  datosDistribuciones = distribuciones;
}

async function cargarDatosCaso(caso_id) {
  datosCaso = await fetch(`data/${caso_id}.json`).then(r => r.json());
}

async function cargarVariante(caso_id, variante) {
  datosVariante = await fetch(`data/${caso_id}_variante_${variante}.json`).then(r => r.json());
}

// ─── HELPERS DE DATOS ─────────────────────────────────────────────────────────

function getPNJ(id) {
  return datosCaso?.comun?.pnj?.find(p => p.id === id);
}
function getEstadoPNJ(id) { return estado?.pnj?.[id]; }

// ─── HELPERS DE CERRADURA ─────────────────────────────────────────────────────
// Compatibilidad con formato antiguo (array de strings) y nuevo (array de objetos)
function _getCerradurasDef() {
  return (datosCaso?.losetas_cerradas_inicial || []).map(c =>
    typeof c === 'string' ? { id: c, dificultad_for: 5 } : c
  );
}
function isCerradaInicial(id) {
  return _getCerradurasDef().some(c => c.id === id);
}
function isCerrada(id) {
  return isCerradaInicial(id) && !(estado?.cerraduras_abiertas || []).includes(id);
}
function getDifCerradura(id) {
  const def = _getCerradurasDef().find(c => c.id === id);
  return def?.dificultad_for ?? 5;
}

function getLoseta(id) {
  return datosLosetas?.losetas?.find(l => l.id === id);
}

// Devuelve el array normalizado de losetas de la distribución activa
// con { id, nombre, col, fila } — convirtiendo nombres->ids
function getLosetasDistribucion() {
  if (!datosDistribuciones || !estado?.distribucion_id) return [];
  const casoNum = estado.caso_id.replace('caso_', '');
  const lista   = datosDistribuciones.casos?.[casoNum] || [];
  const distrib = lista.find(d => d.id === estado.distribucion_id);
  if (!distrib) return [];
  return Object.entries(distrib.losetas).map(([nombre, pos]) => ({
    nombre,
    id:   NOMBRE_A_ID[nombre] || nombre.toLowerCase().replace(/\s+/g,'_'),
    col:  pos.col,
    fila: pos.fila,
  }));
}

// Devuelve conexiones normalizadas [{desde, hasta}] con ids
function getConexionesDistribucion() {
  if (!datosDistribuciones || !estado?.distribucion_id) return [];
  const casoNum = estado.caso_id.replace('caso_', '');
  const lista   = datosDistribuciones.casos?.[casoNum] || [];
  const distrib = lista.find(d => d.id === estado.distribucion_id);
  if (!distrib) return [];
  return (distrib.conexiones || []).map(([a, b]) => ({
    desde: NOMBRE_A_ID[a] || a,
    hasta: NOMBRE_A_ID[b] || b,
  }));
}

// Devuelve lista de distribuciones del caso activo (o del caso_id dado)
function getDistribucionesCaso(caso_id) {
  if (!datosDistribuciones) return [];
  const casoNum = (caso_id || estado?.caso_id || 'caso_1').replace('caso_', '');
  return datosDistribuciones.casos?.[casoNum] || [];
}

function getFase() {
  if (!estado) return 'anochecer';
  if (estado.ronda <= 4)  return 'anochecer';
  if (estado.ronda <= 8)  return 'medianoche';
  return 'madrugada';
}

function getEfectoAlerta() {
  const a = estado?.alerta || 0;
  if (a <= 2) return { nombre: 'Calma',        color: 'verde',    descripcion: 'Sin efectos adicionales.' };
  if (a <= 4) return { nombre: 'Desconfianza', color: 'amarillo', descripcion: '+1 a la dificultad de todos los interrogatorios.' };
  if (a <= 6) return { nombre: 'Nerviosismo',  color: 'naranja',  descripcion: 'Al fin de cada ronda: 1 PNJ se mueve.' };
  if (a <= 8) return { nombre: 'Pánico',       color: 'rojo',     descripcion: 'Al fin de cada ronda: 1 PNJ se mueve dos veces.' };
  if (a === 9) return { nombre: 'Crisis',      color: 'rojo-oscuro', descripcion: 'Sin interrogatorios con pista. El PNJ con mayor Sospecha destruye 1 carta de Exploración.' };
  return { nombre: 'Desastre', color: 'negro', descripcion: 'Fracaso automático. El crimen queda sin resolver.' };
}

// ─── INICIALIZACIÓN ────────────────────────────────────────────────────────────

function iniciarPartida(config) {
  estado = {
    caso_id:         config.caso_id,
    variante:        config.variante,
    distribucion_id: config.distribucion_id,
    jugadores: config.jugadores.map(j => ({
      personaje:      j.personaje,
      loseta_actual:  datosCaso.punto_inicio,
      atributos:      { ...PERSONAJES[j.personaje].atributos },
      // Tracking de acciones por ronda
      turno: {
        mov_libre_usado: false,   // movimiento gratuito (hasta 2 pasos) ya gastado
        accion_usada:    false,   // la 1 acción del turno ya gastada
        turno_terminado: false,  // jugador ha terminado voluntariamente su turno
        // historial de lo que se ha hecho (para bloquear repeticiones)
        interrogados_sin_pista: [],  // PNJ IDs interrogados sin pista esta ronda
        // acción específica usada (para mostrarlo en la UI)
        accion_tipo: null,
      }
    })),
    ronda:  1,
    fase:   'anochecer',
    alerta: 0,
    pnj:    {},
    pistas_descubiertas:  [],
    pistas_interpretadas: [],
    sucesos_jugados:      [],
    cerraduras_abiertas:  [],
    implicado_revelado:   false,
    declaraciones_leidas: [],
    deducciones_resueltas: [],
    acusacion_desbloqueada: false,
    partida_terminada: false,
    visiones_activadas: 0,
    flags: {},
  };

  datosCaso.comun.pnj.forEach(pnj => {
    estado.pnj[pnj.id] = {
      sospecha:              0,
      loseta_actual:         pnj.posicion_inicial,
      retirado:              false,
      reacciones_activadas:  [],
      interrogatorios_usados:[],
      bloqueado:             false,
    };
  });

  guardarEstado();
}

// ─── MUTACIONES ────────────────────────────────────────────────────────────────

function subirAlerta(valor = 1, motivo) {
  const anterior = estado.alerta;
  estado.alerta = Math.min(10, estado.alerta + valor);
  if (estado.alerta >= 10) {
    estado.partida_terminada = true;
    estado._alerta10 = true;
    estado._pts_resolucion = 0;
  }
  guardarEstado();
  if (typeof notifAlerta === 'function') notifAlerta(anterior, estado.alerta, motivo);
  return estado.alerta;
}

function bajarAlerta(valor = 1, motivo) {
  const anterior = estado.alerta;
  estado.alerta = Math.max(0, estado.alerta - valor);
  guardarEstado();
  if (typeof notifAlerta === 'function') notifAlerta(anterior, estado.alerta, motivo);
  return estado.alerta;
}

function subirSospecha(pnj_id, valor = 1) {
  valor = Math.min(1, Math.max(0, valor)); // máximo +1 por llamada
  const pnjDef = getPNJ(pnj_id);
  if (!pnjDef) return null;
  const estPNJ = estado.pnj[pnj_id];
  if (!estPNJ || estPNJ.bloqueado) return null;

  const max      = pnjDef.sospecha_max || 5;
  const anterior = estPNJ.sospecha;
  estPNJ.sospecha = Math.min(max, estPNJ.sospecha + valor);
  const nuevo = estPNJ.sospecha;

  if (anterior < 4 && nuevo >= 4) subirAlerta(1);
  if (anterior < 5 && nuevo >= 5) subirAlerta(1);

  const reaccionesNuevas = [];
  for (let nivel = anterior + 1; nivel <= nuevo; nivel++) {
    const reaccionDef = pnjDef.reacciones?.[nivel.toString()];
    if (reaccionDef && !estPNJ.reacciones_activadas.includes(nivel)) {
      estPNJ.reacciones_activadas.push(nivel);
      reaccionesNuevas.push({ nivel, reaccion: reaccionDef });
    }
  }

  guardarEstado();
  if (typeof notifSospecha === 'function') notifSospecha(pnj_id, anterior, nuevo);
  return { anterior, nuevo, reaccionesNuevas };
}

function bajarSospecha(pnj_id, valor = 1, motivo) {
  const estPNJ = estado.pnj[pnj_id];
  if (!estPNJ) return;
  const anterior = estPNJ.sospecha;
  estPNJ.sospecha = Math.max(0, estPNJ.sospecha - valor);
  guardarEstado();
  if (typeof notifSospecha === 'function') notifSospecha(pnj_id, anterior, estPNJ.sospecha, motivo);
}

function descubrirPista(pista_id) {
  if (!estado.pistas_descubiertas.includes(pista_id)) {
    estado.pistas_descubiertas.push(pista_id);
    guardarEstado();
  }
}

function interpretarPista(pista_id) {
  if (!estado.pistas_interpretadas.includes(pista_id)) {
    estado.pistas_interpretadas.push(pista_id);
    if (!estado.pistas_descubiertas.includes(pista_id))
      estado.pistas_descubiertas.push(pista_id);
    guardarEstado();
    _verificarDesbloqueoAcusacion();
  }
}

function _verificarDesbloqueoAcusacion() {
  const tieneRoja = estado.deducciones_resueltas.some(d => d.color === 'roja');
  const tieneAzul = estado.deducciones_resueltas.some(d => d.color === 'azul');
  if (tieneRoja && tieneAzul) {
    estado.acusacion_desbloqueada = true;
    guardarEstado();
  }
}

function moverJugador(idx, loseta_id) {
  estado.jugadores[idx].loseta_actual = loseta_id;
  guardarEstado();
}

function moverPNJ(pnj_id, loseta_id) {
  estado.pnj[pnj_id].loseta_actual = loseta_id;
  guardarEstado();
}

function avanzarRonda() {
  if (estado.ronda >= 12) return false;
  estado.ronda++;
  estado.fase = getFase();
  resetearTurnos();
  // Limpiar bloqueos temporales que expiran al inicio de esta ronda
  if (estado.losetas_bloqueadas) {
    estado.losetas_bloqueadas = estado.losetas_bloqueadas.filter(b => b.expira_ronda > estado.ronda);
  }
  guardarEstado();
  return true;
}

// Bloquea una loseta hasta el final de la ronda indicada
function bloquearLoseta(losetaId, expira_ronda, motivo) {
  if (!estado.losetas_bloqueadas) estado.losetas_bloqueadas = [];
  // Evitar duplicados
  if (!estado.losetas_bloqueadas.some(b => b.id === losetaId)) {
    estado.losetas_bloqueadas.push({ id: losetaId, expira_ronda, motivo: motivo || '' });
  }
  guardarEstado();
}

function isLosetaBloqueada(losetaId) {
  if (!estado.losetas_bloqueadas?.length) return false;
  return estado.losetas_bloqueadas.some(b => b.id === losetaId && b.expira_ronda >= estado.ronda);
}

function modificarAtributoJugador(jugIdx, atributo, modificador, motivo) {
  const j = estado.jugadores[jugIdx];
  if (!j) return;
  const max      = PERSONAJES[j.personaje]?.atributos?.[atributo] ?? 99;
  const anterior = j.atributos[atributo] ?? 0;
  j.atributos[atributo] = Math.max(0, Math.min(max, anterior + modificador));
  const nuevo = j.atributos[atributo];

  // Detectar FOR=0 (desmayo) o TEM=0 (crisis nerviosa)
  if (nuevo === 0 && anterior > 0 && (atributo === 'FOR' || atributo === 'TEM') && !j.incapacitado) {
    const tipo = atributo === 'FOR' ? 'desmayo' : 'crisis';
    j.incapacitado = { tipo, atributo, ronda_recuperacion: estado.ronda + 1 };
    // Marcar turno terminado
    if (j.turno) j.turno.turno_terminado = true;
  }

  guardarEstado();
  if (typeof notifAtributo === 'function') notifAtributo(jugIdx, atributo, anterior, nuevo, motivo);

  // Habilidad Médium: visión al perder Temple (una por cada punto perdido)
  const jug = estado.jugadores[jugIdx];
  if (atributo === 'TEM' && modificador < 0 && jug?.personaje === 'medium') {
    if (typeof _activarVisionMedium === 'function') {
      const puntosPerdidos = Math.abs(modificador);
      for (let i = 0; i < puntosPerdidos; i++) {
        _activarVisionMedium(jugIdx);
      }
    }
  }
}

function aplicarAtributoJugadores(target, atributo, modificador, motivo) {
  const allJugs = estado.jugadores;
  const targets = target === 'todos' ? allJugs.map((_,i)=>i) : [0];
  targets.forEach(idx => {
    const j   = allJugs[idx];
    const max = PERSONAJES[j.personaje]?.atributos?.[atributo] ?? 99;
    const ant = j.atributos[atributo] ?? 0;
    j.atributos[atributo] = Math.max(0, Math.min(max, ant + modificador));
    if (typeof notifAtributo === 'function') notifAtributo(idx, atributo, ant, j.atributos[atributo], motivo);
  });
  guardarEstado();
}

// ─── MOTOR INTERROGATORIO ──────────────────────────────────────────────────────

function _encontrarEntrada(pnj_id, pista_id) {
  const entradas = datosVariante?.interrogatorios?.[pnj_id];
  if (!entradas) return null;

  // 1. Buscar entrada específica para esta pista
  for (const [key, e] of Object.entries(entradas)) {
    if (!e.pistas) continue;
    const pistas = Array.isArray(e.pistas) ? e.pistas : [e.pistas];
    if (pistas.some(p => p === pista_id || p === pista_id + '_interpretada')) {
      return { key, entrada: e };
    }
  }

  // 2. Si no hay entrada específica, usar _resto (respuesta genérica del PNJ)
  const restoKey = Object.keys(entradas).find(k => k.endsWith('_resto'));
  if (restoKey) return { key: restoKey, entrada: entradas[restoKey] };

  return null;
}

function calcularDificultad(pnj_id, pista_id) {
  if (estado.alerta >= 9) return { bloqueado: true, razon: 'Crisis — sin interrogatorios con pista (Alerta 9)' };

  const found = _encontrarEntrada(pnj_id, pista_id);
  if (!found) return null;
  const { entrada } = found;

  // Respuesta sin prueba (atributo null): no hay tirada, solo texto narrativo
  if (!entrada.atributo) {
    return { sinPrueba: true, entrada, atributo: null, dificultad: null, mods: [] };
  }

  let dif = entrada.dificultad || 0;
  const mods = [];

  // Alerta ≥ 3: +1 dificultad
  if (estado.alerta >= 3) {
    dif += 1;
    mods.push({ texto: 'Desconfianza (Alerta ≥3)', valor: +1 });
  }

  // Loseta especial (capilla para Whitfield)
  const losetaActual = estado.pnj[pnj_id]?.loseta_actual;
  if (entrada.dificultad_capilla !== undefined && losetaActual === 'capilla') {
    const diff = entrada.dificultad_capilla - entrada.dificultad;
    dif += diff;
    mods.push({ texto: 'Efecto Capilla', valor: diff });
  }

  // mod_interrogatorio_propio: reacción de Sospecha del PNJ (continua)
  const sospPNJ = estado.pnj[pnj_id]?.sospecha || 0;
  if (sospPNJ >= 3 && typeof _REACCIONES_SOSPECHA !== 'undefined') {
    const reacciones = _REACCIONES_SOSPECHA[estado.caso_id]?.[pnj_id];
    if (reacciones) {
      // Buscar el mod_interrogatorio_propio activo más alto (puede haber reemplazos)
      let modAcum = 0;
      let reemplazado = {}; // nivel → valor ya sustituido
      for (let niv = 3; niv <= sospPNJ; niv++) {
        const reac = reacciones[String(niv)];
        if (!reac) continue;
        const efectos = reac.efectos_continuos || reac.efectos || [];
        efectos.forEach(ef => {
          if (ef.tipo === 'mod_interrogatorio_propio') {
            const afecta = !ef.atributo || ef.atributo === entrada.atributo;
            if (!afecta) return;
            if (ef.reemplaza_nivel != null) {
              // Reemplaza el modificador del nivel indicado
              reemplazado[ef.reemplaza_nivel] = ef.modificador;
            } else {
              reemplazado[niv] = ef.modificador;
            }
          }
        });
      }
      modAcum = Object.values(reemplazado).reduce((s, v) => s + v, 0);
      if (modAcum !== 0) {
        dif += modAcum;
        mods.push({ texto: `Actitud del PNJ (Sospecha ${sospPNJ})`, valor: modAcum });
      }
    }
  }

  // buffs_interrogacion: bonificaciones temporales de cartas de Suceso
  if (estado.buffs_interrogacion?.length) {
    const buffsActivos = estado.buffs_interrogacion.filter(b => {
      if (b.expira_ronda <= estado.ronda) return false;
      if (b.pnj && b.pnj !== pnj_id) return false;
      if (b.atributo && b.atributo !== entrada.atributo) return false;
      return true;
    });
    buffsActivos.forEach(b => {
      dif += b.mod_dif;
      mods.push({ texto: 'Ventaja (carta de Suceso)', valor: b.mod_dif });
    });
    // Limpiar buffs expirados
    estado.buffs_interrogacion = estado.buffs_interrogacion.filter(b => b.expira_ronda > estado.ronda);
  }

  // Bonus de confidencia del jugador activo
  if (typeof getBonusConfidenciaInterrogacion === 'function') {
    // Detectar jugador activo: el que está realizando el interrogatorio
    const jugActivo = estado.jugadores.find(j => j.turno?.accion_tipo === 'interrogatorio') ||
                      estado.jugadores.find(j => !j.turno?.turno_terminado);
    const jugIdx = jugActivo ? estado.jugadores.indexOf(jugActivo) : -1;
    if (jugIdx >= 0) {
      const bonusConf = getBonusConfidenciaInterrogacion(jugIdx, pnj_id);
      if (bonusConf !== 0) {
        dif += bonusConf;
        mods.push({ texto: 'Confidencia', valor: bonusConf });
      }
    }
  }

  return { dificultad: dif, mods, entrada, atributo: entrada.atributo };
}

// Fase 1: calcula resultado y texto pero NO modifica el estado.
// Devuelve efectosPendientes para aplicar al confirmar.
function resolverInterrogatorio(pnj_id, pista_id, resultado) {
  const calc = calcularDificultad(pnj_id, pista_id);
  if (!calc || calc.bloqueado) return { bloqueado: true, razon: calc?.razon };

  const { dificultad, entrada } = calc;

  let tipo_resultado;
  if (calc.sinPrueba || !entrada.atributo || resultado === null) {
    tipo_resultado = 'exito';
  } else if (resultado === 'critico') {
    tipo_resultado = 'exito';
  } else if (resultado === 'pifia') {
    tipo_resultado = 'fracaso';
  } else {
    tipo_resultado = resultado;
  }

  let texto = tipo_resultado === 'fracaso' ? entrada.fracaso : entrada.exito;
  const efectosPendientes = tipo_resultado === 'fracaso'
    ? [...(entrada.efectos_fracaso || [])]
    : [...(entrada.efectos_exito   || [])];

  // Texto y efectos condicionales (solo lectura del estado, sin modificarlo)
  if (tipo_resultado !== 'fracaso' && entrada.exito_condicional) {
    const cond = entrada.exito_condicional.condicion;
    if (cond?.pistas_interpretadas_any) {
      const cumple = cond.pistas_interpretadas_any.some(p => estado.pistas_interpretadas.includes(p));
      if (cumple) {
        texto = (texto || '') + '\n\n' + entrada.exito_condicional.texto;
        (entrada.exito_condicional.efectos || []).forEach(ef => efectosPendientes.push(ef));
      }
    }
  }

  // Sospecha por fracaso: pendiente, se aplica al confirmar
  if (tipo_resultado === 'fracaso') {
    efectosPendientes.push({ tipo: 'sospecha_pnj', pnj: pnj_id, valor: 1, _fracaso: true });
  }

  return {
    tipo_resultado, dificultad, texto,
    efectosPendientes,
    efectos: [],   // se rellena en confirmarInterrogatorio
    pnj_id, pista_id,
    ojo_entrenado: entrada.ojo_entrenado || null,
    prensa:        entrada.prensa || null,
    atributo:      entrada.atributo,
  };
}

// Fase 2: aplica efectos y marca la entrada usada. Llamar desde "Continuar".
function confirmarInterrogatorio(res) {
  if (!res || res.bloqueado) return;
  const { pnj_id, pista_id, efectosPendientes } = res;

  const efectosAplicados = [];
  (efectosPendientes || []).forEach(ef => {
    if (ef.tipo === 'sospecha_pnj' && ef.valor > 0) {
      const r = subirSospecha(ef.pnj, ef.valor);
      efectosAplicados.push(ef);
      if (r?.reaccionesNuevas?.length > 0) {
        efectosAplicados.push({ tipo: '_reacciones', pnj_id: ef.pnj, reacciones: r.reaccionesNuevas });
      }
    } else if (ef.tipo === 'sospecha_pnj' && ef.valor < 0) {
      bajarSospecha(ef.pnj, -ef.valor);
      efectosAplicados.push(ef);
    } else if (ef.tipo === 'atributo_jugador') {
      aplicarAtributoJugadores(ef.jugador, ef.atributo, ef.modificador);
      efectosAplicados.push(ef);
    }
  });

  res.efectos = efectosAplicados;

  const { key } = _encontrarEntrada(pnj_id, pista_id) || {};
  if (key) {
    // Guardar pista_id para bloquear re-interrogatorio por pista (incluso en entradas _resto)
    if (!estado.pnj[pnj_id].interrogatorios_usados.includes(pista_id)) {
      estado.pnj[pnj_id].interrogatorios_usados.push(pista_id);
    }
    guardarEstado();
  }
}

function resolverDeduccion(pista1_id, pista2_id) {
  if (!datosVariante?.deducciones) return { encontrada: false };

  // Los IDs en estado son 'pista_N'; en el JSON de variante son 'pista_N_interpretada'
  // Normalizamos: probamos el ID tal cual y con sufijo _interpretada
  const variantes1 = [pista1_id, pista1_id + '_interpretada'];
  const variantes2 = [pista2_id, pista2_id + '_interpretada'];

  const deduccion = datosVariante.deducciones.find(d =>
    variantes1.some(v => d.pistas.includes(v)) &&
    variantes2.some(v => d.pistas.includes(v))
  );
  if (!deduccion) return { encontrada: false };

  const id = [pista1_id, pista2_id].sort().join('+');
  if (!estado.deducciones_resueltas.find(d => d.id === id)) {
    // Determinar el color de la deducción (ambas pistas deben ser del mismo color)
    const color = typeof getColorPista === 'function' ? getColorPista(pista1_id) : null;
    estado.deducciones_resueltas.push({ id, color });
    guardarEstado();
    _verificarDesbloqueoAcusacion();
  }
  return { encontrada: true, texto: deduccion.texto, efectos: deduccion.efectos || [] };
}

// ─── MOVIMIENTO PATRULLA ────────────────────────────────────────────────────────

function _mayorSospecha() {
  let max = -1, maxId = null;
  Object.entries(estado.pnj).forEach(([id, e]) => {
    if (!e.retirado && e.sospecha > max) { max = e.sospecha; maxId = id; }
  });
  return maxId;
}

function _menorSospecha(excluir = null) {
  let min = Infinity, minId = null;
  Object.entries(estado.pnj).forEach(([id, e]) => {
    if (!e.retirado && id !== excluir && e.sospecha < min) { min = e.sospecha; minId = id; }
  });
  return minId;
}

function resolverMovimientoPatrulla(pnj_id) {
  const conexiones = getConexionesDistribucion();
  const losetaActual = estado.pnj[pnj_id]?.loseta_actual;
  const disponibles = conexiones.filter(c => c.desde === losetaActual || c.hasta === losetaActual);
  if (!disponibles.length) return { movio: false };

  const idx   = Math.floor(Math.random() * disponibles.length);
  const conn  = disponibles[idx];
  const destino = conn.desde === losetaActual ? conn.hasta : conn.desde;
  moverPNJ(pnj_id, destino);
  return { movio: true, destino };
}

// ─── CONFESIÓN ────────────────────────────────────────────────────────────────

function verificarConfesion(pnj_id) {
  const confesiones = datosVariante?.confesiones;
  if (!confesiones?.[pnj_id]) return null;
  const conf   = confesiones[pnj_id];
  const estPNJ = estado.pnj[pnj_id];

  if (estPNJ.sospecha >= conf.condicion_sospecha) return conf;

  const alt = conf.condicion_alternativa;
  if (alt?.pistas_and) {
    if (alt.pistas_and.every(p => estado.pistas_interpretadas.includes(p))) return conf;
  }
  return null;
}

// ─── ACUSACIÓN FINAL ──────────────────────────────────────────────────────────

function resolverAcusacion(ejecutor, instigador, metodo) {
  const verdad = datosVariante?.acusacion;
  if (!verdad) return null;

  const ej_ok  = ejecutor   === verdad.ejecutor;
  const ins_ok = instigador === verdad.instigador;
  const met_ok = metodo     === verdad.metodo;
  const correctos = [ej_ok, ins_ok, met_ok].filter(Boolean).length;
  const puntos = correctos === 3 ? 10 : correctos === 2 ? 5 : correctos === 1 ? 2 : 0;

  estado.partida_terminada = true;
  guardarEstado();

  return {
    ejecutor_correcto:   ej_ok,
    instigador_correcto: ins_ok,
    metodo_correcto:     met_ok,
    puntos,
    texto_verdad:    verdad.texto_verdad,
    texto_resultado: puntos === 10 ? verdad.texto_victoria : verdad.texto_derrota,
  };
}

// Resetear el tracking de turno de todos los jugadores al inicio de cada ronda
function resetearTurnos() {
  estado.jugadores.forEach((j, idx) => {
    // Recuperar incapacitados si ya llegó su ronda de recuperación
    if (j.incapacitado && estado.ronda >= j.incapacitado.ronda_recuperacion) {
      const atribRecup = j.incapacitado.atributo;
      j.atributos[atribRecup] = 1;
      j.incapacitado = null;
      if (typeof notifAtributo === 'function') {
        notifAtributo(idx, atribRecup, 0, 1, 'Recuperación automática');
      }
    }
    const sigueIncap = j.incapacitado !== null && j.incapacitado !== undefined;
    j.turno = {
      mov_libre_usado: sigueIncap,
      accion_usada:    sigueIncap,
      turno_terminado: sigueIncap,
      interrogados_sin_pista: [],
      accion_tipo: null,
    };
  });
}

// Marcar acción en el turno del jugador
function usarMovLibre(jugIdx) {
  estado.jugadores[jugIdx].turno.mov_libre_usado = true;
}
function usarAccion(jugIdx, tipo) {
  estado.jugadores[jugIdx].turno.accion_usada = true;
  estado.jugadores[jugIdx].turno.accion_tipo = tipo;
}
function registrarInterrogadoSinPista(jugIdx, pnjId) {
  if (!estado.jugadores[jugIdx].turno.interrogados_sin_pista.includes(pnjId)) {
    estado.jugadores[jugIdx].turno.interrogados_sin_pista.push(pnjId);
  }
}
function pasarTurno(jugIdx) {
  const t = getTurno(jugIdx);
  if (t) t.turno_terminado = true;
  guardarEstado();
}

function getTurno(jugIdx) {
  return estado.jugadores[jugIdx]?.turno || {};
}

// Migración defensiva: asegurar que partidas guardadas tienen el campo turno
function asegurarTurno() {
  if (!estado?.jugadores) return;
  estado.jugadores.forEach(j => {
    if (!j.turno) {
      j.turno = { mov_libre_usado:false, accion_usada:false, turno_terminado:false, interrogados_sin_pista:[], accion_tipo:null };
    }
  });
}
