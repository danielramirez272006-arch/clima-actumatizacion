import React from 'react';

const BADGE_VARIANTS = {
  success: {
    label: 'Realizar',
    icon: '✓',
    className: 'badge-success'
  },
  warning: {
    label: 'Precaución',
    icon: '⚠',
    className: 'badge-warning'
  },
  danger: {
    label: 'Reprogramar',
    icon: '✕',
    className: 'badge-danger'
  },
  info: {
    label: 'Informativo',
    icon: 'ℹ',
    className: 'badge-info'
  },
  neutral: {
    label: 'Pendiente',
    icon: '•',
    className: 'badge-neutral'
  }
};

export const StatusBadge = ({ variant = 'neutral', customLabel, size = 'md', icon }) => {
  const config = BADGE_VARIANTS[variant] || BADGE_VARIANTS.neutral;
  const displayText = customLabel || config.label;
  const displayIcon = icon !== undefined ? icon : config.icon;

  return (
    <span className={`status-badge ${config.className} badge-${size}`}>
      {displayIcon && <span className="badge-icon">{displayIcon}</span>}
      <span className="badge-text">{displayText}</span>
    </span>
  );
};

export default StatusBadge;
