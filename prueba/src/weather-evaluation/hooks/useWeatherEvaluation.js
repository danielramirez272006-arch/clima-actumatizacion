import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../shared/services/apiClient';
import { calculateRisk } from '../utils/calculateRisk';

export const PRESET_LOCATIONS = [
  { id: 'patagonia', name: 'Parque Nal. Patagonia', country: 'Chile/Arg', lat: -46.7, lon: -72.0 },
  { id: 'bariloche', name: 'Bariloche (Cerro Catedral)', country: 'Argentina', lat: -41.13, lon: -71.30 },
  { id: 'toluca', name: 'Nevado de Toluca', country: 'México', lat: 19.10, lon: -99.75 },
  { id: 'sierra_nevada', name: 'Sierra Nevada', country: 'España', lat: 37.05, lon: -3.31 },
  { id: 'yosemite', name: 'Yosemite Valley', country: 'Estados Unidos', lat: 37.74, lon: -119.58 }
];

export const useWeatherEvaluation = (initialLocation = PRESET_LOCATIONS[0], initialActivity = 'trekking') => {
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [activeActivity, setActiveActivity] = useState(initialActivity);
  const [weatherData, setWeatherData] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const fetchWeather = useCallback(async (location) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getForecast({
        latitude: location.lat,
        longitude: location.lon
      });
      setWeatherData(data);
    } catch (err) {
      setError(err.message || 'Error al obtener datos meteorológicos');
    } finally {
      setLoading(false);
    }
  }, []);

  // Update evaluation whenever weatherData or activeActivity changes
  useEffect(() => {
    if (weatherData && weatherData.current) {
      const result = calculateRisk({
        current: weatherData.current,
        daily: weatherData.daily,
        activity: activeActivity
      });
      setEvaluation(result);
    }
  }, [weatherData, activeActivity]);

  // Initial and on location change fetch
  useEffect(() => {
    if (selectedLocation) {
      fetchWeather(selectedLocation);
    }
  }, [selectedLocation, fetchWeather]);

  // Search location handler
  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const results = await apiClient.searchLocation(query);
      setSearchResults(
        results.map((item) => ({
          id: `${item.id}-${item.latitude}`,
          name: item.name,
          country: `${item.admin1 ? item.admin1 + ', ' : ''}${item.country || ''}`,
          lat: item.latitude,
          lon: item.longitude
        }))
      );
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectLocation = (loc) => {
    setSelectedLocation(loc);
    setSearchQuery('');
    setSearchResults([]);
  };

  const refreshData = () => {
    if (selectedLocation) {
      fetchWeather(selectedLocation);
    }
  };

  return {
    selectedLocation,
    setSelectedLocation: handleSelectLocation,
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
    presetLocations: PRESET_LOCATIONS
  };
};

export default useWeatherEvaluation;
