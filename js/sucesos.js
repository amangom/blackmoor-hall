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
    } else if (ef.tipo === 'pnj_nervioso_huye') {
      // PNJ con mayor sospecha (aleatorio en empate)
      const pnjId = _mayorSospecha();
      if (pnjId) {
        const pnjDef = getPNJ(pnjId);
        const conexiones = getConexionesDistribucion();
        const losetas = getLosetasDistribucion();
        const actual = estado.pnj?.[pnjId]?.loseta_actual || pnjDef?.posicion_inicial;

        // BFS para calcular distancia desde cada loseta hasta el jugador más cercano
        const jugadoresActivos = estado.jugadores.filter(j => !j.incapacitado && j.loseta_actual);
        const distDesdeJugadores = {};
        const cola = [];
        jugadoresActivos.forEach(j => {
          if (!distDesdeJugadores[j.loseta_actual]) {
            distDesdeJugadores[j.loseta_actual] = 0;
            cola.push(j.loseta_actual);
          }
        });
        while (cola.length) {
          const cur = cola.shift();
          const vecinos = conexiones
            .filter(c => c.desde === cur || c.hasta === cur)
            .map(c => c.desde === cur ? c.hasta : c.desde);
          vecinos.forEach(v => {
            if (distDesdeJugadores[v] == null) {
              distDesdeJugadores[v] = distDesdeJugadores[cur] + 1;
              cola.push(v);
            }
          });
        }

        // Losetas accesibles desde la posición actual del PNJ (adyacentes, no cerradas)
        const vecinos = conexiones
          .filter(c => c.desde === actual || c.hasta === actual)
          .map(c => c.desde === actual ? c.hasta : c.desde)
          .filter(id => !isCerrada(id));

        // Elegir la más alejada del jugador más cercano
        let maxDist = -1;
        vecinos.forEach(id => {
          const d = distDesdeJugadores[id] ?? 99;
          if (d > maxDist) maxDist = d;
        });
        const candidatas = vecinos.filter(id => (distDesdeJugadores[id] ?? 99) === maxDist);
        const destino = candidatas.length ? candidatas[Math.floor(Math.random() * candidatas.length)] : null;

        const getLos = id => losetas.find(l => l.id === id);
        carta._resultado_pnj_nervioso = {
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
      const destino = ef.destino;
      const conexiones = getConexionesDistribucion();
      const losetas = getLosetasDistribucion();
      const getLos = id => losetas.find(l => l.id === id);
      const movimientos = [];
      datosCaso?.comun?.pnj?.forEach(p => {
        if (estado.pnj?.[p.id]?.retirado) return;
        const actual = estado.pnj?.[p.id]?.loseta_actual || p.posicion_inicial;
        if (actual === destino) return;
        // BFS para encontrar siguiente paso hacia destino
        const visitado = { [actual]: null };
        const cola = [actual];
        while (cola.length) {
          const cur = cola.shift();
          if (cur === destino) break;
          conexiones.filter(c => c.desde === cur || c.hasta === cur)
            .map(c => c.desde === cur ? c.hasta : c.desde)
            .forEach(v => { if (!visitado.hasOwnProperty(v)) { visitado[v] = cur; cola.push(v); } });
        }
        // Reconstruir primer paso
        let paso = destino;
        while (visitado[paso] !== actual && visitado[paso] !== null) paso = visitado[paso];
        if (visitado[paso] === actual) {
          movimientos.push({ pnjId: p.id, pnjNombre: p.nombre, desde: actual, hasta: paso, nomDesde: getLos(actual)?.nombre || actual, nomHasta: getLos(paso)?.nombre || paso });
        }
      });
      carta._resultado_movimiento_general = movimientos;

    } else if (ef.tipo === 'sospecha_cruzada') {
      const pnjsActivos = datosCaso?.comun?.pnj?.filter(p => !estado.pnj?.[p.id]?.retirado) || [];
      if (pnjsActivos.length >= 2) {
        let maxS = -1, minS = 99;
        pnjsActivos.forEach(p => {
          const s = estado.pnj?.[p.id]?.sospecha || 0;
          if (s > maxS) maxS = s;
          if (s < minS) minS = s;
        });
        const acusadores = pnjsActivos.filter(p => (estado.pnj?.[p.id]?.sospecha || 0) === maxS);
        const acusados   = pnjsActivos.filter(p => (estado.pnj?.[p.id]?.sospecha || 0) === minS && !acusadores.includes(p));
        const acusador = acusadores[Math.floor(Math.random() * acusadores.length)];
        const acusado  = acusados.length ? acusados[Math.floor(Math.random() * acusados.length)] : pnjsActivos.find(p => p !== acusador);
        carta._resultado_sospecha_cruzada = { acusadorId: acusador?.id, acusadoId: acusado?.id };
      }

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
      const condAlerta = ef.condicion_alerta_min || 8;
      if ((estado.alerta || 0) >= condAlerta) {
        const pnjsActivos = datosCaso?.comun?.pnj?.filter(p => !estado.pnj?.[p.id]?.retirado) || [];
        let minS = 99;
        pnjsActivos.forEach(p => { const s = estado.pnj?.[p.id]?.sospecha || 0; if (s < minS) minS = s; });
        const cands = pnjsActivos.filter(p => (estado.pnj?.[p.id]?.sospecha || 0) === minS);
        const pnjElegido = cands[Math.floor(Math.random() * cands.length)];
        let minTEM = 99;
        estado.jugadores.forEach(j => { const t = j.atributos?.TEM || 0; if (t < minTEM) minTEM = t; });
        const jugsCands = estado.jugadores.filter(j => (j.atributos?.TEM || 0) === minTEM);
        const jugElegido = jugsCands[Math.floor(Math.random() * jugsCands.length)];
        const jugIdx = estado.jugadores.indexOf(jugElegido);
        const pjNom = (typeof PERSONAJES !== 'undefined' ? PERSONAJES[jugElegido?.personaje]?.nombre : null) || jugElegido?.personaje || '';
        carta._resultado_ultimo_recurso = { activa: true, pnjId: pnjElegido?.id, pnjNombre: pnjElegido?.nombre || '', pjIdx: jugIdx, pjNombre: pjNom, losetaId: jugElegido?.loseta_actual };
      } else {
        carta._resultado_ultimo_recurso = { activa: false };
      }

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
    } else if (ef.tipo === 'robar_carta_resolucion_todos') {
      carta._resultado_momento_claridad = true;

    } else if (ef.tipo === 'destruir_carta_exploracion') {
      const losetas = getLosetasDistribucion();
      const jugadas = estado.exploraciones_jugadas || [];
      const pnjsPos = {};
      datosCaso?.comun?.pnj?.forEach(p => {
        const pos = estado.pnj?.[p.id]?.loseta_actual || p.posicion_inicial;
        if (!pnjsPos[pos]) pnjsPos[pos] = 0;
        pnjsPos[pos]++;
      });
      const jugadoresPos = {};
      estado.jugadores?.forEach(j => {
        if (!jugadoresPos[j.loseta_actual]) jugadoresPos[j.loseta_actual] = 0;
        jugadoresPos[j.loseta_actual]++;
      });
      const candidatas = losetas.filter(l =>
        !pnjsPos[l.id] && !jugadoresPos[l.id]
      );
      let cartaElegida = null;
      if (candidatas.length) {
        const elegida = candidatas[Math.floor(Math.random() * candidatas.length)];
        const cartasLoseta = (typeof getCartasExploracionCaso === 'function'
          ? getCartasExploracionCaso(estado.caso_id)
          : []).filter(c => c.loseta_id === elegida.id && !jugadas.includes(c.id));
        cartasLoseta.sort((a, b) => (a.numero || 0) - (b.numero || 0));
        if (cartasLoseta.length) {
          cartaElegida = cartasLoseta[0];
          carta._resultado_destruir_carta = {
            cartaId: cartaElegida.id,
            numero: cartaElegida.numero || '?',
            losetaId: elegida.id,
            losetaNom: getNombreConArticulo(elegida.id)
          };
        }
      }
      if (!cartaElegida) carta._resultado_destruir_carta = null;

    } else if (ef.tipo === 'carta_resolucion_todos') {
      carta._resultado_carta_resolucion = { valor: ef.valor };

    } else if (ef.tipo === 'bloquear_losetas_pnj_alta_sospecha') {
      const umbral = ef.umbral_sospecha || 3;
      const losetasBloqueadas = [];
      datosCaso?.comun?.pnj?.forEach(p => {
        const sosp = estado.pnj?.[p.id]?.sospecha || 0;
        if (sosp >= umbral) {
          const pos = estado.pnj?.[p.id]?.loseta_actual || p.posicion_inicial;
          if (pos && !losetasBloqueadas.includes(pos)) losetasBloqueadas.push(pos);
        }
      });
      carta._resultado_bloqueo_nervios = losetasBloqueadas;

    } else if (ef.tipo === 'buff_interrogacion') {
      // Sin resultado visual adicional necesario — el texto narrativo es fijo

    } else if (ef.tipo === 'rumores_oscuridad' || carta.id === 'rumores_en_la_oscuridad') {
      const pnjsActivos = datosCaso?.comun?.pnj?.filter(p => !estado.pnj?.[p.id]?.retirado) || [];
      if (pnjsActivos.length >= 1) {
        let maxS = -1;
        pnjsActivos.forEach(p => { const s = estado.pnj?.[p.id]?.sospecha || 0; if (s > maxS) maxS = s; });
        const candidatos = pnjsActivos.filter(p => (estado.pnj?.[p.id]?.sospecha || 0) === maxS);
        const acusador = candidatos[Math.floor(Math.random() * candidatos.length)];
        const conexiones = getConexionesDistribucion();
        const losetas = getLosetasDistribucion();
        const getLos = id => losetas.find(l => l.id === id);
        // Buscar loseta con otro PNJ
        const losetasConPNJ = {};
        pnjsActivos.forEach(p => {
          if (p.id === acusador.id) return;
          const pos = estado.pnj?.[p.id]?.loseta_actual || p.posicion_inicial;
          if (!losetasConPNJ[pos]) losetasConPNJ[pos] = [];
          losetasConPNJ[pos].push(p);
        });
        const actual = estado.pnj?.[acusador.id]?.loseta_actual || acusador.posicion_inicial;
        const vecinos = conexiones.filter(c => c.desde === actual || c.hasta === actual).map(c => c.desde === actual ? c.hasta : c.desde);
        const destinosConPNJ = vecinos.filter(id => losetasConPNJ[id]);
        let destino, acusadoPNJ;
        if (destinosConPNJ.length) {
          destino = destinosConPNJ[Math.floor(Math.random() * destinosConPNJ.length)];
          acusadoPNJ = losetasConPNJ[destino][Math.floor(Math.random() * losetasConPNJ[destino].length)];
        } else {
          destino = vecinos.length ? vecinos[Math.floor(Math.random() * vecinos.length)] : actual;
          acusadoPNJ = pnjsActivos.find(p => p.id !== acusador.id);
        }
        const sospAcusado = estado.pnj?.[acusadoPNJ?.id]?.sospecha || 0;
        carta._resultado_rumores_oscuridad = {
          acusadorId: acusador.id, acusadorNom: acusador.nombre,
          acusadoId: acusadoPNJ?.id, acusadoNom: acusadoPNJ?.nombre || '',
          hasta: destino, nomHasta: getLos(destino)?.nombre || destino,
          alerta: sospAcusado >= 2
        };
      }

    } else if (ef.tipo === 'sospecha_bajar' && carta.id === 'confesion_parcial') {
      const pnjsActivos = datosCaso?.comun?.pnj?.filter(p => !estado.pnj?.[p.id]?.retirado) || [];
      const elegible = pnjsActivos.filter(p => (estado.pnj?.[p.id]?.sospecha || 0) >= 3);
      if (elegible.length) {
        let maxS = Math.max(...elegible.map(p => estado.pnj?.[p.id]?.sospecha || 0));
        const cands = elegible.filter(p => (estado.pnj?.[p.id]?.sospecha || 0) === maxS);
        const elegido = cands[Math.floor(Math.random() * cands.length)];
        carta._resultado_confesion_parcial = { pnjId: elegido.id, pnjNombre: elegido.nombre };
      } else {
        carta._resultado_confesion_parcial = { pnjId: null };
      }

    } else if (ef.tipo === 'dificultad_exploracion_global') {
      const hayCartas = (typeof getCartasExploracionCaso === 'function'
        ? getCartasExploracionCaso(estado.caso_id) : [])
        .some(c => !(estado.exploraciones_jugadas || []).includes(c.id));
      carta._resultado_evidencia_alterada = hayCartas;
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
      const r = carta._resultado_sospecha_cruzada;
      if (r?.acusadoId) subirSospecha(r.acusadoId, 1);

    } else if (ef.tipo === 'pnj_huida_mayor_sospecha') {
      const r = carta._resultado_huida;
      if (r?.pnjId && r.destino) {
        if (typeof moverPNJ === 'function') moverPNJ(r.pnjId, r.destino);
        log.push(`${r.pnjNombre} huye a ${r.nomDestino}`);
      }

    } else if (ef.tipo === 'dificultad_exploracion_global') {
      if (carta._resultado_evidencia_alterada) {
        if (!estado.modificadores_exploracion) estado.modificadores_exploracion = [];
        estado.modificadores_exploracion.push({ valor: ef.valor, expira_ronda: estado.ronda + 1 });
        guardarEstado();
      }

    } else if (ef.tipo === 'ayuda_pnj_menor_sospecha') {
      const r = carta._resultado_ultimo_recurso;
      if (r?.activa && r.pnjId && r.losetaId) {
        moverPNJ(r.pnjId, r.losetaId);
        if (!estado.buffs_interrogacion) estado.buffs_interrogacion = [];
        estado.buffs_interrogacion.push({ pnj: null, atributo: null, mod_dif: -1, expira_ronda: estado.ronda + 2, jugIdx: r.pjIdx, tipo: 'ayuda_pnj' });
        guardarEstado();
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
    } else if (ef.tipo === 'pnj_nervioso_huye') {
      const r = carta._resultado_pnj_nervioso;
      if (r?.pnjId) {
        subirSospecha(r.pnjId, 1);
        if (r.hasta) moverPNJ(r.pnjId, r.hasta);
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
      (carta._resultado_movimiento_general || []).forEach(m => moverPNJ(m.pnjId, m.hasta));
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
    } else if (ef.tipo === 'robar_carta_resolucion_todos') {
      // Solo notificación — los jugadores roban físicamente
      if (typeof registrarCambio === 'function') {
        registrarCambio('info', { lineas: ['Todos los jugadores roban 1 carta de Resolución.'] });
      }

    } else if (ef.tipo === 'destruir_carta_exploracion') {
      const r = carta._resultado_destruir_carta;
      if (r?.cartaId) {
        if (!estado.exploraciones_jugadas) estado.exploraciones_jugadas = [];
        estado.exploraciones_jugadas.push(r.cartaId);
        guardarEstado();
      }

    } else if (ef.tipo === 'carta_resolucion_todos') {
      if (typeof registrarCambio === 'function') {
        registrarCambio('info', { lineas: ['Todos los jugadores descartan 1 carta de Resolución al azar.'] });
      }

    } else if (ef.tipo === 'bloquear_losetas_pnj_alta_sospecha') {
      const losetas = carta._resultado_bloqueo_nervios || [];
      losetas.forEach(id => {
        if (typeof bloquearLoseta === 'function') {
          bloquearLoseta(id, estado.ronda + 1, 'Nervios');
        }
      });
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
