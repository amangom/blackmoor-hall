// ─── PERSONAJES JUGADORES ────────────────────────────────────────────────────

const PERSONAJES = {
  doctor: {
    id: 'doctor',
    nombre: 'El Doctor',
    imagen: 'Doctor.png',
    atributos: { FOR: 2, INT: 4, TEM: 3 },
    habilidad_id: 'mente_analitica',
    habilidad_nombre: 'Mente analítica',
    habilidad_desc: '−1 dif al interpretar pistas. Algunas cartas indican «Doctor: automático» o «Doctor: dif X».'
  },
  institutriz: {
    id: 'institutriz',
    nombre: 'La Institutriz',
    imagen: 'Institutriz.png',
    atributos: { FOR: 2, INT: 3, TEM: 4 },
    habilidad_id: 'intuicion_social',
    habilidad_nombre: 'Empatía',
    habilidad_desc: '−1 dif en exploración y en interrogatorios de Temple.'
  },
  periodista: {
    id: 'periodista',
    nombre: 'El Periodista',
    imagen: 'Periodista.png',
    atributos: { FOR: 2, INT: 4, TEM: 3 },
    habilidad_id: 'olfato_periodistico',
    habilidad_nombre: 'Olfato periodístico',
    habilidad_desc: 'Al fallar un interrogatorio con pista, la app puede mostrar la entrada [PRENSA], obteniendo un detalle adicional incluso en el fracaso.'
  },
  medium: {
    id: 'medium',
    nombre: 'La Médium',
    imagen: 'Medium.png',
    atributos: { FOR: 2, INT: 2, TEM: 5 },
    habilidad_id: 'visiones',
    habilidad_nombre: 'Visiones',
    habilidad_desc: 'Cada vez que pierde Temple (por cualquier causa), la app muestra una visión [VISIÓN] y la lee en voz alta. Hay 3 visiones por caso, en orden.'
  },
  mayordomo: {
    id: 'mayordomo',
    nombre: 'El Mayordomo',
    imagen: 'Mayordomo.png',
    atributos: { FOR: 3, INT: 2, TEM: 4 },
    habilidad_id: 'conoce_la_casa',
    habilidad_nombre: 'Conoce la casa',
    habilidad_desc: '−1 dif en pruebas de exploración en losetas de tipo P (Privada). Puede acceder a zonas privadas sin penalización de Alerta.'
  },
  inspector: {
    id: 'inspector',
    nombre: 'El Inspector',
    imagen: 'Inspector.png',
    atributos: { FOR: 3, INT: 3, TEM: 3 },
    habilidad_id: 'ojo_entrenado',
    habilidad_nombre: 'Ojo entrenado',
    habilidad_desc: 'Al fallar un interrogatorio con pista, consulta la entrada [OJO ENTRENADO] del Libro de Caso para ese PNJ y esa pista (si existe). Obtiene información incluso en el fracaso.'
  }
};

const PERSONAJES_LISTA = Object.values(PERSONAJES);
