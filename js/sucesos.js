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
      // Elegir una loseta aleatoria de entre todas las en juego (no cerradas, no ya bloqueadas)
      const losetas = typeof getLosetasDistribucion === 'function' ? getLosetasDistribucion() : [];
      const candidatas = losetas
        .map(l => l.id)
        .filter(id => !isCerrada(id) && !(typeof isLosetaBloqueada === 'function' && isLosetaBloqueada(id)));
      if (candidatas.length) {
        const elegida = candidatas[Math.floor(Math.random() * candidatas.length)];
        const nom = typeof getLoseta === 'function' ? (getLoseta(elegida)?.nombre || elegida) : elegida;
        carta._resultado_bloqueo = { losetaId: elegida, losetaNom: nom };
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
            return pjNom;
          });
          carta._resultado_loseta = { losetaNom: nom, jugadores: jugs };
        }
      }
    } else if (ef.tipo === 'sospecha_activar') {
      // Pre-calcular qué PNJ se activará (para mostrarlo en el log)
      const pnjActivado = _mayorSospecha();
      if (pnjActivado) {
        const pnjDef = typeof getPNJ === 'function' ? getPNJ(pnjActivado) : null;
        const sosp_actual = estado.pnj?.[pnjActivado]?.sospecha || 0;
        carta._resultado_rumores = {
          pnjId: pnjActivado,
          pnjNombre: pnjDef?.nombre || pnjActivado,
          sosp_antes: sosp_actual,
          sosp_despues: sosp_actual + ef.valor
        };
      }
    } else if (ef.tipo === 'activar_pnj_mayor_sospecha') {
      const pnjId = _mayorSospecha();
      if (pnjId) {
        const conexiones = getConexionesDistribucion();
        const actual = estado.pnj?.[pnjId]?.loseta_actual || getPNJ(pnjId)?.posicion_inicial;
        const vecinos = conexiones
          .filter(c => c.desde === actual || c.hasta === actual)
          .map(c => c.desde === actual ? c.hasta : c.desde)
          .filter(id => !isCerrada(id));
        const destino = vecinos.length ? vecinos[Math.floor(Math.random() * vecinos.length)] : null;
        const pnjDef = getPNJ(pnjId);
        const getLos = id => getLosetasDistribucion().find(l => l.id === id);
        carta._resultado_activar_pnj = {
          pnjId,
          pnjNombre: pnjDef?.nombre || pnjId,
          desde: actual,
          nomDesde: getLos(actual)?.nombre || actual,
          hasta: destino,
          nomHasta: destino ? (getLos(destino)?.nombre || destino) : null
        };
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
    } else if (ef.tipo === 'mover_todos_hacia') {
      // Pre-calcular un paso hacia el destino para cada PNJ activo
      const conexiones = typeof getConexionesDistribucion === 'function' ? getConexionesDistribucion() : [];
      const destino = ef.destino;
      // BFS desde destino para calcular distancias
      const dist = {}; const cola = [destino]; dist[destino] = 0;
      while (cola.length) {
        const curr = cola.shift();
        conexiones.forEach(c => {
          const v = c.desde === curr ? c.hasta : c.hasta === curr ? c.desde : null;
          if (v && dist[v] === undefined) { dist[v] = dist[curr] + 1; cola.push(v); }
        });
      }
      const getLos = id => typeof getLoseta === 'function' ? getLoseta(id) : null;
      const movs = [];
      (datosCaso?.comun?.pnj || []).forEach(pnjDef => {
        const actual = estado.pnj?.[pnjDef.id]?.loseta_actual || pnjDef.posicion_inicial;
        if (actual === destino) { movs.push({ id: pnjDef.id, nombre: pnjDef.nombre, desde: actual, hasta: null, yaEstaba: true }); return; }
        // Vecino más cercano al destino
        const vecinos = conexiones.flatMap(c => {
          if (c.desde === actual) return [c.hasta];
          if (c.hasta === actual) return [c.desde];
          return [];
        });
        vecinos.sort((a,b) => (dist[a]??99) - (dist[b]??99));
        const hasta = vecinos[0] || null;
        movs.push({ id: pnjDef.id, nombre: pnjDef.nombre, desde: actual, nomDesde: getLos(actual)?.nombre || actual, hasta, nomHasta: hasta ? (getLos(hasta)?.nombre || hasta) : null, yaEstaba: false });
      });
      carta._resultado_movimiento_general = { destino, nomDestino: getLos(destino)?.nombre || destino, movs };

    } else if (ef.tipo === 'sospecha_cruzada') {
      const acusadorId = _mayorSospecha();
      const acusadoId  = acusadorId ? _menorSospecha(acusadorId) : null;
      const getPNJNom = id => datosCaso?.comun?.pnj?.find(p => p.id === id)?.nombre || id;
      carta._resultado_sospecha_cruzada = {
        acusadorId, acusadoId,
        acusadorNombre: acusadorId ? getPNJNom(acusadorId) : '?',
        acusadoNombre:  acusadoId  ? getPNJNom(acusadoId)  : '?'
      };

    } else if (ef.tipo === 'pnj_huida_mayor_sospecha') {
      const pnjId = _mayorSospecha();
      if (pnjId) {
        const pnjDef = datosCaso?.comun?.pnj?.find(p => p.id === pnjId);
        const actual = estado.pnj?.[pnjId]?.loseta_actual || pnjDef?.posicion_inicial;
        const conexiones = typeof getConexionesDistribucion === 'function' ? getConexionesDistribucion() : [];
        // Loseta más alejada de jugadores — máxima distancia mínima de cualquier jugador
        const jugLosets = estado.jugadores.map(j => j.loseta_actual).filter(Boolean);
        const todasLosets = typeof getLosetasDistribucion === 'function' ? getLosetasDistribucion().map(l => l.id) : [];
        // BFS distancias desde cada jugador
        const distJug = {};
        jugLosets.forEach(jl => {
          const d = {}; const q = [jl]; d[jl] = 0;
          while (q.length) { const c = q.shift(); conexiones.forEach(cn => { const v = cn.desde===c?cn.hasta:cn.hasta===c?cn.desde:null; if(v&&d[v]===undefined){d[v]=d[c]+1;q.push(v);} }); }
          Object.entries(d).forEach(([id,dist]) => { distJug[id] = Math.min(distJug[id]??99, dist); });
        });
        // Vecinos directos del PNJ; elegir el más alejado de jugadores
        const vecinos = conexiones.flatMap(c => { if(c.desde===actual)return[c.hasta]; if(c.hasta===actual)return[c.desde]; return[]; });
        const getLos = id => typeof getLoseta === 'function' ? getLoseta(id) : null;
        vecinos.sort((a,b) => (distJug[b]??0) - (distJug[a]??0));
        const destino = vecinos[0] || null;
        carta._resultado_huida = { pnjId, pnjNombre: pnjDef?.nombre || pnjId, desde: actual, destino, nomDestino: destino ? (getLos(destino)?.nombre || destino) : null, jugadoresPresentes: jugLosets.includes(actual) };
      }

    } else if (ef.tipo === 'ayuda_pnj_menor_sospecha') {
      const activo = (estado.alerta || 0) >= (ef.condicion_alerta_min || 8);
      const pnjId = activo ? _menorSospecha() : null;
      const pnjDef = pnjId ? datosCaso?.comun?.pnj?.find(p => p.id === pnjId) : null;
      carta._resultado_ultimo_recurso = { activo, pnjId, pnjNombre: pnjDef?.nombre || pnjId };

    } else if (ef.tipo === 'pnj_descubre_secreto') {
      // Buscar loseta con carta de Secreto no descubierta
      const cartas = Object.entries(estado.cartas_secreto || {});
      const pendientes = cartas.filter(([id, c]) => !c.descubierta);
      const elegida = pendientes.length ? pendientes[Math.floor(Math.random() * pendientes.length)] : null;
      const getLos = id => typeof getLoseta === 'function' ? getLoseta(id) : null;
      if (elegida) {
        // Buscar nombre de la carta en el JSON de exploración (simplificado: usar el id)
        carta._resultado_catherine = { pista_id: elegida[0], pista_nombre: elegida[0], loseta_nombre: elegida[1].loseta || '?' };
      } else {
        carta._resultado_catherine = null;
      }

    } else if (ef.tipo === 'marsh_altera_cuerpo') {
      const jugPresente = estado.jugadores.some(j => j.loseta_actual === ef.loseta_condicion && !j.incapacitado);
      carta._resultado_marsh = { jugadorPresente: jugPresente };

    } else if (ef.tipo === 'harold_destruye_testamento') {
      const jugPresente = estado.jugadores.some(j => j.loseta_actual === ef.destino && !j.incapacitado);
      const pistaDescubierta = estado.pistas_descubiertas?.includes(ef.pista_objetivo);
      carta._resultado_harold = { jugadorPresente: jugPresente, pistaYaDescubierta: pistaDescubierta };

    } else if (ef.tipo === 'hobbes_revela_cerradura') {
      // Solo pre-cálculo trivial (se maneja en aplicar)

    } else if (ef.tipo === 'bloqueo_loseta_pnj_cercano') {
      // Loseta con PNJ activo más cercana a cualquier jugador
      const conexiones = typeof getConexionesDistribucion === 'function' ? getConexionesDistribucion() : [];
      const getLos = id => typeof getLoseta === 'function' ? getLoseta(id) : null;
      const pnjsActivos = (datosCaso?.comun?.pnj || []).filter(p => !estado.pnj?.[p.id]?.retirado);
      let mejorLosetaId = null, mejorDist = Infinity, mejorNombre = null;
      pnjsActivos.forEach(pnjDef => {
        const losPNJ = estado.pnj?.[pnjDef.id]?.loseta_actual || pnjDef.posicion_inicial;
        estado.jugadores.forEach(j => {
          if (j.incapacitado) return;
          const origen = j.loseta_actual;
          // BFS distancia
          const dist = {}; const q = [origen]; dist[origen] = 0;
          while (q.length) { const c = q.shift(); conexiones.forEach(cn => { const v = cn.desde===c?cn.hasta:cn.hasta===c?cn.desde:null; if(v&&dist[v]===undefined){dist[v]=dist[c]+1;q.push(v);} }); }
          const d = dist[losPNJ] ?? Infinity;
          if (d < mejorDist) { mejorDist = d; mejorLosetaId = losPNJ; mejorNombre = getLos(losPNJ)?.nombre || losPNJ; }
        });
      });
      carta._resultado_puerta_bloqueada = mejorLosetaId
        ? { losetaId: mejorLosetaId, losetaNombre: mejorNombre }
        : null;

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
            return `${pjNom} — ${getLoseta(j.loseta_actual)?.nombre || j.loseta_actual}`;
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
      if (carta._resultado_bloqueo?.losetaId && typeof bloquearLoseta === 'function') {
        bloquearLoseta(carta._resultado_bloqueo.losetaId, estado.ronda + 1, 'Corriente de aire');
      }
    } else if (ef.tipo === 'alerta' && ef.valor > 0) {
      subirAlerta(ef.valor, motivo);
    } else if (ef.tipo === 'sospecha_activar') {
      const r = carta._resultado_rumores;
      if (r?.pnjId) {
        subirSospecha(r.pnjId, ef.valor);
        log.push(`${r.pnjNombre}: +${ef.valor} Sospecha (${r.sosp_antes} → ${r.sosp_despues})`);
      }
    } else if (ef.tipo === 'alerta_si_sospecha') {
      // Sube alerta solo si el PNJ activado tiene sospecha >= umbral tras el suceso
      const r = carta._resultado_rumores;
      if (r?.pnjId) {
        const sosp = estado.pnj?.[r.pnjId]?.sospecha || 0;
        if (sosp >= (ef.umbral || 2)) {
          subirAlerta(ef.valor, motivo);
          log.push(`Sospecha de ${r.pnjNombre} ≥${ef.umbral}: +${ef.valor} Alerta`);
        }
      }
    } else if (ef.tipo === 'sospecha_bajar') {
      const pnjId = _mayorSospecha();
      if (pnjId) bajarSospecha(pnjId, Math.abs(ef.valor), motivo);

    // ── NUEVOS TIPOS C1 ───────────────────────────────────────────────────────

    } else if (ef.tipo === 'sospecha_cruzada') {
      // Mayor Sospecha acusa al de menor Sospecha: +1 al acusado
      const acusador = carta._resultado_sospecha_cruzada?.acusadorId;
      const acusado  = carta._resultado_sospecha_cruzada?.acusadoId;
      if (acusado) {
        subirSospecha(acusado, 1);
        const nomA = carta._resultado_sospecha_cruzada.acusadorNombre;
        const nomB = carta._resultado_sospecha_cruzada.acusadoNombre;
        log.push(`${nomA} acusa a ${nomB}: +1 Sospecha`);
      }

    } else if (ef.tipo === 'pnj_huida_mayor_sospecha') {
      const r = carta._resultado_huida;
      if (r?.pnjId && r.destino) {
        if (typeof moverPNJ === 'function') moverPNJ(r.pnjId, r.destino);
        log.push(`${r.pnjNombre} huye a ${r.nomDestino}`);
      }

    } else if (ef.tipo === 'dificultad_exploracion_global') {
      // +N dificultad a todas las exploraciones si quedan secretos sin descubrir
      const haySecretosPendientes = Object.values(estado.cartas_secreto || {})
        .some(c => !c.descubierta);
      if (haySecretosPendientes) {
        estado.dificultad_exploracion_global = (estado.dificultad_exploracion_global || 0) + ef.valor;
        guardarEstado();
        log.push(`+${ef.valor} dificultad a todas las exploraciones hasta próxima ronda`);
      } else {
        log.push('Sin efecto (no quedan cartas de Secreto sin descubrir)');
      }

    } else if (ef.tipo === 'ayuda_pnj_menor_sospecha') {
      const r = carta._resultado_ultimo_recurso;
      if (r?.activo && r.pnjId) {
        estado.buff_pnj_ayuda = { pnjId: r.pnjId, pnjNombre: r.pnjNombre, hasta_ronda: estado.ronda };
        guardarEstado();
        log.push(`${r.pnjNombre} ofrece ayuda: +1 a todas las pruebas esta ronda`);
      } else {
        log.push('Alerta < 8: sin efecto');
      }

    } else if (ef.tipo === 'pnj_descubre_secreto') {
      const r = carta._resultado_catherine;
      if (r?.pista_id) {
        // Marcar la carta como descubierta
        if (!estado.cartas_secreto) estado.cartas_secreto = {};
        if (!estado.cartas_secreto[r.pista_id]) estado.cartas_secreto[r.pista_id] = {};
        estado.cartas_secreto[r.pista_id].descubierta = true;
        guardarEstado();
        log.push(`Catherine descubre: ${r.pista_nombre} (${r.loseta_nombre}) — carta DESCUBIERTA`);
      } else {
        log.push('No quedan cartas de Secreto sin descubrir');
      }

    } else if (ef.tipo === 'marsh_altera_cuerpo') {
      const r = carta._resultado_marsh;
      if (r?.jugadorPresente) {
        log.push('Jugador en el Despacho: Marsh finge un examen rutinario. Sin efecto.');
      } else {
        const afectadas = ef.pistas_afectadas || [];
        afectadas.forEach(pid => {
          if (!estado.dificultad_pista_extra) estado.dificultad_pista_extra = {};
          if (!estado.pistas_descubiertas?.includes(pid)) {
            estado.dificultad_pista_extra[pid] = (estado.dificultad_pista_extra[pid] || 0) + ef.dificultad_extra;
          }
        });
        guardarEstado();
        log.push(`Marsh altera el cuerpo: +${ef.dificultad_extra} dificultad a pistas #9 y #10`);
      }

    } else if (ef.tipo === 'harold_destruye_testamento') {
      const r = carta._resultado_harold;
      if (r?.jugadorPresente) {
        // Se resuelve interactivamente (prueba FOR) — ya gestionado en calcularResultadosSuceso
        log.push('Harold irrumpe. Se requiere prueba FOR dif. 4 para detenerle.');
      } else if (r?.pistaYaDescubierta) {
        log.push('Pista #3 ya descubierta: Harold llega tarde. Sin efecto.');
      } else {
        // Destruir pista #3
        if (!estado.pistas_destruidas) estado.pistas_destruidas = [];
        if (!estado.pistas_destruidas.includes('pista_3')) {
          estado.pistas_destruidas.push('pista_3');
          guardarEstado();
          log.push('Harold quema el testamento. Pista #3 destruida permanentemente.');
        }
        // Mover Harold al Despacho
        if (typeof moverPNJ === 'function') moverPNJ('harold', ef.destino);
      }

    } else if (ef.tipo === 'hobbes_revela_cerradura') {
      const ya_interpretada = estado.pistas_interpretadas?.includes(ef.pista_afectada);
      if (ya_interpretada) {
        log.push('Pista #12 ya interpretada: sin efecto.');
      } else {
        if (!estado.dificultad_pista_extra) estado.dificultad_pista_extra = {};
        estado.dificultad_pista_extra[ef.pista_afectada] = (estado.dificultad_pista_extra[ef.pista_afectada] || 0) + ef.dificultad_mod;
        guardarEstado();
        log.push('Hobbes: «El Lord cambió la cerradura del Despacho la semana pasada.» −1 dif. pista #12');
      }

    } else if (ef.tipo === 'bloqueo_loseta_pnj_cercano') {
      const r = carta._resultado_puerta_bloqueada;
      if (r?.losetaId) {
        bloquearLoseta(r.losetaId, estado.ronda + 1, motivo);
        log.push(`${r.losetaNombre} bloqueada hasta final de la próxima ronda`);
      }

    } else if (ef.tipo === 'atributo_jugadores') {
      aplicarAtributoJugadores('todos', ef.atributo, ef.valor, motivo);
    } else if (ef.tipo === 'sospecha_activar') {
      // Pre-calcular qué PNJ se activará (para mostrarlo en el log)
      const pnjActivado = _mayorSospecha();
      if (pnjActivado) {
        const pnjDef = typeof getPNJ === 'function' ? getPNJ(pnjActivado) : null;
        const sosp_actual = estado.pnj?.[pnjActivado]?.sospecha || 0;
        carta._resultado_rumores = {
          pnjId: pnjActivado,
          pnjNombre: pnjDef?.nombre || pnjActivado,
          sosp_antes: sosp_actual,
          sosp_despues: sosp_actual + ef.valor
        };
      }
    } else if (ef.tipo === 'activar_pnj_mayor_sospecha') {
      if (carta._resultado_activar_pnj?.hasta) {
        moverPNJ(carta._resultado_activar_pnj.pnjId, carta._resultado_activar_pnj.hasta);
      }
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
    } else if (ef.tipo === 'mover_todos_hacia') {
      // Pre-calcular un paso hacia el destino para cada PNJ activo
      const conexiones = typeof getConexionesDistribucion === 'function' ? getConexionesDistribucion() : [];
      const destino = ef.destino;
      // BFS desde destino para calcular distancias
      const dist = {}; const cola = [destino]; dist[destino] = 0;
      while (cola.length) {
        const curr = cola.shift();
        conexiones.forEach(c => {
          const v = c.desde === curr ? c.hasta : c.hasta === curr ? c.desde : null;
          if (v && dist[v] === undefined) { dist[v] = dist[curr] + 1; cola.push(v); }
        });
      }
      const getLos = id => typeof getLoseta === 'function' ? getLoseta(id) : null;
      const movs = [];
      (datosCaso?.comun?.pnj || []).forEach(pnjDef => {
        const actual = estado.pnj?.[pnjDef.id]?.loseta_actual || pnjDef.posicion_inicial;
        if (actual === destino) { movs.push({ id: pnjDef.id, nombre: pnjDef.nombre, desde: actual, hasta: null, yaEstaba: true }); return; }
        // Vecino más cercano al destino
        const vecinos = conexiones.flatMap(c => {
          if (c.desde === actual) return [c.hasta];
          if (c.hasta === actual) return [c.desde];
          return [];
        });
        vecinos.sort((a,b) => (dist[a]??99) - (dist[b]??99));
        const hasta = vecinos[0] || null;
        movs.push({ id: pnjDef.id, nombre: pnjDef.nombre, desde: actual, nomDesde: getLos(actual)?.nombre || actual, hasta, nomHasta: hasta ? (getLos(hasta)?.nombre || hasta) : null, yaEstaba: false });
      });
      carta._resultado_movimiento_general = { destino, nomDestino: getLos(destino)?.nombre || destino, movs };

    } else if (ef.tipo === 'mover_todos_hacia') {
      const r = carta._resultado_movimiento_general;
      if (r) {
        r.movs.forEach(m => {
          if (!m.yaEstaba && m.hasta) {
            if (typeof moverPNJ === 'function') moverPNJ(m.id, m.hasta);
            log.push(`${m.nombre}: ${m.nomDesde} → ${m.nomHasta}`);
          }
        });
      }
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

function aplicarCatherineInvestiga() {
  const caso_id = estado.caso_id || 'caso_1';
  const todasCartas = getCartasExploracionCaso(caso_id) || [];
  const jugadas = estado.exploraciones_jugadas || [];
  const disponibles = todasCartas.filter(c => !jugadas.includes(c.id));
  if (disponibles.length === 0) return null;
  const carta = disponibles[Math.floor(Math.random() * disponibles.length)];
  moverPNJ('catherine', carta.loseta_id);
  if (!estado.exploraciones_jugadas) estado.exploraciones_jugadas = [];
  estado.exploraciones_jugadas.push(carta.id);
  if (carta.pista_id) descubrirPista(carta.pista_id);
  guardarEstado();
  return carta;
}
