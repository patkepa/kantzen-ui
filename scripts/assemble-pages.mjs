import { cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";

const rootDir = resolve(import.meta.dirname, "..");
const outputDir = resolve(rootDir, "dist", "pages");
const landingPageDir = resolve(rootDir, "examples", "landing-page", "dist");
const starlightDir = resolve(rootDir, "examples", "starlight", "dist");

await rm(outputDir, { force: true, recursive: true });
await mkdir(outputDir, { recursive: true });
await cp(landingPageDir, outputDir, { recursive: true });
await cp(starlightDir, resolve(outputDir, "starlight"), { recursive: true });

console.log(`GitHub Pages artifact assembled at ${outputDir}`);
