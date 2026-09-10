import React from 'react';
import { StatusBadge } from '../../shared/components/StatusBadge';

export const Recommendation = ({ evaluation }) => {
  if (!evaluation) return null;

  const { score, level, recommendation, badgeVariant, summary, reasons, tips } = evaluation;

  // Determine bar colors based on score
  const getScoreColor = () => {
    if (score >= 65) return 'var(--color-danger)';
    if (score >= 30) return 'var(--color-warning)';
    return 'var(--color-success)';
  };

  return (
    <section className={`recommendation-panel card-risk-${badgeVariant}`}>
      <div className="recommendation-header">
        <div className="recommendation-title-group">
          <span className="recommendation-kicker">DICTAMEN TÉCNICO DE SEGURIDAD</span>
          <h2 className="recommendation-decision">
            Decisión: <StatusBadge variant={badgeVariant} customLabel={recommendation} size="lg" />
          </h2>
        </div>

        <div className="risk-score-display">
          <div className="score-number-group">
            <span className="score-value" style={{ color: getScoreColor() }}>{score}</span>
            <span className="score-max">/100</span>
          </div>
          <span className="score-label">Índice de Riesgo: <strong>{level}</strong></span>
        </div>
      </div>

      {/* Visual Risk Progress Bar */}
      <div className="risk-progress-bar-container">
        <div 
          className="risk-progress-bar-fill" 
          style={{ width: `${Math.max(8, score)}%`, backgroundColor: getScoreColor() }}
        ></div>
      </div>

      {/* Executive Summary */}
      <p className="recommendation-summary">{summary}</p>

      {/* Grid of Reasons and Protocol */}
      <div className="recommendation-details-grid">
        <div className="detail-box">
          <h3 className="detail-box-title">
            <span className="detail-box-icon">⚠️</span> Factores y Variables Críticas
          </h3>
          <ul className="reasons-list">
            {reasons.map((reason, idx) => (
              <li key={idx} className="reason-item">
                <span className="reason-bullet">•</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="detail-box">
          <h3 className="detail-box-title">
            <span className="detail-box-icon">📋</span> Protocolo para el Organizador
          </h3>
          <ul className="tips-list">
            {tips.map((tip, idx) => (
              <li key={idx} className="tip-item">
                <span className="tip-check">✓</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Recommendation;
