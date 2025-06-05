/**
 * @fileoverview Hauptkomponente der Anwendung mit Routing-Konfiguration
 * @component App
 */

import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import './styles/theme.css';

// Providers
import { AuthProvider } from './context/AuthContext';
import { LoadingProvider } from './context/LoadingContext';

// Layout
import Layout from './components/Layout/Layout';
import LoadingSpinner from './components/UI/LoadingSpinner';
import PrivateRoute from './components/Auth/PrivateRoute';

// Lazy-loaded components
const HomePage = React.lazy(() => import('./pages/Home'));
const About = React.lazy(() => import('./pages/About'));
const Login = React.lazy(() => import('./components/Auth/Login'));
const Register = React.lazy(() => import('./components/Auth/Register'));
const ForgotPassword = React.lazy(() => import('./components/Auth/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./components/Auth/ResetPassword'));
const RecipeListPage = React.lazy(() => import('./pages/RecipeListPage'));
const RecipeDetail = React.lazy(() => import('./pages/RecipeDetail'));
const CreateRecipe = React.lazy(() => import('./pages/CreateRecipe'));
const EditRecipe = React.lazy(() => import('./pages/EditRecipe'));
const Profile = React.lazy(() => import('./components/Auth/Profile'));
const MyRecipes = React.lazy(() => import('./pages/MyRecipes'));
const FavoriteRecipes = React.lazy(() => import('./pages/FavoriteRecipes'));
const CategoryRecipes = React.lazy(() => import('./pages/CategoryRecipes'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

/**
 * Hauptkomponente der Anwendung
 * Konfiguriert das Routing und die Provider für Authentifizierung und Loading-Status
 * @returns {JSX.Element} Die gerenderte App Komponente
 */
function App() {
  return (
    <Router>
      <AuthProvider>
        <LoadingProvider>
          <Layout>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* Öffentliche Routen */}
                <Route path="/" element={<HomePage />} />
                <Route path="/uber" element={<About />} />
                <Route path="/rezepte" element={<RecipeListPage />} />
                <Route path="/rezepte/:id" element={<RecipeDetail />} />
                <Route path="/kategorie/:id" element={<CategoryRecipes />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/passwort-vergessen" element={<ForgotPassword />} />
                <Route path="/passwort-zuruecksetzen/:token" element={<ResetPassword />} />

                {/* Geschützte Routen */}
                <Route element={<PrivateRoute />}>
                  <Route path="/rezept-erstellen" element={<CreateRecipe />} />
                  <Route path="/rezepte/:id/bearbeiten" element={<EditRecipe />} />
                  <Route path="/profil" element={<Profile />} />
                  <Route path="/meine-rezepte" element={<MyRecipes />} />
                  <Route path="/favoriten" element={<FavoriteRecipes />} />
                </Route>

                {/* Fehlerseiten */}
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </Suspense>
          </Layout>

          {/* Toast-Benachrichtigungen */}
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
            theme="light"
          />
        </LoadingProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
