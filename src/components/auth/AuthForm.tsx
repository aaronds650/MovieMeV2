import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function AuthForm() {
  const navigate = useNavigate();

  useEffect(() => {
    // For alpha testing, automatically redirect to main app
    // The AuthContext will handle UUID generation and initialization
    navigate('/');
  }, [navigate]);

  return (
    <div className="w-full max-w-md mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Welcome to MovieMe Alpha</h1>
        <p className="text-gray-500">
          Setting up your alpha testing profile...
        </p>
      </div>
      
      <div className="flex justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  );
}