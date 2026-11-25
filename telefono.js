// Ejemplo de escena con cosas que no están en el repertorio: un objeto propio (el teléfono),
// un movimiento escrito a mano (el sobresalto) y una salida por la izquierda.
import { secuencia, animaciones as a, DIBUJOS, ambas, sale, pasa } from "./monito.js";

// Un clip propio: pega un brinquito, se estira y abre mucho los ojos
const sobresalto = {
  dura: .7,
  pos: [[0, [0, 0]], [.12, [0, -14], sale], [.45, [0, 0], ambas], [.7, [0, 0]]],
  deforma: [[0, [1, 1]], [.12, [.9, 1.14], sale], [.4, [1.05, .96], ambas], [.7, [1, 1], ambas]],
  ojos: [[0, 1], [.12, 1.5, pasa], [.5, 1.5], [.7, 1, ambas]],
};

export default {
  fps: 60,
  colores: { fondo: "#f8f9f6", cuerpo: "#15171d", ojos: "#ffffff", acento: "#ff6a3d" },
  ...secuencia([
    a.entrar(),
    a.pausa(.3),
    a.aparecer("tel", DIBUJOS.telefono(), { en: [95, 20] }),
    sobresalto,
    ["Ring!", a.vibrar("tel", 1.3)],
    a.tomar("tel", { en: [39, 6] }),
    a.aparecer("hola", DIBUJOS.globo("Hello?"), { en: [-8, -62], mira: false }),
    a.asentir(),
    a.curiosear(),
    a.desaparecer("hola"),
    a.asentir(),
    a.desaparecer("tel"),
    a.pausa(.2),
    a.salir({ hacia: "izquierda" }),
  ], { formato: "horizontal", tamano: 1.1 }),
};
