import { readdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, extname, join, relative, resolve } from "node:path";
import { transform } from "oxc-transform-react";

const rootDir = resolve(import.meta.dirname, "..");
const sourceDir = resolve(rootDir, "packages/ui/src");
const outputDir = resolve(rootDir, "packages/ui/dist");

async function findSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return findSourceFiles(path);
      if (entry.name.endsWith(".d.ts")) return [];
      return [".ts", ".tsx"].includes(extname(entry.name)) ? [path] : [];
    }),
  );
  return files.flat();
}

function formatDiagnostics(sourcePath, diagnostics) {
  return diagnostics
    .map(
      (diagnostic) =>
        diagnostic.codeframe ??
        `${relative(rootDir, sourcePath)}: ${diagnostic.message}`,
    )
    .join("\n");
}

async function compileSource(sourcePath) {
  const sourceRelativePath = relative(sourceDir, sourcePath);
  const outputPath = resolve(
    outputDir,
    sourceRelativePath.replace(/\.(?:ts|tsx)$/, ".js"),
  );
  const sourceText = await readFile(sourcePath, "utf8");
  // This render-prop ref forwarding pattern hits an upstream false positive:
  // https://github.com/facebook/react/issues/34954
  const reactCompiler =
    sourceRelativePath === "primitives/popover.tsx"
      ? false
      : { panicThreshold: "all_errors", target: "18" };
  const result = await transform(sourcePath, sourceText, {
    reactCompiler,
    sourcemap: true,
  });

  if (result.fatal || result.errors.length > 0) {
    throw new Error(formatDiagnostics(sourcePath, result.errors));
  }

  const mapName = `${basename(outputPath)}.map`;
  const sourceMap = {
    ...result.map,
    file: basename(outputPath),
    sources: [relative(dirname(outputPath), sourcePath)],
  };
  await Promise.all([
    writeFile(outputPath, `${result.code}//# sourceMappingURL=${mapName}\n`),
    writeFile(`${outputPath}.map`, `${JSON.stringify(sourceMap)}\n`),
  ]);
  return result.code.includes('from "react-compiler-runtime"');
}

const sourceFiles = await findSourceFiles(sourceDir);
const optimizedModules = (
  await Promise.all(sourceFiles.map(compileSource))
).filter(Boolean).length;

console.log(
  `Transformed ${sourceFiles.length} package modules; the native React Compiler optimized ${optimizedModules}.`,
);
