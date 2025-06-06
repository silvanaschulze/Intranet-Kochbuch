/**
 * @fileoverview Layout-Komponente für die Anwendung
 * @component Layout
 */

import React from 'react';
import { toast } from 'react-toastify';
import Header from './Header';
import Footer from './Footer';
import { ToastContainer } from 'react-toastify';

export const addNotification = (message, type = 'info') => {
  toast[type](message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

/**
 * Layout-Komponente
 * Stellt das grundlegende Layout der Anwendung bereit
 * @param {Object} props - Komponenten-Eigenschaften
 * @param {React.ReactNode} props.children - Untergeordnete Komponenten
 * @returns {JSX.Element} Layout-Komponente
 */
const Layout = ({ children }) => {
  return (
    <div className="app-container">
      <Header />
      <main className="main-content" style={{ paddingTop: '80px', minHeight: '100vh' }}>
        {children}
      </main>
      <Footer />
      <ToastContainer />
    </div>
  );
};

export default Layout;
