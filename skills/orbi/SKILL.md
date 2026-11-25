---
name: orbi
description: Hace videos y animaciones con Orbi, un monito animado (una bolita negra con dos rayitas por ojos que flota), encadenando animaciones ya hechas (entrar, saltar, asentir, negar, bailar, dormir, celebrar, voltereta…) y accesorios que le llegan volando (audífonos, lentes, gorra, corona u otros nuevos). No se limita al repertorio: también inventa movimientos nuevos y dibuja objetos propios (un teléfono, un globo de diálogo, lo que pidan) que Orbi mira, toma y lleva. Sale como página web animada, como .mp4 o como .webm con fondo transparente para montar sobre otro video, en horizontal, vertical o cuadrado. El personaje puede ser cualquier silueta con ojos (gato, fantasma, taza, cohete… hay 36 y dibuja las que falten) y tiene estados (pensando, trabajando, esperando, bloqueado, listo). Úsala cuando pidan un video, un clip, un avatar o sticker animado o una animación «con Orbi» o «con el monito», o cambiarle accesorios, colores, movimientos o ritmo.
---

# Orbi

Un personaje mínimo: una silueta de un solo color (una bolita oscura si no se pide otra cosa) con dos rayitas por
ojos. Flota, nunca pisa suelo. Expresa todo con
cuatro cosas: a dónde va, de qué tamaño está, cuánto ladea la cabeza y a dónde mira (los ojos se pasean por la
cara). Los accesorios le llegan volando y él los sigue con la vista.

No tiene boca, mejillas, brillo ni sombra, y no rebota contra un piso: es parte de su diseño, no se los añadas.
La animación debe sentirse fluida y calmada, no nerviosa.

## Cómo se hace un video

1. Crea una carpeta para el video y copia ahí el motor desde la raíz de este plugin (dos carpetas arriba de este
   archivo): `monito.js`, `formas.js`, `escena.js`, `telefono.js`, `galeria.js`, `galeria-formas.js`, `galeria.html`, `index.html`,
   `grabar.mjs`, `revisar.mjs` y `package.json`. `monito.js` importa `formas.js`: sin él no carga.
   No copies los videos ni el resto.
2. Escribe la coreografía en `escena.js` encadenando animaciones (abajo). El `escena.js` que copiaste es un ejemplo:
   sobrescríbelo.
3. Míralo: `python -m http.server 8731 --bind 127.0.0.1` dentro de la carpeta y abre
   `http://127.0.0.1:8731/` (la escena, con cámara lenta y barra de tiempo) o `/galeria.html`
   (todas las animaciones a la vez, para elegir; con `?formas`, todas las formas). Hace falta servidor: los módulos no cargan desde `file://`.
4. Grábalo: `node grabar.mjs` deja `monito.mp4`, o `monito.webm` con alfa si el fondo es `"transparente"`.
   `node grabar.mjs otra-escena.js salida.mp4` para otros nombres. Tarda un par de segundos; solo usa `node` y `ffmpeg`.
5. Revísalo antes de entregarlo: `node revisar.mjs` (o `node revisar.mjs otra-escena.js`). Avisa de fotogramas
   rotos y de saltos bruscos, y escribe dos imágenes que **tienes que mirar**: `hoja.png` (24 fotogramas de toda la
   escena) y `fijas.png` (el personaje en reposo, mirando a dos esquinas y con un accesorio). Corrige y repite hasta
   que la hoja cuente lo que pidieron: que se vea quién es, qué hace y en qué orden.

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
- `tamano`: tamaño inicial. A tamaño 1 el personaje ocupa menos de un cuarto del alto: sirve cuando comparte la
  escena con texto u otras cosas. Si es el protagonista, usa de 1.5 a 2.2;
  en vertical manda el ancho (270): una forma ancha con asa o brazos a tamaño 1.6 ya ocupa más de la mitad, así que
  deja los desplazamientos laterales en ±45 o baja el tamaño. `en`: dónde está parado al empezar (por
  defecto el centro). El escenario va de `-ancho/2` a `ancho/2` y de `-alto/2` a `alto/2`; lo que quede fuera no se ve.
- `fps`: 60 por defecto; 30 también va bien y pesa la mitad.
- `colores.fondo: "transparente"` para montarlo encima de otro video.
- `acento` es el color por defecto de los accesorios; cada uno puede llevar su `color`.

## El personaje: cualquier forma

No tiene que ser una bolita. El cuerpo es una **forma**: una silueta de un solo color con las dos rayitas por ojos.
Se elige en `secuencia`, y todas las animaciones, accesorios y objetos funcionan igual con cualquiera:

```js
...secuencia([a.entrar(), a.pensar(), a.listo()], { formato: "cuadrado", forma: "gato" })
```

Hay 36 de muestra (míralas en `galeria.html?formas`): `bolita`, `huevo`, `gota`, `fantasma`, `estrella`, `corazon`,
`diamante`, `escudo`, `burbuja`, `nube`, `gato`, `conejo`, `oso`, `toro`, `pez`, `pulpo`, `robot`, `planta`, `cactus`,
`hongo`, `manzana`, `helado`, `taza`, `foco`, `cohete`, `libro`, `paleta`, `mancuerna`, `control`, `pluma`, `regadera`,
`lupa`, `sombrero`, `cerebro`, `camara`, `casa`. Son ejemplos, no la lista cerrada: **si piden otro personaje
(un pingüino, una tetera, una guitarra), dibújalo.**

```js
const pinguino = {
  dibujo: c => `<ellipse rx="24" ry="31" fill="${c}"/><path d="M-22 -4 L-33 14 L-22 12 Z M22 -4 L33 14 L22 12 Z" fill="${c}"/>`,
  ojos: [0, -10],        // dónde van los ojos en reposo (centro del par)
  rango: [9, 7],         // cuánto pueden moverse al mirar sin salirse de la silueta
  cabeza: [0, -8, 22],   // [x, y, radio] del círculo que mejor aproxima la cabeza: ahí van accesorios y objetos tomados
};
...secuencia(pasos, { forma: pinguino })
```

La silueta se dibuja alrededor de (0,0), dentro de un radio de unos 34, con el color que recibe `dibujo` y sin
variables CSS. Opcionales: `separa` (media distancia entre los ojos, 7) y `ojoTam` (tamaño de los ojos, 1).
Si no se elige `colores.ojos`, salen claros sobre cuerpo oscuro y oscuros sobre cuerpo claro.

**Cómo dibujar una forma que se lea bien:**
- La parte que lleva la cara es la masa principal. Exagérala lo que haga falta para que los ojos quepan con aire
  (unas 36 × 25 unidades de relleno liso alrededor del par), en vez de achicar los ojos.
- Las partes secundarias (orejas, asa, tallo, aletas) van compactas y pegadas, claramente más chicas que la cara,
  y metidas unas unidades dentro del cuerpo para que no se vean pegadas con costura.
- Conserva los dos o tres rasgos que hacen reconocible el objeto y redondea todo lo demás. Tiene que
  reconocerse en chiquito, a 28 píxeles.
- La silueta manda y va del color del cuerpo. Si hace falta para reconocerlo, añade uno o dos detalles de otro
  color fijo dentro de `dibujo` (la panza blanca de un pingüino, el pico, una franja), lejos de los ojos. Sin más.

**Comprueba cada forma nueva antes de usarla.** `node revisar.mjs` escribe `fijas.png` con el personaje grande en
cuatro poses: en reposo, mirando a dos esquinas opuestas y con una corona. Mírala: tiene que reconocerse qué es, los
ojos no deben tocar el borde y la corona no debe flotar ni hundirse. Ajusta `dibujo`, `rango` y `cabeza` y repite.

**Importar una ya hecha.** `formaDeAvatar(definicion)` convierte una definición de Open Bot Avatar
(un JSON con `body.path` en una caja de 0 a 100 y `eyes`) en una forma. Sirve para las de su editor y su galería:
`import { formaDeAvatar } from "./monito.js"` y luego `forma: formaDeAvatar(json)`.

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
| `esquivar({ hacia, distancia })` | 0.6 | Se quita de un brinco hacia un lado, estirado y con los ojos muy abiertos, y se queda ahí |
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
| `pensar({ dura, marca })` | 2.4 | Mira arriba, ladea la cabeza y le salen tres puntitos |
| `trabajar({ dura })` | 2 | Cabecea rápido con la vista abajo, de lado a lado |
| `esperar({ dura })` | 2.8 | Se mece despacio y parpadea lento |
| `bloqueado({ dura, marca })` | 1.8 | Niega sacudiéndose, entrecierra los ojos y le sale un «!» |
| `listo({ dura, marca })` | 1.6 | Brinca de gusto y le sale una palomita |
| `aparecer(id, dibujo, { en, pegado, capa, tam })` | 0.6 | Aparece un objeto; Orbi lo mira |
| `caer(id, dibujo, { hasta, rebotes, tam })` | 0.7 + rebotes | Un objeto cae desde arriba hasta `hasta` y rebota; Orbi lo mira caer |
| `moverObjeto(id, [x, y], dura, arco)` | 0.7 | Mueve un objeto en arco (`arco` es la altura, 20; 0 va recto); Orbi lo sigue con la vista |
| `vibrar(id, dura)` | 1 | El objeto se sacude (suena, tiembla) |
| `tomar(id, { en, giro, tam })` | 0.7 | El objeto vuela a la cabeza de Orbi y se queda pegado en `en`; conserva su tamaño salvo que des `tam`; `giro` lo deja girado |
| `juntos(a, b, …)` | la más larga | Varias a la vez: Orbi se mueve mientras un objeto se mueve |
| `desaparecer(id)` | 0.45 | El objeto se encoge y se va |

Para poner un rótulo en pantalla mientras dura una animación, escribe el paso como `["texto", a.saltar()]`.
Sale abajo al centro (arriba si el monito anda por abajo), del color `colores.texto`. Aparece al empezar ese
paso y se queda al menos 1.2 s aunque el paso sea más corto (cede antes si llega otro rótulo): ponlo en el paso
donde pasa lo que nombra. Pregunta en qué idioma van si no lo dijeron.

Después de `salir` o `asomarse` queda fuera de cuadro: lo siguiente tiene que ser `entrar` o `asomarse`.

Accesorios: `audifonos`, `lentes`, `gorra`, `corona`. `desde` es de dónde aparece, relativo al monito
(por defecto arriba a la derecha). `crece` lo deja de ese tamaño al ponérselo, como premio.

## Cuando piden algo que no está en el repertorio

El repertorio es un punto de partida, no un límite. Si piden algo que no existe (que saque un teléfono, que lo
persiga una abeja, que se derrita, que le caiga una manzana), **hazlo**: no contestes que no se puede ni lo
sustituyas por la animación más parecida. Si lo que piden es otro personaje, es una forma nueva (arriba). Para lo
demás hay cuatro herramientas, de menor a mayor esfuerzo:

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
con colores literales. Dibújalo tú; `DIBUJOS` trae de ejemplo `telefono`, `corazon`, `estrella`, `puntos`, `signo(texto)`,
`palomita` y `globo(texto)` (un globo de diálogo, que es como «habla» sin boca).

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

**Dos cosas a la vez.** Los pasos de `secuencia` van uno tras otro. Para que pasen al mismo tiempo (una
persecución, esquivar algo que cae), envuélvelos en `a.juntos(...)`:

```js
a.juntos(a.moverA([70, -20], 1), a.moverObjeto("pez", [110, -40], 1)),    // el pez huye y Orbi va detrás
a.juntos(a.moverA([-60, 30], 1), a.moverObjeto("pez", [-100, 10], 1)),
a.moverA([-80, 20], .5),                                                  // lo alcanza: se acerca antes de tomarlo
a.tomar("pez", { en: [0, -40], giro: -20 }),                              // y se lo pone de sombrero
```

`tomar` hace volar el objeto hasta la cabeza desde donde esté; para que parezca que lo atrapa, acerca primero a
Orbi con `moverA`. Lo tomado se queda puesto hasta `desaparecer`. `en` va en unidades de cabeza, medidas desde
su centro: 33 es justo el borde, así que `[0, -33]` queda apoyado encima (tapa, sombrero), `[0, -45]` flotando
arriba y `[40, 8]` a un lado. Para ver cómo quedó puesto, mira los últimos fotogramas de `hoja.png`.

Para que algo caiga del cielo usa `caer`; para que Orbi se quite, `esquivar`. Juntos:
`a.juntos(a.caer("galleta", galleta, { hasta: [0, 70] }), a.esquivar())`.

Con `pegado: true` en `aparecer`, el objeto nace ya sobre Orbi y `en` es relativo al centro de la cabeza (radio 33).
`capa: "atras"` lo dibuja detrás. Cada objeto tiene un solo dibujo para toda la escena: para otra cosa, otro `id`. Para un movimiento propio del objeto, un clip puede llevar
`objetos: { abeja: { pos, tam, giro, opacidad } }` con claves como las de Orbi (`pos` en coordenadas del
escenario), y `miraA: "abeja"` para que Orbi lo mire mientras dura.

**3. Algo que se pone y se quita en la cabeza: un accesorio.** Una entrada más en `ACCESORIOS`: una función del
color que devuelve `atras` (detrás de la cabeza), `frente` (delante), `volando` (cómo se ve mientras llega) y, si
va sobre los ojos, `sigueOjos: true`.

**4. Si nada de eso alcanza, amplía el motor.** `monito.js` (el motor) y `formas.js` (las siluetas) son código corto y legible: una pista nueva,
otro personaje, un fondo. Cámbialo en la copia del proyecto.

`telefono.js` es un ejemplo completo: un objeto, un clip a mano, un globo y una salida por la izquierda.

## Comprobar antes de entregar

`node revisar.mjs` y mirar `hoja.png` y `fijas.png` (paso 5). En la hoja, fíjate en:

- **Que se entienda la historia.** Si pidieron que persiga, atrape y celebre, cada cosa tiene que verse en algún
  fotograma y en ese orden. Si algo no se ve, no está.
- **Las uniones entre animaciones.** Ahí están los fallos: algo que aparece de golpe, un objeto que se queda atrás.
- **El tamaño.** Si el personaje se ve perdido en el cuadro, sube `tamano`.
- **Movimientos de menos de 0.15 s.** El motor suaviza las esquinas y los aplana: hazlos más amplios o más largos.

Dile a quien lo pidió lo que no quedó bien, en vez de entregarlo como si lo estuviera.
