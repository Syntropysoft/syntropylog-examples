#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Leer versiones desde el archivo
const versionsContent = fs.readFileSync('versions.txt', 'utf8');
const VERSIONS = {};

versionsContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [pkg, version] = trimmed.split('=');
    if (pkg && version) {
      VERSIONS[pkg.trim()] = version.trim();
    }
  }
});

console.log('🔄 Actualizando versiones en ejemplos...');
console.log('Versiones a actualizar:');
Object.entries(VERSIONS).forEach(([pkg, version]) => {
  console.log(`  ${pkg}: ${version}`);
});

// Obtener todos los directorios de ejemplos
const examples = fs.readdirSync('.', { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name)
  .filter(name => /^\d+/.test(name)) // Solo directorios que empiecen con números
  .sort();

console.log(`\n📁 Encontrados ${examples.length} ejemplos`);

let updated = 0;
let failed = 0;

examples.forEach(example => {
  const packagePath = path.join(example, 'package.json');
  
  if (!fs.existsSync(packagePath)) {
    console.log(`⚠️  ${example}: No tiene package.json`);
    return;
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    let changed = false;

    // Actualizar dependencias
    ['dependencies', 'devDependencies'].forEach(depType => {
      if (packageJson[depType]) {
        Object.keys(VERSIONS).forEach(pkg => {
          if (packageJson[depType][pkg]) {
            const oldVersion = packageJson[depType][pkg];
            packageJson[depType][pkg] = `${VERSIONS[pkg]}`;
            if (oldVersion !== packageJson[depType][pkg]) {
              console.log(`  ${pkg}: ${oldVersion} → ${packageJson[depType][pkg]}`);
              changed = true;
            }
          }
        });
      }
    });

    if (changed) {
      fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
      console.log(`✅ ${example}: Actualizado`);
      updated++;
    } else {
      console.log(`ℹ️  ${example}: Sin cambios necesarios`);
    }

  } catch (error) {
    console.log(`❌ ${example}: Error - ${error.message}`);
    failed++;
  }
});

console.log(`\n📊 Resumen:`);
console.log(`  ✅ Actualizados: ${updated}`);
console.log(`  ❌ Fallidos: ${failed}`);
console.log(`  📁 Total: ${examples.length}`);

if (updated > 0) {
  console.log(`\n💡 Para instalar dependencias actualizadas:`);
  console.log(`   npm install`);
} 