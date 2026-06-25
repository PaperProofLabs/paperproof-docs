// Copyright (c) 2026 PaperProof Labs
// SPDX-License-Identifier: Apache-2.0

import fs from 'node:fs/promises';
import { TextDecoder } from 'node:util';

const utf8Decoder = new TextDecoder('utf-8', { fatal: true });

export async function assertUtf8JsonFile(filePath) {
  const bytes = await fs.readFile(filePath);
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
    throw new Error(`${filePath} is UTF-16 LE; rewrite it as UTF-8 before deploy.`);
  }
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    throw new Error(`${filePath} is UTF-16 BE; rewrite it as UTF-8 before deploy.`);
  }
  JSON.parse(utf8Decoder.decode(bytes).replace(/^\uFEFF/, ''));
}

export async function preflightJsonFiles(filePaths) {
  for (const filePath of filePaths) {
    await assertUtf8JsonFile(filePath);
  }
}
