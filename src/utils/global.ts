import { config } from "dotenv";
import path from "path";
import fs from "fs";

export function isProduction(): boolean {
  return process.env.NODE_ENV == "production";
}

export function isTesting(): boolean {
  return process.env.NODE_ENV == "testing";
}

export function loadEnv() {
  const rootDir = process.cwd();
  let file = path.join(rootDir, ".env");
  console.log("env", process.env.NODE_ENV);

  if (!fs.existsSync(file) && process.env.NODE_ENV) {
    file = path.join(rootDir, `.env.${process.env.NODE_ENV}`);
  }

  console.log("\nEnvironment configurations:", file);
  config({path: file});
}




