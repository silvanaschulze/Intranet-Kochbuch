/**
 * @fileoverview Themed Toast Container Component
 * @component ThemedToast
 */

import React from 'react';
import { ToastContainer } from 'react-toastify';
import { useTheme } from '../../context/ThemeContext';

/**
 * ThemedToast Component
 * Renders a ToastContainer that adapts to the current theme
 * @returns {JSX.Element} ThemedToast component
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