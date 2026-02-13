import React, { createContext, useContext, useEffect, useState } from 'react';

interface UserProfile {
  id: string;
  username: string;
  email: string | null;
  role: 'core' | 'premium';
  include_rentals: boolean;
}

interface MockSession {
  user: {
    id: string;
    email: string;
  };
}

interface AuthContextType {
  session: MockSession | null;
  loading: boolean;
  userProfile: UserProfile | null;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
  userProfile: null,
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<MockSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const refreshProfile = async () => {
    // Mock profile for development
    if (session?.user.id) {
      setUserProfile({
        id: session.user.id,
        username: 'dev_user',
        email: session.user.email,
        role: 'core',
        include_rentals: false
      });
    }
  };

  useEffect(() => {
    // Mock session initialization
    setTimeout(() => {
      const mockSession = {
        user: {
          id: 'dev-user-1',
          email: 'dev@example.com'
        }
      };
      
      setSession(mockSession);
      setUserProfile({
        id: mockSession.user.id,
        username: 'dev_user',
        email: mockSession.user.email,
        role: 'core',
        include_rentals: false
      });
      setLoading(false);
    }, 100);
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading, userProfile, refreshProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper hook to check if user has specific role
export function useHasRole(role: 'core' | 'premium') {
  const { userProfile } = useAuth();
  return userProfile?.role === role;
}