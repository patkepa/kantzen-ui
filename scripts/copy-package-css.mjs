import { copyFile, mkdir, readdir } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";

const packageDir = process.cwd();
const sourceDir = resolve(packageDir, "src");
const outputDir = resolve(packageDir, "dist");

async function copyCssFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });

  await Promise.all(
    entries.map(async (entry) => {
      const sourcePath = resolve(directory, entry.name);
      if (entry.isDirectory()) {
        await copyCssFiles(sourcePath);
        return;
      }
      if (!entry.isFile() || !entry.name.endsWith(".css")) return;

      const outputPath = resolve(outputDir, relative(sourceDir, sourcePath));
      await mkdir(dirname(outputPath), { recursive: true });
      await copyFile(sourcePath, outputPath);
    }),
  );
}

await copyCssFiles(sourceDir);
