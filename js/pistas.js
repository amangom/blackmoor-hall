// ── PISTAS.JS — métodos de interpretación y disponibilidad ──────────────────
// Datos embebidos por caso. Fuente de verdad: Cartas de Pista físicas.

// Datos embebidos directamente para evitar dependencia de fetch
const _PISTAS_EMBEBIDOS = {
  'caso_1': {
  "caso_id": "caso_1",
  "pistas": {
    "pista_1": {
      "nombre": "El botón de puño",
      "metodos": [
        {
          "id": "p1-pnj",
          "tipo": "pnj_cualquiera",
          "descripcion": "Preguntar a los PNJ quién tiene las iniciales C.M.",
          "atributo": "INT",
          "dificultad": 3
        },
        {
          "id": "p1-loseta",
          "tipo": "loseta",
          "loseta_id": "hab_invitados",
          "loseta_nombre": "Hab. de Invitados",
          "descripcion": "Buscar en la Hab. de Invitados un gemelo que haga par",
          "atributo": "INT",
          "dificultad": 1,
          "ref_libro": "§1-1H"
        },
        {
          "id": "p1-ind",
          "tipo": "individual",
          "descripcion": "Examinar el botón como joya (factura, joyero, antigüedad)",
          "atributo": "INT",
          "dificultad": 4
        }
      ]
    },
    "pista_2": {
      "nombre": "Plantas junto a la despensa",
      "metodos": [
        {
          "id": "p2-ind",
          "tipo": "individual",
          "descripcion": "Identificar la planta",
          "atributo": "INT",
          "dificultad": 5,
          "doctor_dif": 3
        },
        {
          "id": "p2-pnj",
          "tipo": "pnj",
          "pnj_id": "pemberton",
          "pnj_nombre": "Pemberton",
          "descripcion": "Preguntar a Pemberton qué plantas usa",
          "atributo": "TEM",
          "dificultad": 3,
          "efecto_adicional": {
            "tipo": "sospecha_pnj",
            "pnj": "pemberton",
            "valor": 1
          }
        },
        {
          "id": "p2-loseta",
          "tipo": "loseta",
          "loseta_id": "biblioteca",
          "loseta_nombre": "Biblioteca",
          "descripcion": "Buscar un libro de botánica en la Biblioteca",
          "atributo": "INT",
          "dificultad": 3
        }
      ]
    },
    "pista_3": {
      "nombre": "Documento en el escritorio",
      "metodos": [
        {
          "id": "p3-ind",
          "tipo": "individual",
          "descripcion": "Leer el documento completo",
          "atributo": "INT",
          "dificultad": 4
        },
        {
          "id": "p3-pnj-hobbes",
          "tipo": "pnj",
          "pnj_id": "hobbes",
          "pnj_nombre": "Hobbes",
          "descripcion": "Preguntar a Hobbes si el Lord tenía asuntos legales pendientes",
          "atributo": "TEM",
          "dificultad": 4
        },
        {
          "id": "p3-pnj-whitfield",
          "tipo": "pnj",
          "pnj_id": "whitfield",
          "pnj_nombre": "Whitfield",
          "descripcion": "Preguntar a Whitfield, confidente del Lord",
          "atributo": "TEM",
          "dificultad": 3
        }
      ]
    },
    "pista_4": {
      "nombre": "Cartas en la Biblioteca",
      "metodos": [
        {
          "id": "p4-ind",
          "tipo": "individual",
          "descripcion": "Leer las cartas (correspondencia privada)",
          "atributo": "INT",
          "dificultad": 4,
          "efecto_adicional": {
            "tipo": "alerta",
            "valor": 1
          }
        },
        {
          "id": "p4-pnj-harold",
          "tipo": "pnj",
          "pnj_id": "harold",
          "pnj_nombre": "Harold",
          "descripcion": "Preguntar a Harold directamente",
          "atributo": "TEM",
          "dificultad": 3
        },
        {
          "id": "p4-pnj-hobbes",
          "tipo": "pnj",
          "pnj_id": "hobbes",
          "pnj_nombre": "Hobbes",
          "descripcion": "Preguntar a Hobbes si conoce las finanzas de la familia",
          "atributo": "TEM",
          "dificultad": 4
        }
      ]
    },
    "pista_5": {
      "nombre": "Certificado en la Capilla",
      "metodos": [
        {
          "id": "p5-ind",
          "tipo": "individual",
          "descripcion": "Leer el certificado completo",
          "atributo": "INT",
          "dificultad": 4,
          "doctor_automatico": true
        },
        {
          "id": "p5-pnj-catherine",
          "tipo": "pnj",
          "pnj_id": "catherine",
          "pnj_nombre": "Catherine",
          "descripcion": "Preguntar a Catherine por qué hay un documento médico en la Capilla",
          "atributo": "TEM",
          "dificultad": 2
        },
        {
          "id": "p5-pnj-whitfield",
          "tipo": "pnj",
          "pnj_id": "whitfield",
          "pnj_nombre": "Whitfield",
          "descripcion": "Preguntar a Whitfield qué guarda en su misal",
          "atributo": "TEM",
          "dificultad": 3,
          "doctor_automatico": true
        }
      ]
    },
    "pista_6": {
      "nombre": "Cuaderno oculto",
      "metodos": [
        {
          "id": "p6-ind",
          "tipo": "individual",
          "descripcion": "Leer el cuaderno completo",
          "atributo": "INT",
          "dificultad": 5
        },
        {
          "id": "p6-pnj-catherine",
          "tipo": "pnj",
          "pnj_id": "catherine",
          "pnj_nombre": "Catherine",
          "descripcion": "Preguntar a Catherine si es suyo",
          "atributo": "TEM",
          "dificultad": 3,
          "dificultad_condicional": {
            "condicion": "sospecha_pnj_gte",
            "pnj": "catherine",
            "umbral": 2,
            "dificultad": 4
          }
        },
        {
          "id": "p6-ind2",
          "tipo": "individual",
          "descripcion": "Comparar la letra con otros documentos de la casa",
          "atributo": "INT",
          "dificultad": 4
        }
      ]
    },
    "pista_7": {
      "nombre": "Nota en la Capilla",
      "metodos": [
        {
          "id": "p7-pnj-whitfield",
          "tipo": "pnj",
          "pnj_id": "whitfield",
          "pnj_nombre": "Whitfield",
          "descripcion": "Preguntar a Whitfield directamente",
          "atributo": "TEM",
          "dificultad": 4,
          "dificultad_en_loseta": {
            "loseta_id": "capilla",
            "dificultad": 3
          }
        },
        {
          "id": "p7-auto",
          "tipo": "automatico",
          "descripcion": "Comparar la letra con el documento del escritorio (Pista #3)",
          "condicion_automatico": {
            "tipo": "pista_descubierta",
            "pista_id": "pista_3"
          }
        },
        {
          "id": "p7-pnj-hobbes",
          "tipo": "pnj",
          "pnj_id": "hobbes",
          "pnj_nombre": "Hobbes",
          "descripcion": "Preguntar a Hobbes quién escribía así",
          "atributo": "TEM",
          "dificultad": 3
        }
      ]
    },
    "pista_8": {
      "nombre": "Informe de auditoría",
      "metodos": [
        {
          "id": "p8-ind",
          "tipo": "individual",
          "descripcion": "Analizar las cuentas",
          "atributo": "INT",
          "dificultad": 5
        },
        {
          "id": "p8-pnj-hobbes",
          "tipo": "pnj",
          "pnj_id": "hobbes",
          "pnj_nombre": "Hobbes",
          "descripcion": "Preguntar a Hobbes si sabe de irregularidades en la casa",
          "atributo": "TEM",
          "dificultad": 4
        },
        {
          "id": "p8-pnj-pemberton",
          "tipo": "pnj",
          "pnj_id": "pemberton",
          "pnj_nombre": "Pemberton",
          "descripcion": "Confrontar a Pemberton con el cuaderno",
          "atributo": "TEM",
          "dificultad": 3,
          "efecto_adicional": {
            "tipo": "sospecha_pnj",
            "pnj": "pemberton",
            "valor": 2
          }
        }
      ]
    },
    "pista_9": {
      "nombre": "La segunda copa",
      "metodos": [
        {
          "id": "p9-ind",
          "tipo": "individual",
          "descripcion": "Analizar los restos",
          "atributo": "INT",
          "dificultad": 6,
          "doctor_dif": 4
        },
        {
          "id": "p9-pnj-pemberton",
          "tipo": "pnj",
          "pnj_id": "pemberton",
          "pnj_nombre": "Pemberton",
          "descripcion": "Preguntar a Pemberton sobre las copas de la cena",
          "atributo": "TEM",
          "dificultad": 3
        },
        {
          "id": "p9-ind2",
          "tipo": "individual",
          "descripcion": "Recoger los fragmentos y olerlos",
          "atributo": "INT",
          "dificultad": 5
        }
      ]
    },
    "pista_10": {
      "nombre": "Frasco vacío",
      "metodos": [
        {
          "id": "p10-ind",
          "tipo": "individual",
          "descripcion": "Analizar el residuo",
          "atributo": "INT",
          "dificultad": 6,
          "doctor_dif": 4
        },
        {
          "id": "p10-auto",
          "tipo": "automatico",
          "descripcion": "Comparar con las plantas (Pista #2 ya interpretada → mismo compuesto)",
          "condicion_automatico": {
            "tipo": "pista_interpretada",
            "pista_id": "pista_2"
          }
        },
        {
          "id": "p10-pnj-marsh",
          "tipo": "pnj",
          "pnj_id": "marsh",
          "pnj_nombre": "Dr. Marsh",
          "descripcion": "Preguntar a Marsh si reconoce el frasco",
          "atributo": "TEM",
          "dificultad": 4
        }
      ]
    },
    "pista_11": {
      "nombre": "Correspondencia",
      "metodos": [
        {
          "id": "p11-ind",
          "tipo": "individual",
          "descripcion": "Leer el francés",
          "atributo": "INT",
          "dificultad": 5,
          "institutriz_automatico": true
        },
        {
          "id": "p11-pnj-pemberton",
          "tipo": "pnj",
          "pnj_id": "pemberton",
          "pnj_nombre": "Pemberton",
          "descripcion": "Preguntar a Pemberton sobre las cartas",
          "atributo": "TEM",
          "dificultad": 3,
          "efecto_adicional": {
            "tipo": "sospecha_pnj",
            "pnj": "pemberton",
            "valor": 1
          }
        }
      ]
    },
    "pista_12": {
      "nombre": "Marcas en la puerta del Despacho",
      "metodos": [
        {
          "id": "p12-ind",
          "tipo": "individual",
          "descripcion": "Examinar las marcas con detalle",
          "atributo": "INT",
          "dificultad": 5
        },
        {
          "id": "p12-pnj-hobbes",
          "tipo": "pnj",
          "pnj_id": "hobbes",
          "pnj_nombre": "Hobbes",
          "descripcion": "Preguntar a Hobbes si alguien ha forzado la puerta",
          "atributo": "TEM",
          "dificultad": 3
        },
        {
          "id": "p12-ind2",
          "tipo": "individual",
          "descripcion": "Reconstruir físicamente cómo se hicieron las marcas",
          "atributo": "FOR",
          "dificultad": 4
        }
      ]
    },
    "pista_13": {
      "nombre": "Póliza de seguro",
      "metodos": [
        {
          "id": "p13-ind",
          "tipo": "individual",
          "descripcion": "Leer el contenido",
          "atributo": "INT",
          "dificultad": 4
        },
        {
          "id": "p13-pnj-harold",
          "tipo": "pnj",
          "pnj_id": "harold",
          "pnj_nombre": "Harold",
          "descripcion": "Confrontar a Harold con el sobre",
          "atributo": "TEM",
          "dificultad": 4,
          "efecto_adicional": {
            "tipo": "sospecha_pnj",
            "pnj": "harold",
            "valor": 1
          }
        },
        {
          "id": "p13-pnj-hobbes",
          "tipo": "pnj",
          "pnj_id": "hobbes",
          "pnj_nombre": "Hobbes",
          "descripcion": "Preguntar a Hobbes si el Lord tenía seguros importantes",
          "atributo": "TEM",
          "dificultad": 3
        }
      ]
    }
  }
}
};

var _PISTAS_DATOS = null;

// Carga síncrona desde datos embebidos, o async como fallback
async function cargarDatosPistas() {
  if (_PISTAS_DATOS) return _PISTAS_DATOS;
  const caso_id = (typeof estado !== 'undefined' && estado?.caso_id) || 'caso_1';
  if (_PISTAS_EMBEBIDOS[caso_id]) {
    _PISTAS_DATOS = _PISTAS_EMBEBIDOS[caso_id];
    return _PISTAS_DATOS;
  }
  try {
    const r = await fetch(`data/pistas_${caso_id}.json`);
    _PISTAS_DATOS = await r.json();
    return _PISTAS_DATOS;
  } catch(e) {
    console.warn('pistas no cargadas:', e);
    return null;
  }
}

// Versión síncrona para llamadas no-async
function cargarDatosPistasSync() {
  if (_PISTAS_DATOS) return _PISTAS_DATOS;
  const caso_id = (typeof estado !== 'undefined' && estado?.caso_id) || 'caso_1';
  if (_PISTAS_EMBEBIDOS[caso_id]) {
    _PISTAS_DATOS = _PISTAS_EMBEBIDOS[caso_id];
  }
  return _PISTAS_DATOS;
}

// Devuelve los métodos de una pista para el caso activo
function getMetodosPista(pista_id) {
  if (!_PISTAS_DATOS) return [];
  return _PISTAS_DATOS.pistas?.[pista_id]?.metodos || [];
}

// Evalúa si un método está disponible para el jugador activo
// Devuelve { disponible: bool, razon: string|null }
function evaluarDisponibilidadMetodo(metodo, jugIdx) {
  const j = estado.jugadores[jugIdx];
  const losetaActual = j.loseta_actual;

  // ── Automáticos condicionales ─────────────────────────────────────────────
  if (metodo.tipo === 'automatico' && metodo.condicion_automatico) {
    const cond = metodo.condicion_automatico;
    if (cond.tipo === 'pista_descubierta') {
      const ok = (estado.pistas_descubiertas || []).includes(cond.pista_id);
      if (!ok) return { disponible: false, razon: `Requiere tener la ${cond.pista_id.replace('pista_','Pista #')} descubierta` };
    }
    if (cond.tipo === 'pista_interpretada') {
      const ok = (estado.pistas_interpretadas || []).includes(cond.pista_id);
      if (!ok) return { disponible: false, razon: `Requiere la ${cond.pista_id.replace('pista_','Pista #')} ya interpretada` };
    }
    return { disponible: true, razon: null };
  }

  // ── Automáticos del Doctor ────────────────────────────────────────────────
  if (metodo.doctor_automatico && j.personaje === 'doctor') {
    return { disponible: true, razon: null };
  }
  if (metodo.institutriz_automatico && j.personaje === 'institutriz') {
    return { disponible: true, razon: null };
  }

  // ── Requiere loseta concreta ──────────────────────────────────────────────
  if (metodo.tipo === 'loseta') {
    if (losetaActual !== metodo.loseta_id) {
      const nom = metodo.loseta_nombre || metodo.loseta_id;
      return { disponible: false, razon: `Requiere estar en ${nom}` };
    }
    // Comprobar si la loseta está abierta (no cerrada)
    if (estado.losetas_cerradas && estado.losetas_cerradas.includes(metodo.loseta_id)) {
      return { disponible: false, razon: `${metodo.loseta_nombre} está cerrada` };
    }
  }

  // ── Requiere estar con un PNJ concreto ────────────────────────────────────
  if (metodo.tipo === 'pnj') {
    const _dc = (typeof datosCaso !== 'undefined') ? datosCaso : null;
    const pnjActual = estado.pnj?.[metodo.pnj_id]?.loseta_actual
      || _dc?.comun?.pnj?.find(p => p.id === metodo.pnj_id)?.posicion_inicial;
    if (pnjActual !== losetaActual) {
      return { disponible: false, razon: `Requiere estar con ${metodo.pnj_nombre}` };
    }
  }

  // ── Requiere estar con cualquier PNJ ─────────────────────────────────────
  if (metodo.tipo === 'pnj_cualquiera') {
    const _dc2 = (typeof datosCaso !== 'undefined') ? datosCaso : null;
    const hayPNJ = _dc2?.comun?.pnj?.some(p => {
      const pos = estado.pnj?.[p.id]?.loseta_actual || p.posicion_inicial;
      return pos === losetaActual;
    });
    if (!hayPNJ) {
      return { disponible: false, razon: 'Requiere estar con un PNJ' };
    }
  }

  return { disponible: true, razon: null };
}

// Calcula la dificultad final de un método para un jugador
// Devuelve { dif, attr, mods[], automatico }
function calcularDifMetodo(metodo, jugIdx) {
  const j = estado.jugadores[jugIdx];

  // Automático
  if (metodo.tipo === 'automatico') return { dif: 0, attr: '', mods: [], automatico: true };
  if (metodo.doctor_automatico && j.personaje === 'doctor') return { dif: 0, attr: metodo.atributo || '', mods: ['Doctor: automático'], automatico: true };
  if (metodo.institutriz_automatico && j.personaje === 'institutriz') return { dif: 0, attr: metodo.atributo || '', mods: ['Institutriz: automático'], automatico: true };

  let dif = metodo.dificultad || 4;
  const attr = metodo.atributo || 'INT';
  const mods = [];

  // Doctor dif especial
  if (metodo.doctor_dif != null && j.personaje === 'doctor') {
    dif = metodo.doctor_dif;
    mods.push(`Doctor: dif ${dif}`);
  }

  // Dificultad condicional (ej: Sospecha PNJ ≥ umbral)
  if (metodo.dificultad_condicional) {
    const dc = metodo.dificultad_condicional;
    if (dc.condicion === 'sospecha_pnj_gte') {
      const sosp = estado.pnj?.[dc.pnj]?.sospecha ?? 0;
      if (sosp >= dc.umbral) {
        dif = dc.dificultad;
        mods.push(`+1 por Sospecha ${dc.pnj} ≥${dc.umbral}`);
      }
    }
  }

  // Dificultad reducida en loseta concreta (ej: Whitfield en Capilla)
  if (metodo.dificultad_en_loseta) {
    const del = metodo.dificultad_en_loseta;
    if (j.loseta_actual === del.loseta_id) {
      dif = del.dificultad;
      const nom = getLoseta(del.loseta_id)?.nombre || del.loseta_id;
      mods.push(`dif ${dif} en ${nom}`);
    }
  }

  // Bonus de crítico de exploración
  const bonusCrit = estado.bonus_interpretacion?.[metodo._pista_id] || 0;
  if (bonusCrit !== 0) {
    dif += bonusCrit;
    mods.push(`${bonusCrit} crítico exploración`);
  }

  // Pasiva de loseta
  const loseta = (typeof getLoseta === 'function') ? getLoseta(j.loseta_actual) : null;
  if (loseta) {
    for (const ef of loseta.efectos || []) {
      if (ef.tipo === 'mod_prueba' && ef.atributo === attr) {
        dif += ef.modificador;
        const signo = ef.modificador > 0 ? '+' : '';
        mods.push(`${signo}${ef.modificador} ${loseta.nombre}`);
      }
    }
  }

  return { dif: Math.max(1, dif), attr, mods, automatico: false };
}
