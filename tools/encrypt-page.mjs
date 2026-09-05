import { createCipheriv, createDecipheriv, createHash, pbkdf2Sync, randomBytes } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

const [inputPath, outputPath] = process.argv.slice(2);
if (!inputPath || !outputPath) {
  console.error('Usage: node tools/encrypt-page.mjs INPUT_HTML OUTPUT_JSON');
  process.exit(2);
}

const generatedPassword = !process.env.MIDDLE_SCHOOL_PASSWORD;
const password = process.env.MIDDLE_SCHOOL_PASSWORD || randomBytes(10).toString('hex').match(/.{1,4}/g).join('-');
const iterations = 600_000;
const salt = randomBytes(16);
const iv = randomBytes(12);
const plaintext = await readFile(inputPath);
const key = pbkdf2Sync(password, salt, iterations, 32, 'sha256');
const cipher = createCipheriv('aes-256-gcm', key, iv);
const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final(), cipher.getAuthTag()]);

const payload = {
  version: 1,
  kdf: 'PBKDF2-SHA-256',
  cipher: 'AES-256-GCM',
  iterations,
  salt: salt.toString('base64'),
  iv: iv.toString('base64'),
  ciphertext: ciphertext.toString('base64')
};
await writeFile(outputPath, `${JSON.stringify(payload)}\n`, { mode: 0o644 });

const tag = ciphertext.subarray(ciphertext.length - 16);
const encryptedBody = ciphertext.subarray(0, ciphertext.length - 16);
const decipher = createDecipheriv('aes-256-gcm', key, iv);
decipher.setAuthTag(tag);
const verified = Buffer.concat([decipher.update(encryptedBody), decipher.final()]);
if (!verified.equals(plaintext)) throw new Error('Encryption verification failed');

const digest = (value) => createHash('sha256').update(value).digest('hex');
console.log(`source_sha256=${digest(plaintext)}`);
console.log(`verified_sha256=${digest(verified)}`);
console.log(`payload_bytes=${ciphertext.length}`);
if (generatedPassword) console.log(`generated_password=${password}`);
