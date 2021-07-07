import { createTransport } from "nodemailer";
import { config } from "dotenv";
import { hash, compare} from "bcrypt";
import { uid } from "rand-token";
import Email from "email-templates";
import path from "path";
import crypto from "crypto";
import fs from "fs";

const HASH_SALT_ROUNDS = 12;

export function isProduction(): boolean {
  return process.env.NODE_ENV == "production";
}

export function isTesting(): boolean {
  return process.env.NODE_ENV == "testing";
}

export function generateHash(plain: string) : Promise<string> {
  return hash(plain, HASH_SALT_ROUNDS);
}

export function comparePassword(plain: string, encrypted: string) : Promise<boolean> {
  return compare(plain, encrypted);
}

export function randomString(size: number = 21): string {
  return crypto
    .randomBytes(size)
    .toString('base64')
    .slice(0, size);
}

export function randomInt(size: number = 5) {
  return uid(size, "0123456789");
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

export function createEmail(): Email {
  return new Email({
    send: isProduction(),
    message: {
      from: process.env.EMAIL_FROM,
    },
    transport: createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    }),
    getPath: (type, template) => {
      return path.join(__dirname, "emails", template, type);
    },
  });
}


