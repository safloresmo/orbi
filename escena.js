// La escena: lo que cambia de un video a otro.
// Posiciones en unidades del escenario, con el origen en el centro (y positivo hacia abajo).
import { secuencia, animaciones as a } from "./monito.js";

export default {
  fps: 60,
  colores: { fondo: "#f8f9f6", cuerpo: "#15171d", ojos: "#ffffff", acento: "#ff6a3d" },
  accesoriosPuestos: [],   // por ejemplo [{ tipo: "corona", color: "#ffc93d" }]

  // horizontal 1920×1080 · vertical 1080×1920 · cuadrado 1080×1080
  ...secuencia([
    a.entrar(),
    a.pausa(.3),
    a.ponerse("audifonos", { crece: 1.7 }),
    a.curiosear(),
    a.mirarAlrededor(),
    a.asentir(),
    a.celebrar(),
    a.pausa(.4),
    a.salir(),
  ], { formato: "horizontal", tamano: .6 }),
};
