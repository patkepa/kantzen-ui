import { rm } from "node:fs/promises";
import { resolve } from "node:path";

const packages = ["ui"];

await Promise.all(
  packages.map((name) =>
    rm(resolve(import.meta.dirname, "..", "packages", name, "dist"), {
      force: true,
      recursive: true,
    }),
  ),
);
