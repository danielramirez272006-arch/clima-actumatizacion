// src/features/weather-evaluation/use-weather.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchWeatherData, searchGlobalLocations, LOCATIONS, ALL_ACTIVITIES } from '../../shared/services/api-client';

export const getCardinalDirection = (deg) => {
  if (deg === undefined || deg === null) return { code: 'N', label: 'Norte', angle: 0 };
  const val = Math.floor((deg / 45) + 0.5) % 8;
  const directions = [
    { code: 'N', label: 'Norte' },
    { code: 'NE', label: 'Noreste' },
    { code: 'E', label: 'Este' },
    { code: 'SE', label: 'Sureste' },
    { code: 'S', label: 'Sur' },
    { code: 'SO', label: 'Suroeste' },
    { code: 'O', label: 'Oeste' },
    { code: 'NO', label: 'Noroeste' }
  ];
  return { ...directions[val], angle: deg };
};

export const evaluateActivitiesForWeather = (weather) => {
  const temp = Number(weather.temperature_2m) || 20;
  const precip = Number(weather.precipitation) || 0;
  const wind = Number(weather.wind_speed_10m) || 0;

  const allowed = [];
  const caution = [];
  const forbidden = [];

  ALL_ACTIVITIES.forEach((act) => {
    const { maxRain, maxWind, minTemp, maxTemp } = act.rules;
    const reasons = [];

    let isForbidden = false;
    let isCaution = false;

    if (precip > maxRain * 2) {
      isForbidden = true;
      reasons.push(`Lluvia excesiva (${precip} mm > ${maxRain} mm)`);
    } else if (precip > maxRain) {
      isCaution = true;
      reasons.push(`Llovizna (${precip} mm)`);
    }

    if (wind > maxWind * 1.3) {
      isForbidden = true;
      reasons.push(`Viento peligroso (${wind} km/h > ${maxWind} km/h)`);
    } else if (wind > maxWind) {
      isCaution = true;
      reasons.push(`Viento moderado (${wind} km/h)`);
    }

    if (temp < minTemp - 2 || temp > maxTemp + 3) {
      isForbidden = true;
      reasons.push(`Temp. extrema (${temp}°C)`);
    } else if (temp < minTemp || temp > maxTemp) {
      isCaution = true;
      reasons.push(`Temp. límite (${temp}°C)`);
    }

    const item = {
      ...act,
      reason: reasons.join(', ') || 'Condiciones climáticas favorables'
    };

    if (isForbidden) {
      forbidden.push(item);
    } else if (isCaution) {
      caution.push(item);
    } else {
      allowed.push(item);
    }
  });

  return { allowed, caution, forbidden };
};

export const getSmartGearChecklist = (weather) => {
  const temp = Number(weather.temperature_2m) || 20;
  const precip = Number(weather.precipitation) || 0;
  const wind = Number(weather.wind_speed_10m) || 0;

  const items = [];

  items.push({ id: 'water', label: 'Botella de Agua / Hidratación (1.5L - 2L)', essential: true, icon: '💧' });
  items.push({ id: 'first_aid', label: 'Botiquín de Primeros Auxilios Básico', essential: true, icon: '🩹' });

  if (precip > 0.1) {
    items.push({ id: 'raincoat', label: 'Capa / Poncho Impermeable Transpirable', essential: true, icon: '🧥' });
    items.push({ id: 'drybag', label: 'Funda Estanca para Móvil y Documentos', essential: true, icon: '📱' });
    items.push({ id: 'boots', label: 'Calzado con Suela de Alto Agarre (Barro)', essential: true, icon: '🥾' });
  }

  if (temp >= 23 && precip === 0) {
    items.push({ id: 'sunscreen', label: 'Protector Solar FPS 50+ y Bálsamo Labial', essential: true, icon: '🧴' });
    items.push({ id: 'hat', label: 'Gorra / Sombrero de Ala Ancha', essential: false, icon: '🧢' });
    items.push({ id: 'glasses', label: 'Gafas de Sol con Filtro UV400', essential: false, icon: '🕶️' });
  }

  if (temp <= 16 || wind >= 18) {
    items.push({ id: 'windbreaker', label: 'Chaqueta Cortavientos Técnica', essential: true, icon: '🌬️' });
  }
  if (temp <= 12) {
    items.push({ id: 'thermal', label: 'Camiseta Térmica y Guantes Ligeros', essential: true, icon: '🧤' });
  }

  return items;
};

export const useWeather = () => {
  const [selectedLocation, setSelectedLocation] = useState(LOCATIONS[0]);
  const [selectedDay, setSelectedDay] = useState(0); // 0 = Hoy, 1 = Mañana
  const [selectedHourIndex, setSelectedHourIndex] = useState(new Date().getHours());
  const [rawData, setRawData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Favoritos guardados en localStorage
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('climita_favorites');
      return saved ? JSON.parse(saved) : ['sanjose', 'manuel_antonio'];
    } catch {
      return ['sanjose', 'manuel_antonio'];
    }
  });

  const toggleFavorite = (locId) => {
    setFavorites((prev) => {
      const updated = prev.includes(locId) ? prev.filter((id) => id !== locId) : [...prev, locId];
      try {
        localStorage.setItem('climita_favorites', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Búsqueda de ubicaciones
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchWeatherData(selectedLocation.lat, selectedLocation.lon, selectedLocation.name);
      setRawData(data);
    } catch (err) {
      setError(err.message || 'Error al conectar con la estación meteorológica');
    } finally {
      setLoading(false);
    }
  }, [selectedLocation]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const results = await searchGlobalLocations(query);
      setSearchResults(results);
    } finally {
      setSearching(false);
    }
  };

  const selectCustomLocation = (loc) => {
    setSelectedLocation(loc);
    setSearchQuery('');
    setSearchResults([]);
  };

  // 24 horas del día seleccionado con barras de temperatura y lluvia relativas
  const hourlyList = useMemo(() => {
    if (!rawData?.hourly?.time) return [];
    const offset = selectedDay * 24;
    const slice = rawData.hourly.time.slice(offset, offset + 24);

    const temps = rawData.hourly.temperature_2m.slice(offset, offset + 24);
    const minTemp = Math.min(...temps);
    const maxTemp = Math.max(...temps);

    return slice.map((isoTime, relIdx) => {
      const globalIdx = offset + relIdx;
      const date = new Date(isoTime);
      const hourStr = date.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit', hour12: false });
      const tempVal = Math.round(rawData.hourly.temperature_2m[globalIdx]);
      const precipVal = rawData.hourly.precipitation[globalIdx] ?? 0;
      const windDirVal = rawData.hourly.wind_direction_10m?.[globalIdx] ?? 0;
      const isDayVal = rawData.hourly.is_day?.[globalIdx] ?? (relIdx >= 6 && relIdx < 18 ? 1 : 0);

      // Calcular altura relativa de barra de temperatura (20% a 100%)
      const tempPercent = maxTemp === minTemp ? 50 : Math.round(((tempVal - minTemp) / (maxTemp - minTemp)) * 80 + 20);

      return {
        index: relIdx,
        globalIndex: globalIdx,
        time: hourStr,
        hourNumber: date.getHours(),
        temp: tempVal,
        tempPercent,
        precip: precipVal,
        rainProb: rawData.hourly.precipitation_probability[globalIdx] ?? 0,
        wind: Math.round(rawData.hourly.wind_speed_10m[globalIdx] ?? 0),
        windDirection: getCardinalDirection(windDirVal),
        humidity: rawData.hourly.relative_humidity_2m[globalIdx] ?? 60,
        isDay: Boolean(isDayVal)
      };
    });
  }, [rawData, selectedDay]);

  // Clima de la hora seleccionada
  const activeWeather = useMemo(() => {
    if (!rawData) return null;

    if (hourlyList.length > 0 && hourlyList[selectedHourIndex]) {
      const h = hourlyList[selectedHourIndex];
      return {
        temperature_2m: h.temp,
        apparent_temperature: h.temp,
        precipitation: h.precip,
        wind_speed_10m: h.wind,
        windDirection: h.windDirection,
        relative_humidity_2m: h.humidity,
        rainProb: h.rainProb,
        hourTime: h.time,
        isDay: h.isDay
      };
    }

    const currIsDay = rawData.current?.is_day !== undefined ? Boolean(rawData.current.is_day) : true;
    const currWindDir = getCardinalDirection(rawData.current?.wind_direction_10m);

    return {
      temperature_2m: Math.round(rawData.current?.temperature_2m ?? 22),
      apparent_temperature: Math.round(rawData.current?.apparent_temperature ?? 22),
      precipitation: rawData.current?.precipitation ?? 0,
      wind_speed_10m: Math.round(rawData.current?.wind_speed_10m ?? 8),
      windDirection: currWindDir,
      relative_humidity_2m: rawData.current?.relative_humidity_2m ?? 70,
      hourTime: 'Ahora',
      isDay: currIsDay
    };
  }, [rawData, hourlyList, selectedHourIndex]);

  // Mejor Ventana del Día
  const bestWindow = useMemo(() => {
    if (hourlyList.length < 4) return null;
    const dayHours = hourlyList.slice(6, 19);
    if (dayHours.length === 0) return null;

    let bestBlock = null;
    let minScore = Infinity;

    for (let i = 0; i <= dayHours.length - 3; i++) {
      const trio = dayHours.slice(i, i + 3);
      const totalRain = trio.reduce((acc, h) => acc + h.precip, 0);
      const avgWind = trio.reduce((acc, h) => acc + h.wind, 0) / 3;
      const avgTemp = trio.reduce((acc, h) => acc + h.temp, 0) / 3;

      const score = totalRain * 10 + avgWind + Math.abs(22 - avgTemp);
      if (score < minScore) {
        minScore = score;
        bestBlock = {
          startHour: trio[0].time,
          endHour: trio[2].time,
          avgTemp: Math.round(avgTemp),
          totalRain: Math.round(totalRain * 10) / 10,
          avgWind: Math.round(avgWind)
        };
      }
    }

    return bestBlock;
  }, [hourlyList]);

  // Actividades viables
  const activityEvaluation = useMemo(() => {
    if (!activeWeather) return { allowed: [], caution: [], forbidden: [] };
    return evaluateActivitiesForWeather(activeWeather);
  }, [activeWeather]);

  // Checklist de equipamiento
  const gearChecklist = useMemo(() => {
    if (!activeWeather) return [];
    return getSmartGearChecklist(activeWeather);
  }, [activeWeather]);

  return {
    rawData,
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
    refetch: loadData,
    locations: LOCATIONS
  };
};

export default useWeather;
