// ─── CARTAS DE CONFIDENCIA ────────────────────────────────────────────────────
// Fuente canónica: Blackmoor_Hall_Cartas_Confidencia_v8.txt
// Efecto: −2 dificultad al explorar la loseta indicada, o interrogar al PNJ indicado.
// La escena del crimen se resuelve dinámicamente desde datosCaso.escena_crimen.

const _CONFIDENCIAS = {
  caso_1: {
    doctor:      { tipo: 'exploracion', losetas: ['escena'] },
    institutriz: { tipo: 'interrogacion', pnj: ['catherine'] },
    inspector:   { tipo: 'exploracion', losetas: ['despacho'] },
    medium:      { tipo: 'exploracion', losetas: ['capilla', 'hab_invitados'] },
    mayordomo:   { tipo: 'exploracion', losetas: ['salon_principal', 'cocina'] },
    periodista:  { tipo: 'exploracion', losetas: ['hab_invitados', 'biblioteca'] },
  },
  caso_2: {
    doctor:      { tipo: 'exploracion', losetas: ['escena'] },
    institutriz: { tipo: 'exploracion', losetas: ['galeria_retratos'] },
    inspector:   { tipo: 'exploracion', losetas: ['despacho', 'hab_invitados'] },
    medium:      { tipo: 'exploracion', losetas: ['galeria_retratos', 'pasadizos'] },
    mayordomo:   { tipo: 'exploracion', losetas: ['galeria_retratos', 'pasadizos'] },
    periodista:  { tipo: 'exploracion', losetas: ['biblioteca', 'hab_invitados'] },
  },
  caso_3: {
    doctor:      { tipo: 'exploracion', losetas: ['escena'] },
    institutriz: { tipo: 'interrogacion', pnj: ['catherine', 'greaves'] },
    inspector:   { tipo: 'exploracion', losetas: ['despacho', 'biblioteca'] },
    medium:      { tipo: 'exploracion', losetas: ['sotano'] },
    mayordomo:   { tipo: 'exploracion', losetas: ['sotano'] },
    periodista:  { tipo: 'exploracion', losetas: ['biblioteca'] },
  },
  caso_4: {
    doctor:      { tipo: 'exploracion', losetas: ['escena'] },
    institutriz: { tipo: 'interrogacion', pnj: ['ingrid'] },
    inspector:   { tipo: 'exploracion', losetas: ['despacho', 'hab_invitados'] },
    medium:      { tipo: 'exploracion', losetas: ['sala_relojeria'] },
    mayordomo:   { tipo: 'exploracion', losetas: ['sala_relojeria'] },
    periodista:  { tipo: 'exploracion', losetas: ['galeria_retratos', 'biblioteca'] },
  },
  caso_5: {
    doctor:      { tipo: 'exploracion', losetas: ['escena'] },
    institutriz: { tipo: 'interrogacion', pnj: ['lydia', 'nora'] },
    inspector:   { tipo: 'exploracion', losetas: ['despacho', 'hab_invitados'] },
    medium:      { tipo: 'exploracion', losetas: ['bambalinas', 'escenario'] },
    mayordomo:   { tipo: 'exploracion', losetas: ['bambalinas', 'sala_utileria'] },
    periodista:  { tipo: 'exploracion', losetas: ['camerinos', 'despacho'] },
  },
};

// Devuelve el modificador de dificultad de exploración para un jugador en una loseta.
// Retorna −2 si aplica la confidencia, 0 si no.
function getBonusConfidenciaExploracion(jugIdx, losetaId) {
  if (!datosCaso || !estado) return 0;
  const casoId = datosCaso.comun?.caso_id || estado.caso_id;
  if (!casoId) return 0;

  const jugador = estado.jugadores[jugIdx];
  if (!jugador) return 0;
  const personaje = jugador.personaje;

  const conf = _CONFIDENCIAS[casoId]?.[personaje];
  if (!conf || conf.tipo !== 'exploracion') return 0;

  // Resolver "escena" dinámicamente
  const losetas = conf.losetas.map(l => l === 'escena' ? (datosCaso.comun?.escena_crimen || l) : l);

  return losetas.includes(losetaId) ? -2 : 0;
}

// Devuelve el modificador de dificultad de interrogación para un jugador con un PNJ.
// Retorna −2 si aplica la confidencia, 0 si no.
function getBonusConfidenciaInterrogacion(jugIdx, pnjId) {
  if (!datosCaso || !estado) return 0;
  const casoId = datosCaso.comun?.caso_id || estado.caso_id;
  if (!casoId) return 0;

  const jugador = estado.jugadores[jugIdx];
  if (!jugador) return 0;
  const personaje = jugador.personaje;

  const conf = _CONFIDENCIAS[casoId]?.[personaje];
  if (!conf || conf.tipo !== 'interrogacion') return 0;

  return conf.pnj.includes(pnjId) ? -2 : 0;
}
