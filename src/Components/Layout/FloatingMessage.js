import React, { useState, useEffect } from 'react';
import '../../style/floatingmessage.css';

const FloatingMessage = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [message, onClose]);

  return (
    <div className={`floating-message ${type}`}>
      {message}
    </div>
  );
};

export default FloatingMessage;
