#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Configurando desarrollo local...\n');

// Leer el archivo de configuración
const configPath = path.join(__dirname, '../src/config/api.js');
let configContent = fs.readFileSync(configPath, 'utf8');

// Cambiar el entorno a development
configContent = configContent.replace(
  /return 'ngrok'; \/\/ Cambiado automáticamente por el script/,
  "return 'development'; // Cambia a 'ngrok' si usas ngrok"
);

// Escribir el archivo actualizado
fs.writeFileSync(configPath, configContent);

console.log('✅ Configuración actualizada exitosamente!');
console.log('🏠 Modo: Desarrollo local (http://localhost:8000)');
console.log('\n🚀 Para usar ngrok, ejecuta:');
console.log('   npm run setup-ngrok'); 