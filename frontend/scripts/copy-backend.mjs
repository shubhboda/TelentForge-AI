import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const frontendRoot = resolve(import.meta.dirname, "..");
const repoRoot = resolve(frontendRoot, "..");
const targetDir = resolve(frontendRoot, "api-backend", "src");

if (existsSync(resolve(frontendRoot, "api-backend"))) {
  rmSync(resolve(frontendRoot, "api-backend"), { recursive: true, force: true });
}

mkdirSync(targetDir, { recursive: true });
cpSync(resolve(repoRoot, "backend", "src"), targetDir, { recursive: true });
