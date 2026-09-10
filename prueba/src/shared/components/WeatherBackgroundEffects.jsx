// src/shared/components/WeatherBackgroundEffects.jsx
import React, { useMemo } from 'react';

export const WeatherBackgroundEffects = ({ weatherType = 'sun', intensity = 'medium' }) => {
  // Generate random rain particles
  const raindrops = useMemo(() => {
    return Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      left: `${(i * 2.3) % 100}%`,
      delay: `${(i * 0.08) % 1.6}s`,
      duration: `${0.6 + (i % 5) * 0.12}s`,
      opacity: 0.3 + (i % 4) * 0.18
    }));
  }, []);

  // Generate solar flare particles
  const sunMotes = useMemo(() => {
    return Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      left: `${5 + (i * 5.2) % 90}%`,
      top: `${10 + (i * 4.7) % 80}%`,
      size: `${4 + (i % 5) * 3}px`,
      delay: `${(i * 0.3) % 3}s`,
      duration: `${3 + (i % 3) * 1.5}s`
    }));
  }, []);

  const isRaining = weatherType === 'rain' || weatherType === 'storm';
  const isSunny = weatherType === 'sun';
  const isStorm = weatherType === 'storm';

  return (
    <div className={`weather-ambient-container weather-theme-${weatherType}`}>
      {/* Sun Rays and Corona Glow */}
      {isSunny && (
        <div className="sun-effect-wrapper">
          <div className="sun-glow-core"></div>
          <div className="sun-rays-spin"></div>
          <div className="sun-rays-pulse"></div>

          {/* Floating Warm Golden Motes */}
          <div className="sun-motes-layer">
            {sunMotes.map((mote) => (
              <span
                key={mote.id}
                className="sun-mote"
                style={{
                  left: mote.left,
                  top: mote.top,
                  width: mote.size,
                  height: mote.size,
                  animationDelay: mote.delay,
                  animationDuration: mote.duration
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Rain Drops Layer */}
      {isRaining && (
        <div className="rain-effect-wrapper">
          {isStorm && <div className="lightning-flash-layer"></div>}
          <div className="rain-layer">
            {raindrops.map((drop) => (
              <span
                key={drop.id}
                className="rain-drop"
                style={{
                  left: drop.left,
                  animationDelay: drop.delay,
                  animationDuration: drop.duration,
                  opacity: drop.opacity
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Floating Cloud Silhouettes */}
      <div className="ambient-clouds-layer">
        <div className="ambient-cloud cloud-1"></div>
        <div className="ambient-cloud cloud-2"></div>
      </div>
    </div>
  );
};

export default WeatherBackgroundEffects;
