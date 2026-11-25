#!/usr/bin/env node
// Graba la escena a video: node grabar.mjs [escena.js] [salida]
// Con fondo de color sale un .mp4; con fondo "transparente", un .webm con canal alfa.
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import { monito } from "./monito.js";

const escena = (await import(pathToFileURL(resolve(process.argv[2] || "escena.js")))).default;
const m = monito(escena);
const salida = process.argv[3] || (m.transparente ? "monito.webm" : "monito.mp4");
const total = Math.round(m.duracion * m.fps);

const dir = mkdtempSync(join(tmpdir(), "monito-"));
for (let i = 0; i < total; i++) {
  writeFileSync(join(dir, `f${String(i).padStart(5, "0")}.svg`), m.svg(i / m.fps, true));
}
const codec = m.transparente
  ? ["-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-b:v", "0", "-crf", "24"]
  : ["-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "16"];
const r = spawnSync("ffmpeg", ["-v", "error", "-y", "-framerate", String(m.fps),
  "-i", join(dir, "f%05d.svg"), ...codec, salida], { stdio: "inherit" });
rmSync(dir, { recursive: true });

if (r.status !== 0) { console.error("ffmpeg falló"); process.exit(1); }
console.log(`${salida}: ${total} fotogramas, ${m.px.join("×")}, ${m.fps} fps`);
