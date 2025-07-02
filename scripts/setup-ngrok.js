#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Configurando ngrok para desarrollo...\n');

// Solicitar la URL de ngrok
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Ingresa tu URL de ngrok (ej: https://abc123.ngrok.io): ', (ngrokUrl) => {
  if (!ngrokUrl.startsWith('https://')) {
    console.error('❌ La URL debe comenzar con https://');
    rl.close();
    return;
  }

  // Leer el archivo de configuración
  const configPath = path.join(__dirname, '../src/config/api.js');
  let configContent = fs.readFileSync(configPath, 'utf8');

  // Actualizar la URL de ngrok
  configContent = configContent.replace(
    /baseURL: 'https:\/\/tu-url-ngrok\.ngrok\.io'/,
    `baseURL: '${ngrokUrl}'`
  );

  // Cambiar el entorno a ngrok
  configContent = configContent.replace(
    /return 'development'; \/\/ Cambia a 'ngrok' si usas ngrok/,
    "return 'ngrok'; // Cambiado automáticamente por el script"
  );

  // Escribir el archivo actualizado
  fs.writeFileSync(configPath, configContent);

  console.log('✅ Configuración actualizada exitosamente!');
  console.log(`📡 URL de ngrok: ${ngrokUrl}`);
  console.log('\n🚀 Para volver a desarrollo local, ejecuta:');
  console.log('   npm run setup-local');
  
  rl.close();
}); 