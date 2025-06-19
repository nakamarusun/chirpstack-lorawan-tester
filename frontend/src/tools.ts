import { customAlphabet } from "nanoid";

const alphabet = '0123456789abcdef';
export function nanoIDRandomHex(length: number): string {
  const nanoid = customAlphabet(alphabet, length);
  return nanoid();
}