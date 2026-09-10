// src/features/weather-evaluation/components/weather-panel.jsx
import React, { useState } from 'react';

export const WeatherPanel = ({
  activeWeather,
  activityEvaluation,
  gearChecklist = [],
  bestWindow,
  hourlyList = [],
  selectedDay,
  setSelectedDay,
  selectedHourIndex,
  setSelectedHourIndex,
  selectedLocation,
  setSelectedLocation,
  locations = [],
  favorites = [],
  toggleFavorite,
  searchQuery,
  searchResults = [],
  searching,
  handleSearch,
  selectCustomLocation,
  onRefresh,
  loading
}) => {
  const [copied, setCopied] = useState(false);
  const [checkedGear, setCheckedGear] = useState({});

  if (!activeWeather) return null;

  const {
    temperature_2m: temp,
    apparent_temperature: apparentTemp,
    precipitation: precip,
    wind_speed_10m: wind,
    windDirection,
    relative_humidity_2m: humidity,
    hourTime,
    isDay
  } = activeWeather;

  const { allowed = [], caution = [], forbidden = [] } = activityEvaluation || {};

  // Estado del clima para el ícono animado
  let weatherCondition = 'sun';
  if (precip > 2 || wind > 30) {
    weatherCondition = 'storm';
  } else if (precip > 0) {
    weatherCondition = 'rain';
  } else if (!isDay) {
    weatherCondition = 'night';
  } else {
    weatherCondition = 'sun';
  }

  const toggleGear = (id) => {
    setCheckedGear((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleShareWhatsApp = () => {
    const allowedNames = allowed.map((a) => `${a.icon} ${a.name}`).join(', ') || 'Ninguna';
    const text = `🌤️ *Reporte Climita - ${selectedLocation.name}*
📅 Día: ${selectedDay === 0 ? 'Hoy' : 'Mañana'} a las ${hourTime}
🌡️ Temp: ${temp}°C (Sensación ${apparentTemp}°C)
🌧️ Lluvia: ${precip} mm | 💨 Viento: ${wind} km/h (${windDirection?.label || 'N'})
✅ *Actividades Recomendadas:* ${allowedNames}
⚠️ *Restricciones:* ${forbidden.length > 0 ? forbidden.map((f) => f.name).join(', ') : 'Ninguna'}

_Generado automáticamente con climita & n8n_`;

    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="climita-container">
      {/* 1. Barra de Búsqueda y Lugares con Favoritos ⭐ */}
      <section className="location-bar-section">
        <div className="location-bar-top">
          <span className="section-tag">📍 Lugares ({locations.length})</span>
          {/* Buscador Global con Autocompletado */}
          <div className="global-search-wrapper">
            <input
              type="text"
              className="search-input-field"
              placeholder="🔍 Buscar cualquier ciudad o parque..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {searching && <span className="search-spinner-tiny">...</span>}

            {searchResults.length > 0 && (
              <div className="search-results-floating-card">
                {searchResults.map((res) => (
                  <div
                    key={res.id}
                    className="search-res-item"
                    onClick={() => selectCustomLocation(res)}
                  >
                    <strong>{res.name}</strong>
                    <small>{res.country}</small>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chips de Destinos con ⭐ Favoritos */}
        <div className="location-chips-row">
          {locations.map((loc) => {
            const isFav = favorites.includes(loc.id);
            return (
              <div
                key={loc.id}
                className={`loc-chip-container ${selectedLocation.id === loc.id ? 'active' : ''} ${isFav ? 'is-fav' : ''}`}
              >
                <button
                  type="button"
                  className="loc-chip-btn"
                  onClick={() => setSelectedLocation(loc)}
                >
                  <span>{loc.icon}</span>
                  <span>{loc.name.split('(')[0].trim()}</span>
                </button>
                <button
                  type="button"
                  className={`loc-fav-star ${isFav ? 'starred' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(loc.id);
                  }}
                  title={isFav ? 'Quitar de favoritos' : 'Marcar como favorito'}
                >
                  {isFav ? '★' : '☆'}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. Selector de Día y Timeline con Mini Gráfico de Nivel 📊 */}
      <section className="hourly-timeline-section">
        <div className="timeline-header">
          {/* Selector de Día: Hoy / Mañana */}
          <div className="day-toggle-group">
            <button
              type="button"
              className={`day-toggle-btn ${selectedDay === 0 ? 'active' : ''}`}
              onClick={() => setSelectedDay(0)}
            >
              📅 Hoy
            </button>
            <button
              type="button"
              className={`day-toggle-btn ${selectedDay === 1 ? 'active' : ''}`}
              onClick={() => setSelectedDay(1)}
            >
              📆 Mañana
            </button>
          </div>

          <span className="active-hour-badge">
            Hora: <strong>{hourTime}</strong> {isDay ? '☀️ Día' : '🌙 Noche'}
          </span>
        </div>

        {/* Timeline Horario con Mini Barras de Nivel */}
        <div className="hourly-scroll-track">
          {hourlyList.map((item) => (
            <button
              key={item.index}
              type="button"
              className={`hour-item-btn ${selectedHourIndex === item.index ? 'active' : ''}`}
              onClick={() => setSelectedHourIndex(item.index)}
            >
              <span className="h-time">{item.time}</span>
              <span className="h-icon">
                {item.precip > 0 ? '🌧️' : item.isDay ? '☀️' : '🌙'}
              </span>
              <span className="h-temp">{item.temp}°</span>

              {/* Mini Barra Gráfica de Temperatura / Lluvia */}
              <div className="h-bar-container">
                <div
                  className={`h-bar-fill ${item.precip > 0 ? 'bar-rain' : 'bar-temp'}`}
                  style={{ height: `${item.tempPercent || 50}%` }}
                ></div>
              </div>

              {item.precip > 0 ? (
                <span className="h-rain">{item.precip}mm</span>
              ) : (
                <span className="h-wind-tiny">{item.wind}k</span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* 3. Hero Card con Micro-Animación en el Ícono (Día ☀️ / Noche 🌙) */}
      <section className="weather-hero-card">
        <div className="hero-left-details">
          <div className="hero-top-meta">
            <span className="hero-city-tag">{selectedLocation.name}</span>
            <span className="hero-hour-tag">{selectedDay === 0 ? 'Hoy' : 'Mañana'} a las {hourTime}</span>
            <button
              type="button"
              className={`hero-refresh-btn ${loading ? 'spinning' : ''}`}
              onClick={onRefresh}
              title="Actualizar datos"
            >
              🔄
            </button>
          </div>

          <div className="hero-temp-display">
            <span className="big-temp-num">{temp}°</span>
            <div className="temp-sub-group">
              <span className="condition-label">
                {weatherCondition === 'sun' && '☀️ Cielo Despejado (Día Soleado)'}
                {weatherCondition === 'night' && '🌙 Noche Despejada & Estrellada'}
                {weatherCondition === 'rain' && '🌧️ Lluvia Ligera a Moderada'}
                {weatherCondition === 'storm' && '⛈️ Tormenta / Viento Fuerte'}
              </span>
              <span className="apparent-text">Sensación térmica: {apparentTemp}°C</span>
            </div>
          </div>

          <div className="hero-mini-metrics">
            <div className="mini-stat">
              <span className="stat-name">🌧️ Lluvia</span>
              <span className="stat-val">{precip} mm</span>
            </div>
            <div className="mini-stat">
              <span className="stat-name">💨 Viento</span>
              <span className="stat-val">{wind} km/h</span>
            </div>
            <div className="mini-stat">
              <span className="stat-name">💧 Humedad</span>
              <span className="stat-val">{humidity} %</span>
            </div>
          </div>
        </div>

        {/* Ícono con Micro-Animación Encapsulada (Sol / Luna / Lluvia) */}
        <div className="hero-icon-animation-box">
          {weatherCondition === 'sun' && (
            <div className="icon-anim-sun">
              <div className="sun-center-orb"></div>
              <div className="sun-rotating-rays"></div>
              <div className="sun-sparkle-dot s1"></div>
              <div className="sun-sparkle-dot s2"></div>
            </div>
          )}

          {weatherCondition === 'night' && (
            <div className="icon-anim-night">
              <div className="moon-crescent"></div>
              <div className="night-star ns1">★</div>
              <div className="night-star ns2">✦</div>
              <div className="night-star ns3">★</div>
            </div>
          )}

          {weatherCondition === 'rain' && (
            <div className="icon-anim-rain">
              <div className="rain-cloud-shape">
                <span className="cloud-symbol">☁️</span>
              </div>
              <div className="rain-falling-drops">
                <span className="drop-particle d1"></span>
                <span className="drop-particle d2"></span>
                <span className="drop-particle d3"></span>
                <span className="drop-particle d4"></span>
              </div>
            </div>
          )}

          {weatherCondition === 'storm' && (
            <div className="icon-anim-storm">
              <div className="storm-cloud-shape">
                <span className="cloud-symbol dark">🌩️</span>
              </div>
              <div className="storm-sparks">
                <span className="storm-sparkle sp1">⚡</span>
                <span className="drop-particle d1"></span>
                <span className="drop-particle d3"></span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. Brújula del Viento 🧭 & Mejor Ventana 🌟 & WhatsApp */}
      <section className="smart-highlight-row">
        {/* Widget de Brújula de Viento */}
        <div className="wind-compass-widget">
          <div className="compass-dial">
            <div
              className="compass-arrow"
              style={{ transform: `rotate(${windDirection?.angle || 0}deg)` }}
            >
              <span className="arrow-head">▲</span>
            </div>
            <span className="compass-cardinal-n">N</span>
          </div>
          <div className="compass-info">
            <span className="compass-title">🧭 Dirección del Viento</span>
            <span className="compass-direction-text">
              Del <strong>{windDirection?.label || 'Norte'}</strong> ({windDirection?.code || 'N'}) a {wind} km/h
            </span>
          </div>
        </div>

        {/* Mejor Ventana del Día */}
        {bestWindow && (
          <div className="best-window-card">
            <div className="best-window-icon">🌟</div>
            <div className="best-window-info">
              <span className="best-window-title">Mejor Ventana ({selectedDay === 0 ? 'Hoy' : 'Mañana'})</span>
              <p className="best-window-desc">
                De <strong>{bestWindow.startHour} a {bestWindow.endHour}</strong> • {bestWindow.avgTemp}°C • {bestWindow.totalRain > 0 ? `${bestWindow.totalRain}mm` : 'Sin lluvia'}
              </p>
            </div>
          </div>
        )}

        <button type="button" className="share-whatsapp-btn" onClick={handleShareWhatsApp}>
          <span>📲 Compartir en WhatsApp</span>
          {copied && <span className="copied-tag">¡Enviando!</span>}
        </button>
      </section>

      {/* 5. SECCIÓN: Qué actividades SÍ y cuáles NO puedo hacer */}
      <section className="activities-feasibility-section">
        <h3 className="activities-main-title">🎯 Viabilidad de Actividades al Aire Libre</h3>
        <p className="activities-sub-title">
          Evaluado para las {hourTime} según temperatura ({temp}°C), lluvia ({precip} mm) y viento ({wind} km/h {windDirection?.code}):
        </p>

        <div className="feasibility-grid">
          {/* SÍ puedes hacer */}
          <div className="feasibility-column column-allowed">
            <div className="column-header">
              <span className="col-badge badge-green">✓ SÍ PUEDES HACER ({allowed.length})</span>
            </div>
            <div className="activities-list">
              {allowed.length > 0 ? (
                allowed.map((act) => (
                  <div key={act.id} className="act-card act-card-allowed">
                    <span className="act-card-icon">{act.icon}</span>
                    <div className="act-card-content">
                      <h4 className="act-card-title">{act.name}</h4>
                      <span className="act-card-status">Condición óptima y segura</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-acts-note">No hay actividades recomendadas bajo las condiciones de esta hora.</p>
              )}
            </div>
          </div>

          {/* Con Precaución */}
          {caution.length > 0 && (
            <div className="feasibility-column column-caution">
              <div className="column-header">
                <span className="col-badge badge-yellow">⚠️ CON PRECAUCIÓN ({caution.length})</span>
              </div>
              <div className="activities-list">
                {caution.map((act) => (
                  <div key={act.id} className="act-card act-card-caution">
                    <span className="act-card-icon">{act.icon}</span>
                    <div className="act-card-content">
                      <h4 className="act-card-title">{act.name}</h4>
                      <span className="act-card-status warning-text">{act.reason}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NO recomendadas */}
          <div className="feasibility-column column-forbidden">
            <div className="column-header">
              <span className="col-badge badge-red">✕ NO RECOMENDADO ({forbidden.length})</span>
            </div>
            <div className="activities-list">
              {forbidden.length > 0 ? (
                forbidden.map((act) => (
                  <div key={act.id} className="act-card act-card-forbidden">
                    <span className="act-card-icon">{act.icon}</span>
                    <div className="act-card-content">
                      <h4 className="act-card-title">{act.name}</h4>
                      <span className="act-card-status danger-text">{act.reason}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-acts-note">¡Excelente clima! No hay restricciones para ninguna actividad.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 6. SECCIÓN: Checklist de Equipamiento Dinámico */}
      {gearChecklist && gearChecklist.length > 0 && (
        <section className="gear-checklist-section">
          <div className="gear-header">
            <h3 className="activities-main-title">🎒 Equipamiento Recomendado para este Clima</h3>
            <span className="gear-tip">Haz clic para marcar lo que ya tienes listo</span>
          </div>

          <div className="gear-grid">
            {gearChecklist.map((item) => {
              const isChecked = Boolean(checkedGear[item.id]);
              return (
                <div
                  key={item.id}
                  className={`gear-item-card ${isChecked ? 'gear-checked' : ''}`}
                  onClick={() => toggleGear(item.id)}
                >
                  <span className="gear-checkbox">{isChecked ? '☑️' : '⬜'}</span>
                  <span className="gear-icon">{item.icon}</span>
                  <span className="gear-label">{item.label}</span>
                  {item.essential && <span className="gear-essential-tag">Imprescindible</span>}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};

export default WeatherPanel;
