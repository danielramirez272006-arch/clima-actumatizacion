import React from 'react';

export const WeatherCard = ({ title, value, unit, subtitle, icon, highlight = false, alert = null }) => {
  return (
    <div className={`weather-card ${highlight ? 'card-highlight' : ''} ${alert ? `card-alert-${alert}` : ''}`}>
      <div className="weather-card-header">
        <span className="weather-card-title">{title}</span>
        {icon && <span className="weather-card-icon">{icon}</span>}
      </div>
      <div className="weather-card-body">
        <div className="weather-card-value-group">
          <span className="weather-card-value">{value ?? '--'}</span>
          {unit && <span className="weather-card-unit">{unit}</span>}
        </div>
        {subtitle && <p className="weather-card-subtitle">{subtitle}</p>}
      </div>
    </div>
  );
};

export default WeatherCard;
