/**
 * @fileoverview Thematisierte Toast-Container-Komponente
 * @component ThemedToast
 */

import React from 'react';
import { ToastContainer } from 'react-toastify';
import { useTheme } from '../../context/ThemeContext';

/**
 * ThemedToast-Komponente
 * Bietet Toast-Nachrichten basierend auf dem aktuellen Theme
 * @returns {JSX.Element} ThemedToast-Komponente
 */
const ThemedToast = () => {
  const { theme } = useTheme();

  return (
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme={theme}
    />
  );
};

export default ThemedToast; 