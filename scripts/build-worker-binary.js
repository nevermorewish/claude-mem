#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';

const version = JSON.parse(fs.readFileSync('package.json', 'utf-8')).version;
const outDir = 'dist/binaries';
const target = process.env.CLAUDE_MEM_BINARY_TARGET || 'bun-windows-x64';
const defaultBinaryName = target.includes('windows') ? 'claude-mem.exe' : 'claude-mem';
const outfile = process.env.CLAUDE_MEM_BINARY_OUTFILE || `${outDir}/${defaultBinaryName}`;
const legacyOutfile = `${outDir}/worker-service-v${version}-win-x64.exe`;

fs.mkdirSync(outDir, { recursive: true });

console.log(`Building claude-mem ${target} binary v${version}...`);

try {
  const windowsFlags = target.includes('windows') ? ' --windows-hide-console' : '';
  execSync(
    `bun build --compile --minify${windowsFlags} --target=${target} ./src/services/worker-service.ts --outfile ${outfile}`,
    { stdio: 'inherit' }
  );
  console.log(`\nBuilt: ${outfile}`);

  if (target === 'bun-windows-x64' && outfile !== legacyOutfile) {
    fs.copyFileSync(outfile, legacyOutfile);
    console.log(`Built compatibility copy: ${legacyOutfile}`);
  }
} catch (error) {
  console.error('Failed to build claude-mem binary:', error.message);
  process.exit(1);
}
