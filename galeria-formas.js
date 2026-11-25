// Una escena corta por cada forma del cuerpo, para verlas todas en galeria.html?formas
import { secuencia, animaciones as a, FORMAS } from "./monito.js";

const colores = ["#f4f4f1", "#ff6a3d", "#f5a623", "#ffc93d", "#3ddc97", "#22b8a7", "#3b82f6", "#8b5cf6", "#ec4899", "#ef4444", "#a8a29e", "#22c55e"];
const pasos = [a.pausa(.4), a.mirarAlrededor(), a.saltar(30), a.curiosear(), a.pausa(.4)];

export default Object.keys(FORMAS).map((forma, i) => ({
  nombre: forma,
  escena: {
    colores: { fondo: "#1c1c1e", cuerpo: colores[i % colores.length] },
    ...secuencia(pasos, { formato: "cuadrado", tamano: 1.6, forma }),
  },
}));
