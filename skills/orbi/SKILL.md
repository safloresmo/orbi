---
name: orbi
description: Hace videos y animaciones con Orbi, un monito animado (una bolita negra con dos rayitas por ojos que flota), encadenando animaciones ya hechas (entrar, saltar, asentir, negar, bailar, dormir, celebrar, voltereta…) y accesorios que le llegan volando (audífonos, lentes, gorra, corona u otros nuevos). No se limita al repertorio: también inventa movimientos nuevos y dibuja objetos propios (un teléfono, un globo de diálogo, lo que pidan) que Orbi mira, toma y lleva. Sale como página web animada, como .mp4 o como .webm con fondo transparente para montar sobre otro video, en horizontal, vertical o cuadrado. Úsala cuando pidan un video, un clip, un sticker animado o una animación «con Orbi» o «con el monito», o cambiarle accesorios, colores, movimientos o ritmo.
---

# Orbi

Un personaje mínimo: círculo oscuro, dos rayitas blancas por ojos. Flota, nunca pisa suelo. Expresa todo con
cuatro cosas: a dónde va, de qué tamaño está, cuánto ladea la cabeza y a dónde mira (los ojos se pasean por la
cara). Los accesorios le llegan volando y él los sigue con la vista.

No tiene boca, mejillas, brillo ni sombra, y no rebota contra un piso: es parte de su diseño, no se los añadas.
La animación debe sentirse fluida y calmada, no nerviosa.

## Cómo se hace un video

1. Crea una carpeta para el video y copia ahí el motor desde la raíz de este plugin (dos carpetas arriba de este
   archivo): `monito.js`, `escena.js`, `telefono.js`, `galeria.js`, `galeria.html`, `index.html`, `grabar.mjs` y `package.json`.
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

Cada una dura lo que dice y deja al monito en reposo, así que se encadenan en cualquier orden. Son atajos: lo que
no esté aquí se escribe a mano (más abajo).

| Animación | Dura | Qué hace |
|---|---|---|
| `entrar({ en, desde })` | 1.45 | Baja en un columpio en U, estirado, y se asienta en `en`; `desde` "derecha" o "izquierda" |
| `salir({ hacia })` | 1.05 | Toma impulso, se deja caer y sale; `hacia` "derecha" o "izquierda" |
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
| `aparecer(id, dibujo, { en, pegado, capa, tam })` | 0.6 | Aparece un objeto; Orbi lo mira |
| `moverObjeto(id, [x, y], dura)` | 0.7 | Mueve un objeto en arco; Orbi lo sigue con la vista |
| `vibrar(id, dura)` | 1 | El objeto se sacude (suena, tiembla) |
| `tomar(id, { en, tam })` | 0.7 | Orbi toma el objeto y lo lleva pegado a la cabeza |
| `desaparecer(id)` | 0.45 | El objeto se encoge y se va |

Para poner un rótulo en pantalla mientras dura una animación, escribe el paso como `["texto", a.saltar()]`.
Sale abajo al centro (arriba si el monito anda por abajo), del color `colores.texto`. Pregunta en qué idioma van si no lo dijeron.

Después de `salir` o `asomarse` queda fuera de cuadro: lo siguiente tiene que ser `entrar` o `asomarse`.

Accesorios: `audifonos`, `lentes`, `gorra`, `corona`. `desde` es de dónde aparece, relativo al monito
(por defecto arriba a la derecha). `crece` lo deja de ese tamaño al ponérselo, como premio.

## Cuando piden algo que no está en el repertorio

El repertorio es un punto de partida, no un límite. Si piden algo que no existe (que saque un teléfono, que lo
persiga una abeja, que se derrita, que le caiga una manzana), **hazlo**: no contestes que no se puede ni lo
sustituyas por la animación más parecida. Hay cuatro herramientas, de menor a mayor esfuerzo:

**1. Un movimiento nuevo de Orbi: un clip escrito a mano.** Cualquier paso de `secuencia` puede ser un objeto con
pistas, sin registrarlo en ningún lado:

```js
const sobresalto = {
  dura: .7,
  pos:     [[0, [0, 0]], [.12, [0, -14], sale], [.45, [0, 0], ambas], [.7, [0, 0]]],   // relativo a donde está parado
  deforma: [[0, [1, 1]], [.12, [.9, 1.14], sale], [.4, [1.05, .96], ambas], [.7, [1, 1], ambas]],
  ojos:    [[0, 1], [.12, 1.5, pasa], [.5, 1.5], [.7, 1, ambas]],
};
```

Pistas de Orbi: `pos` (con cuarto valor opcional, el punto de control para ir en arco), `tam` (factor), `ladeo`
(grados; 360 es una vuelta), `miraX` y `miraY` (de -1 a 1), `deforma` (`[ancho, alto]`: aplastar y estirar), `ojos`
(0 cerrados, 1 normal, 1.5 muy abiertos), `opacidad`, `parpadeos` (`[instante, duración]`) y `lanzado` (1 mientras
deba volverse cápsula con los ojos por delante). Cada clave es `[tiempo, valor, curva]`; curvas: `ambas`, `sale`,
`entra`, `lin`, `pasa` (se pasa un poco y vuelve). Dos reglas para que encadene: cada pista empieza con una clave
en el instante 0 y termina en reposo (posición `[0,0]`, tamaño 1, ladeo 0, mirada 0, deforma `[1,1]`, ojos 1), salvo
que declare `fin`, `finTam` o `finGiro`. Si necesita saber el tamaño del escenario o dónde está parado, es una
función `({ ancho, alto, ancla, tam, objetos }) => clip`.

**2. Un elemento nuevo: un objeto.** Cualquier cosa que no sea Orbi es un objeto: SVG dibujado alrededor de (0,0),
con colores literales. Dibújalo tú; `DIBUJOS` trae `telefono`, `corazon`, `estrella` y `globo(texto)` (un globo
de diálogo, que es como «habla» sin boca) de ejemplo.

```js
const abeja = `<ellipse rx="9" ry="6" fill="#ffc93d"/><path d="M-3 -6 V6 M3 -6 V6" stroke="#15171d" stroke-width="2.5"/>`;
...secuencia([
  a.aparecer("abeja", abeja, { en: [90, -40] }),   // suelta: coordenadas del escenario
  a.moverObjeto("abeja", [-90, -30]),              // Orbi la sigue con la vista
  a.vibrar("abeja", 1),
  a.tomar("abeja", { en: [0, -44] }),              // vuela a su cabeza y la lleva pegada
  a.desaparecer("abeja"),
])
```

Con `pegado: true` en `aparecer`, el objeto nace ya sobre Orbi y `en` es relativo al centro de la cabeza (radio 33).
`capa: "atras"` lo dibuja detrás. Para un movimiento propio del objeto, un clip puede llevar
`objetos: { abeja: { pos, tam, giro, opacidad } }` con claves como las de Orbi (`pos` en coordenadas del
escenario), y `miraA: "abeja"` para que Orbi lo mire mientras dura.

**3. Algo que se pone y se quita en la cabeza: un accesorio.** Una entrada más en `ACCESORIOS`: una función del
color que devuelve `atras` (detrás de la cabeza), `frente` (delante), `volando` (cómo se ve mientras llega) y, si
va sobre los ojos, `sigueOjos: true`.

**4. Si nada de eso alcanza, amplía el motor.** `monito.js` es un solo archivo de unas 400 líneas: una pista nueva,
otro personaje, un fondo. Cámbialo en la copia del proyecto.

`telefono.js` es un ejemplo completo: un objeto, un clip a mano, un globo y una salida por la izquierda.

## Comprobar antes de entregar

- Ningún fotograma roto: recorre la escena y busca `NaN`, `Infinity` o `undefined` en `svg(t)`. Una pista sin
  clave inicial o un accesorio mal escrito aparecen ahí.
- Mira la tira de fotogramas, no solo el primero: los fallos están en las uniones entre animaciones.
- El motor suaviza las esquinas (`suave`), así que movimientos de menos de 0.15 s se aplanan: hazlos más
  amplios o más largos en vez de más rápidos.
