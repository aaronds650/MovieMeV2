import React from 'react';
import { useNavigate } from 'react-router-dom';
// Removed Supabase import
import { LogOut } from 'lucide-react';

export function Dashboard() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    // Mock sign out - redirect to login
    window.location.href = '/login';
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <header className="py-6 px-4 border-b bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">MovieMe</h1>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Welcome to MovieMe!</h2>
          <p className="text-gray-600">
            Your personalized movie recommendations are coming soon. Stay tuned!
          </p>
        </div>
      </main>
    </div>
  );
}