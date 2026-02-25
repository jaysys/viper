import { execSync } from "node:child_process";
import path from "node:path";

const root = path.resolve("/Users/jaehojoo/Desktop/codex-lgcns-workspace");

const steps = [
  { name: "mock scenario validation", cmd: "node viper/scripts/validate-mock-scenarios.mjs" },
  { name: "screen scenario execution", cmd: "node viper/scripts/run-screen-scenarios.mjs" },
  { name: "fetch conversion verification", cmd: "node viper/scripts/verify-fetch-conversion.mjs" }
];

for (const step of steps) {
  process.stdout.write(`[RUN] ${step.name}\n`);
  execSync(step.cmd, { cwd: root, stdio: "inherit" });
}

process.stdout.write("[PASS] full mock verification\n");
