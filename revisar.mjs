#!/usr/bin/env node
// Revisa una escena antes de grabarla: node revisar.mjs [escena.js]
//   1. recorre todos los fotogramas buscando valores rotos y saltos bruscos de posición
//   2. escribe hoja.png: 24 fotogramas repartidos por toda la escena
//   3. escribe fijas.png: el personaje en reposo, mirando a dos esquinas opuestas y con un accesorio
// Solo necesita node y ffmpeg. Las dos imágenes hay que mirarlas: el script no juzga si se ve bien.
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import { monito, FORMATOS } from "./monito.js";

const escena = (await import(pathToFileURL(resolve(process.argv[2] || "escena.js")))).default;
const m = monito(escena);
const { ancho, alto } = FORMATOS[escena.formato || "horizontal"];

let rotos = 0, salto = 0, cuando = 0, antes = null;
for (let i = 0; i <= m.duracion * 60; i++) {
  const t = i / 60, [x, y] = m.posicion(t);
  if (/NaN|Infinity|undefined/.test(m.svg(t))) rotos++;
  const dentro = p => Math.abs(p[0]) < ancho / 2 && Math.abs(p[1]) < alto / 2;   // los saltos fuera de cuadro no se ven
  if (antes && dentro(antes) && dentro([x, y])) {
    const d = Math.hypot(x - antes[0], y - antes[1]);
    if (d > salto) { salto = d; cuando = t; }
  }
  antes = [x, y];
}
console.log(`${m.duracion.toFixed(2)} s · fotogramas rotos: ${rotos} · salto máximo dentro de cuadro: ${salto.toFixed(1)} unidades en t=${cuando.toFixed(2)}`);
if (rotos) console.log("  -> hay fotogramas rotos: una pista sin clave en el instante 0, un accesorio o un objeto mal escrito");
if (salto > 25) console.log("  -> ese salto se va a ver como un tirón: revisa la unión entre animaciones cerca de ese instante");

function hoja(cuadros, columnas, filas, salida) {
  const dir = mkdtempSync(join(tmpdir(), "monito-"));
  cuadros.forEach((svg, i) => writeFileSync(join(dir, `f${String(i).padStart(3, "0")}.svg`), svg));
  const r = spawnSync("ffmpeg", ["-v", "error", "-y", "-i", join(dir, "f%03d.svg"),
    "-vf", `scale=360:-1,tile=${columnas}x${filas}`, "-frames:v", "1", salida], { stdio: "inherit" });
  rmSync(dir, { recursive: true });
  console.log(r.status === 0 ? `${salida} escrita` : `no se pudo escribir ${salida}`);
}

hoja(Array.from({ length: 24 }, (_, i) => m.svg(m.duracion * (i + .5) / 24, true)), 6, 4, "hoja.png");

const quieto = { formato: "cuadrado", forma: escena.forma, colores: escena.colores, duracion: 1, tamano: [[0, 3]] };
hoja([
  quieto,
  { ...quieto, miraX: [[0, 1]], miraY: [[0, 1]] },
  { ...quieto, miraX: [[0, -1]], miraY: [[0, -1]] },
  { ...quieto, accesoriosPuestos: [{ tipo: "corona", color: "#ffc93d" }] },
].map(e => monito(e).svg(.5, true)), 4, 1, "fijas.png");
