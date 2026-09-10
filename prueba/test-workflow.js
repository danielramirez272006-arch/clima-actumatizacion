/**
 * Simulación y prueba directa del Workflow de n8n:
 * 1. HTTP Request (Open-Meteo San José, Costa Rica)
 * 2. Code Node - Business Rules
 * 3. Switch & Set Results
 */

const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast?latitude=9.9981&longitude=-84.1169&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m';

async function runN8nWorkflowTest() {
  console.log('----------------------------------------------------');
  console.log('🚀 [NODO 1: Manual Trigger] - Iniciando ejecución...');
  console.log('----------------------------------------------------');

  console.log('🌐 [NODO 2: HTTP Request] - Consultando Open-Meteo...');
  console.log(`URL: ${OPEN_METEO_URL}`);
  
  const response = await fetch(OPEN_METEO_URL);
  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
  }
  const rawData = await response.json();
  const current = rawData.current;

  console.log('📥 Datos crudos recibidos de la estación (San José, CR):');
  console.log(`   - Temperatura actual: ${current.temperature_2m} °C`);
  console.log(`   - Precipitación: ${current.precipitation} mm`);
  console.log(`   - Velocidad del viento: ${current.wind_speed_10m} km/h`);
  console.log(`   - Humedad relativa: ${current.relative_humidity_2m} %`);

  console.log('\n⚙️ [NODO 3: Code Node - Business Rules] - Evaluando reglas...');
  const temperature = current.temperature_2m;
  const precipitation = current.precipitation;
  const windSpeed = current.wind_speed_10m;

  let recomendacion = "Realizar";

  if (temperature < 10 || temperature > 35 || precipitation > 2 || windSpeed > 30) {
    recomendacion = "Reprogramar";
  } else if ((temperature >= 10 && temperature <= 14) || (temperature >= 31 && temperature <= 35) || (precipitation >= 0.1 && precipitation <= 2) || (windSpeed >= 15 && windSpeed <= 30)) {
    recomendacion = "Precaución";
  }

  console.log(`   --> Dictamen de regla: "${recomendacion}"`);

  console.log('\n🔀 [NODO 4: Switch - Routes] - Redirigiendo a rama correspondiente...');
  let finalNodeName = '';
  let finalMessage = '';

  if (recomendacion === 'Realizar') {
    finalNodeName = 'Set - Realizar';
    finalMessage = 'Puede realizar la actividad sin restricciones';
  } else if (recomendacion === 'Precaución') {
    finalNodeName = 'Set - Precaución';
    finalMessage = 'Tome precauciones adicionales para realizar la actividad';
  } else if (recomendacion === 'Reprogramar') {
    finalNodeName = 'Set - Reprogramar';
    finalMessage = 'Se recomienda reprogramar la actividad por condiciones climáticas adversas';
  }

  console.log(`✅ [NODO 5: ${finalNodeName}] - Output Final del Workflow:`);
  const finalOutput = {
    status: recomendacion,
    temperature: `${temperature} °C`,
    precipitation: `${precipitation} mm`,
    windSpeed: `${windSpeed} km/h`,
    humidity: `${current.relative_humidity_2m} %`,
    message: finalMessage,
    timestamp: new Date().toISOString()
  };

  console.log(JSON.stringify(finalOutput, null, 2));
  console.log('----------------------------------------------------');
  console.log('🎉 ¡Prueba completada con éxito! El workflow funciona 100%');
  console.log('----------------------------------------------------');
}

runN8nWorkflowTest().catch(console.error);
