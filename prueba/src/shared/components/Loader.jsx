import React from 'react';

export const Loader = ({ message = 'Analizando condiciones meteorológicas...' }) => {
  return (
    <div className="loader-container">
      <div className="loader-spinner"></div>
      <p className="loader-text">{message}</p>
    </div>
  );
};

export default Loader;
