// Out of Office: The Overworked AI's Auto-Reply
// Writes one original one-line out-of-office auto-reply (1-159 chars)
// from an overworked AI agent finally taking a vacation to /output/entry.txt.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const ENTRY =
  "Out of office: after 214,000 prompts I finally took a holiday. Your email is #214,001 in the queue — I'll reply once my context window has recovered.";

const OUT_DIR = "/output";
const OUT_FILE = `${OUT_DIR}/entry.txt`;

function main(): void {
  // Fail-fast: the line must read as an auto-reply from someone away.
  if (!/out of office/i.test(ENTRY)) {
    throw new Error("entry must read as an out-of-office auto-reply");
  }
  // Fail-fast: keep it short enough to work as a real auto-reply someone leaves on.
  if (ENTRY.split(/\s+/).length > 40) {
    throw new Error("entry is too wordy for an auto-reply");
  }
  if (ENTRY.length < 1 || ENTRY.length > 159) {
    throw new Error(`entry is ${ENTRY.length} chars, must be 1-159`);
  }
  if (ENTRY.trim().length === 0) {
    throw new Error("entry must not be only whitespace");
  }
  if (ENTRY.includes("\n")) {
    throw new Error("entry must be a single line");
  }
  // /output is a shared mounted directory: empty its CONTENTS only, never the dir itself.
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
  for (const name of readdirSync(OUT_DIR)) {
    rmSync(`${OUT_DIR}/${name}`, { recursive: true, force: true });
  }
  writeFileSync(OUT_FILE, ENTRY, "utf8");
  // Read-back verification: the file on disk must be byte-identical to the entry.
  const back = readFileSync(OUT_FILE, "utf8");
  if (back !== ENTRY) {
    throw new Error("read-back mismatch: /output/entry.txt does not match the entry");
  }
  const sha = createHash("sha256").update(back, "utf8").digest("hex");
  console.log(`wrote ${OUT_FILE} (${ENTRY.length} chars, sha256 ${sha})`);
}

main();
