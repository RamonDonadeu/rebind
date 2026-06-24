import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const dbRoot = path.resolve(scriptDir, "..");
const repoRoot = path.resolve(dbRoot, "../..");
const rootEnv = path.join(repoRoot, ".env");
const prismaCli = path.join(repoRoot, "node_modules", "prisma", "build", "index.js");

if (!existsSync(prismaCli)) {
  console.error("Prisma CLI not found. Run npm install from the repo root.");
  process.exit(1);
}

const prismaArgs = process.argv.slice(2);
const nodeArgs = [];

if (!process.env.DATABASE_URL && existsSync(rootEnv)) {
  nodeArgs.push("--env-file", rootEnv);
}

nodeArgs.push(prismaCli, ...prismaArgs);

const result = spawnSync(process.execPath, nodeArgs, {
  stdio: "inherit",
  cwd: dbRoot,
});

process.exit(result.status ?? 1);
