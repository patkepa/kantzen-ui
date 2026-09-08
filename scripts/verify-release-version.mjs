import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const releaseVersion = process.argv[2];
if (!releaseVersion) {
  throw new Error("Pass the release tag or version to verify.");
}

const normalizedReleaseVersion = releaseVersion.startsWith("v")
  ? releaseVersion.slice(1)
  : releaseVersion;
const packageDirectories = ["ui", "starlight"];

for (const packageDirectory of packageDirectories) {
  const packageManifest = JSON.parse(
    readFileSync(
      resolve(
        import.meta.dirname,
        "..",
        "packages",
        packageDirectory,
        "package.json",
      ),
      "utf8",
    ),
  );

  if (normalizedReleaseVersion !== packageManifest.version) {
    throw new Error(
      `Release version ${releaseVersion} does not match ${packageManifest.name}@${packageManifest.version}.`,
    );
  }

  console.log(
    `Release version verified: ${packageManifest.name}@${packageManifest.version}`,
  );
}
