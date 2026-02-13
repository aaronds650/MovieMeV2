import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthForm } from './components/auth/AuthForm';
import { PasswordReset } from './components/auth/PasswordReset';
import { HomePage } from './components/pages/HomePage';
import { ConversationFlow } from './components/conversation/ConversationFlow';
import { WatchlistPage } from './components/pages/WatchlistPage';
import { WatchedMoviesPage } from './components/pages/WatchedMoviesPage';
import { PrivacyPolicy } from './components/pages/PrivacyPolicy';
import { TermsOfService } from './components/pages/TermsOfService';
import { usePageViewTracker } from './hooks/usePageViewTracker';

// Validate required environment variables (Using PostgreSQL)
const requiredEnvVars = [
  'VITE_TMDB_API_KEY'
];

const missingEnvVars = requiredEnvVars.filter(key => !import.meta.env[key]);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  return session ? <>{children}</> : <Navigate to="/login" />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  return !session ? <>{children}</> : <Navigate to="/" />;
}

function AppRoutes() {
  usePageViewTracker();

  return (
    <Routes>
      <Route path="/login" element={
        <PublicRoute>
          <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex flex-col">
            <header className="py-6 px-4 border-b bg-white/50 backdrop-blur-sm">
              <div className="max-w-7xl mx-auto flex justify-between items-center">
                <h1 className="text-2xl font-bold text-indigo-600">MovieMe</h1>
              </div>
            </header>
            <main className="flex-1 flex items-center justify-center p-4">
              <AuthForm />
            </main>
          </div>
        </PublicRoute>
      } />
      <Route path="/reset-password" element={
        <PublicRoute>
          <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex flex-col">
            <header className="py-6 px-4 border-b bg-white/50 backdrop-blur-sm">
              <div className="max-w-7xl mx-auto flex justify-between items-center">
                <h1 className="text-2xl font-bold text-indigo-600">MovieMe</h1>
              </div>
            </header>
            <main className="flex-1 flex items-center justify-center p-4">
              <PasswordReset />
            </main>
          </div>
        </PublicRoute>
      } />
      <Route path="/" element={
        <PrivateRoute>
          <HomePage />
        </PrivateRoute>
      } />
      <Route path="/conversation" element={
        <PrivateRoute>
          <ConversationFlow />
        </PrivateRoute>
      } />
      <Route path="/watchlist" element={
        <PrivateRoute>
          <WatchlistPage />
        </PrivateRoute>
      } />
      <Route path="/watched" element={
        <PrivateRoute>
          <WatchedMoviesPage />
        </PrivateRoute>
      } />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;