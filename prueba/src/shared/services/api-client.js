// src/shared/services/api-client.js

const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1/forecast';
const GEOCODING_BASE = 'https://geocoding-api.open-meteo.com/v1/search';
const N8N_WEBHOOK_URL = 'http://localhost:5678/webhook-test/weather-evaluation';

// Lugares reales y conocidos de Costa Rica con coordenadas exactas
export const LOCATIONS = [
  { id: 'sanjose', name: 'San José', country: 'Costa Rica', lat: 9.9281, lon: -84.0907, icon: '🏙️' },
  { id: 'cartago', name: 'Cartago', country: 'Costa Rica', lat: 9.8644, lon: -83.9194, icon: '⛪' },
  { id: 'heredia', name: 'Heredia', country: 'Costa Rica', lat: 9.9981, lon: -84.1169, icon: '🌸' },
  { id: 'alajuela', name: 'Alajuela', country: 'Costa Rica', lat: 10.0163, lon: -84.2116, icon: '✈️' },
  { id: 'la_fortuna', name: 'La Fortuna (Arenal)', country: 'Costa Rica', lat: 10.4709, lon: -84.6453, icon: '🌋' },
  { id: 'manuel_antonio', name: 'Manuel Antonio (Quepos)', country: 'Costa Rica', lat: 9.3900, lon: -84.1400, icon: '🏖️' },
  { id: 'liberia', name: 'Liberia (Guanacaste)', country: 'Costa Rica', lat: 10.6350, lon: -85.4377, icon: '☀️' },
  { id: 'limon', name: 'Puerto Limón', country: 'Costa Rica', lat: 9.9907, lon: -83.0360, icon: '🌴' }
];

export const ALL_ACTIVITIES = [
  {
    id: 'trekking',
    name: 'Senderismo / Caminata',
    icon: '🥾',
    rules: { maxRain: 1.5, maxWind: 28, minTemp: 8, maxTemp: 34 }
  },
  {
    id: 'kayak',
    name: 'Kayak / Deportes en Agua',
    icon: '🚣',
    rules: { maxRain: 0.5, maxWind: 18, minTemp: 14, maxTemp: 36 }
  },
  {
    id: 'camping',
    name: 'Campamento',
    icon: '⛺',
    rules: { maxRain: 1.0, maxWind: 22, minTemp: 10, maxTemp: 32 }
  },
  {
    id: 'cycling',
    name: 'Ciclismo (MTB / Ruta)',
    icon: '🚵',
    rules: { maxRain: 0.8, maxWind: 25, minTemp: 10, maxTemp: 33 }
  },
  {
    id: 'climbing',
    name: 'Escalada al Aire Libre',
    icon: '🧗',
    rules: { maxRain: 0.1, maxWind: 20, minTemp: 12, maxTemp: 30 }
  },
  {
    id: 'picnic',
    name: 'Picnic / Paseo Familiar',
    icon: '🧺',
    rules: { maxRain: 0.2, maxWind: 24, minTemp: 15, maxTemp: 32 }
  }
];

/**
 * Consulta pronóstico horario y diario con dirección del viento de Open-Meteo
 */
export const fetchWeatherData = async (lat = 9.9281, lon = -84.0907, locationName = 'San José, Costa Rica') => {
  // Notificación opcional a n8n
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location: locationName, lat, lon, requestedAt: new Date().toISOString() }),
      signal: controller.signal
    }).catch(() => {});
    clearTimeout(timeoutId);
  } catch {}

  const url = `${OPEN_METEO_BASE}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_gusts_10m,wind_direction_10m,is_day&hourly=temperature_2m,precipitation_probability,precipitation,wind_speed_10m,wind_direction_10m,relative_humidity_2m,is_day&forecast_days=3&timezone=auto`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Error al consultar clima: ${response.statusText}`);
  }
  return await response.json();
};

/**
 * Buscador de lugares reales con geocodificación
 */
export const searchGlobalLocations = async (query) => {
  if (!query || query.trim().length < 2) return [];
  const url = `${GEOCODING_BASE}?name=${encodeURIComponent(query.trim())}&count=5&language=es&format=json`;
  try {
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();
    return (data.results || []).map((item) => ({
      id: `geo-${item.id}`,
      name: item.name,
      country: [item.admin1, item.country].filter(Boolean).join(', '),
      lat: item.latitude,
      lon: item.longitude,
      icon: '📍'
    }));
  } catch {
    return [];
  }
};
