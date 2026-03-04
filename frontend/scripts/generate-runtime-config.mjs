import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const clerkPublishableKey = process.env.CLERK_PUBLISHABLE_KEY || "";
const apiBaseUrl = process.env.API_BASE_URL || "";

const runtimeConfigPath = join(
  __dirname,
  "..",
  "src",
  "assets",
  "runtime-config.js",
);
await mkdir(dirname(runtimeConfigPath), { recursive: true });

const content = [
  `window.CLERK_PUBLISHABLE_KEY = ${JSON.stringify(clerkPublishableKey)};`,
  `window.API_BASE_URL = ${JSON.stringify(apiBaseUrl)};`,
  "",
].join("\n");

await writeFile(runtimeConfigPath, content, "utf8");
console.log(`Generated runtime config at ${runtimeConfigPath}`);
