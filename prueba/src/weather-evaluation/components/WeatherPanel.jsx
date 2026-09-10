import React from 'react';
import { WeatherCard } from '../../shared/components/WeatherCard';
import { getWeatherCodeInfo } from '../utils/calculateRisk';

export const WeatherPanel = ({
  weatherData,
  evaluation,
  selectedLocation,
  setSelectedLocation,
  presetLocations,
  searchQuery,
  searchResults,
  searching,
  handleSearch,
  onRefresh
}) => {
  if (!weatherData || !weatherData.current) return null;

  const { current, daily } = weatherData;
  const weatherInfo = getWeatherCodeInfo(current.weather_code);

  const getDayName = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  return (
    <div className="weather-panel-container">
      {/* Location Bar & Quick Selector */}
      <div className="location-toolbar">
        <div className="location-info">
          <span className="location-marker">📍</span>
          <div>
            <h2 className="location-title">{selectedLocation.name}</h2>
            <span className="location-subtitle">{selectedLocation.country} • Lat: {selectedLocation.lat}, Lon: {selectedLocation.lon}</span>
          </div>
        </div>

        <div className="location-actions">
          {/* Preset Buttons */}
          <div className="preset-buttons-group">
            {presetLocations.map((loc) => (
              <button
                key={loc.id}
                type="button"
                className={`preset-btn ${selectedLocation.id === loc.id ? 'active' : ''}`}
                onClick={() => setSelectedLocation(loc)}
              >
                {loc.name.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="search-box-wrapper">
            <input
              type="text"
              className="search-input"
              placeholder="Buscar otra ubicación..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {searching && <span className="search-loading-indicator">...</span>}
            
            {/* Search Dropdown */}
            {searchResults.length > 0 && (
              <div className="search-dropdown-menu">
                {searchResults.map((res) => (
                  <div
                    key={res.id}
                    className="search-dropdown-item"
                    onClick={() => setSelectedLocation(res)}
                  >
                    <strong>{res.name}</strong>
                    <small>{res.country}</small>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="button" className="refresh-btn" onClick={onRefresh} title="Actualizar datos">
            🔄
          </button>
        </div>
      </div>

      {/* Hero Weather Section */}
      <div className="current-weather-hero">
        <div className="hero-weather-main">
          <span className="hero-weather-icon">{weatherInfo.icon}</span>
          <div className="hero-temp-group">
            <span className="hero-temp-value">{Math.round(current.temperature_2m)}°C</span>
            <span className="hero-weather-condition">{weatherInfo.label}</span>
          </div>
        </div>

        <div className="hero-meta-stats">
          <div className="hero-meta-item">
            <span className="meta-label">Sensación Térmica</span>
            <span className="meta-value">{Math.round(current.apparent_temperature)}°C</span>
          </div>
          <div className="hero-meta-item">
            <span className="meta-label">Humedad Relativa</span>
            <span className="meta-value">{current.relative_humidity_2m}%</span>
          </div>
          <div className="hero-meta-item">
            <span className="meta-label">Día / Noche</span>
            <span className="meta-value">{current.is_day ? '☀️ Diurno' : '🌙 Nocturno'}</span>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="weather-cards-grid">
        <WeatherCard
          title="Velocidad del Viento"
          value={Math.round(current.wind_speed_10m)}
          unit="km/h"
          subtitle={`Ráfagas máx: ${Math.round(current.wind_gusts_10m || current.wind_speed_10m)} km/h`}
          icon="💨"
          alert={current.wind_speed_10m > 30 ? 'warning' : null}
        />
        <WeatherCard
          title="Precipitación Actual"
          value={current.precipitation}
          unit="mm/h"
          subtitle={current.precipitation > 0 ? 'Lluvia en curso' : 'Sin lluvia registrada'}
          icon="🌧️"
          alert={current.precipitation > 2 ? 'danger' : null}
        />
        <WeatherCard
          title="Probabilidad de Lluvia (Día)"
          value={daily?.precipitation_probability_max?.[0] ?? 0}
          unit="%"
          subtitle={`Acumulado previsto: ${daily?.precipitation_sum?.[0] ?? 0} mm`}
          icon="☔"
          alert={daily?.precipitation_probability_max?.[0] > 60 ? 'warning' : null}
        />
        <WeatherCard
          title="Índice UV Máximo"
          value={daily?.uv_index_max?.[0] ?? '--'}
          unit="UV"
          subtitle={
            (daily?.uv_index_max?.[0] || 0) >= 8
              ? 'Muy Alto (Protección extrema)'
              : (daily?.uv_index_max?.[0] || 0) >= 5
              ? 'Moderado a Alto'
              : 'Bajo'
          }
          icon="🔆"
          alert={(daily?.uv_index_max?.[0] || 0) >= 8 ? 'warning' : null}
        />
      </div>

      {/* 5-Day Outlook */}
      {daily && daily.time && (
        <div className="forecast-outlook-section">
          <h3 className="section-subtitle">Pronóstico Extendido a 5 Días</h3>
          <div className="forecast-days-strip">
            {daily.time.slice(0, 5).map((date, idx) => {
              const dayWmo = getWeatherCodeInfo(daily.weather_code[idx]);
              const maxTemp = Math.round(daily.temperature_2m_max[idx]);
              const minTemp = Math.round(daily.temperature_2m_min[idx]);
              const rainProb = daily.precipitation_probability_max[idx];
              const maxWind = Math.round(daily.wind_speed_10m_max[idx]);

              return (
                <div key={date} className={`forecast-day-card ${idx === 0 ? 'active-today' : ''}`}>
                  <span className="forecast-date-label">{idx === 0 ? 'Hoy' : getDayName(date)}</span>
                  <span className="forecast-icon">{dayWmo.icon}</span>
                  <div className="forecast-temp-range">
                    <span className="temp-max">{maxTemp}°</span>
                    <span className="temp-min">{minTemp}°</span>
                  </div>
                  <span className="forecast-rain-prob">💧 {rainProb}%</span>
                  <span className="forecast-wind-speed">💨 {maxWind} km/h</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherPanel;
