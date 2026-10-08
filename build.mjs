import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectDir = path.dirname(fileURLToPath(import.meta.url));
const defaultApiUrl = "https://api.attackontitanapi.com";
const envFilePath = path.join(projectDir, ".env");
let envFile = "";

try {
  envFile = await readFile(envFilePath, "utf8");
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

const localSetting = envFile
  .split(/\r?\n/)
  .map((line) => line.trim())
  .find((line) => line.startsWith("AOT_API_URL="))
  ?.slice("AOT_API_URL=".length)
  .trim()
  .replace(/^(["'])(.*)\1$/, "$2");

const rawApiUrl = process.env.AOT_API_URL || localSetting || defaultApiUrl;
let apiUrl;

try {
  apiUrl = new URL(rawApiUrl);
} catch {
  throw new Error("AOT_API_URL must be a valid absolute URL.");
}

if (!["https:", "http:"].includes(apiUrl.protocol) || apiUrl.username || apiUrl.password) {
  throw new Error("AOT_API_URL must use HTTP(S) and must not contain credentials.");
}

const indexPath = path.join(projectDir, "index.html");
const source = await readFile(indexPath, "utf8");
const marker = '"__AOT_API_URL__"';

if (!source.includes(marker)) {
  throw new Error("Could not find the AOT_API_URL build marker in index.html.");
}

const outputDir = path.join(projectDir, "dist");
await mkdir(outputDir, { recursive: true });
await writeFile(
  path.join(outputDir, "index.html"),
  source.replaceAll(marker, JSON.stringify(apiUrl.toString().replace(/\/+$/, ""))),
);

console.log(`Built AOT Desk for ${apiUrl.origin} in dist/.`);
