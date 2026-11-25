// Una escena corta por animación, para verlas todas juntas en galeria.html
import { secuencia, animaciones as a, DIBUJOS } from "./monito.js";

const muestras = {
  entrar: [a.entrar(), a.pausa(.8)],
  salir: [a.pausa(.5), a.salir(), a.pausa(.3)],
  asomarse: [a.asomarse(), a.pausa(.3)],
  moverA: [a.pausa(.3), a.moverA([60, -30]), a.pausa(.3), a.moverA([-60, 30]), a.pausa(.3), a.moverA([0, 0])],
  flotar: [a.flotar(2.6)],
  saltar: [a.pausa(.4), a.saltar(), a.pausa(.5)],
  voltereta: [a.pausa(.4), a.voltereta(), a.pausa(.5)],
  celebrar: [a.pausa(.3), a.celebrar(), a.pausa(.4)],
  bailar: [a.pausa(.2), a.bailar(2), a.pausa(.2)],
  asentir: [a.pausa(.4), a.asentir(), a.pausa(.5)],
  negar: [a.pausa(.4), a.negar(), a.pausa(.5)],
  mirarAlrededor: [a.pausa(.2), a.mirarAlrededor(), a.pausa(.3)],
  curiosear: [a.pausa(.3), a.curiosear(), a.pausa(.4)],
  sorpresa: [a.pausa(.5), a.sorpresa(), a.pausa(.5)],
  temblar: [a.pausa(.4), a.temblar(), a.pausa(.5)],
  dormir: [a.pausa(.3), a.dormir(3), a.pausa(.3)],
  crecer: [a.pausa(.4), a.crecer(1.5), a.pausa(.6), a.crecer(1 / 1.5), a.pausa(.4)],
  "ponerse(audifonos)": [a.pausa(.3), a.ponerse("audifonos"), a.pausa(.8)],
  "ponerse(lentes)": [a.pausa(.3), a.ponerse("lentes", { color: "#ffffff" }), a.pausa(.8)],
  "ponerse(gorra)": [a.pausa(.3), a.ponerse("gorra"), a.pausa(.8)],
  "ponerse(corona)": [a.pausa(.3), a.ponerse("corona", { color: "#ffc93d" }), a.pausa(.8)],
  quitarse: [a.ponerse("gorra"), a.pausa(.4), a.quitarse("gorra"), a.pausa(.6)],
  "entrar(izquierda)": [a.entrar({ desde: "izquierda" }), a.pausa(.8)],
  "salir(izquierda)": [a.pausa(.5), a.salir({ hacia: "izquierda" }), a.pausa(.3)],
  "aparecer + vibrar": [a.pausa(.2), a.aparecer("o", DIBUJOS.telefono(), { en: [70, 10] }), a.vibrar("o", 1.2), a.desaparecer("o"), a.pausa(.3)],
  tomar: [a.aparecer("o", DIBUJOS.estrella(), { en: [80, -40] }), a.tomar("o", { en: [0, -44] }), a.pausa(.9), a.desaparecer("o")],
  moverObjeto: [a.aparecer("o", DIBUJOS.corazon(), { en: [-80, 20] }), a.moverObjeto("o", [80, -20]), a.moverObjeto("o", [-80, 20]), a.desaparecer("o")],
  "globo de diálogo": [a.pausa(.2), a.aparecer("o", DIBUJOS.globo("Hola"), { en: [10, -62], mira: false }), a.pausa(1.2), a.desaparecer("o")],
};

export default Object.entries(muestras).map(([nombre, pasos]) => ({
  nombre,
  escena: secuencia(pasos, { formato: "cuadrado" }),
}));
