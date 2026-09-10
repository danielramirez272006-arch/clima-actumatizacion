// src/pages/dashboard-page.jsx
import React, { useState, useEffect } from 'react';
import { useWeather } from '../features/weather-evaluation/use-weather';
import { WeatherPanel } from '../features/weather-evaluation/components/weather-panel';

export const DashboardPage = () => {
  const {
    activeWeather,
    activityEvaluation,
    gearChecklist,
    bestWindow,
    hourlyList,
    selectedDay,
    setSelectedDay,
    selectedHourIndex,
    setSelectedHourIndex,
    selectedLocation,
    setSelectedLocation,
    favorites,
    toggleFavorite,
    searchQuery,
    searchResults,
    searching,
    handleSearch,
    selectCustomLocation,
    loading,
    error,
    refetch,
    locations
  } = useWeather();

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="climita-root">
      {/* Header */}
      <header className="climita-header">
        <div className="header-inner">
          <div className="brand-logo-area">
            <span className="brand-badge-icon">🌤️</span>
            <div>
              <h1 className="brand-title-text">climita</h1>
              <span className="brand-subtitle-text">Planificador de Actividades al Aire Libre</span>
            </div>
          </div>

          <div className="header-meta-group">
            <span className="time-pill">
              🕒 {currentTime.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="source-pill">Open-Meteo & n8n Sync</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="climita-main">
        {error ? (
          <div className="climita-error-card">
            <p>⚠️ {error}</p>
            <button onClick={refetch} className="btn-retry">Reintentar</button>
          </div>
        ) : loading && !activeWeather ? (
          <div className="climita-loading-card">
            <div className="loading-spinner"></div>
            <p>Consultando pronóstico horario y evaluando actividades...</p>
          </div>
        ) : (
          <WeatherPanel
            activeWeather={activeWeather}
            activityEvaluation={activityEvaluation}
            gearChecklist={gearChecklist}
            bestWindow={bestWindow}
            hourlyList={hourlyList}
            selectedDay={selectedDay}
            setSelectedDay={setSelectedDay}
            selectedHourIndex={selectedHourIndex}
            setSelectedHourIndex={setSelectedHourIndex}
            selectedLocation={selectedLocation}
            setSelectedLocation={setSelectedLocation}
            locations={locations}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            searchQuery={searchQuery}
            searchResults={searchResults}
            searching={searching}
            handleSearch={handleSearch}
            selectCustomLocation={selectCustomLocation}
            onRefresh={refetch}
            loading={loading}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="climita-footer">
        <span>climita • Datos meteorológicos en tiempo real y reglas de seguridad para actividades al aire libre</span>
      </footer>
    </div>
  );
};

export default DashboardPage;
