#!/usr/bin/env node

/**
 * Dedicated syntropylog version updater for the distributed-orders-kafka monorepo.
 *
 * The examples-root `update-versions.js` only rewrites a single top-level
 * `<example>/package.json`. This example is an npm-workspaces monorepo: the
 * `syntropylog` dependency lives inside each workspace member (`packages/*`,
 * `services/*`), not at the root — so it needs its own walker.
 *
 * Usage:
 *   node update-version.js 1.3.0                     # pin to a published npm version
 *   node update-version.js file:../../../SyntropyLog # local link (needs pnpm — see README)
 *
 * Only members that already declare `syntropylog` are touched; everything else
 * (frontend, shared build tooling) is left as-is.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const PACKAGE = 'syntropylog';
const target = process.argv[2];

if (!target) {
  console.error('❌ Falta la versión.  Uso: node update-version.js <version|spec>');
  console.error('   ej: node update-version.js 1.3.0');
  process.exit(1);
}

const root = path.dirname(fileURLToPath(import.meta.url));

// Expand the workspace globs declared by this monorepo's own package.json,
// so the walker follows the real layout instead of a hard-coded list.
const rootPkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const globs = rootPkg.workspaces || [];

const memberDirs = new Set();
for (const glob of globs) {
  if (glob.endsWith('/*')) {
    const base = path.join(root, glob.slice(0, -2));
    if (!fs.existsSync(base)) continue;
    for (const entry of fs.readdirSync(base, { withFileTypes: true })) {
      if (entry.isDirectory()) memberDirs.add(path.join(base, entry.name));
    }
  } else {
    memberDirs.add(path.join(root, glob));
  }
}

console.log(`🔄 Fijando ${PACKAGE} → ${target} en el monorepo del ejemplo 22...\n`);

let updated = 0;
let scanned = 0;

for (const dir of [...memberDirs].sort()) {
  const pkgPath = path.join(dir, 'package.json');
  if (!fs.existsSync(pkgPath)) continue;
  scanned++;

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  let changed = false;

  for (const depType of ['dependencies', 'devDependencies']) {
    if (pkg[depType] && pkg[depType][PACKAGE]) {
      const old = pkg[depType][PACKAGE];
      if (old !== target) {
        pkg[depType][PACKAGE] = target;
        console.log(`  ${path.relative(root, dir) || '.'}: ${PACKAGE} ${old} → ${target}`);
        changed = true;
      }
    }
  }

  if (changed) {
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
    updated++;
  }
}

console.log(`\n📊 ${updated} package.json actualizados (de ${scanned} workspaces escaneados).`);
if (updated > 0) {
  console.log('💡 Ahora corré:  npm install');
} else {
  console.log(`ℹ️  Nada que cambiar — ya estaban en ${target}.`);
}
