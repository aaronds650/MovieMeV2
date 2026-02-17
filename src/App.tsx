import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthProvider';
import { AuthPage } from './components/auth/AuthPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import { HomePage } from './components/pages/HomePage';
import { ConversationFlow } from './components/conversation/ConversationFlow';
import { WatchlistPage } from './components/pages/WatchlistPage';
import { WatchedMoviesPage } from './components/pages/WatchedMoviesPage';
import { PrivacyPolicy } from './components/pages/PrivacyPolicy';
import { TermsOfService } from './components/pages/TermsOfService';
import { usePageViewTracker } from './hooks/usePageViewTracker';

// Validate required environment variables
const requiredEnvVars = [
  'VITE_TMDB_API_KEY'
];

const missingEnvVars = requiredEnvVars.filter(key => !import.meta.env[key]);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  return user ? <>{children}</> : <AuthPage />;
}

function AppRoutes() {
  usePageViewTracker();

  return (
    <Routes>
      <Route path="/" element={
        <ProtectedRoute>
          <HomePage />
        </ProtectedRoute>
      } />
      <Route path="/conversation" element={
        <ProtectedRoute>
          <ConversationFlow />
        </ProtectedRoute>
      } />
      <Route path="/watchlist" element={
        <ProtectedRoute>
          <WatchlistPage />
        </ProtectedRoute>
      } />
      <Route path="/watched" element={
        <ProtectedRoute>
          <WatchedMoviesPage />
        </ProtectedRoute>
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