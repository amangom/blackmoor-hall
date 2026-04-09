// ── SUCESOS.JS — Motor de cartas de Suceso ───────────────────────────────────

let _datosSucesos = null;

async function cargarSucesos() {
  if (_datosSucesos) return;
  const r = await fetch('data/sucesos.json');
  _datosSucesos = await r.json();
}

// Obtener la carta de suceso de esta ronda (aleatoria, sin repetición)
function robarSuceso() {
  if (!_datosSucesos) return null;
  const caso_num = parseInt(estado.caso_id.replace('caso_', ''));
  const fase = estado.fase;

  // Pool: genéricas de esta fase + específicas del caso de esta fase
  const pool = _datosSucesos.sucesos.filter(s => {
    const faseOk = s.fase === fase || s.fase === 'todas';
    const casoOk = s.tipo === 'generica' || s.caso === caso_num;
    const noUsado = !estado.sucesos_jugados.includes(s.id);
    return faseOk && casoOk && noUsado;
  });

  if (pool.length === 0) {
    // Todas usadas: reiniciar solo las genéricas de esta fase (no las de caso)
    const poolReset = _datosSucesos.sucesos.filter(s => {
      const faseOk = s.fase === fase || s.fase === 'todas';
      return s.tipo === 'generica' && faseOk;
    });
    if (poolReset.length === 0) return null;
    const carta = poolReset[Math.floor(Math.random() * poolReset.length)];
    return carta;
  }

  return pool[Math.floor(Math.random() * pool.length)];
}

// ── pnj_movimiento_aleatorio: elige PNJ activo al azar y lo mueve ─────────────
// Devuelve { pnjId, pnjNombre, desde, hasta } o null si no hay PNJ activos
function resolverPNJMovimientoAleatorio() {
  const conexiones = typeof getConexionesDistribucion === 'function'
    ? getConexionesDistribucion() : [];

  // PNJ activos (no retirados)
  const pnjActivos = Object.entries(estado.pnj || {})
    .filter(([, e]) => !e.retirado)
    .map(([id]) => id);

  if (pnjActivos.length === 0) return null;

  // Elegir PNJ al azar
  const pnjId = pnjActivos[Math.floor(Math.random() * pnjActivos.length)];
  const estPNJ = estado.pnj[pnjId];
  const desde  = estPNJ.loseta_actual;

  // Losetas adyacentes
  const adyacentes = [];
  conexiones.forEach(c => {
    if (c.desde === desde) adyacentes.push(c.hasta);
    if (c.hasta  === desde) adyacentes.push(c.desde);
  });

  if (adyacentes.length === 0) return { pnjId, desde, hasta: null };

  // Elegir destino al azar
  const hasta = adyacentes[Math.floor(Math.random() * adyacentes.length)];

  if (typeof moverPNJ === 'function') moverPNJ(pnjId, hasta);
  guardarEstado();

  // Obtener nombres para el relato
  const pnjNombre = datosCaso?.comun?.pnj?.find(p => p.id === pnjId)?.nombre || pnjId;
  const nomDesde  = typeof getLoseta === 'function' ? (getLoseta(desde)?.nombre  || desde)  : desde;
  const nomHasta  = typeof getLoseta === 'function' ? (getLoseta(hasta)?.nombre  || hasta)  : hasta;

  return { pnjId, pnjNombre, desde, nomDesde, hasta, nomHasta };
}


// ── Resolver efecto loseta_mas_jugadores ─────────────────────────────────────
// Devuelve { unica: {losetaId, jugadores[]}, empate: [{losetaId, jugadores[]}] }
function calcularLosetasMasJugadores() {
  const grupos = {};
  estado.jugadores.forEach((j, idx) => {
    const lid = j.loseta_actual;
    if (!grupos[lid]) grupos[lid] = [];
    grupos[lid].push({ j, idx });
  });

  const max = Math.max(...Object.values(grupos).map(g => g.length));
  let candidatas = Object.entries(grupos)
    .filter(([, g]) => g.length === max)
    .map(([lid, jugs]) => ({ losetaId: lid, jugadores: jugs }));

  if (candidatas.length === 1) return candidatas[0];

  // Empate: la sala con el jugador de menor TEM
  const minTEM = loseta => Math.min(...loseta.jugadores.map(({ j }) => j.atributos?.TEM ?? 99));
  const minVal = Math.min(...candidatas.map(c => minTEM(c)));
  candidatas = candidatas.filter(c => minTEM(c) === minVal);

  // Si persiste empate: aleatorio
  return candidatas[Math.floor(Math.random() * candidatas.length)];
}

// Aplicar efectos de loseta_mas_jugadores a los jugadores de una loseta concreta
function aplicarEfectoLosetaJugadores(losetaId, efecto, motivo) {
  const jPresentes = estado.jugadores
    .map((j, idx) => ({ j, idx }))
    .filter(({ j }) => j.loseta_actual === losetaId);

  jPresentes.forEach(({ j, idx }) => {
    (efecto.efecto_sobre_jugadores || []).forEach(ef => {
      if (ef.tipo === 'carta_resolucion') {
        j.cartas_resolucion = Math.max(0, (j.cartas_resolucion || 0) + ef.modificador);
      } else if (typeof modificarAtributoJugador === 'function') {
        modificarAtributoJugador(idx, ef.atributo, ef.modificador, motivo);
      }
    });
  });

  guardarEstado();
  return jPresentes;
}


// Aplicar efectos automáticos de la carta (los que no requieren decisión de jugador)
// ── Fase 1: calcular resultados (sin modificar estado) ───────────────────────
// Rellena carta._resultado_* para que el overlay los muestre antes de confirmar
function calcularResultadosSuceso(carta) {
  if (!carta?.efectos) return;
  carta.efectos.forEach(ef => {
    if (ef.tipo === 'bloqueo_loseta_adyacente') {
      // Determinar el jugador con más TEM (empate: aleatorio entre los empatados)
      const jugsActivos = estado.jugadores.filter(j => !j.incapacitado);
      if (jugsActivos.length) {
        const maxTEM = Math.max(...jugsActivos.map(j => j.atributos?.TEM ?? 0));
        const candidatos = jugsActivos.filter(j => (j.atributos?.TEM ?? 0) === maxTEM);
        // En empate, aleatorio
        const elegido = candidatos[Math.floor(Math.random() * candidatos.length)];
        const elegidoIdx = estado.jugadores.indexOf(elegido);
        const pjDef = typeof PERSONAJES !== 'undefined' ? PERSONAJES[elegido.personaje] : null;
        const pjNom = (pjDef?.nombre || elegido.personaje) + ' (' + elegido.nombre + ')';
        carta._resultado_bloqueo = { jugIdx: elegidoIdx, jugNom: pjNom, tem: maxTEM, losetaActual: elegido.loseta_actual, empate: candidatos.length > 1 };
      }
    } else if (ef.tipo === 'loseta_mas_jugadores') {
      if (!carta._pendiente_loseta) carta._pendiente_loseta = ef;
      // Calcular loseta afectada (empate resuelto automáticamente)
      if (typeof calcularLosetasMasJugadores === 'function') {
        const resLos = calcularLosetasMasJugadores();
        if (resLos?.losetaId) {
          const nom = typeof getLoseta === 'function' ? (getLoseta(resLos.losetaId)?.nombre || resLos.losetaId) : resLos.losetaId;
          const jugs = resLos.jugadores.map(({j}) => {
            const pjNom = typeof PERSONAJES !== 'undefined' ? (PERSONAJES[j.personaje]?.nombre || j.personaje) : j.personaje;
            return pjNom + ' (' + j.nombre + ')';
          });
          carta._resultado_loseta = { losetaNom: nom, jugadores: jugs };
        }
      }
    } else if (ef.tipo === 'pnj_movimiento_aleatorio') {
      // Calcular destino (sin mover aún)
      const pnjsActivos = datosCaso.comun.pnj.filter(p => !estado.pnj?.[p.id]?.retirado);
      if (!pnjsActivos.length) { carta._resultado_viento = null; return; }
      const pnjDef = pnjsActivos[Math.floor(Math.random() * pnjsActivos.length)];
      const conexiones = getConexionesDistribucion();
      const actual = estado.pnj?.[pnjDef.id]?.loseta_actual || pnjDef.posicion_inicial;
      const vecinos = conexiones
        .filter(c => c.desde === actual || c.hasta === actual)
        .map(c => c.desde === actual ? c.hasta : c.desde);
      const getLos = id => getLosetasDistribucion().find(l => l.id === id);
      const hasta = vecinos.length ? vecinos[Math.floor(Math.random() * vecinos.length)] : null;
      carta._resultado_viento = {
        pnjId: pnjDef.id,
        pnjNombre: pnjDef.nombre,
        desde: actual,
        nomDesde: getLos(actual)?.nombre || actual,
        hasta,
        nomHasta: hasta ? (getLos(hasta)?.nombre || hasta) : null
      };
    } else if (ef.tipo === 'pnj_refugio_exterior') {
      const losetaExt = ef.loseta_exterior;
      const objetivo  = ef.destino_objetivo;
      const conexiones = typeof getConexionesDistribucion === 'function' ? getConexionesDistribucion() : [];

      const distancia = {};
      const colaB = [objetivo];
      distancia[objetivo] = 0;
      while (colaB.length) {
        const actual = colaB.shift();
        conexiones.forEach(c => {
          const vecino = c.desde === actual ? c.hasta : c.hasta === actual ? c.desde : null;
          if (vecino && distancia[vecino] === undefined) {
            distancia[vecino] = distancia[actual] + 1;
            colaB.push(vecino);
          }
        });
      }

      const adyacentes = conexiones.flatMap(c => {
        if (c.desde === losetaExt) return [c.hasta];
        if (c.hasta  === losetaExt) return [c.desde];
        return [];
      });
      adyacentes.sort((a, b) => (distancia[a] ?? 99) - (distancia[b] ?? 99));
      const destinoLluvia = adyacentes[0] || null;

      const pnjsEnExt = Object.entries(estado.pnj || {})
        .filter(([, v]) => v?.loseta_actual === losetaExt)
        .map(([id]) => {
          const def = typeof getPNJ === 'function' ? getPNJ(id) : null;
          return { id, nombre: def?.nombre || id };
        });

      const nomDestLluvia = destinoLluvia && typeof getLoseta === 'function'
        ? (getLoseta(destinoLluvia)?.nombre || destinoLluvia) : destinoLluvia;

      carta._resultado_lluvia = { destino: destinoLluvia, nomDest: nomDestLluvia, pnjs: pnjsEnExt };
    } else if (ef.tipo === 'alerta_si_zona_privada') {
      const jugsEnPrivada = estado.jugadores
        .map((j, idx) => ({ j, idx }))
        .filter(({ j }) => getLoseta(j.loseta_actual)?.tipo === 'P');
      if (jugsEnPrivada.length > 0) {
        carta._resultado_hobbes = {
          afecta: true,
          jugadores: jugsEnPrivada.map(({ j }) => {
            const pjNom = typeof PERSONAJES !== 'undefined'
              ? (PERSONAJES[j.personaje]?.nombre || j.personaje) : j.personaje;
            return `${pjNom} (${j.nombre}) — ${getLoseta(j.loseta_actual)?.nombre || j.loseta_actual}`;
          })
        };
      } else {
        carta._resultado_hobbes = { afecta: false };
      }
    }
  });
}

// ── Fase 2: aplicar efectos al estado (tras confirmar en overlay) ─────────────
function aplicarEfectosSuceso(carta) {
  const log = [];
  if (!carta?.efectos) return log;
  const motivo = carta.titulo ? `Suceso: ${carta.titulo}` : 'Suceso';

  carta.efectos.forEach(ef => {
    if (ef.tipo === 'bloqueo_loseta_adyacente') {
      if (carta._losetaBloqueadaElegida && typeof bloquearLoseta === 'function') {
        bloquearLoseta(carta._losetaBloqueadaElegida, estado.ronda + 1, motivo);
      }
    } else if (ef.tipo === 'alerta' && ef.valor > 0) {
      subirAlerta(ef.valor, motivo);
    } else if (ef.tipo === 'sospecha_activar') {
      const pnjId = _mayorSospecha();
      if (pnjId) subirSospecha(pnjId, ef.valor);
    } else if (ef.tipo === 'sospecha_bajar') {
      const pnjId = _mayorSospecha();
      if (pnjId) bajarSospecha(pnjId, Math.abs(ef.valor), motivo);
    } else if (ef.tipo === 'atributo_jugadores') {
      aplicarAtributoJugadores('todos', ef.atributo, ef.valor, motivo);
    } else if (ef.tipo === 'pnj_movimiento_aleatorio') {
      // Usar resultado ya calculado
      if (carta._resultado_viento?.hasta) {
        moverPNJ(carta._resultado_viento.pnjId, carta._resultado_viento.hasta);
      }
    } else if (ef.tipo === 'alerta_si_zona_privada') {
      if (carta._resultado_hobbes?.afecta) {
        subirAlerta(1, 'Hobbes os ha descubierto en zona privada');
      }
    } else if (ef.tipo === 'buff_interrogacion') {
      // Buff temporal: -1 dif para interrogar a un PNJ durante N rondas.
      // No aplica alerta ahora; solo si fracasa la interrogación en ese periodo.
      if (!estado.buffs_interrogacion) estado.buffs_interrogacion = [];
      estado.buffs_interrogacion.push({
        pnj:          ef.pnj,
        atributo:     ef.atributo,
        mod_dif:      ef.modificador_dificultad,
        expira_ronda: estado.ronda + (ef.duracion_rondas || 1),
        alerta_si_fracaso: ef.alerta_si_fracaso || false
      });
      registrarCambio('info', {
        lineas: [`${ef.pnj ? ef.pnj.charAt(0).toUpperCase() + ef.pnj.slice(1) : 'PNJ'}: −1 dif ${ef.atributo} para interrogar hasta fin de ronda ${estado.ronda + (ef.duracion_rondas||1)}`]
      });
    } else if (ef.tipo === 'pnj_refugio_exterior') {
      // Usar resultado ya calculado en calcularResultadosSuceso
      const r = carta._resultado_lluvia;
      if (r?.destino && r.pnjs?.length) {
        r.pnjs.forEach(({ id, nombre }) => {
          if (typeof moverPNJ === 'function') moverPNJ(id, r.destino);
          log.push(`${nombre} se refugia en ${r.nomDest}`);
        });
      } else if (r) {
        log.push('Ningún personaje estaba en el Jardín');
      }
    }
    // loseta_mas_jugadores se gestiona aparte vía _pendiente_loseta
  });

  guardarEstado();
  return log;
}
