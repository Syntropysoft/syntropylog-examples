#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Configuration
// Ruta a la librería local (relativa al package.json de cada ejemplo).
// Estructura: .../syntropy/syntropylog-examples/  y  .../syntropy/syntropyLog/
const LOCAL_VERSION = "file:../../syntropyLog";
const PACKAGE_NAME = "syntropylog";

console.log('🔄 Actualizando ejemplos para usar versión local...');
console.log(`Versión local: ${LOCAL_VERSION}`);
console.log();

// Get all example directories
const examples = fs.readdirSync('.', { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name)
  .filter(name => /^\d+/.test(name)) // Only directories starting with numbers
  .sort();

if (examples.length === 0) {
  console.log('❌ No se encontraron directorios de ejemplos');
  process.exit(1);
}

console.log(`📁 Encontrados ${examples.length} ejemplos`);
console.log();

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

    // Update dependencies
    ['dependencies', 'devDependencies'].forEach(depType => {
      if (packageJson[depType] && packageJson[depType][PACKAGE_NAME]) {
        const oldVersion = packageJson[depType][PACKAGE_NAME];
        if (oldVersion !== LOCAL_VERSION) {
          console.log(`  ${PACKAGE_NAME}: ${oldVersion} → ${LOCAL_VERSION}`);
          packageJson[depType][PACKAGE_NAME] = LOCAL_VERSION;
          changed = true;
        }
      }
    });

    if (changed) {
      fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
      console.log(`  ✅ ${example}: Actualizado`);
      updated++;
    } else {
      console.log(`  ℹ️  ${example}: Ya usa versión local o no usa ${PACKAGE_NAME}`);
    }

  } catch (error) {
    console.log(`  ❌ ${example}: Error - ${error.message}`);
    failed++;
  }
});

console.log();
console.log('📊 Resumen:');
console.log(`  ✅ Actualizados: ${updated}`);
console.log(`  ❌ Fallidos: ${failed}`);
console.log(`  📁 Total: ${examples.length}`);

if (updated > 0) {
  console.log();
  console.log('💡 Para instalar dependencias actualizadas:');
  console.log('   npm install');
  console.log();
  console.log('⚠️  Nota: Los ejemplos ahora usan la versión local compilada');
  console.log('   Esto es útil para desarrollo y testing');
}

console.log();
console.log('✅ Actualización completada!'); 