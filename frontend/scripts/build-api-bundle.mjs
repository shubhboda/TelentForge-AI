import { build } from "esbuild";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const frontendRoot = resolve(import.meta.dirname, "..");
const repoRoot = resolve(frontendRoot, "..");
const outputDir = resolve(frontendRoot, "api-backend");

if (existsSync(outputDir)) {
  rmSync(outputDir, { recursive: true, force: true });
}

mkdirSync(outputDir, { recursive: true });

await build({
  entryPoints: [resolve(repoRoot, "backend/src/app.ts")],
  outfile: resolve(outputDir, "bundle.cjs"),
  bundle: true,
  platform: "node",
  target: "node20",
  format: "cjs",
  packages: "bundle",
  logLevel: "info",
});
