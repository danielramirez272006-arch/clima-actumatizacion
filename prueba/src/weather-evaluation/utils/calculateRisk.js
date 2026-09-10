/**
 * Interprets WMO Weather interpretation codes (Open-Meteo)
 */
export const getWeatherCodeInfo = (code) => {
  const codes = {
    0: { label: 'Cielo despejado', icon: '☀️', severity: 'none' },
    1: { label: 'Principalmente despejado', icon: '🌤️', severity: 'none' },
    2: { label: 'Parcialmente nublado', icon: '⛅', severity: 'none' },
    3: { label: 'Nublado', icon: '☁️', severity: 'low' },
    45: { label: 'Niebla', icon: '🌫️', severity: 'medium' },
    48: { label: 'Niebla con escarcha', icon: '🌫️', severity: 'medium' },
    51: { label: 'Llovizna ligera', icon: '🌦️', severity: 'medium' },
    53: { label: 'Llovizna moderada', icon: '🌦️', severity: 'medium' },
    55: { label: 'Llovizna densa', icon: '🌧️', severity: 'high' },
    61: { label: 'Lluvia leve', icon: '🌧️', severity: 'medium' },
    63: { label: 'Lluvia moderada', icon: '🌧️', severity: 'high' },
    65: { label: 'Lluvia fuerte', icon: '🌧️', severity: 'critical' },
    71: { label: 'Nevada ligera', icon: '🌨️', severity: 'high' },
    73: { label: 'Nevada moderada', icon: '🌨️', severity: 'critical' },
    75: { label: 'Nevada intensa', icon: '❄️', severity: 'critical' },
    80: { label: 'Chubascos leves', icon: '🌦️', severity: 'medium' },
    81: { label: 'Chubascos moderados', icon: '🌧️', severity: 'high' },
    82: { label: 'Chubascos violentos', icon: '⛈️', severity: 'critical' },
    95: { label: 'Tormenta eléctrica', icon: '⛈️', severity: 'critical' },
    96: { label: 'Tormenta con granizo ligero', icon: '⛈️', severity: 'critical' },
    99: { label: 'Tormenta con granizo fuerte', icon: '⛈️', severity: 'critical' }
  };
  return codes[code] || { label: 'Condiciones variables', icon: '🌤️', severity: 'low' };
};

/**
 * Calculates risk level and final outdoor recommendation
 * @param {Object} current - Current weather data
 * @param {Object} daily - Daily forecast data (first day or selected day)
 * @param {string} activity - 'trekking' | 'kayak' | 'camping' | 'cycling'
 */
export const calculateRisk = ({ current, daily, activity = 'trekking' }) => {
  if (!current) return null;

  const temp = current.temperature_2m ?? 20;
  const apparentTemp = current.apparent_temperature ?? temp;
  const precip = current.precipitation ?? 0;
  const windSpeed = current.wind_speed_10m ?? 0;
  const windGusts = current.wind_gusts_10m ?? windSpeed;
  const weatherCode = current.weather_code ?? 0;
  const precipProb = daily?.precipitation_probability_max?.[0] ?? (precip > 0 ? 80 : 10);
  const maxWindDaily = daily?.wind_speed_10m_max?.[0] ?? windSpeed;
  const uvMax = daily?.uv_index_max?.[0] ?? 5;

  let riskScore = 0;
  const reasons = [];
  const tips = [];

  // 1. ANÁLISIS DE PRECIPITACIÓN Y TORMENTAS
  if ([95, 96, 99].includes(weatherCode)) {
    riskScore += 55;
    reasons.push('Alerta de tormenta eléctrica activa o inminente en la zona.');
  } else if ([65, 75, 82].includes(weatherCode) || precip >= 8) {
    riskScore += 45;
    reasons.push(`Precipitación intensa registrada (${precip} mm/h).`);
  } else if ([63, 73, 81].includes(weatherCode) || precip >= 3) {
    riskScore += 30;
    reasons.push(`Lluvia moderada continua (${precip} mm/h).`);
  } else if (precipProb >= 70) {
    riskScore += 20;
    reasons.push(`Alta probabilidad de lluvia durante la jornada (${precipProb}%).`);
  } else if (precipProb >= 40) {
    riskScore += 10;
    reasons.push(`Probabilidad moderada de precipitaciones (${precipProb}%).`);
  }

  // 2. ANÁLISIS DE VIENTO
  if (windGusts >= 65 || windSpeed >= 45) {
    riskScore += 45;
    reasons.push(`Ráfagas de viento peligrosas detectadas (${Math.round(windGusts)} km/h).`);
  } else if (windGusts >= 45 || windSpeed >= 30) {
    riskScore += 25;
    reasons.push(`Vientos fuertes sostenidos (${Math.round(windSpeed)} km/h) con rachas de ${Math.round(windGusts)} km/h.`);
  } else if (windSpeed >= 22) {
    riskScore += 12;
    reasons.push(`Viento moderado apreciable (${Math.round(windSpeed)} km/h).`);
  }

  // 3. ANÁLISIS DE TEMPERATURA
  if (temp <= -5 || apparentTemp <= -8) {
    riskScore += 40;
    reasons.push(`Frío extremo bajo cero (${temp}°C, sensación ${apparentTemp}°C) con riesgo de congelación.`);
  } else if (temp <= 4) {
    riskScore += 20;
    reasons.push(`Bajas temperaturas (${temp}°C) requieren vestimenta térmica técnica.`);
  } else if (temp >= 35 || apparentTemp >= 38) {
    riskScore += 40;
    reasons.push(`Calor extremo (${temp}°C, sensación ${apparentTemp}°C) con alto riesgo de golpe de calor.`);
  } else if (temp >= 30) {
    riskScore += 18;
    reasons.push(`Temperaturas elevadas (${temp}°C). Se requiere hidratación continua.`);
  }

  // 4. FACTORES ESPECÍFICOS POR ACTIVIDAD
  if (activity === 'kayak') {
    if (windSpeed >= 18 || windGusts >= 30) {
      riskScore += 25;
      reasons.push('Actividad Acuática: El oleaje y la deriva por viento incrementan drásticamente el riesgo de vuelco.');
    }
    if ([95, 96, 99].includes(weatherCode)) {
      riskScore += 30;
      reasons.push('Actividad Acuática: Riesgo crítico de impacto por rayos en masas de agua abiertas.');
    }
  } else if (activity === 'camping') {
    if (temp <= 5) {
      riskScore += 20;
      reasons.push('Campamento: Temperatura nocturna muy baja. Se requiere saco de dormir de alto aislamiento.');
    }
    if (precip >= 3 || precipProb >= 60) {
      riskScore += 15;
      reasons.push('Campamento: Terreno saturado puede anegar zonas de carpas.');
    }
  } else if (activity === 'cycling') {
    if (precip > 1 || [61, 63, 65].includes(weatherCode)) {
      riskScore += 20;
      reasons.push('Ciclismo: Terrenos resbaladizos, pérdida de tracción y acumulación de lodo en senderos.');
    }
  } else if (activity === 'trekking') {
    if (uvMax >= 9) {
      riskScore += 10;
      reasons.push(`Índice UV extremo (${uvMax}). Alto riesgo de radiación solar en senderos despejados.`);
    }
  }

  // Clamp risk score to 0 - 100
  riskScore = Math.min(100, Math.max(0, riskScore));

  // Determine Category and Recommendation
  let recommendation = 'Realizar';
  let badgeVariant = 'success';
  let riskLevel = 'Bajo';
  let summary = 'Condiciones meteorológicas óptimas para el desarrollo seguro de la actividad.';

  if (riskScore >= 65) {
    recommendation = 'Reprogramar';
    badgeVariant = 'danger';
    riskLevel = riskScore >= 85 ? 'Crítico' : 'Alto';
    summary = 'Las condiciones meteorológicas actuales o proyectadas representan un riesgo inaceptable para los participantes. Se recomienda aplazar la actividad.';
    tips.push('Notificar a los participantes sobre el aplazamiento con antelación.');
    tips.push('Evaluar fechas alternas revisando el pronóstico extendido a 5 días.');
    tips.push('Evitar permanecer en terrenos expuestos, cumbres o zonas fluviales.');
  } else if (riskScore >= 30) {
    recommendation = 'Precaución';
    badgeVariant = 'warning';
    riskLevel = 'Moderado';
    summary = 'La actividad puede realizarse únicamente si se implementan medidas preventivas y equipamiento adecuado.';
    tips.push('Verificar equipo impermeable, cortavientos y botiquín de emergencia.');
    tips.push('Definir rutas de escape o puntos de repliegue rápido durante el trayecto.');
    tips.push('Monitorear la evolución climática cada 2 horas antes de iniciar la marcha.');
  } else {
    recommendation = 'Realizar';
    badgeVariant = 'success';
    riskLevel = 'Bajo';
    summary = 'Condiciones meteorológicas favorables y seguras para los participantes.';
    tips.push('Mantener el plan de ruta habitual y protocolo de registro.');
    tips.push('Asegurar abastecimiento de agua y protector solar.');
  }

  return {
    score: riskScore,
    level: riskLevel,
    recommendation,
    badgeVariant,
    summary,
    reasons: reasons.length > 0 ? reasons : ['No se detectaron anomalías climáticas significativas.'],
    tips,
    weatherInfo: getWeatherCodeInfo(weatherCode),
    metrics: {
      temperature: temp,
      apparentTemperature: apparentTemp,
      precipitation: precip,
      precipitationProbability: precipProb,
      windSpeed: windSpeed,
      windGusts: windGusts,
      uvIndex: uvMax
    }
  };
};
