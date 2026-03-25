// ── PISTAS.JS — métodos de interpretación y disponibilidad ──────────────────
// Datos embebidos por caso. Fuente de verdad: Cartas de Pista físicas.

// Datos embebidos directamente para evitar dependencia de fetch
const _PISTAS_EMBEBIDOS = {
  'caso_1': {
  "caso_id": "caso_1",
  "pistas": {
    "pista_1": {
      "nombre": "El botón de puño",
      "color": "roja",
      "texto_descubierta": "Un botón de puño de plata con las iniciales C.M. grabadas. Estaba en la mano crispada del Lord. La mano estaba cerrada con fuerza sobre él.",
      "metodos": [
        {
          "tipo": "individual",
          "atributo": "INT",
          "dificultad": 4,
          "descripcion": "Examinar el botón con detalle: material, manufactura, marcas del artesano",
          "id": "p1-m0"
        },
        {
          "tipo": "loseta",
          "atributo": "INT",
          "dificultad": 1,
          "descripcion": "Buscar el gemelo que hace par",
          "loseta_id": "hab_invitados",
          "requiere_loseta_abierta": true,
          "fracaso_reintento": true,
          "exito_variante": {
            "texto_comun": "Entre las maletas de Harold y los efectos personales del Dr. Marsh, encontráis el maletín médico de Marsh. Dentro hay un estuche de terciopelo para gemelos de plata con las iniciales C.M.",
            "A": {
              "texto": "El estuche contiene un solo gemelo. El hueco del segundo está vacío. El gemelo presente es idéntico al encontrado en la mano del Lord: plata maciza, iniciales C.M., misma manufactura. Al Dr. Marsh le falta un gemelo.",
              "efectos": [
                {
                  "tipo": "sospecha_pnj",
                  "pnj": "marsh",
                  "valor": 1
                }
              ]
            },
            "B": {
              "texto": "El estuche contiene un solo gemelo. El hueco del segundo está vacío. El gemelo presente es idéntico al encontrado en la mano del Lord: plata maciza, iniciales C.M., misma manufactura. Pero hay un detalle: el interior del maletín tiene arañazos recientes en el cierre, como si alguien lo hubiera abierto a la fuerza o con prisa. Al Dr. Marsh le falta un gemelo.",
              "efectos": [
                {
                  "tipo": "sospecha_pnj",
                  "pnj": "marsh",
                  "valor": 1
                }
              ]
            },
            "C": {
              "texto": "El estuche contiene dos gemelos completos. Ambos son de plata con las iniciales C.M. Al Dr. Marsh no le falta ninguno. El botón encontrado en la mano del Lord no pertenece a este par. Existe otro juego de gemelos C.M. en Blackmoor Hall.",
              "efectos": [
                {
                  "tipo": "sospecha_pnj",
                  "pnj": "marsh",
                  "valor": -1,
                  "condicional": "si_tiene"
                },
                {
                  "tipo": "sospecha_pnj",
                  "pnj": "catherine",
                  "valor": 1
                }
              ]
            }
          },
          "id": "p1-m1"
        }
      ],
      "texto_interpretada": "Botón de plata maciza, manufactura londinense, pareja de gemelos. Las iniciales C.M. están grabadas por encargo. El cierre está roto y hay hilos de tela enganchados. Estaba apretado en la mano crispada del Lord."
    },
    "pista_2": {
      "nombre": "Plantas junto a la despensa",
      "color": "roja",
      "texto_descubierta": "Un ramo de plantas secas colgado junto a la despensa de la cocina. Hojas alargadas, flores tubulares de color púrpura. No parecen hierbas culinarias normales.",
      "metodos": [
        {
          "tipo": "individual",
          "atributo": "INT",
          "dificultad": 5,
          "descripcion": "Identificar la planta: morfología, propiedades",
          "doctor_dif": 3,
          "id": "p2-m0"
        },
        {
          "tipo": "pnj",
          "atributo": "TEM",
          "dificultad": 3,
          "descripcion": "Observar las plantas que usa Pemberton",
          "pnj_id": "pemberton",
          "efecto_exito": [
            {
              "tipo": "sospecha_pnj",
              "pnj": "pemberton",
              "valor": 1
            }
          ],
          "texto_exito": ". Pemberton se tensa al ver las plantas. Las reconoce, está claro. Baja la voz: estas plantas no son para cocinar.",
          "id": "p2-m1",
          "pnj_nombre": "Mrs. Pemberton"
        },
        {
          "tipo": "loseta",
          "atributo": "INT",
          "dificultad": 3,
          "descripcion": "Consultar un libro de botánica",
          "loseta_id": "biblioteca",
          "requiere_loseta_abierta": true,
          "fracaso_reintento": true,
          "id": "p2-m2"
        }
      ],
      "texto_interpretada": "Dedalera (Digitalis purpurea). Extremadamente tóxica en dosis concentradas. Fuente natural de digitalina, un compuesto que en pequeñas dosis es medicinal y en grandes dosis provoca paro cardíaco. Alguien en esta casa sabe de venenos."
    },
    "pista_3": {
      "nombre": "Documento en el escritorio",
      "color": "azul",
      "texto_descubierta": "Un documento legal con membrete de notaría, parcialmente oculto bajo un secante. Solo se ven sellos oficiales y una fecha de la semana pasada. El Lord no quería que nadie lo viera.",
      "metodos": [
        {
          "tipo": "individual",
          "atributo": "INT",
          "dificultad": 4,
          "descripcion": "Leer el documento completo",
          "id": "p3-m0"
        },
        {
          "tipo": "pnj",
          "atributo": "TEM",
          "dificultad": 4,
          "descripcion": "Preguntar a Hobbes sobre los asuntos legales del Lord",
          "pnj_id": "hobbes",
          "id": "p3-m1",
          "pnj_nombre": "Hobbes"
        },
        {
          "tipo": "pnj",
          "atributo": "TEM",
          "dificultad": 3,
          "descripcion": "Preguntar a Whitfield, confidente del Lord",
          "pnj_id": "whitfield",
          "id": "p3-m2",
          "pnj_nombre": "Rev. Whitfield"
        }
      ],
      "texto_interpretada": "Borrador de un nuevo testamento. El Lord planeaba dejar toda su fortuna a una fundación benéfica. Harold quedaría completamente desheredado. El documento aún no está firmado."
    },
    "pista_4": {
      "nombre": "Cartas en la Biblioteca",
      "color": "azul",
      "texto_descubierta": "Un fajo de cartas atadas con cinta negra en un cajón de la Biblioteca. Llevan membrete de un bufete de Londres. El tono de las que se ven por encima es amenazante.",
      "metodos": [
        {
          "tipo": "individual",
          "atributo": "INT",
          "dificultad": 4,
          "descripcion": "Leer las cartas",
          "efecto_exito": [
            {
              "tipo": "alerta",
              "valor": 1
            }
          ],
          "id": "p4-m0"
        },
        {
          "tipo": "pnj",
          "atributo": "TEM",
          "dificultad": 3,
          "descripcion": "Mostrar las cartas a Harold",
          "pnj_id": "harold",
          "exito_variante": {
            "B": {
              "texto": "Harold resopla. Se recuesta en la silla y os mira con resignación.",
              "efectos": [
                {
                  "tipo": "sospecha_pnj",
                  "pnj": "harold",
                  "valor": 1
                }
              ]
            },
            "C": {
              "texto": "Harold examina las cartas sin inmutarse. Asiente despacio, como si llevara tiempo esperando este momento.",
              "efectos": [
                {
                  "tipo": "sospecha_pnj",
                  "pnj": "harold",
                  "valor": 1
                }
              ]
            },
            "A": {
              "texto": "Harold mira las cartas un momento. Cierra los ojos brevemente. Cuando habla, lo hace en voz baja.",
              "efectos": [
                {
                  "tipo": "sospecha_pnj",
                  "pnj": "harold",
                  "valor": 1
                }
              ]
            }
          },
          "id": "p4-m1",
          "pnj_nombre": "Harold Ashworth"
        },
        {
          "tipo": "pnj",
          "atributo": "TEM",
          "dificultad": 4,
          "descripcion": "Preguntar a Hobbes sobre las finanzas de la familia",
          "pnj_id": "hobbes",
          "id": "p4-m2",
          "pnj_nombre": "Hobbes"
        }
      ],
      "texto_interpretada": "Reclamaciones de deuda a nombre de Harold Ashworth. Debe £3.000 a tres acreedores distintos. Amenazas de embargo. La última carta, de hace dos semanas, dice: «Si no paga antes de fin de mes, procederemos judicialmente.» Harold está desesperado."
    },
    "pista_5": {
      "nombre": "Certificado en la Capilla",
      "color": "azul",
      "texto_descubierta": "En la sacristía, dentro de un misal, un certificado oficial doblado y amarillento. Tiene un sello médico y una fecha de hace cinco años. Alguien lo guardó aquí a propósito.",
      "metodos": [
        {
          "tipo": "individual",
          "atributo": "INT",
          "dificultad": 4,
          "descripcion": "Leer el certificado completo",
          "id": "p5-m0"
        },
        {
          "tipo": "pnj",
          "atributo": "TEM",
          "dificultad": 3,
          "descripcion": "Mostrar el certificado a Whitfield",
          "pnj_id": "whitfield",
          "doctor_auto": true,
          "id": "p5-m1",
          "pnj_nombre": "Rev. Whitfield"
        }
      ],
      "texto_interpretada": "Certificado de defunción de Eleanor Ashworth. Causa: fallo cardíaco. Firmado por el Dr. Marsh, hace cinco años. Los síntomas descritos son idénticos a los del Lord esta noche."
    },
    "pista_6": {
      "nombre": "Cuaderno oculto",
      "color": "azul",
      "texto_descubierta": "Un cuaderno de tapas gastadas escondido bajo un tablón suelto en la Biblioteca. La letra es femenina, apretada, furiosa. Hay fechas que abarcan varios meses.",
      "metodos": [
        {
          "tipo": "individual",
          "atributo": "INT",
          "dificultad": 5,
          "descripcion": "Leer el cuaderno completo",
          "id": "p6-m0"
        },
        {
          "tipo": "pnj",
          "atributo": "TEM",
          "dificultad": 3,
          "descripcion": "Preguntar a Catherine si es suyo",
          "pnj_id": "catherine",
          "condicion_sospecha_pnj": "catherine",
          "condicion_sospecha_min": 2,
          "dificultad_alternativa": 4,
          "id": "p6-m1",
          "pnj_nombre": "Catherine Ashworth"
        },
        {
          "tipo": "individual",
          "atributo": "INT",
          "dificultad": 4,
          "descripcion": "Comparar la letra con otros documentos de la casa",
          "id": "p6-m2"
        }
      ],
      "texto_interpretada": "Es un diario de investigación. Alguien ha estado recopilando datos sobre muertes en la familia Ashworth: fechas, síntomas, médicos presentes. Las últimas páginas son más emocionales, con frases subrayadas como «No fue natural» y «Alguien debe responder». La autora estaba convencida de que hubo un asesinato previo."
    },
    "pista_7": {
      "nombre": "Nota en la Capilla",
      "color": "azul",
      "texto_descubierta": "Una hoja doblada dentro de la Biblia de Whitfield. Solo se lee el final: «...antes de que sea demasiado tarde. Confío en su discreción, Reverendo.» La letra es elegante pero temblorosa.",
      "metodos": [
        {
          "tipo": "pnj",
          "atributo": "TEM",
          "dificultad": 4,
          "descripcion": "Preguntar a Whitfield sobre la nota",
          "pnj_id": "whitfield",
          "id": "p7-m0",
          "dificultad_en_loseta": {
            "loseta_id": "capilla",
            "dificultad": 3
          },
          "pnj_nombre": "Rev. Whitfield"
        },
        {
          "tipo": "individual",
          "atributo": "INT",
          "dificultad": 4,
          "descripcion": "Comparar la letra con el documento del escritorio",
          "id": "p7-m1"
        },
        {
          "tipo": "pnj",
          "atributo": "TEM",
          "dificultad": 3,
          "descripcion": "Preguntar a Hobbes quién escribía así",
          "pnj_id": "hobbes",
          "id": "p7-m2",
          "pnj_nombre": "Hobbes"
        }
      ],
      "texto_interpretada": "La nota es del Lord Ashworth. Pedía a Whitfield discreción sobre un asunto que le atormentaba. La letra coincide con la del documento legal del Despacho. El Lord confiaba en Whitfield y temía algo."
    },
    "pista_8": {
      "nombre": "Informe de auditoría",
      "color": "azul",
      "texto_descubierta": "Un cuaderno de contabilidad en el cajón del escritorio del Lord. Columnas de cifras con anotaciones en rojo y signos de exclamación.",
      "metodos": [
        {
          "tipo": "individual",
          "atributo": "INT",
          "dificultad": 5,
          "descripcion": "Analizar las cuentas",
          "id": "p8-m0"
        },
        {
          "tipo": "pnj",
          "atributo": "TEM",
          "dificultad": 4,
          "descripcion": "Mostrar el cuaderno a Hobbes",
          "pnj_id": "hobbes",
          "id": "p8-m1",
          "pnj_nombre": "Hobbes"
        }
      ],
      "texto_interpretada": "Registro contable de los gastos domésticos de Blackmoor Hall. Las anotaciones en rojo marcan discrepancias: cantidades que no cuadran, facturas infladas, partidas fantasma. El patrón abarca 15 años. Alguien ha estado robando sistemáticamente de la despensa, la bodega y las cajas de la casa. Las anotaciones del Lord dicen: «Confirmar con Hobbes»."
    },
    "pista_9": {
      "nombre": "La segunda copa",
      "color": "roja",
      "texto_descubierta": "Fragmentos de una copa de cristal junto a la mesa. Alguien la rompió (¿el Lord al caer? ¿alguien al recoger?). Quedan restos de líquido con un olor dulzón apenas perceptible.",
      "metodos": [
        {
          "tipo": "individual",
          "atributo": "INT",
          "dificultad": 5,
          "descripcion": "Analizar los restos",
          "doctor_dif": 3,
          "id": "p9-m0"
        },
        {
          "tipo": "individual",
          "atributo": "TEM",
          "dificultad": 4,
          "descripcion": "Recoger los fragmentos y olerlos con atención",
          "id": "p9-m1"
        },
        {
          "tipo": "pnj",
          "atributo": "TEM",
          "dificultad": 3,
          "descripcion": "Preguntar a Pemberton sobre las copas de la cena",
          "pnj_id": "pemberton",
          "id": "p9-m2",
          "pnj_nombre": "Mrs. Pemberton"
        }
      ],
      "texto_interpretada": "Los restos contienen un compuesto que no es vino. Un líquido claro, dulzón, fue añadido a la copa. Esta no es la copa de la cena: es una segunda copa servida después. Alguien envenenó esta copa específicamente."
    },
    "pista_10": {
      "nombre": "Frasco vacío",
      "color": "roja",
      "texto_descubierta": "Un frasco de cristal oscuro sin etiqueta, escondido tras los libros del Despacho. Vacío, pero con residuos de un líquido claro y un olor tenue a hierba.",
      "metodos": [
        {
          "tipo": "individual",
          "atributo": "INT",
          "dificultad": 6,
          "descripcion": "Analizar el residuo del frasco",
          "doctor_dif": 4,
          "condicion_automatico": "pista_2_interpretada",
          "id": "p10-m0"
        },
        {
          "tipo": "individual",
          "atributo": "TEM",
          "dificultad": 4,
          "descripcion": "Oler y examinar el frasco con atención",
          "id": "p10-m1"
        },
        {
          "tipo": "pnj",
          "atributo": "TEM",
          "dificultad": 4,
          "descripcion": "Mostrar el frasco a Marsh",
          "pnj_id": "marsh",
          "id": "p10-m2",
          "pnj_nombre": "Dr. Marsh"
        }
      ],
      "texto_interpretada": "El frasco contenía un concentrado de digitalina: el mismo compuesto de la dedalera. La dosis que cabía en este frasco es letal varias veces. Quien lo preparó sabía exactamente lo que hacía. El frasco es de uso médico, no doméstico."
    },
    "pista_11": {
      "nombre": "Correspondencia en la Hab. del Servicio",
      "color": "azul",
      "texto_descubierta": "Cartas personales en el cuarto de Pemberton. Están en francés. Un sobre lacrado lleva el sello de un banco de Lyon.",
      "metodos": [
        {
          "tipo": "individual",
          "atributo": "INT",
          "dificultad": 6,
          "descripcion": "Leer las cartas en francés",
          "institutriz_auto": true,
          "id": "p11-m0"
        },
        {
          "tipo": "pnj",
          "atributo": "TEM",
          "dificultad": 3,
          "descripcion": "Preguntar a Pemberton sobre las cartas",
          "pnj_id": "pemberton",
          "efecto_exito": [
            {
              "tipo": "sospecha_pnj",
              "pnj": "pemberton",
              "valor": 1
            },
            {
              "tipo": "alerta",
              "valor": 1
            }
          ],
          "id": "p11-m1",
          "pnj_nombre": "Mrs. Pemberton"
        }
      ],
      "texto_interpretada": "Pemberton envía £50 mensuales a una dirección en Lyon, Francia. Las cartas son de su hermana, viuda con tres hijos. El banco confirma transferencias regulares durante años. ¿De dónde saca Pemberton ese dinero con un sueldo de cocinera?"
    },
    "pista_12": {
      "nombre": "Marcas en la puerta del Despacho",
      "color": "azul",
      "texto_descubierta": "Arañazos frescos en el interior de la puerta del Despacho. Hay dos tipos de marcas: unas en la cerradura (metálicas, limpias) y otras en la madera (arañazos orgánicos, como uñas o dedos).",
      "metodos": [
        {
          "tipo": "individual",
          "atributo": "INT",
          "dificultad": 5,
          "descripcion": "Examinar las marcas con detalle",
          "id": "p12-m0"
        },
        {
          "tipo": "individual",
          "atributo": "FOR",
          "dificultad": 4,
          "descripcion": "Intentar reconstruir cómo se hicieron",
          "id": "p12-m1"
        },
        {
          "tipo": "pnj",
          "atributo": "TEM",
          "dificultad": 3,
          "descripcion": "Preguntar a Hobbes sobre la puerta",
          "pnj_id": "hobbes",
          "id": "p12-m2",
          "pnj_nombre": "Hobbes"
        }
      ],
      "texto_interpretada": "Las marcas metálicas son de un cambio de cerradura reciente (la semana pasada). Las marcas en la madera son de esta noche: arañazos profundos en el marco, como si alguien se agarrase con fuerza. El Lord pasó sus últimos momentos en esta puerta."
    },
    "pista_13": {
      "nombre": "Póliza de seguro",
      "color": "azul",
      "texto_descubierta": "Un sobre grueso con membrete de una compañía de seguros, dentro del equipaje de Harold. Sellado, pero el sello está roto: alguien lo abrió y volvió a cerrar.",
      "metodos": [
        {
          "tipo": "individual",
          "atributo": "INT",
          "dificultad": 4,
          "descripcion": "Leer el contenido del sobre",
          "id": "p13-m0"
        },
        {
          "tipo": "pnj",
          "atributo": "TEM",
          "dificultad": 4,
          "descripcion": "Mostrar el sobre a Harold",
          "pnj_id": "harold",
          "efecto_exito": [
            {
              "tipo": "sospecha_pnj",
              "pnj": "harold",
              "valor": 1
            }
          ],
          "id": "p13-m1",
          "pnj_nombre": "Harold Ashworth"
        },
        {
          "tipo": "pnj",
          "atributo": "TEM",
          "dificultad": 4,
          "descripcion": "Preguntar a Hobbes sobre los seguros del Lord",
          "pnj_id": "hobbes",
          "id": "p13-m2",
          "pnj_nombre": "Hobbes"
        }
      ],
      "texto_interpretada": "Póliza de vida de Lord Ashworth por una suma enorme. Beneficiario: según testamento vigente. Harold la había encontrado y leído: sabía exactamente cuánto valía la muerte de su padre. Hay anotaciones de Harold en los márgenes calculando la cifra."
    },
    "pista_14": {
      "nombre": "Restos en el parterre",
      "color": "roja",
      "texto_descubierta": "Junto a la planta de dedalera, el suelo está removido recientemente. Hay restos de hojas cortadas y un trapo con manchas oscuras abandonado entre los tallos.",
      "metodos": [
        {
          "tipo": "individual",
          "atributo": "INT",
          "dificultad": 4,
          "descripcion": "Examinar los residuos del trapo",
          "doctor_dif": 2,
          "id": "p14-m0"
        },
        {
          "tipo": "individual",
          "atributo": "TEM",
          "dificultad": 4,
          "descripcion": "Oler el trapo e identificar el residuo por el olfato",
          "id": "p14-m1"
        },
        {
          "tipo": "pnj",
          "atributo": "TEM",
          "dificultad": 3,
          "descripcion": "Mostrar el trapo a Pemberton",
          "pnj_id": "pemberton",
          "efecto_exito": [
            {
              "tipo": "sospecha_pnj",
              "pnj": "pemberton",
              "valor": 1
            }
          ],
          "id": "p14-m2",
          "pnj_nombre": "Mrs. Pemberton"
        }
      ],
      "texto_interpretada": "Las hojas fueron cortadas con precisión, no arrancadas. El trapo tiene residuos del mismo compuesto que el frasco vacío. Alguien procesó la dedalera aquí mismo, con cuidado y conocimiento. No fue un accidente ni un impulso: fue preparación deliberada."
    }
  }
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

// Devuelve el color ('roja' | 'azul' | null) de una pista
function getColorPista(pista_id) {
  if (!_PISTAS_DATOS) cargarDatosPistasSync();
  return _PISTAS_DATOS?.pistas?.[pista_id]?.color || null;
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
  // condicion_automatico como string (pista_N_interpretada) — siempre disponible (se convierte en automático)
  if (metodo.condicion_automatico && typeof metodo.condicion_automatico === 'string') {
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
  // Nuevas propiedades auto
  if (metodo.doctor_auto && j.personaje === 'doctor') return { dif: 0, attr: metodo.atributo || '', mods: ['Doctor: automático'], automatico: true };
  if (metodo.institutriz_auto && j.personaje === 'institutriz') return { dif: 0, attr: metodo.atributo || '', mods: ['Institutriz: automático'], automatico: true };
  // condicion_automatico como string (pista_N_interpretada)
  if (metodo.condicion_automatico) {
    const pistaCond = metodo.condicion_automatico;
    if ((estado.pistas_interpretadas || []).includes(pistaCond)) {
      return { dif: 0, attr: metodo.atributo || '', mods: ['Automático (pista ya interpretada)'], automatico: true };
    }
  }

  let dif = metodo.dificultad || 4;
  const attr = metodo.atributo || 'INT';
  const mods = [];

  // Doctor dif especial
  if (metodo.doctor_dif != null && j.personaje === 'doctor') {
    dif = metodo.doctor_dif;
    mods.push(`Doctor: dif ${dif}`);
  }

  // Dificultad alternativa por sospecha de PNJ (ej: Catherine ≥2 → dif 4)
  if (metodo.condicion_sospecha_pnj && metodo.dificultad_alternativa) {
    const sosp = estado.pnj?.[metodo.condicion_sospecha_pnj]?.sospecha ?? 0;
    if (sosp >= (metodo.condicion_sospecha_min || 2)) {
      dif = metodo.dificultad_alternativa;
      mods.push(`dif ${dif} (Sospecha ≥${metodo.condicion_sospecha_min})`);
    }
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

  // Bonus de crítico de exploración (vinculado al jugador que sacó el crítico)
  const bonusCrit = estado.bonus_interpretacion?.[metodo._pista_id]?.[jugIdx] || 0;
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

  // Habilidad pasiva del Doctor: −1 dif en todas las interpretaciones
  if (j.personaje === 'doctor') {
    dif -= 1;
    mods.push('Doctor: −1 dif');
  }

  return { dif: Math.max(1, dif), attr, mods, automatico: false };
}
