// ── EXPLORACION.JS — gestión de cartas de exploración ────────────────────────

var _cartasExpl = null;  // cache por caso

// Cartas embebidas directamente para evitar problemas de fetch/caché
const _CARTAS_DATOS = {
  'caso_1': {"caso_id": "caso_1", "cartas": [{"id": "c1_expl_1", "numero": 1, "reverso": "Despacho — 1", "loseta_nombre": "Despacho", "loseta_id": "despacho", "titulo": "Botón de puño", "pista_id": "pista_1", "pista_nombre": "Botón de puño", "atributo": "INT", "dificultad": 3, "nota_especial": "", "exito": {"texto": "Obtén Pista #1", "efectos": [{"tipo": "pista_descubierta", "valor": "pista_1"}]}, "critico": {"texto": "Pista #1 y −2 dif interpretar", "efectos": [{"tipo": "pista_descubierta", "valor": "pista_1"}, {"tipo": "bonus_interpretacion", "valor": -2}]}, "fracaso": {"texto": "No distingues las iniciales", "efectos": []}, "pifia": {"texto": "−1 TEM", "efectos": [{"tipo": "atributo", "attr": "TEM", "valor": -1}]}}, {"id": "c1_expl_2", "numero": 2, "reverso": "Despacho — 2", "loseta_nombre": "Despacho", "loseta_id": "despacho", "titulo": "La segunda copa", "pista_id": "pista_9", "pista_nombre": "La segunda copa", "atributo": "INT", "dificultad": 3, "nota_especial": "", "exito": {"texto": "Obtén Pista #9", "efectos": [{"tipo": "pista_descubierta", "valor": "pista_9"}]}, "critico": {"texto": "Pista #9 y −2 dif", "efectos": [{"tipo": "pista_descubierta", "valor": "pista_9"}, {"tipo": "bonus_interpretacion", "valor": -2}]}, "fracaso": {"texto": "Solo ves cristales rotos", "efectos": []}, "pifia": {"texto": "+1 Alerta", "efectos": [{"tipo": "alerta", "valor": 1}]}}, {"id": "c1_expl_3", "numero": 3, "reverso": "Despacho — 3", "loseta_nombre": "Despacho", "loseta_id": "despacho", "titulo": "Documento en el escritorio", "pista_id": "pista_3", "pista_nombre": "Documento en el escritorio", "atributo": "INT", "dificultad": 4, "nota_especial": "", "exito": {"texto": "Obtén Pista #3", "efectos": [{"tipo": "pista_descubierta", "valor": "pista_3"}]}, "critico": {"texto": "Pista #3 y −2 dif interpretar", "efectos": [{"tipo": "pista_descubierta", "valor": "pista_3"}, {"tipo": "bonus_interpretacion", "valor": -2}]}, "fracaso": {"texto": "Solo ves sellos oficiales", "efectos": []}, "pifia": {"texto": "+1 Alerta", "efectos": [{"tipo": "alerta", "valor": 1}]}}, {"id": "c1_expl_4", "numero": 4, "reverso": "Despacho — 4", "loseta_nombre": "Despacho", "loseta_id": "despacho", "titulo": "Marcas en la puerta", "pista_id": "pista_12", "pista_nombre": "Marcas en la puerta", "atributo": "INT", "dificultad": 4, "nota_especial": "", "exito": {"texto": "Obtén Pista #12", "efectos": [{"tipo": "pista_descubierta", "valor": "pista_12"}]}, "critico": {"texto": "Pista #12 y −2 dif interpretar", "efectos": [{"tipo": "pista_descubierta", "valor": "pista_12"}, {"tipo": "bonus_interpretacion", "valor": -2}]}, "fracaso": {"texto": "No notas nada", "efectos": []}, "pifia": {"texto": "+1 Alerta", "efectos": [{"tipo": "alerta", "valor": 1}]}}, {"id": "c1_expl_5", "numero": 5, "reverso": "Cocina — 1", "loseta_nombre": "Cocina", "loseta_id": "cocina", "titulo": "Plantas junto a la despensa", "pista_id": "pista_2", "pista_nombre": "Plantas junto a la despensa", "atributo": "INT", "dificultad": 4, "nota_especial": "Doctor: dif. 2", "exito": {"texto": "Obtén Pista #2", "efectos": [{"tipo": "pista_descubierta", "valor": "pista_2"}]}, "critico": {"texto": "Pista #2 y −2 dif interpretar", "efectos": [{"tipo": "pista_descubierta", "valor": "pista_2"}, {"tipo": "bonus_interpretacion", "valor": -2}]}, "fracaso": {"texto": "+1 Sospecha Pemberton", "efectos": [{"tipo": "sospecha_pnj", "pnj": "pemberton", "valor": 1}]}, "pifia": {"texto": "+1 Alerta y +1 Sospecha Pemberton", "efectos": [{"tipo": "alerta", "valor": 1}, {"tipo": "sospecha_pnj", "pnj": "pemberton", "valor": 1}]}}, {"id": "c1_expl_6", "numero": 6, "reverso": "Despacho — 5", "loseta_nombre": "Despacho", "loseta_id": "despacho", "titulo": "Frasco vacío", "pista_id": "pista_10", "pista_nombre": "Frasco vacío", "atributo": "INT", "dificultad": 4, "nota_especial": "", "exito": {"texto": "Obtén Pista #10", "efectos": [{"tipo": "pista_descubierta", "valor": "pista_10"}]}, "critico": {"texto": "Pista #10 y −2 dif interpretar", "efectos": [{"tipo": "pista_descubierta", "valor": "pista_10"}, {"tipo": "bonus_interpretacion", "valor": -2}]}, "fracaso": {"texto": "+1 Alerta", "efectos": [{"tipo": "alerta", "valor": 1}]}, "pifia": {"texto": "+1 Alerta y −1 TEM", "efectos": [{"tipo": "alerta", "valor": 1}, {"tipo": "atributo", "attr": "TEM", "valor": -1}]}}, {"id": "c1_expl_7", "numero": 7, "reverso": "Biblioteca — 1", "loseta_nombre": "Biblioteca", "loseta_id": "biblioteca", "titulo": "Cartas en la Biblioteca", "pista_id": "pista_4", "pista_nombre": "Cartas en la Biblioteca", "atributo": "INT", "dificultad": 4, "nota_especial": "", "exito": {"texto": "Obtén Pista #4", "efectos": [{"tipo": "pista_descubierta", "valor": "pista_4"}]}, "critico": {"texto": "Pista #4 y −2 dif interpretar", "efectos": [{"tipo": "pista_descubierta", "valor": "pista_4"}, {"tipo": "bonus_interpretacion", "valor": -2}]}, "fracaso": {"texto": "+1 Alerta (ruido)", "efectos": [{"tipo": "alerta", "valor": 1}]}, "pifia": {"texto": "+1 Alerta y −1 Temple", "efectos": [{"tipo": "alerta", "valor": 1}, {"tipo": "atributo", "attr": "TEM", "valor": -1}]}}, {"id": "c1_expl_8", "numero": 8, "reverso": "Capilla — 1", "loseta_nombre": "Capilla", "loseta_id": "capilla", "titulo": "Certificado en la Capilla", "pista_id": "pista_5", "pista_nombre": "Certificado en la Capilla", "atributo": "INT", "dificultad": 4, "nota_especial": "Doctor: automático", "exito": {"texto": "Obtén Pista #5", "efectos": [{"tipo": "pista_descubierta", "valor": "pista_5"}]}, "critico": {"texto": "Pista #5 y −2 dif interpretar", "efectos": [{"tipo": "pista_descubierta", "valor": "pista_5"}, {"tipo": "bonus_interpretacion", "valor": -2}]}, "fracaso": {"texto": "No encuentras nada", "efectos": []}, "pifia": {"texto": "−1 TEM", "efectos": [{"tipo": "atributo", "attr": "TEM", "valor": -1}]}}, {"id": "c1_expl_9", "numero": 9, "reverso": "Biblioteca — 2", "loseta_nombre": "Biblioteca", "loseta_id": "biblioteca", "titulo": "Cuaderno oculto", "pista_id": "pista_6", "pista_nombre": "Cuaderno oculto", "atributo": "INT", "dificultad": 5, "nota_especial": "", "exito": {"texto": "Obtén Pista #6", "efectos": [{"tipo": "pista_descubierta", "valor": "pista_6"}]}, "critico": {"texto": "Pista #6 y −2 dif interpretar", "efectos": [{"tipo": "pista_descubierta", "valor": "pista_6"}, {"tipo": "bonus_interpretacion", "valor": -2}]}, "fracaso": {"texto": "+1 Alerta", "efectos": [{"tipo": "alerta", "valor": 1}]}, "pifia": {"texto": "+1 Alerta y −1 TEM", "efectos": [{"tipo": "alerta", "valor": 1}, {"tipo": "atributo", "attr": "TEM", "valor": -1}]}}, {"id": "c1_expl_10", "numero": 10, "reverso": "Capilla — 2", "loseta_nombre": "Capilla", "loseta_id": "capilla", "titulo": "Nota en la Capilla", "pista_id": "pista_7", "pista_nombre": "Nota en la Capilla", "atributo": "TEM", "dificultad": 4, "nota_especial": "", "exito": {"texto": "Obtén Pista #7", "efectos": [{"tipo": "pista_descubierta", "valor": "pista_7"}]}, "critico": {"texto": "Pista #7 y −2 dif interpretar", "efectos": [{"tipo": "pista_descubierta", "valor": "pista_7"}, {"tipo": "bonus_interpretacion", "valor": -2}]}, "fracaso": {"texto": "Whitfield interviene: −1 TEM", "efectos": [{"tipo": "atributo", "attr": "TEM", "valor": -1}]}, "pifia": {"texto": "+1 Sospecha Whitfield", "efectos": [{"tipo": "sospecha_pnj", "pnj": "whitfield", "valor": 1}]}}, {"id": "c1_expl_11", "numero": 11, "reverso": "Despacho — 6", "loseta_nombre": "Despacho", "loseta_id": "despacho", "titulo": "Informe de auditoría", "pista_id": "pista_8", "pista_nombre": "Informe de auditoría", "atributo": "INT", "dificultad": 5, "nota_especial": "", "exito": {"texto": "Obtén Pista #8", "efectos": [{"tipo": "pista_descubierta", "valor": "pista_8"}]}, "critico": {"texto": "Pista #8 y −2 dif interpretar", "efectos": [{"tipo": "pista_descubierta", "valor": "pista_8"}, {"tipo": "bonus_interpretacion", "valor": -2}]}, "fracaso": {"texto": "Cajón cerrado", "efectos": []}, "pifia": {"texto": "+1 Alerta", "efectos": [{"tipo": "alerta", "valor": 1}]}}, {"id": "c1_expl_12", "numero": 12, "reverso": "Hab. del Servicio — 1", "loseta_nombre": "Hab. del Servicio", "loseta_id": "hab_servicio", "titulo": "Correspondencia", "pista_id": "pista_11", "pista_nombre": "Correspondencia", "atributo": "INT", "dificultad": 5, "nota_especial": "", "exito": {"texto": "Obtén Pista #11", "efectos": [{"tipo": "pista_descubierta", "valor": "pista_11"}]}, "critico": {"texto": "Pista #11 y −2 dif interpretar", "efectos": [{"tipo": "pista_descubierta", "valor": "pista_11"}, {"tipo": "bonus_interpretacion", "valor": -2}]}, "fracaso": {"texto": "+1 Alerta", "efectos": [{"tipo": "alerta", "valor": 1}]}, "pifia": {"texto": "+1 Alerta y +1 Sospecha Pemberton", "efectos": [{"tipo": "alerta", "valor": 1}, {"tipo": "sospecha_pnj", "pnj": "pemberton", "valor": 1}]}}, {"id": "c1_expl_13", "numero": 13, "reverso": "Hab. de Invitados — 1", "loseta_nombre": "Hab. de Invitados", "loseta_id": "hab_invitados", "titulo": "Póliza de seguro", "pista_id": "pista_13", "pista_nombre": "Póliza de seguro", "atributo": "INT", "dificultad": 4, "nota_especial": "", "exito": {"texto": "Obtén Pista #13", "efectos": [{"tipo": "pista_descubierta", "valor": "pista_13"}]}, "critico": {"texto": "Pista #13 y −2 dif interpretar", "efectos": [{"tipo": "pista_descubierta", "valor": "pista_13"}, {"tipo": "bonus_interpretacion", "valor": -2}]}, "fracaso": {"texto": "+1 Alerta", "efectos": [{"tipo": "alerta", "valor": 1}]}, "pifia": {"texto": "+1 Alerta y −1 Temple", "efectos": [{"tipo": "alerta", "valor": 1}, {"tipo": "atributo", "attr": "TEM", "valor": -1}]}}, {"id": "c1_expl_14", "numero": 14, "reverso": "Salón Principal — 1", "loseta_nombre": "Salón Principal", "loseta_id": "salon_principal", "titulo": "Manchas en el mantel", "pista_id": null, "pista_nombre": null, "atributo": "INT", "dificultad": 4, "nota_especial": "", "exito": {"texto": "Cada jugador en la loseta obtiene +1 carta de Resolución", "efectos": [{"tipo": "carta_resolucion", "valor": 1}]}, "critico": {"texto": "+1 carta de Resolución y +1 TEM", "efectos": [{"tipo": "atributo", "attr": "TEM", "valor": 1}, {"tipo": "carta_resolucion", "valor": 1}]}, "fracaso": {"texto": "No notas nada útil", "efectos": []}, "pifia": {"texto": "+1 Alerta", "efectos": [{"tipo": "alerta", "valor": 1}]}}, {"id": "c1_expl_15", "numero": 15, "reverso": "Vestíbulo — 2", "loseta_nombre": "Vestíbulo", "loseta_id": "vestibulo", "titulo": "Registro del perchero", "pista_id": null, "pista_nombre": null, "atributo": "INT", "dificultad": 3, "nota_especial": "", "exito": {"texto": "+1 carta de Resolución", "efectos": [{"tipo": "carta_resolucion", "valor": 1}]}, "critico": {"texto": "+1 carta de Resolución y -1 Sospecha Hobbes", "efectos": [{"tipo": "carta_resolucion", "valor": 1}, {"tipo": "sospecha_pnj", "pnj": "hobbes", "valor": -1}]}, "fracaso": {"texto": "Solo abrigos y paraguas", "efectos": []}, "pifia": {"texto": "−1 TEM", "efectos": [{"tipo": "atributo", "attr": "TEM", "valor": -1}]}}, {"id": "c1_expl_16", "numero": 16, "reverso": "Salón de Música — 1", "loseta_nombre": "Salón de Música", "loseta_id": "salon_musica", "titulo": "Partitura con anotaciones", "pista_id": null, "pista_nombre": null, "atributo": "INT", "dificultad": 4, "nota_especial": "", "exito": {"texto": "+1 carta de Resolución", "efectos": [{"tipo": "carta_resolucion", "valor": 1}]}, "critico": {"texto": "+1 carta de Resolución y +1 TEM", "efectos": [{"tipo": "atributo", "attr": "TEM", "valor": 1}, {"tipo": "carta_resolucion", "valor": 1}]}, "fracaso": {"texto": "Solo notas musicales", "efectos": []}, "pifia": {"texto": "+1 Alerta", "efectos": [{"tipo": "alerta", "valor": 1}]}}, {"id": "c1_expl_17", "numero": 17, "reverso": "Galería de Retratos — 1", "loseta_nombre": "Galería de Retratos", "loseta_id": "galeria_retratos", "titulo": "Retrato de Eleanor", "pista_id": null, "pista_nombre": null, "atributo": "TEM", "dificultad": 4, "nota_especial": "", "exito": {"texto": "+1 carta de Resolución + 1 TEM", "efectos": [{"tipo": "carta_resolucion", "valor": 1}]}, "critico": {"texto": "+2 cartas de Resolución y +1 TEM", "efectos": [{"tipo": "atributo", "attr": "TEM", "valor": 1}, {"tipo": "carta_resolucion", "valor": 2}]}, "fracaso": {"texto": "−1 TEM (la mirada te perturba)", "efectos": [{"tipo": "atributo", "attr": "TEM", "valor": -1}]}, "pifia": {"texto": "−2 TEM", "efectos": [{"tipo": "atributo", "attr": "TEM", "valor": -2}]}}, {"id": "c1_expl_18", "numero": 18, "reverso": "Jardín — 1", "loseta_nombre": "Jardín", "loseta_id": "jardin", "titulo": "Huellas en el barro", "pista_id": null, "pista_nombre": null, "atributo": "FOR", "dificultad": 4, "nota_especial": "", "exito": {"texto": "+1 FOR", "efectos": [{"tipo": "atributo", "attr": "FOR", "valor": 1}]}, "critico": {"texto": "+1 FOR y −1 Alerta", "efectos": [{"tipo": "alerta", "valor": -1}, {"tipo": "atributo", "attr": "FOR", "valor": 1}]}, "fracaso": {"texto": "−1 FOR (empapado)", "efectos": [{"tipo": "atributo", "attr": "FOR", "valor": -1}]}, "pifia": {"texto": "−1 FOR y +1 Alerta", "efectos": [{"tipo": "alerta", "valor": 1}, {"tipo": "atributo", "attr": "FOR", "valor": -1}]}}, {"id": "c1_expl_19", "numero": 19, "reverso": "Cobertizo — 1", "loseta_nombre": "Cobertizo", "loseta_id": "cobertizo", "titulo": "Estante desordenado", "pista_id": null, "pista_nombre": null, "atributo": "INT", "dificultad": 3, "nota_especial": "", "exito": {"texto": "+1 Herramientas", "efectos": [{"tipo": "herramienta", "valor": 1}]}, "critico": {"texto": "+1 Herramientas y −1 Alerta", "efectos": [{"tipo": "alerta", "valor": -1}, {"tipo": "herramienta", "valor": 1}]}, "fracaso": {"texto": "Solo herramientas viejas", "efectos": []}, "pifia": {"texto": "+1 Alerta", "efectos": [{"tipo": "alerta", "valor": 1}]}}, {"id": "c1_expl_20", "numero": 20, "reverso": "Sótano — 1", "loseta_nombre": "Sótano", "loseta_id": "sotano", "titulo": "Caja olvidada", "pista_id": null, "pista_nombre": null, "atributo": "FOR", "dificultad": 4, "nota_especial": "", "exito": {"texto": "+2 cartas de Resolución", "efectos": [{"tipo": "carta_resolucion", "valor": 2}]}, "critico": {"texto": "+2 cartas de Resolución y +1 FOR", "efectos": [{"tipo": "atributo", "attr": "FOR", "valor": 1}, {"tipo": "carta_resolucion", "valor": 2}]}, "fracaso": {"texto": "Demasiado pesada", "efectos": []}, "pifia": {"texto": "−1 FOR", "efectos": [{"tipo": "atributo", "attr": "FOR", "valor": -1}]}}, {"id": "c1_expl_21", "numero": 21, "reverso": "Pasadizos — 1", "loseta_nombre": "Pasadizos", "loseta_id": "pasadizos", "titulo": "Pisadas en el polvo", "pista_id": null, "pista_nombre": null, "atributo": "FOR", "dificultad": 4, "nota_especial": "", "exito": {"texto": "−1 Alerta y Robar 1 carta de Resolución", "efectos": [{"tipo": "alerta", "valor": -1}]}, "critico": {"texto": "Además, +1 Fortaleza", "efectos": []}, "fracaso": {"texto": "−1 FOR (tropiezas)", "efectos": [{"tipo": "atributo", "attr": "FOR", "valor": -1}]}, "pifia": {"texto": "−1 FOR y +1 Alerta", "efectos": [{"tipo": "alerta", "valor": 1}, {"tipo": "atributo", "attr": "FOR", "valor": -1}]}}, {"id": "c1_expl_22", "numero": 22, "reverso": "Vestíbulo — 1", "loseta_nombre": "Vestíbulo", "loseta_id": "vestibulo", "titulo": "Llavero del mayordomo", "pista_id": null, "pista_nombre": null, "atributo": "INT", "dificultad": 4, "nota_especial": "", "exito": {"texto": "+1 Llave", "efectos": [{"tipo": "llave", "valor": 1}]}, "critico": {"texto": "+1 Llave y +1 carta de Resolución", "efectos": [{"tipo": "carta_resolucion", "valor": 1}, {"tipo": "llave", "valor": 1}]}, "fracaso": {"texto": "No encuentras nada útil", "efectos": []}, "pifia": {"texto": "+1 Alerta", "efectos": [{"tipo": "alerta", "valor": 1}]}}]}
};

async function cargarCartasExploracion(caso_id) {
  if (_cartasExpl?.caso_id === caso_id) return _cartasExpl;
  if (_CARTAS_DATOS[caso_id]) {
    _cartasExpl = _CARTAS_DATOS[caso_id];
  } else {
    try {
      const r = await fetch(`data/cartas_exploracion_${caso_id}.json`);
      _cartasExpl = await r.json();
    } catch(e) {
      _cartasExpl = { caso_id, cartas: [] };
    }
  }
  return _cartasExpl;
}

// Devuelve las cartas disponibles para una loseta (no jugadas aún)
function getCartasDisponibles(losetaId) {
  if (!_cartasExpl) return [];
  const jugadas = estado.exploraciones_jugadas || [];
  return _cartasExpl.cartas.filter(c =>
    c.loseta_id === losetaId && !jugadas.includes(c.id)
  );
}

// Aplica los efectos de un resultado al estado
function aplicarEfectosExploracion(efectos, jugIdx, motivoBase, pistaBonusId) {
  const log = [];
  const j = estado.jugadores[jugIdx];
  const motivo = motivoBase || 'Exploración';

  for (const ef of efectos) {
    switch (ef.tipo) {
      case 'pista_descubierta':
        if (!(estado.pistas_descubiertas || []).includes(ef.valor)) {
          if (!estado.pistas_descubiertas) estado.pistas_descubiertas = [];
          estado.pistas_descubiertas.push(ef.valor);
          // Formatear: "pista_1" → "Pista 1 — Botón de puño"
          const numPista = ef.valor.replace('pista_', '');
          const nombrePista = (() => {
            const cartas = _cartasExpl?.cartas || [];
            const c = cartas.find(c => c.pista_id === ef.valor);
            return c?.pista_nombre || null;
          })();
          const labelPista = nombrePista
            ? `Pista ${numPista} — ${nombrePista}`
            : `Pista ${numPista}`;
          log.push(`Habéis encontrado: ${labelPista}`);
        }
        break;
      case 'bonus_interpretacion':
        if (!estado.bonus_interpretacion) estado.bonus_interpretacion = {};
        if (pistaBonusId) {
          estado.bonus_interpretacion[pistaBonusId] = (estado.bonus_interpretacion[pistaBonusId] || 0) + ef.valor;
          log.push(`★ El hallazgo es tan claro que será más fácil interpretarlo`);
        }
        break;
      case 'alerta':
        if (ef.valor > 0 && typeof subirAlerta === 'function') subirAlerta(ef.valor, motivo);
        else if (ef.valor < 0 && typeof bajarAlerta === 'function') bajarAlerta(-ef.valor, motivo);
        break;
      case 'atributo':
        if (j?.atributos?.[ef.attr] !== undefined) {
          if (typeof modificarAtributoJugador === 'function') {
            modificarAtributoJugador(jugIdx, ef.attr, ef.valor, motivo);
          } else {
            j.atributos[ef.attr] = Math.max(0, j.atributos[ef.attr] + ef.valor);
          }
        }
        break;
      case 'sospecha_pnj':
        if (typeof subirSospecha === 'function') {
          subirSospecha(ef.pnj, ef.valor);
        } else {
          if (!estado.pnj) estado.pnj = {};
          if (!estado.pnj[ef.pnj]) estado.pnj[ef.pnj] = { sospecha: 0 };
          estado.pnj[ef.pnj].sospecha = Math.max(0, Math.min(5, (estado.pnj[ef.pnj].sospecha || 0) + ef.valor));
        }
        break;
      case 'carta_resolucion': {
        // Aplica a todos los jugadores en la misma loseta
        const losetaAct = j?.loseta_actual;
        const jugadoresPresentes = losetaAct
          ? estado.jugadores.map((jj, ii) => ({ jj, ii })).filter(({ jj }) => jj.loseta_actual === losetaAct)
          : [{ jj: j, ii: jugIdx }];
        const nombres = jugadoresPresentes.map(({ jj, ii }) => {
          const pjNom = PERSONAJES[jj.personaje]?.nombre || jj.personaje;
          jj.cartas_resolucion = (jj.cartas_resolucion || 0) + ef.valor;
          return `${pjNom} (${jj.nombre})`;
        });
        log.push(`+${ef.valor} carta${ef.valor > 1 ? 's' : ''} de Resolución → ${nombres.join(', ')}`);
        break;
      }
      case 'herramienta':
        estado.herramienta_recogida = true;
        log.push('🔧 Recogiste las herramientas');
        break;
      case 'llave':
        // La llave la lleva el jugador que la encuentra
        if (!estado.tokens_llave) estado.tokens_llave = {};
        estado.tokens_llave[jugIdx] = true;
        log.push('🔑 Llave encontrada');
        break;
    }
  }
  return log;
}
