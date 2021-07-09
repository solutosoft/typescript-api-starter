import { hash, compare} from "bcrypt";
import { uid } from "rand-token";
import crypto from "crypto";

const HASH_SALT_ROUNDS = 12;

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
