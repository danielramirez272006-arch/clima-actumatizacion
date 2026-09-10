/**
 * Shared API Client for Open-Meteo and general HTTP requests
 */

const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1/forecast';
const GEOCODING_BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';

export const apiClient = {
  /**
   * Fetches weather forecast data from Open-Meteo
   * @param {Object} params - Query params (latitude, longitude, hourly, daily, etc.)
   */
  async getForecast({ latitude, longitude, timezone = 'auto' }) {
    const url = new URL(OPEN_METEO_BASE_URL);
    url.searchParams.set('latitude', latitude);
    url.searchParams.set('longitude', longitude);
    url.searchParams.set('timezone', timezone);
    url.searchParams.set(
      'current',
      'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,wind_speed_10m,wind_gusts_10m'
    );
    url.searchParams.set(
      'hourly',
      'temperature_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m,wind_gusts_10m'
    );
    url.searchParams.set(
      'daily',
      'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,uv_index_max'
    );
    url.searchParams.set('forecast_days', '5');

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Error fetching weather data: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Searches for location coordinates by query name
   * @param {string} query - Location name (e.g., "Bogotá", "Patagonia", "Yosemite")
   */
  async searchLocation(query) {
    if (!query || query.trim().length < 2) return [];
    const url = new URL(GEOCODING_BASE_URL);
    url.searchParams.set('name', query.trim());
    url.searchParams.set('count', '5');
    url.searchParams.set('language', 'es');
    url.searchParams.set('format', 'json');

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Error searching location: ${response.statusText}`);
    }
    const data = await response.json();
    return data.results || [];
  }
};
