import React from 'react';
import { MainLayout } from '../shared/layouts/MainLayout';
import { Loader } from '../shared/components/Loader';
import { WeatherPanel, Recommendation, useWeatherEvaluation } from '../weather-evaluation';

export const Dashboard = () => {
  const {
    selectedLocation,
    setSelectedLocation,
    activeActivity,
    setActiveActivity,
    weatherData,
    evaluation,
    loading,
    error,
    searchQuery,
    searchResults,
    searching,
    handleSearch,
    refreshData,
    presetLocations
  } = useWeatherEvaluation();

  return (
    <MainLayout activeActivity={activeActivity} onSelectActivity={setActiveActivity}>
      <div className="dashboard-content">
        {error && (
          <div className="error-alert">
            <span>⚠️ {error}</span>
            <button type="button" onClick={refreshData} className="error-retry-btn">
              Reintentar
            </button>
          </div>
        )}

        {loading && !weatherData ? (
          <Loader message="Consultando API de Open-Meteo y analizando variables..." />
        ) : (
          <>
            {/* Top Critical Decision & Recommendation */}
            <Recommendation evaluation={evaluation} />

            {/* Weather Analytics and Forecast Panel */}
            <WeatherPanel
              weatherData={weatherData}
              evaluation={evaluation}
              selectedLocation={selectedLocation}
              setSelectedLocation={setSelectedLocation}
              presetLocations={presetLocations}
              searchQuery={searchQuery}
              searchResults={searchResults}
              searching={searching}
              handleSearch={handleSearch}
              onRefresh={refreshData}
            />
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default Dashboard;
