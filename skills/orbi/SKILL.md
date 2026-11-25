---
name: orbi
description: Hace videos y animaciones con Orbi, un monito animado (una bolita negra con dos rayitas por ojos que flota), encadenando animaciones ya hechas (entrar, saltar, asentir, negar, bailar, dormir, celebrar, voltereta…) y accesorios que le llegan volando (audífonos, lentes, gorra, corona u otros nuevos). Sale como página web animada, como .mp4 o como .webm con fondo transparente para montar sobre otro video, en horizontal, vertical o cuadrado. Úsala cuando pidan un video, un clip, un sticker animado o una animación «con Orbi» o «con el monito», o cambiarle accesorios, colores, movimientos o ritmo.
---

# Orbi

Un personaje mínimo: círculo oscuro, dos rayitas blancas por ojos. Flota, nunca pisa suelo. Expresa todo con
cuatro cosas: a dónde va, de qué tamaño está, cuánto ladea la cabeza y a dónde mira (los ojos se pasean por la
cara). Los accesorios le llegan volando y él los sigue con la vista.

No tiene boca, mejillas, brillo ni sombra, y no rebota contra un piso: es parte de su diseño, no se los añadas.
La animación debe sentirse fluida y calmada, no nerviosa.

## Cómo se hace un video

1. Crea una carpeta para el video y copia ahí el motor desde la raíz de este plugin (dos carpetas arriba de este
   archivo): `monito.js`, `escena.js`, `galeria.js`, `galeria.html`, `index.html`, `grabar.mjs` y `package.json`.
   No copies los videos ni el resto.
2. Escribe la coreografía en `escena.js` encadenando animaciones (abajo).
3. Míralo: `python -m http.server 8731 --bind 127.0.0.1` dentro de la carpeta y abre
   `http://127.0.0.1:8731/` (la escena, con cámara lenta y barra de tiempo) o `/galeria.html`
   (todas las animaciones a la vez, para elegir). Hace falta servidor: los módulos no cargan desde `file://`.
4. Grábalo: `node grabar.mjs` deja `monito.mp4`, o `monito.webm` con alfa si el fondo es `"transparente"`.
   `node grabar.mjs otra-escena.js salida.mp4` para otros nombres. Tarda un par de segundos; solo usa `node` y `ffmpeg`.
5. Revisa el resultado antes de entregarlo: saca una hoja de contactos del video
   (`ffmpeg -i monito.mp4 -vf "fps=4,scale=320:-1,tile=7x4" -frames:v 1 hoja.png`) y mírala.

## La escena

```js
import { secuencia, animaciones as a } from "./monito.js";

export default {
  fps: 60,
  colores: { fondo: "#f8f9f6", cuerpo: "#15171d", ojos: "#ffffff", acento: "#ff6a3d" },
  accesoriosPuestos: [{ tipo: "corona", color: "#ffc93d" }],   // los que ya trae desde el inicio
  ...secuencia([
    a.entrar(),
    a.ponerse("audifonos", { crece: 1.7 }),
    a.curiosear(),
    a.celebrar(),
    a.salir(),
  ], { formato: "vertical", tamano: .6 }),
};
```

- `formato`: `horizontal` (1920×1080, escenario 480×270), `vertical` (1080×1920, 270×480) o `cuadrado`
  (1080×1080, 300×300). Las posiciones van en unidades del escenario con el origen en el centro e `y` hacia abajo.
  La cabeza mide 33 de radio a tamaño 1.
- `tamano`: tamaño inicial. `en`: dónde está parado al empezar (por defecto el centro).
- `colores.fondo: "transparente"` para montarlo encima de otro video.
- `acento` es el color por defecto de los accesorios; cada uno puede llevar su `color`.

## Animaciones

Cada una dura lo que dice y deja al monito en reposo, así que se encadenan en cualquier orden.

| Animación | Dura | Qué hace |
|---|---|---|
| `entrar({ en })` | 1.45 | Baja en un columpio en U, estirado, y se asienta en `en` |
| `salir()` | 1.05 | Toma impulso, se deja caer y sale por la derecha |
| `asomarse({ x })` | 2.2 | Se asoma por abajo, mira a los lados y se esconde (al inicio o tras `salir`) |
| `moverA([x, y], dura)` | 0.8 | Se desliza en arco a otro punto |
| `flotar(dura)` | 2 | Se mece en su sitio |
| `pausa(dura)` | 0.5 | Quieto |
| `saltar(altura)` | 0.95 | Un salto |
| `voltereta()` | 1 | Vuelta completa en el aire |
| `celebrar()` | 1.7 | Dos saltitos de gusto |
| `bailar(compases)` | 1.2 por compás + 0.3 | Se balancea de lado a lado |
| `asentir()` | 0.9 | Dice que sí |
| `negar()` | 1 | Dice que no |
| `mirarAlrededor()` | 2 | Mira a un lado, parpadea, mira al otro |
| `curiosear()` | 1.6 | Ladea la cabeza y mira hacia arriba |
| `sorpresa()` | 1 | Se infla de golpe y vuelve |
| `temblar()` | 1 | Tiembla encogido con los ojos apretados |
| `dormir(dura)` | 3 | Se va quedando dormido y despierta |
| `crecer(factor, dura)` | 0.4 | Cambia de tamaño y se queda así |
| `ponerse(tipo, { color, desde, crece })` | 1.4 | Le llega el accesorio volando y se lo pone |
| `quitarse(tipo)` | 0.8 | Suelta ese accesorio, que sale volando (solo los de `ponerse`, no los de `accesoriosPuestos`) |

Para poner un rótulo en pantalla mientras dura una animación, escribe el paso como `["texto", a.saltar()]`.
Sale abajo al centro (arriba si el monito anda por abajo), del color `colores.texto`. Pregunta en qué idioma van si no lo dijeron.

Después de `salir` o `asomarse` queda fuera de cuadro: lo siguiente tiene que ser `entrar` o `asomarse`.

Accesorios: `audifonos`, `lentes`, `gorra`, `corona`. `desde` es de dónde aparece, relativo al monito
(por defecto arriba a la derecha). `crece` lo deja de ese tamaño al ponérselo, como premio.

## Lo que no está en el repertorio

Trabaja en la copia del proyecto y añade una muestra a `galeria.js` para verlo junto a los demás.

**Una animación nueva** es una entrada más en `animaciones` (en `monito.js`): una función que devuelve un clip.

```js
saludar: () => ({
  dura: 1.2,
  pos:   [[0, [0, 0]], [.3, [0, -8], a], [1.2, [0, 0], a]],     // relativo a donde está parado
  ladeo: [[0, 0], [.3, 14, a], [.6, -8, a], [.9, 10, a], [1.2, 0, a]],
  miraY: [[0, 0], [.3, -.4, a], [1.2, 0, a]],
  parpadeos: [[.7, .25]],                                        // [instante, duración]
}),
```

Pistas de un clip: `pos` (con cuarto valor opcional, el punto de control para ir en arco), `tam` (factor),
`ladeo` (grados), `miraX` y `miraY` (de -1 a 1), `parpadeos`, y `lanzado` (1 mientras deba volverse cápsula con
los ojos por delante, como al entrar y salir). Curvas: `a` ambas, `s` sale, `e` entra, `lin`, `pasa` (se pasa un
poco y vuelve). Dos reglas para que encadene bien: cada pista que definas empieza con una clave en el instante 0,
y termina en reposo (posición `[0,0]`, tamaño 1, ladeo 0, mirada 0) salvo que declares `fin`, `finTam` o `finGiro`.
Si el clip necesita saber el tamaño del escenario o dónde está parado, devuelve una función
`({ ancho, alto, ancla, tam }) => clip`, como hacen `entrar` y `salir`.

**Un accesorio nuevo** es una entrada más en `ACCESORIOS`: una función del color que devuelve trozos de SVG
dibujados alrededor del centro de la cabeza (0,0), radio 33: `atras` (detrás de la cabeza), `frente` (delante),
`volando` (cómo se ve mientras llega) y, si va sobre los ojos, `sigueOjos: true`. Usa colores literales, no
variables CSS: el grabador no las entiende.

## Comprobar antes de entregar

- Ningún fotograma roto: recorre la escena y busca `NaN`, `Infinity` o `undefined` en `svg(t)`. Una pista sin
  clave inicial o un accesorio mal escrito aparecen ahí.
- Mira la tira de fotogramas, no solo el primero: los fallos están en las uniones entre animaciones.
- El motor suaviza las esquinas (`suave`), así que movimientos de menos de 0.15 s se aplanan: hazlos más
  amplios o más largos en vez de más rápidos.
