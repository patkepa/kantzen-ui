import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const releaseVersion = process.argv[2];
if (!releaseVersion) {
  throw new Error("Pass the release tag or version to verify.");
}

const packageManifest = JSON.parse(
  readFileSync(
    resolve(import.meta.dirname, "..", "packages/ui/package.json"),
    "utf8",
  ),
);
const normalizedReleaseVersion = releaseVersion.startsWith("v")
  ? releaseVersion.slice(1)
  : releaseVersion;

if (normalizedReleaseVersion !== packageManifest.version) {
  throw new Error(
    `Release version ${releaseVersion} does not match @kantzen-ui/ui@${packageManifest.version}.`,
  );
}

console.log(
  `Release version verified: @kantzen-ui/ui@${packageManifest.version}`,
);
