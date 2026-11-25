// Motor del monito: convierte una escena (pistas de claves) en un SVG por instante.
// No toca el DOM, así que sirve igual en el navegador (index.html) y en node (grabar.mjs).

// Curvas
export const lin = u => u;
export const sale = u => 1 - (1 - u) ** 2;
export const entra = u => u * u;
export const ambas = u => u < .5 ? 4 * u ** 3 : 1 - (-2 * u + 2) ** 3 / 2;
export const pasa = u => { const c = 1.1; return 1 + (c + 1) * (u - 1) ** 3 + c * (u - 1) ** 2; };

export const limita = (v, a, b) => Math.max(a, Math.min(b, v));
export const mezcla = (a, b, w) => a + (b - a) * w;
export const rampa = (a, b, v) => { const u = limita((v - a) / (b - a), 0, 1); return u * u * (3 - 2 * u); };
const pulso = (t, centro, ancho) => { const u = Math.abs(t - centro) / (ancho / 2); return u >= 1 ? 0 : .5 + .5 * Math.cos(Math.PI * u); };

// Pista: claves [tiempo, valor, curva para llegar, punto de control opcional para ir en arco]
export function pista(claves) {
  return t => {
    if (t <= claves[0][0]) return claves[0][1];
    for (let i = 1; i < claves.length; i++) {
      const [t1, v1, curva = lin, c] = claves[i], [t0, v0] = claves[i - 1];
      if (t > t1) continue;
      const u = curva((t - t0) / (t1 - t0));
      if (typeof v0 === "number") return v0 + (v1 - v0) * u;
      if (c) return v0.map((a, k) => (1 - u) ** 2 * a + 2 * (1 - u) * u * c[k] + u * u * v1[k]);
      return v0.map((a, k) => a + (v1[k] - a) * u);
    }
    return claves.at(-1)[1];
  };
}

// Promedia la pista en una ventana centrada: redondea las esquinas entre un movimiento y el siguiente
export function suave(f, ventana, n = 8) {
  return t => {
    let suma = null;
    for (let i = 0; i <= n; i++) {
      const v = f(Math.max(0, t + ventana * (i / n - .5)));
      suma = suma === null ? (typeof v === "number" ? v : [...v])
        : typeof v === "number" ? suma + v : suma.map((a, k) => a + v[k]);
    }
    return typeof suma === "number" ? suma / (n + 1) : suma.map(a => a / (n + 1));
  };
}
console.assert(pista([[0, 0], [1, 10, lin]])(.5) === 5 && pista([[0, [0, 0]], [1, [2, 2], lin, [0, 2]]])(1)[0] === 2, "pista mal");
console.assert(Math.abs(suave(pista([[0, 0], [1, 10, lin]]), .2)(.5) - 5) < 1e-9, "suave mal");

// Tamaño del escenario en unidades (origen en el centro) y del video en píxeles
export const FORMATOS = {
  horizontal: { ancho: 480, alto: 270, px: [1920, 1080] },
  vertical: { ancho: 270, alto: 480, px: [1080, 1920] },
  cuadrado: { ancho: 300, alto: 300, px: [1080, 1080] },
};

// ---------------------------------------------------------------------------
// Animaciones: piezas que se encadenan con secuencia(). Cada una devuelve un clip
// con tiempos desde 0 y posiciones relativas a donde está parado el monito (su ancla).
// Toda pista que un clip define empieza en el instante 0 y termina en reposo:
// posición [0,0], tamaño 1, ladeo 0, mirada 0 (salvo lo que declare en fin, finTam o finGiro).
const a = ambas, s = sale, e = entra;

export const animaciones = {
  pausa: (dura = .5) => ({ dura }),

  // Entra en un columpio en U desde arriba y se asienta en `en` (posición absoluta). `desde`: "derecha" o "izquierda"
  entrar: ({ en = [0, 0], desde = "derecha" } = {}) => ({ ancla, alto }) => {
    const [dx, dy] = [en[0] - ancla[0], en[1] - ancla[1]], y0 = -alto / 2 - 70 - ancla[1], k = desde === "izquierda" ? -1 : 1;
    return {
      dura: 1.45, fin: [dx, dy],
      pos: [[0, [dx + 52 * k, y0]], [.38, [dx - 60 * k, dy + 42], lin, [dx - 88 * k, dy - 66]],
        [.8, [dx, dy - 22], s, [dx - 12 * k, dy + 72]], [1.05, [dx, dy - 23]], [1.45, [dx, dy], a]],
      tam: [[0, 1.6], [.45, 1, s], [1.45, 1]],
      miraY: [[0, -1], [1.05, -1], [1.45, 0, a]],
      lanzado: [[0, 1], [1.0, 1], [1.2, 0], [1.45, 0]],
      sentido: [[0, k], [1.45, k]],
    };
  },
  // Toma impulso, se deja caer y sale columpiándose. `hacia`: "derecha" o "izquierda"
  salir: ({ hacia = "derecha" } = {}) => ({ ancla, ancho }) => {
    const k = hacia === "izquierda" ? -1 : 1, x1 = k * (ancho / 2 + 80) - ancla[0];
    return {
      dura: 1.05, fin: [x1, -110],
      pos: [[0, [0, 0]], [.3, [0, -7], a], [.65, [40 * k, 67], e, [-8 * k, 71]], [1.05, [x1, -110], lin, [40 * k + (x1 - 40 * k) * .4, 63]]],
      miraX: [[0, 0], [.25, .6 * k, a], [.5, 0, a], [1.05, 0]],
      lanzado: [[0, 0], [.3, 0], [.42, 1], [1.05, 1]],
      sentido: [[0, k], [1.05, k]],
    };
  },
  // Se asoma por el borde de abajo, mira a los lados y se esconde. Para el inicio o después de salir.
  asomarse: ({ x = 0 } = {}) => ({ ancla, alto, tam }) => {
    const dx = x - ancla[0], abajo = alto / 2 + 45 * tam - ancla[1], asomado = alto / 2 - 6 * tam - ancla[1];
    return {
      dura: 2.2, fin: [dx, abajo],
      pos: [[0, [dx, abajo]], [.5, [dx, asomado], s], [1.75, [dx, asomado]], [2.2, [dx, abajo], e]],
      miraX: [[0, 0], [.6, 0], [.82, -.8, a], [1.1, -.8], [1.35, .8, a], [1.6, .8], [1.78, 0, a], [2.2, 0]],
      miraY: [[0, -.7], [.5, -.4, a], [1.75, -.4], [2.2, 0, a]],
      lanzado: [[0, 0], [2.2, 0]],
    };
  },
  // Se desliza en arco a otra posición absoluta
  moverA: (destino, dura = .8) => ({ ancla }) => {
    const [dx, dy] = [destino[0] - ancla[0], destino[1] - ancla[1]], lado = Math.sign(dx) * .7;
    return {
      dura, fin: [dx, dy],
      pos: [[0, [0, 0]], [dura, [dx, dy], a, [dx / 2, dy / 2 - 25]]],
      miraX: [[0, 0], [dura * .25, lado, a], [dura * .8, lado], [dura, 0, a]],
    };
  },
  // Se mece en su sitio
  flotar: (dura = 2) => {
    const pos = [[0, [0, 0]]];
    for (let t = .65, i = 0; t < dura - .3; t += .65, i++) pos.push([t, [0, i % 2 ? 3 : -3], a]);
    pos.push([dura, [0, 0], a]);
    return { dura, pos, parpadeos: [[dura / 2]] };
  },

  saltar: (altura = 46) => ({
    dura: .95,
    pos: [[0, [0, 0]], [.14, [0, 6], a], [.45, [0, -altura], s], [.8, [0, 0], e], [.88, [0, 3], s], [.95, [0, 0], a]],
    miraY: [[0, 0], [.14, .2, a], [.45, -.5, a], [.8, .1, a], [.95, 0, a]],
  }),
  // Vuelta completa en el aire
  voltereta: () => ({
    dura: 1, finGiro: 360,
    pos: [[0, [0, 0]], [.15, [0, 5], a], [.5, [0, -34], s], [.85, [0, 0], e], [1, [0, 0]]],
    ladeo: [[0, 0], [.15, -12, a], [.82, 360, a], [1, 360]],
  }),
  // Dos saltitos de gusto
  celebrar: () => ({
    dura: 1.7,
    pos: [[0, [0, 0]], [.1, [0, 5], a], [.35, [0, -38], s], [.6, [0, 0], e], [.7, [0, 4], a],
      [.95, [0, -30], s], [1.2, [0, 0], e], [1.3, [0, 2], s], [1.7, [0, 0], a]],
    ladeo: [[0, 0], [.35, -10, a], [.6, 0, a], [.95, 10, a], [1.2, 0, a], [1.7, 0]],
    miraY: [[0, 0], [.3, -.6, a], [1.2, -.6], [1.5, 0, a], [1.7, 0]],
    tam: [[0, 1], [.35, 1.1, s], [.6, 1, a], [.95, 1.1, s], [1.2, 1, a], [1.7, 1]],
  }),
  // Se balancea de lado a lado
  bailar: (compases = 2) => {
    const pos = [[0, [0, 0]]], ladeo = [[0, 0]];
    let t = 0;
    for (let i = 0; i < compases * 2; i++) {
      const lado = i % 2 ? 1 : -1;
      pos.push([t + .3, [lado * 14, -6], a], [t + .6, [lado * 4, 0], a]);
      ladeo.push([t + .3, lado * 12, a], [t + .6, lado * 3, a]);
      t += .6;
    }
    pos.push([t + .3, [0, 0], a]);
    ladeo.push([t + .3, 0, a]);
    return { dura: t + .3, pos, ladeo, parpadeos: [[t / 2]] };
  },

  // Dice que sí
  asentir: () => ({
    dura: .9,
    miraY: [[0, 0], [.18, .55, a], [.36, -.1, a], [.54, .55, a], [.75, 0, a], [.9, 0]],
    pos: [[0, [0, 0]], [.18, [0, 3], a], [.36, [0, -1], a], [.54, [0, 3], a], [.75, [0, 0], a], [.9, [0, 0]]],
  }),
  // Dice que no
  negar: () => ({
    dura: 1,
    miraX: [[0, 0], [.18, -.6, a], [.4, .6, a], [.62, -.5, a], [.85, 0, a], [1, 0]],
    ladeo: [[0, 0], [.18, -4, a], [.4, 4, a], [.62, -3, a], [.85, 0, a], [1, 0]],
  }),
  mirarAlrededor: () => ({
    dura: 2,
    miraX: [[0, 0], [.3, -.85, a], [.8, -.85], [1.15, .85, a], [1.65, .85], [1.95, 0, a], [2, 0]],
    miraY: [[0, 0], [.3, -.2, a], [1.65, -.2], [1.95, 0, a], [2, 0]],
    parpadeos: [[.98, .2]],
  }),
  // Ladea la cabeza y mira hacia arriba, con curiosidad
  curiosear: () => ({
    dura: 1.6,
    ladeo: [[0, 0], [.35, 16, s], [1.2, 16], [1.55, 0, a], [1.6, 0]],
    miraX: [[0, 0], [.35, .45, a], [1.2, .45], [1.55, 0, a], [1.6, 0]],
    miraY: [[0, 0], [.35, -.45, a], [1.2, -.45], [1.55, 0, a], [1.6, 0]],
    parpadeos: [[.8, .3]],
  }),
  sorpresa: () => ({
    dura: 1,
    tam: [[0, 1], [.16, 1.28, pasa], [.6, 1.28], [.95, 1, a], [1, 1]],
    pos: [[0, [0, 0]], [.16, [0, -9], s], [.6, [0, -9]], [.95, [0, 0], a], [1, [0, 0]]],
    miraY: [[0, 0], [.16, -.25, s], [.6, -.25], [.95, 0, a], [1, 0]],
  }),
  // Tiembla encogido, con los ojos apretados
  temblar: () => ({
    dura: 1,
    pos: [[0, [0, 0]], [.1, [-8, 0]], [.22, [8, 0]], [.34, [-8, 0]], [.46, [8, 0]], [.58, [-6, 0]], [.7, [6, 0]], [.82, [0, 0]], [1, [0, 0]]],
    tam: [[0, 1], [.1, .93, s], [.7, .93], [.95, 1, a], [1, 1]],
    parpadeos: [[.4, .7]],
  }),
  // Se va quedando dormido y despierta
  dormir: (dura = 3) => ({
    dura,
    ladeo: [[0, 0], [dura * .3, 14, a], [dura * .8, 14], [dura, 0, a]],
    pos: [[0, [0, 0]], [dura * .3, [0, 6], a], [dura * .8, [0, 6]], [dura, [0, 0], a]],
    miraY: [[0, 0], [dura * .25, .35, a], [dura * .8, .35], [dura, 0, a]],
    parpadeos: [[dura * .5, dura * .9]],
  }),

  // Cambia de tamaño y se queda así
  crecer: (factor, dura = .4) => ({ dura, finTam: factor, tam: [[0, 1], [dura, factor, pasa]] }),
  // Le llega un accesorio volando y se lo pone. `crece` lo deja de otro tamaño al ponérselo.
  ponerse: (tipo, { color, desde = [52, -50], crece = 1 } = {}) => ({
    dura: 1.4, finTam: crece,
    accesorio: { tipo, color, nace: 0, captura: .75, desde, sobre: [desde[0] * .45, desde[1] - 10] },
    pos: [[0, [0, 0]], [.55, [0, -6], a], [.75, [0, -6]], [1.15, [0, 0], a], [1.4, [0, 0]]],
    tam: crece === 1
      ? [[0, 1], [.75, 1], [.95, 1.15, s], [1.35, 1, a], [1.4, 1]]
      : [[0, 1], [.75, 1], [1.03, crece, pasa], [1.4, crece]],
    parpadeos: [[.14, .3], [1.2, .3]],
  }),
  // Suelta el accesorio que se puso con ponerse(): sale volando hacia arriba a la derecha
  quitarse: tipo => ({
    dura: .8, quita: { tipo, en: .2 },
    pos: [[0, [0, 0]], [.2, [0, 3], a], [.45, [0, -4], a], [.8, [0, 0], a]],
    miraX: [[0, 0], [.3, .6, a], [.6, .6], [.8, 0, a]],
    miraY: [[0, 0], [.3, -.5, a], [.6, -.5], [.8, 0, a]],
  }),

  // --- Objetos: cualquier cosa que no sea Orbi. `dibujo` es SVG dibujado alrededor de (0,0).
  // Sueltos: `en` son coordenadas del escenario. Con `pegado: true`, `en` es relativo al centro de la cabeza (radio 33).
  aparecer: (id, dibujo, { en = [80, 0], pegado = false, capa = "frente", tam = 1, mira = true } = {}) => ({
    dura: .6, miraA: mira && !pegado ? id : undefined,
    objetos: { [id]: { dibujo, pegado, capa, pos: [[0, en]], tam: [[0, 0], [.4, tam, pasa], [.6, tam]],
      giro: [[0, -25], [.4, 0, s], [.6, 0]], opacidad: [[0, 0], [.12, 1], [.6, 1]] } },
  }),
  desaparecer: id => ({ objetos }) => {
    const k = objetos[id]?.tam.at(-1)?.[1] ?? 1;
    return { dura: .45, objetos: { [id]: { tam: [[0, k], [.35, 0, e], [.45, 0]], opacidad: [[0, 1], [.3, 1], [.42, 0], [.45, 0]] } } };
  },
  // Mueve un objeto suelto en arco a otro punto del escenario; Orbi lo sigue con la vista
  moverObjeto: (id, destino, dura = .7) => ({ objetos }) => {
    const de = objetos[id]?.pos.at(-1)?.[1] ?? destino;
    return { dura, miraA: id, objetos: { [id]: { pos: [[0, de], [dura, destino, a, [(de[0] + destino[0]) / 2, (de[1] + destino[1]) / 2 - 20]]] } } };
  },
  // El objeto se sacude (un teléfono que suena, una alarma)
  vibrar: (id, dura = 1) => {
    const giro = [[0, 0]];
    for (let t = .08, i = 0; t < dura - .1; t += .16, i++) giro.push([t, i % 2 ? -16 : 16, a]);
    giro.push([dura, 0, a]);
    return { dura, miraA: id, objetos: { [id]: { giro } } };
  },
  // Orbi toma un objeto suelto: vuela hasta su cabeza y desde ahí lo lleva pegado. `en` es relativo al centro de la cabeza.
  tomar: (id, { en = [40, 8], tam = 1 } = {}) => ({ ancla, tam: k, objetos }) => {
    const o = objetos[id], de = o?.pos.at(-1)?.[1] ?? ancla, t0 = o?.tam.at(-1)?.[1] ?? 1;
    const destino = [ancla[0] + en[0] * k, ancla[1] + en[1] * k];
    return {
      dura: .7, miraA: id,
      objetos: { [id]: { pegadoEn: .55, enCabeza: en, tamPegado: tam,
        pos: [[0, de], [.55, destino, a, [(de[0] + destino[0]) / 2, Math.min(de[1], destino[1]) - 25]], [.7, destino]],
        tam: [[0, t0], [.55, tam * k, a], [.7, tam * k]] } },
    };
  },
};

// Dibujos listos para usar como objetos; cualquier SVG propio sirve igual
export const DIBUJOS = {
  telefono: (pantalla = "#3ddc97", cuerpo = "#3a3f4b") => `<rect x="-11" y="-20" width="22" height="40" rx="5" fill="${cuerpo}"/><rect x="-8.5" y="-15.5" width="17" height="27" rx="2" fill="${pantalla}"/><circle cy="15.6" r="1.7" fill="#fff" fill-opacity=".75"/>`,
  corazon: (c = "#ff4d6d") => `<path d="M0 10 C-16 -2 -10 -14 0 -6 C10 -14 16 -2 0 10 Z" fill="${c}"/>`,
  estrella: (c = "#ffc93d") => `<path d="M0 -13 L3.8 -4.2 L13 -3.6 L5.9 2.6 L8.2 12 L0 7 L-8.2 12 L-5.9 2.6 L-13 -3.6 L-3.8 -4.2 Z" fill="${c}" stroke="${c}" stroke-width="2" stroke-linejoin="round"/>`,
  // Globo de diálogo con texto corto: así «habla» sin tener boca
  globo: (texto, c = "#15171d", tinta = "#ffffff") => {
    const w = Math.max(30, texto.length * 6.4 + 16), limpio = texto.replace(/&/g, "&amp;").replace(/</g, "&lt;");
    return `<path d="M${-w / 2 + 12} 10 L${-w / 2 + 25} 20 L${-w / 2 + 24} 10 Z" fill="${c}"/><rect x="${-w / 2}" y="-12" width="${w}" height="24" rx="12" fill="${c}"/>` +
      `<text y="4.2" text-anchor="middle" font-family="Inter, sans-serif" font-weight="600" font-size="11.5" fill="${tinta}">${limpio}</text>`;
  },
};

// Encadena animaciones y devuelve las pistas de la escena, listas para monito()
export function secuencia(pasos, { formato = "horizontal", en = [0, 0], tamano = 1 } = {}) {
  const { ancho, alto } = FORMATOS[formato];
  const esc = { formato, posicion: [], tamano: [], ladeo: [], miraX: [], miraY: [], lanzado: [], sentido: [], deforma: [], ojos: [], opacidad: [], parpadeos: [], accesorios: [], textos: [], miradas: [] };
  const objs = {};
  let t = 0, ancla = [...en], tam = tamano, giro = 0;
  const mas = ([x, y]) => [ancla[0] + x, ancla[1] + y];
  for (let paso of pasos) {
    let rotulo;
    if (Array.isArray(paso)) [rotulo, paso] = paso;   // ["texto en pantalla", animación]
    const c = typeof paso === "function" ? paso({ ancho, alto, ancla, tam, objetos: objs }) : paso;
    if (rotulo) esc.textos.push({ desde: t, hasta: t + c.dura, texto: rotulo });
    for (const [tk, v, curva, ctrl] of c.pos || []) esc.posicion.push([t + tk, mas(v), curva, ctrl && mas(ctrl)]);
    for (const [tk, v, curva] of c.tam || []) esc.tamano.push([t + tk, v * tam, curva]);
    for (const [tk, v, curva] of c.ladeo || []) esc.ladeo.push([t + tk, v + giro, curva]);
    for (const nombre of ["miraX", "miraY", "lanzado", "sentido", "deforma", "ojos", "opacidad"]) {
      for (const [tk, v, curva] of c[nombre] || []) esc[nombre].push([t + tk, v, curva]);
    }
    for (const [tk, dura] of c.parpadeos || []) esc.parpadeos.push([t + tk, dura]);
    if (c.accesorio) {
      const ac = c.accesorio;
      esc.accesorios.push({ ...ac, nace: t + ac.nace, captura: t + ac.captura, desde: mas(ac.desde), sobre: mas(ac.sobre) });
    }
    if (c.quita) {
      const ac = esc.accesorios.findLast(x => x.tipo === c.quita.tipo && x.quita === undefined);
      if (!ac) throw new Error(`quitarse("${c.quita.tipo}"): no lo trae puesto`);
      ac.quita = t + c.quita.en;
    }
    if (c.miraA) esc.miradas.push({ a: c.miraA, desde: t, hasta: t + c.dura });
    for (const [id, o] of Object.entries(c.objetos || {})) {
      const reg = objs[id] ??= { id, pos: [], tam: [], giro: [], opacidad: [] };
      for (const k of ["dibujo", "pegado", "capa", "enCabeza", "tamPegado"]) if (o[k] !== undefined) reg[k] = o[k];
      if (o.pegadoEn !== undefined) reg.pegadoDesde = t + o.pegadoEn;
      for (const k of ["pos", "tam", "giro", "opacidad"]) {
        for (const [tk, v, curva, ctrl] of o[k] || []) reg[k].push([t + tk, v, curva, ctrl]);
      }
    }
    if (c.fin) ancla = mas(c.fin);
    tam *= c.finTam ?? 1;
    giro += c.finGiro ?? 0;
    t += c.dura;
  }
  // Lo que ninguna animación movió desde el principio arranca en reposo
  const reposo = { posicion: [...en], tamano, ladeo: 0, miraX: 0, miraY: 0, lanzado: 0, sentido: 1, deforma: [1, 1], ojos: 1, opacidad: 1 };
  for (const [nombre, valor] of Object.entries(reposo)) {
    if (!esc[nombre].length || esc[nombre][0][0] > 0) esc[nombre].unshift([0, valor]);
  }
  // Un objeto no se ve antes de aparecer; las pistas que nadie tocó quedan en su valor por defecto
  esc.objetos = Object.values(objs).map(o => {
    if (!o.dibujo) throw new Error(`El objeto "${o.id}" no tiene dibujo: créalo primero con aparecer()`);
    if (o.opacidad.length && o.opacidad[0][0] > 0) o.opacidad.unshift([0, 0]);
    for (const k of ["pos", "tam", "giro", "opacidad"]) if (!o[k].length) delete o[k];
    return o;
  });
  esc.duracion = t;
  return esc;
}

// Accesorios, dibujados alrededor del centro de la cabeza (0,0), radio 33.
// atras: detrás de la cabeza · frente: delante · volando: cómo se ve mientras llega
// sigueOjos: el frente se mueve con la mirada (para lo que va sobre los ojos)
export const ACCESORIOS = {
  audifonos: c => ({
    atras: `<path d="M-37 -8 A 37 37 0 0 1 33 -17" fill="none" stroke="${c}" stroke-width="6" stroke-linecap="round"/><ellipse cx="35" cy="-2" rx="7" ry="11" fill="${c}"/>`,
    frente: `<ellipse cx="-33" cy="3" rx="8.5" ry="13" transform="rotate(-8 -33 3)" fill="${c}"/><path d="M-33 14 Q -31 27 -17 26" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round"/><ellipse cx="-13" cy="26" rx="6" ry="4" fill="${c}"/>`,
    volando: `<path d="M-33 -4 A 33.5 33.5 0 0 1 33 -4" fill="none" stroke="${c}" stroke-width="6" stroke-linecap="round"/><ellipse cx="-34" cy="3" rx="7.5" ry="12" fill="${c}"/><ellipse cx="34" cy="3" rx="7.5" ry="12" fill="${c}"/><path d="M-34 14 Q -32 27 -18 26" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round"/><ellipse cx="-14" cy="26" rx="6" ry="4" fill="${c}"/>`,
  }),
  lentes: c => {
    const d = `<rect x="-17" y="-10" width="15.5" height="20" rx="6.5" fill="none" stroke="${c}" stroke-width="3"/><rect x="1.5" y="-10" width="15.5" height="20" rx="6.5" fill="none" stroke="${c}" stroke-width="3"/><path d="M-1.5 -1 H1.5" stroke="${c}" stroke-width="3"/>`;
    return { atras: "", frente: d, volando: d, sigueOjos: true };
  },
  gorra: c => {
    const d = `<path d="M-27 -19 A 33.5 33.5 0 0 1 27 -19 Z" fill="${c}"/><rect x="6" y="-25" width="42" height="8" rx="4" fill="${c}"/>`;
    return { atras: "", frente: d, volando: d };
  },
  corona: c => {
    const d = `<path d="M-18 -27 L-20 -45 L-9.5 -37 L0 -49 L9.5 -37 L20 -45 L18 -27 Q0 -37.5 -18 -27 Z" fill="${c}" stroke="${c}" stroke-width="3.5" stroke-linejoin="round"/>`;
    return { atras: "", frente: d, volando: d };
  },
};

const n = v => +v.toFixed(2);

// Prepara una escena y devuelve { duracion, fps, px, transparente, svg(t) }
export function monito(escena) {
  const formato = FORMATOS[escena.formato || "horizontal"];
  const col = { fondo: "#f8f9f6", cuerpo: "#15171d", ojos: "#ffffff", acento: "#ff6a3d", texto: "#15171d", ...escena.colores };
  const duracion = escena.duracion;

  const posicion = suave(pista(escena.posicion || [[0, [0, 0]]]), .12);
  const tamano = suave(pista(escena.tamano || [[0, 1]]), .1);
  const ladeo = suave(pista(escena.ladeo || [[0, 0]]), .2);
  const miraX = suave(pista(escena.miraX || [[0, 0]]), .22);
  const miraY = suave(pista(escena.miraY || [[0, 0]]), .22);
  const parpadeos = escena.parpadeos || [];
  const lanzadoEn = escena.lanzado ? pista(escena.lanzado) : () => 1;   // cuándo puede volverse cápsula
  const deforma = suave(pista(escena.deforma || [[0, [1, 1]]]), .08);   // [ancho, alto] del cuerpo: aplastar y estirar
  const ojos = suave(pista(escena.ojos || [[0, 1]]), .08);              // apertura: 0 cerrados, 1 normal, más de 1 muy abiertos
  const opacidadEn = pista(escena.opacidad || [[0, 1]]);
  const sentidoEn = escena.sentido ? pista(escena.sentido) : () => 1;   // -1 mientras se columpia hacia la izquierda
  // Objetos: elementos propios de la escena, sueltos (coordenadas del escenario) o pegados a la cabeza
  const objetos = (escena.objetos || []).map(o => ({
    ...o,
    pos: suave(pista(o.pos || [[0, [0, 0]]]), .08),
    tam: suave(pista(o.tam || [[0, 1]]), .08),
    giro: suave(pista(o.giro || [[0, 0]]), .08),
    opacidad: pista(o.opacidad || [[0, 1]]),
  }));
  const miradas = escena.miradas || [];
  const flota = escena.flota;   // [desde, hasta] o nada

  // Cada accesorio: puesto desde el inicio, o llega volando entre `nace` y `captura`
  const accesorios = [...(escena.accesoriosPuestos || []), ...(escena.accesorios || [])].map(a => {
    if (!ACCESORIOS[a.tipo]) throw new Error(`No existe el accesorio "${a.tipo}". Hay: ${Object.keys(ACCESORIOS).join(", ")}`);
    const dibujo = ACCESORIOS[a.tipo](a.color || col.acento);
    const fuera = a.quita === undefined ? {} : { quita: a.quita, de: posicion(a.quita), kFuera: tamano(a.quita) };
    if (a.nace === undefined) return { ...dibujo, ...fuera, nace: -1, captura: -1 };
    const desde = a.desde || [52, -47], sobre = a.sobre || [24, -57], llega = posicion(a.captura);
    return {
      ...dibujo, ...fuera, nace: a.nace, captura: a.captura,
      aparece: pista([[a.nace, 0], [a.nace + .25, 1, sale]]),
      pos: suave(pista([[a.nace, desde], [a.nace + .25, [desde[0], desde[1] - 4], sale],
        [a.captura - .13, sobre, ambas], [a.captura, llega, entra]]), .06),
      giro: suave(pista([[a.nace, 70], [a.nace + .25, 12, sale], [a.captura - .13, -22, ambas], [a.captura, 0, entra]]), .06),
      escala: tamano(a.captura - .1),
    };
  });

  // Cada rótulo va abajo, salvo que el monito ande por ahí a mitad del rótulo: entonces va arriba
  const rotulos = (escena.textos || []).map(x => ({ ...x, arriba: posicion((x.desde + x.hasta) / 2)[1] > formato.alto * .12 }));

  function svg(t, pixeles = false) {
    let [x, y] = posicion(t);
    const h = .03;
    const [xa, ya] = posicion(Math.max(0, t - h)), [xb, yb] = posicion(t + h);
    const vx = (xb - xa) / (2 * h), vy = (yb - ya) / (2 * h), rapidez = Math.hypot(vx, vy) || 1e-6;
    const k = tamano(t);
    if (flota) y += 2.2 * Math.sin(t * Math.PI * 2 / 2.6) * rampa(flota[0], flota[0] + .6, t) * (1 - rampa(flota[1] - .3, flota[1], t));

    // Mientras va rápido es una cápsula estirada con los ojos por delante
    const lanzado = rampa(140, 520, rapidez) * lanzadoEn(t);
    const estira = Math.min(.85, rapidez / 1100);
    const angulo = Math.atan2(vy, vx) * 180 / Math.PI;
    // La cápsula apunta con los ojos por delante; hacia la izquierda se toma la otra vuelta para no girar de más
    const giro = mezcla(ladeo(t), sentidoEn(t) < 0 ? (angulo + 360) % 360 - 270 : angulo + 90, lanzado);

    // Mirada: la suya, hacia adelante si va lanzado, o al accesorio que está llegando
    const llegando = accesorios.find(a => a.nace >= 0 && t >= a.nace && t < a.captura + .15);
    let gx = mezcla(miraX(t), 0, lanzado), gy = mezcla(miraY(t), -1, lanzado);
    if (llegando) {
      const [cx, cy] = llegando.pos(t), dx = cx - x, dy = cy - 30 * k - y, d = Math.hypot(dx, dy) || 1;
      const w = rampa(llegando.nace + .1, llegando.nace + .4, t) * (1 - rampa(llegando.captura - .03, llegando.captura + .15, t));
      gx = mezcla(gx, dx / d * .9, w);
      gy = mezcla(gy, dy / d * .9, w);
    }
    const mirada = miradas.find(m => t >= m.desde && t <= m.hasta);
    const visto = mirada && objetos.find(o => o.id === mirada.a);
    if (visto && !visto.pegado && !(t >= visto.pegadoDesde)) {
      const [ox, oy] = visto.pos(t), dx = ox - x, dy = oy - y, d = Math.hypot(dx, dy) || 1;
      const w = rampa(mirada.desde, mirada.desde + .25, t) * (1 - rampa(mirada.hasta - .25, mirada.hasta, t));
      gx = mezcla(gx, dx / d * .9, w);
      gy = mezcla(gy, dy / d * .9, w);
    }
    const cierre = Math.max(0, ...parpadeos.map(([c, a = .22]) => pulso(t, c, a)));
    const ex = gx * 17, ey = -4 + gy * 19;
    const ojo = dx => `<rect x="-2.5" y="-6.5" width="5" height="13" rx="2.5" fill="${col.ojos}" transform="translate(${n(ex + dx)} ${n(ey)}) scale(1 ${n(Math.max(.12, (1 - .88 * cierre) * ojos(t)))})"/>`;

    const puestos = accesorios.filter(a => t >= a.captura && !(a.quita <= t));
    const frente = puestos.map(a => a.sigueOjos ? `<g transform="translate(${n(ex)} ${n(ey)})">${a.frente}</g>` : a.frente).join("");
    const volando = accesorios.filter(a => t >= a.nace && t < a.captura).map(a => {
      const [cx, cy] = a.pos(t), flota = Math.sin(t * 6) * 1.5 * (1 - rampa(a.captura - .2, a.captura, t));
      return `<g transform="translate(${n(cx)} ${n(cy + flota)}) scale(${n(a.escala * a.aparece(t))}) rotate(${n(a.giro(t))})">${a.volando}</g>`;
    }).join("") + accesorios.filter(a => t >= a.quita && t < a.quita + .6).map(a => {
      const u = (t - a.quita) / .6, v = sale(u);   // se va hacia arriba a la derecha, encogiéndose
      return `<g transform="translate(${n(a.de[0] + 80 * v)} ${n(a.de[1] - 60 * v)}) scale(${n(a.kFuera * (1 - u * u))}) rotate(${n(90 * u)})">${a.volando}</g>`;
    }).join("");

    // Un objeto va suelto, pegado desde siempre (sus pistas son relativas a la cabeza) o pegado desde que Orbi lo toma
    const pinta = o => {
      const op = o.opacidad(t);
      if (op < .004) return "";
      const tomado = !o.pegado && t >= o.pegadoDesde;
      const [ox, oy] = tomado ? o.enCabeza : o.pos(t);
      return `<g transform="translate(${n(ox)} ${n(oy)}) rotate(${n(o.giro(t))}) scale(${n(tomado ? o.tamPegado : o.tam(t))})" opacity="${n(op)}">${o.dibujo}</g>`;
    };
    const capa = (enCabeza, cual) => objetos.filter(o => (!!o.pegado || t >= o.pegadoDesde) === enCabeza && (o.capa || "frente") === cual).map(pinta).join("");

    const [fx, fy] = deforma(t);
    const { ancho, alto, px } = formato;
    // Rótulos: aparecen subiendo un poco y se desvanecen
    const halo = col.fondo === "transparente" ? "#ffffff" : col.fondo;   // contorno para leerlo encima del monito
    const textos = rotulos.filter(x => t >= x.desde && t <= x.hasta).map(x => {
      const w = rampa(x.desde, x.desde + .25, t) * (1 - rampa(x.hasta - .2, x.hasta, t));
      const limpio = x.texto.replace(/&/g, "&amp;").replace(/</g, "&lt;");
      return `<text x="0" y="${n((x.arriba ? -alto * .36 : alto * .4) + (1 - w) * 4)}" text-anchor="middle" font-family="Inter, sans-serif" font-weight="600" font-size="${n(Math.min(ancho, alto) * .06)}" fill="${col.texto}" stroke="${halo}" stroke-width="4" stroke-linejoin="round" paint-order="stroke" opacity="${n(w)}">${limpio}</text>`;
    }).join("");
    const medidas = pixeles ? ` width="${px[0]}" height="${px[1]}"` : "";
    const fondo = col.fondo === "transparente" ? "" : `<rect x="${-ancho / 2}" y="${-alto / 2}" width="${ancho}" height="${alto}" fill="${col.fondo}"/>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-ancho / 2} ${-alto / 2} ${ancho} ${alto}"${medidas}>${fondo}${capa(false, "atras")}` +
      `<g transform="translate(${n(x)} ${n(y)}) rotate(${n(angulo)}) scale(${n(1 + estira)} ${n(1 / (1 + estira))}) rotate(${n(-angulo)}) scale(${n(k * fx)} ${n(k * fy)}) rotate(${n(giro)})" opacity="${n(opacidadEn(t))}">` +
      `${puestos.map(a => a.atras).join("")}${capa(true, "atras")}<circle r="33" fill="${col.cuerpo}"/>${ojo(-7)}${ojo(7)}${frente}${capa(true, "frente")}</g>${volando}${capa(false, "frente")}${textos}</svg>`;
  }

  return { duracion, fps: escena.fps || 60, px: formato.px, transparente: col.fondo === "transparente", svg };
}
