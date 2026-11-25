// Formas del cuerpo: el personaje no tiene que ser una bolita. Cada forma es una silueta dibujada alrededor
// de (0,0), más o menos dentro de un radio de 34, de un solo color:
//   dibujo: color => SVG
//   ojos:   [x, y] donde van los ojos en reposo (las dos rayitas quedan a 7 de cada lado de ese punto)
//   rango:  [rx, ry] cuánto pueden pasearse al mirar sin salirse de la silueta
//   cabeza: [x, y, radio] el círculo que mejor aproxima la cabeza: ahí se ponen accesorios y objetos pegados
//   separa: media distancia entre los ojos (7 si no se dice) · ojoTam: tamaño de los ojos (1)
const punta = (R, r, n = 5) => Array.from({ length: n * 2 }, (_, i) => {
  const q = Math.PI * i / n - Math.PI / 2, d = i % 2 ? r : R;
  return `${(d * Math.cos(q)).toFixed(1)} ${(d * Math.sin(q)).toFixed(1)}`;
}).join(" L");
const redondo = c => `fill="${c}" stroke="${c}" stroke-linejoin="round" stroke-linecap="round"`;

export const FORMAS = {
  bolita: { cabeza: [0, 0, 33], ojos: [0, -4], rango: [17, 19], dibujo: c => `<circle r="33" fill="${c}"/>` },
  huevo: { cabeza: [0, 2, 27], ojos: [0, 4], rango: [11, 10], dibujo: c => `<path d="M0 -34 C18 -34 27 -6 27 8 A27 26 0 0 1 -27 8 C-27 -6 -18 -34 0 -34 Z" fill="${c}"/>` },
  gota: { cabeza: [0, 10, 26], ojos: [0, 11], rango: [10, 7], dibujo: c => `<path d="M0 -34 C14 -12 26 0 26 12 A26 26 0 0 1 -26 12 C-26 0 -14 -12 0 -34 Z" fill="${c}"/>` },
  fantasma: { cabeza: [0, -4, 26], ojos: [0, -8], rango: [9, 8], dibujo: c => `<path d="M-26 31 V-6 A26 26 0 0 1 26 -6 V31 Q19.5 21 13 31 Q6.5 21 0 31 Q-6.5 21 -13 31 Q-19.5 21 -26 31 Z" fill="${c}"/>` },
  estrella: { cabeza: [0, 0, 20], ojos: [0, 3], rango: [5, 4], dibujo: c => `<path d="M${punta(29, 14)} Z" ${redondo(c)} stroke-width="9"/>` },
  corazon: { cabeza: [0, -4, 24], ojos: [0, -3], rango: [9, 6], dibujo: c => `<path d="M0 30 C-42 4 -28 -32 0 -13 C28 -32 42 4 0 30 Z" ${redondo(c)} stroke-width="3"/>` },
  diamante: { cabeza: [0, -8, 22], ojos: [0, -6], rango: [12, 5], dibujo: c => `<path d="M-20 -26 H20 L33 -7 L0 31 L-33 -7 Z" ${redondo(c)} stroke-width="5"/>` },
  escudo: { cabeza: [0, -2, 27], ojos: [0, -7], rango: [11, 8], dibujo: c => `<path d="M-27 -25 Q0 -33 27 -25 V2 C27 20 10 29 0 34 C-10 29 -27 20 -27 2 Z" ${redondo(c)} stroke-width="4"/>` },
  burbuja: { cabeza: [0, -4, 26], ojos: [0, -5], rango: [13, 7], dibujo: c => `<path d="M-19 15 L-23 33 L-3 17 Z" ${redondo(c)} stroke-width="3"/><rect x="-31" y="-27" width="62" height="46" rx="15" fill="${c}"/>` },
  nube: { cabeza: [0, 2, 22], ojos: [0, 6], rango: [11, 4], dibujo: c => `<circle cx="-15" cy="4" r="17" fill="${c}"/><circle cx="14" cy="6" r="15" fill="${c}"/><circle cx="-1" cy="-9" r="19" fill="${c}"/><rect x="-32" y="2" width="61" height="22" rx="11" fill="${c}"/>` },

  gato: { cabeza: [0, 6, 28], ojos: [0, 5], rango: [12, 7], dibujo: c => `<path d="M-28 2 L-26 -31 L-7 -19 Z M28 2 L26 -31 L7 -19 Z" ${redondo(c)} stroke-width="5"/><ellipse cy="6" rx="31" ry="26" fill="${c}"/>` },
  conejo: { cabeza: [0, 10, 25], ojos: [0, 10], rango: [11, 6], dibujo: c => `<ellipse cx="-11" cy="-19" rx="7.5" ry="18" transform="rotate(-9 -11 -19)" fill="${c}"/><ellipse cx="11" cy="-19" rx="7.5" ry="18" transform="rotate(9 11 -19)" fill="${c}"/><ellipse cy="10" rx="28" ry="23" fill="${c}"/>` },
  oso: { cabeza: [0, 5, 28], ojos: [0, 3], rango: [12, 9], dibujo: c => `<circle cx="-22" cy="-19" r="11" fill="${c}"/><circle cx="22" cy="-19" r="11" fill="${c}"/><circle cy="5" r="28" fill="${c}"/>` },
  toro: { cabeza: [0, 7, 23], ojos: [0, 5], rango: [9, 7], dibujo: c => `<path d="M-20 -6 C-36 -8 -36 -24 -29 -31 M20 -6 C36 -8 36 -24 29 -31" fill="none" stroke="${c}" stroke-width="8" stroke-linecap="round"/><ellipse cx="-27" cy="4" rx="8" ry="5" fill="${c}"/><ellipse cx="27" cy="4" rx="8" ry="5" fill="${c}"/><ellipse cy="7" rx="23" ry="25" fill="${c}"/>` },
  pez: { cabeza: [-5, 0, 20], ojos: [-9, -2], rango: [6, 5], dibujo: c => `<path d="M16 0 L33 -17 L33 17 Z" ${redondo(c)} stroke-width="5"/><ellipse cx="-5" rx="27" ry="19" fill="${c}"/>` },
  pulpo: { cabeza: [0, -7, 26], ojos: [0, -8], rango: [11, 8], dibujo: c => `<circle cy="-7" r="26" fill="${c}"/><rect x="-25" y="6" width="10" height="27" rx="5" fill="${c}"/><rect x="-11.5" y="6" width="10" height="27" rx="5" fill="${c}"/><rect x="1.5" y="6" width="10" height="27" rx="5" fill="${c}"/><rect x="15" y="6" width="10" height="27" rx="5" fill="${c}"/>` },
  robot: { cabeza: [0, 4, 27], ojos: [0, 4], rango: [11, 8], dibujo: c => `<path d="M0 -20 V-29" stroke="${c}" stroke-width="5"/><circle cy="-31" r="5" fill="${c}"/><rect x="-35" y="-2" width="9" height="16" rx="3" fill="${c}"/><rect x="26" y="-2" width="9" height="16" rx="3" fill="${c}"/><rect x="-28" y="-20" width="56" height="49" rx="11" fill="${c}"/>` },

  planta: { cabeza: [0, 15, 18], ojos: [0, 15], rango: [6, 4], dibujo: c => `<ellipse cx="-13" cy="-16" rx="15" ry="8" transform="rotate(-32 -13 -16)" fill="${c}"/><ellipse cx="13" cy="-16" rx="15" ry="8" transform="rotate(32 13 -16)" fill="${c}"/><rect x="-2.5" y="-14" width="5" height="14" fill="${c}"/><path d="M-22 0 H22 L16 31 H-16 Z" ${redondo(c)} stroke-width="4"/>` },
  cactus: { cabeza: [0, -18, 14], ojos: [0, -12], rango: [3, 8], dibujo: c => `<path d="M-13 10 H-26 V-8 M13 16 H26 V-2" fill="none" stroke="${c}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/><rect x="-13" y="-33" width="26" height="66" rx="13" fill="${c}"/>` },
  hongo: { cabeza: [0, -12, 26], ojos: [0, -13], rango: [12, 5], dibujo: c => `<rect x="-13" y="-4" width="26" height="37" rx="10" fill="${c}"/><path d="M-34 2 A34 31 0 0 1 34 2 Q0 9 -34 2 Z" ${redondo(c)} stroke-width="3"/>` },
  manzana: { cabeza: [0, 7, 29], ojos: [0, 7], rango: [11, 7], dibujo: c => `<path d="M0 -13 Q2 -25 8 -30" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round"/><ellipse cx="13" cy="-24" rx="9" ry="4.5" transform="rotate(-25 13 -24)" fill="${c}"/><path d="M0 -13 C-10 -22 -31 -18 -31 5 C-31 23 -14 35 0 28 C14 35 31 23 31 5 C31 -18 10 -22 0 -13 Z" fill="${c}"/>` },
  helado: { cabeza: [0, -8, 20], ojos: [0, -12], rango: [8, 10], dibujo: c => `<rect x="-4.5" y="12" width="9" height="22" rx="4.5" fill="${c}"/><rect x="-21" y="-34" width="42" height="52" rx="19" fill="${c}"/>` },

  taza: { cabeza: [-6, 2, 22], ojos: [-6, -3], rango: [7, 8], dibujo: c => `<path d="M14 -10 H21 A11 11 0 0 1 21 12 H14" fill="none" stroke="${c}" stroke-width="7"/><rect x="-27" y="-25" width="42" height="54" rx="10" fill="${c}"/>` },
  foco: { cabeza: [0, -7, 26], ojos: [0, -9], rango: [11, 9], dibujo: c => `<circle cy="-7" r="26" fill="${c}"/><rect x="-11" y="14" width="22" height="19" rx="5" fill="${c}"/>` },
  cohete: { cabeza: [0, -8, 16], ojos: [0, -6], rango: [4, 8], dibujo: c => `<path d="M-14 6 L-29 28 L-12 24 Z M14 6 L29 28 L12 24 Z" ${redondo(c)} stroke-width="4"/><path d="M0 -37 C17 -22 19 2 15 26 H-15 C-19 2 -17 -22 0 -37 Z" fill="${c}"/>` },
  libro: { cabeza: [0, 0, 24], ojos: [0, -3], rango: [10, 5], dibujo: c => `<path d="M0 -17 C-10 -25 -24 -25 -32 -21 V21 C-24 17 -10 17 0 25 C10 17 24 17 32 21 V-21 C24 -25 10 -25 0 -17 Z" ${redondo(c)} stroke-width="4"/>` },
  paleta: { cabeza: [0, 0, 27], ojos: [-7, -7], rango: [8, 5], dibujo: c => `<path fill-rule="evenodd" d="M-33 0 A33 27 0 1 1 33 0 A33 27 0 1 1 -33 0 Z M9 13 a6.5 6.5 0 1 0 13 0 a6.5 6.5 0 1 0 -13 0 Z" fill="${c}"/>` },
  mancuerna: { cabeza: [0, 0, 14], ojos: [0, 0], rango: [3, 3], dibujo: c => `<rect x="-22" y="-11" width="44" height="22" rx="4" fill="${c}"/><rect x="-28" y="-23" width="12" height="46" rx="5" fill="${c}"/><rect x="16" y="-23" width="12" height="46" rx="5" fill="${c}"/><rect x="-35" y="-14" width="9" height="28" rx="4" fill="${c}"/><rect x="26" y="-14" width="9" height="28" rx="4" fill="${c}"/>` },
  control: { cabeza: [0, -4, 20], ojos: [0, -5], rango: [9, 4], dibujo: c => `<path d="M-20 -18 H20 C32 -18 36 2 34 16 C33 26 24 26 20 18 L14 8 H-14 L-20 18 C-24 26 -33 26 -34 16 C-36 2 -32 -18 -20 -18 Z" ${redondo(c)} stroke-width="4"/>` },
  pluma: { cabeza: [3, -3, 20], ojos: [3, -4], rango: [6, 6], dibujo: c => `<path d="M-33 33 L-18 18" stroke="${c}" stroke-width="5" stroke-linecap="round"/><path d="M-24 26 C-30 0 -6 -30 29 -31 C28 4 0 30 -24 26 Z" ${redondo(c)} stroke-width="3"/>` },
  regadera: { cabeza: [-6, 6, 19], ojos: [-6, 5], rango: [7, 6], dibujo: c => `<path d="M-15 -14 C-15 -31 3 -31 3 -14" fill="none" stroke="${c}" stroke-width="6" stroke-linecap="round"/><path d="M10 8 L27 -11 L33 -5 L10 22 Z" ${redondo(c)} stroke-width="3"/><ellipse cx="31" cy="-9" rx="4.5" ry="10" transform="rotate(42 31 -9)" fill="${c}"/><rect x="-26" y="-15" width="40" height="44" rx="10" fill="${c}"/>` },
  lupa: { cabeza: [-6, -6, 25], ojos: [-6, -7], rango: [10, 10], dibujo: c => `<path d="M11 11 L29 29" stroke="${c}" stroke-width="11" stroke-linecap="round"/><circle cx="-6" cy="-6" r="25" fill="${c}"/>` },
  sombrero: { cabeza: [0, 0, 14], ojos: [0, 1], rango: [3, 4], dibujo: c => `<ellipse cy="17" rx="34" ry="10" fill="${c}"/><path d="M-21 15 C-15 -6 -9 -26 7 -34 C4 -22 13 -6 21 15 Z" ${redondo(c)} stroke-width="3"/>` },
  cerebro: { cabeza: [0, 0, 26], ojos: [0, 2], rango: [9, 5], dibujo: c => `<rect x="4" y="16" width="10" height="16" rx="4" fill="${c}"/><circle cx="-14" cy="-8" r="16" fill="${c}"/><circle cx="11" cy="-10" r="17" fill="${c}"/><circle cx="-19" cy="8" r="13" fill="${c}"/><circle cx="18" cy="8" r="14" fill="${c}"/><circle cy="7" r="18" fill="${c}"/><circle cx="-2" cy="-19" r="12" fill="${c}"/>` },
  camara: { cabeza: [0, 6, 24], ojos: [0, 6], rango: [12, 7], dibujo: c => `<rect x="-14" y="-27" width="21" height="18" rx="5" fill="${c}"/><rect x="15" y="-22" width="11" height="10" rx="3" fill="${c}"/><rect x="-33" y="-16" width="66" height="43" rx="10" fill="${c}"/>` },
  casa: { cabeza: [0, 6, 26], ojos: [0, 9], rango: [11, 8], dibujo: c => `<path d="M0 -33 L31 -6 V29 H-31 V-6 Z" ${redondo(c)} stroke-width="5"/>` },
};

// Convierte una definición de Open Bot Avatar (https://github.com/DominikScholz/open-bot-avatar) en una forma:
// { body: { path }, eyes: { x, y, spacing, scale } }, con el trazo dentro de una caja de 0 a 100.
// `ajustes` permite afinar lo que el formato no trae, por ejemplo { cabeza: [0, 8, 24] }.
export function formaDeAvatar(def, ajustes = {}) {
  const d = def?.body?.path, e = def?.eyes || {}, k = .68;
  if (typeof d !== "string" || !/^[MmLlHhVvCcSsQqTtAaZz0-9eE.,\s+-]+$/.test(d)) throw new Error("La definición no trae un trazo SVG válido en body.path");
  return {
    dibujo: c => `<path transform="translate(-34 -34) scale(${k})" d="${d}" fill="${c}"/>`,
    ojos: [((e.x ?? 50) - 50) * k, ((e.y ?? 46) - 50) * k],
    separa: (e.spacing ?? 15) * k / 2, ojoTam: (e.scale ?? 1) * .8,   // allá un ojo mide 4 × 11 en la caja de 100
    rango: [7, 6], cabeza: [0, 0, 30], ...ajustes,
  };
}
