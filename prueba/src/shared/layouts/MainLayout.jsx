import React from 'react';

export const MainLayout = ({ children, activeActivity, onSelectActivity }) => {
  const activities = [
    { id: 'trekking', label: 'Senderismo / Trekking', icon: '🥾' },
    { id: 'kayak', label: 'Kayak / Deportes Acuáticos', icon: '🚣' },
    { id: 'camping', label: 'Campamento Nocturno', icon: '⛺' },
    { id: 'cycling', label: 'Ciclismo de Montaña', icon: '🚵' }
  ];

  return (
    <div className="layout-root">
      {/* Header */}
      <header className="app-header">
        <div className="header-container">
          <div className="brand-group">
            <div className="brand-logo">🌲</div>
            <div>
              <h1 className="brand-title">Barry Outdoors</h1>
              <span className="brand-tagline">Sistema de Evaluación de Riesgo y Viabilidad Climática</span>
            </div>
          </div>
          
          <div className="header-badge-role">
            <span className="role-dot"></span>
            <span>Organizador / Administrador</span>
          </div>
        </div>
      </header>

      {/* Activity Filter Bar */}
      <div className="activity-nav-bar">
        <div className="activity-nav-container">
          <span className="activity-nav-label">Tipo de Actividad:</span>
          <div className="activity-chips">
            {activities.map((act) => (
              <button
                key={act.id}
                type="button"
                className={`activity-chip ${activeActivity === act.id ? 'active' : ''}`}
                onClick={() => onSelectActivity(act.id)}
              >
                <span className="chip-icon">{act.icon}</span>
                <span className="chip-text">{act.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="main-content-container">
        {children}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-container">
          <p>© {new Date().getFullYear()} Barry Outdoors • Motor de Decisión Meteorológica con Open-Meteo API</p>
          <p className="footer-sub">Evaluación en tiempo real para la seguridad de expediciones al aire libre</p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
