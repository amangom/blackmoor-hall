// Datos fijos de cada caso (lo que no cambia entre variantes).
window.BH_CASOS = [
  {
    id: 'caso1',
    numero: 1,
    titulo: 'La Muerte de Lord Ashworth',
    portada: 'img/caso1_portada.webp',
    pnj: [
      { id: 'marsh', el: 'el Dr. Marsh', de: 'del Dr. Marsh', a: 'al Dr. Marsh', num: 1, nombre: 'Dr. Marsh', largo: 'Dr. Elias Marsh', color: '#D42A2A', img: 'img/pnj_marsh.webp' },
      { id: 'harold', el: 'Harold', de: 'de Harold', a: 'a Harold', num: 2, nombre: 'Harold', largo: 'Harold Ashworth', color: '#F28A3C', img: 'img/pnj_harold.webp' },
      { id: 'catherine', el: 'Catherine', de: 'de Catherine', a: 'a Catherine', num: 3, nombre: 'Catherine', largo: 'Catherine Ashworth', color: '#2F7FD0', img: 'img/pnj_catherine.webp' },
      { id: 'hobbes', el: 'Hobbes', de: 'de Hobbes', a: 'a Hobbes', num: 4, nombre: 'Hobbes', largo: 'Hobbes', color: '#151515', img: 'img/pnj_hobbes.webp' },
      { id: 'pemberton', el: 'Mrs. Pemberton', de: 'de Mrs. Pemberton', a: 'a Mrs. Pemberton', num: 5, nombre: 'Mrs. Pemberton', largo: 'Mrs. Pemberton', color: '#A98FE0', img: 'img/pnj_pemberton.webp' },
      { id: 'whitfield', el: 'el Rev. Whitfield', de: 'del Rev. Whitfield', a: 'al Rev. Whitfield', num: 6, nombre: 'Rev. Whitfield', largo: 'Rev. Whitfield', color: '#4FCF8E', img: 'img/pnj_whitfield.webp' }
    ],
    pistas: {
      1: { t: 'El botón de puño', c: 'roja' },
      2: { t: 'Plantas junto a la despensa', c: 'roja' },
      3: { t: 'Documento en el escritorio', c: 'azul' },
      4: { t: 'Cartas en la Biblioteca', c: 'azul' },
      5: { t: 'Certificado en la Capilla', c: 'azul' },
      6: { t: 'Cuaderno oculto', c: 'azul' },
      7: { t: 'Nota en la Capilla', c: 'azul' },
      8: { t: 'Informe de auditoría', c: 'azul' },
      9: { t: 'La segunda copa', c: 'roja' },
      10: { t: 'Frasco vacío', c: 'roja' },
      11: { t: 'Correspondencia en la Hab. del Servicio', c: 'azul' },
      12: { t: 'Marcas en la puerta del Despacho', c: 'azul' },
      13: { t: 'Póliza de seguro', c: 'azul' },
      14: { t: 'Restos en el parterre', c: 'roja' }
    },
    culpables: { A: ['marsh', 'harold'], B: ['catherine'], C: ['pemberton'] },
    metodos: [
      'Veneno en la segunda copa',
      'Veneno en la comida de la cena',
      'Una dosis excesiva de su propia medicación',
      'Un golpe o una caída en el despacho'
    ],
    metodoCorrecto: 0,
    testigos: ['hobbes', 'whitfield'],
    implicado: {
      texto: [
        'Antes de la cena, alguien te pidió que te llevaras a Hobbes a revisar la plata del comedor de abajo. Le entretuviste quince minutos sin sospechar nada.',
        'Tu objetivo: que el caso se resuelva sin que te acusen.'
      ],
      aviso: {
        hobbes: 'Cuidado con Hobbes: si llega a Sospecha 3, contará que un investigador le apartó del comedor, y se colocará el token de Implicado.',
        whitfield: 'Cuidado con el Rev. Whitfield: os vio salir juntos. Si llega a Sospecha 3, lo contará, y se colocará el token de Implicado.'
      }
    },
    textos: 'caso1'
  }
];

window.BH_PJ = [
  { id: 'doctor', nombre: 'Doctor', art: 'el', img: 'img/pj_doctor.webp' },
  { id: 'institutriz', nombre: 'Institutriz', art: 'la', img: 'img/pj_institutriz.webp' },
  { id: 'inspector', nombre: 'Inspector', art: 'el', img: 'img/pj_inspector.webp' },
  { id: 'medium', nombre: 'Médium', art: 'la', img: 'img/pj_medium.webp' },
  { id: 'mayordomo', nombre: 'Mayordomo', art: 'el', img: 'img/pj_mayordomo.webp' },
  { id: 'periodista', nombre: 'Periodista', art: 'el', img: 'img/pj_periodista.webp' }
];
