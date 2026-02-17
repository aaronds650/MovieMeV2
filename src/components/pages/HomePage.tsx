import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Film, Popcorn, Sparkles, ListFilter, Clock, Star, Zap, LogOut, Crown } from 'lucide-react';
import { cn } from '../../lib/utils';
// Removed Supabase import
import { useAuth } from '../../context/AuthProvider';
import { logUserActivity } from '../../lib/activity';

const features = [
  {
    icon: <Sparkles className="h-6 w-6" />,
    title: 'AI-Powered Recommendations',
    description: 'Get personalized movie suggestions based on your preferences and viewing history.'
  },
  {
    icon: <ListFilter className="h-6 w-6" />,
    title: 'Smart Filtering',
    description: 'Find movies that match your taste and preferences.'
  },
  {
    icon: <Clock className="h-6 w-6" />,
    title: 'Time-Based Selection',
    description: 'Choose movies from specific eras or discover timeless classics.'
  },
  {
    icon: <Star className="h-6 w-6" />,
    title: 'Preference Learning',
    description: 'The more you use MovieMe, the better it understands your taste.'
  }
];

export function HomePage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [showUpgradeMessage, setShowUpgradeMessage] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleUpgradeClick = async () => {
    // Log the premium upgrade click
    await logUserActivity('premium_upgrade_click', {
      currentRole: 'core',
      source: 'homepage'
    });

    setShowUpgradeMessage(true);
    setTimeout(() => setShowUpgradeMessage(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <header className="py-6 px-4 border-b bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">MovieMe</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Welcome, {user?.email}
            </span>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {showUpgradeMessage && (
        <div className="fixed top-4 right-4 bg-white rounded-lg shadow-lg p-4 animate-fade-in">
          <p className="text-gray-800">Premium features are coming soon! Stay tuned.</p>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Your Personal Movie Discovery Assistant
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Find your next favorite movie with AI-powered recommendations tailored to your taste.
          </p>
          <button
            onClick={() => navigate('/conversation')}
            className={cn(
              "inline-flex items-center gap-2 px-8 py-4 rounded-lg text-white font-medium text-lg",
              "bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
              "transition-colors duration-200"
            )}
          >
            <Sparkles className="h-5 w-5" />
            Get Movie Recommendations
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-indigo-50 rounded-2xl p-8 md:p-12 mb-16">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Start Building Your Movie Collection
              </h2>
              <p className="text-gray-600">
                Keep track of movies you want to watch and ones you've already seen. Rate your favorites and get better recommendations over time.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => navigate('/watchlist')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-indigo-600 font-medium hover:bg-indigo-50 transition-colors"
                >
                  <Popcorn className="h-5 w-5" />
                  View Watchlist
                </button>
                <button
                  onClick={() => navigate('/watched')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-indigo-600 font-medium hover:bg-indigo-50 transition-colors"
                >
                  <Film className="h-5 w-5" />
                  View Watched Movies
                </button>
              </div>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="relative w-64 h-64">
                <div className="absolute inset-0 bg-indigo-100 rounded-full animate-float opacity-50"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Film className="h-24 w-24 text-indigo-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Section - Updated with more vibrant styling */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-10 animate-pulse"></div>
          <div className="relative bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-8 border border-indigo-100 shadow-lg transform hover:scale-[1.02] transition-transform duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200 to-indigo-200 rounded-full blur-2xl opacity-50 -mr-16 -mt-16"></div>
            <div className="relative flex items-start gap-6">
              <div className="p-4 bg-white bg-opacity-50 backdrop-blur-sm rounded-xl shadow-sm">
                <Zap className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  Coming Soon
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                    New Feature
                  </span>
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Seamless integration with your favorite streaming services! Soon, MovieMe will recommend movies available on the platforms you already use—making finding the perfect movie even easier!
                </p>
                <div className="mt-4 flex items-center gap-2 text-sm text-indigo-600 font-medium">
                  <span>Stay tuned for updates</span>
                  <Sparkles className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}