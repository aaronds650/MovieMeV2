import React, { createContext, useContext, useEffect, useState } from 'react';

interface UserProfile {
  id: string;
  username: string;
  email: string | null;
  role: 'core' | 'premium';
  include_rentals: boolean;
}

interface AlphaSession {
  user: {
    id: string;
    email: string;
  };
}

interface AuthContextType {
  session: AlphaSession | null;
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

// Generate a proper UUID v4
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Get or create user UUID from localStorage
function getOrCreateUserID(): string {
  const stored = localStorage.getItem('movieme_user_id');
  if (stored) {
    // Validate it looks like a UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(stored)) {
      return stored;
    }
  }
  
  // Generate new UUID and store it
  const newUUID = generateUUID();
  localStorage.setItem('movieme_user_id', newUUID);
  console.log('Generated new alpha user ID:', newUUID);
  return newUUID;
}

// Initialize user in database
async function initializeUser(userId: string): Promise<void> {
  try {
    const response = await fetch('/api/init-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId })
    });
    
    if (!response.ok) {
      console.error('Failed to initialize user:', response.status);
    }
  } catch (error) {
    console.error('Error initializing user:', error);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AlphaSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const refreshProfile = async () => {
    if (session?.user.id) {
      setUserProfile({
        id: session.user.id,
        username: 'Alpha User',
        email: session.user.email,
        role: 'core',
        include_rentals: false
      });
    }
  };

  useEffect(() => {
    async function setupAlphaUser() {
      try {
        // Get or create persistent UUID
        const userId = getOrCreateUserID();
        
        // Initialize user in database
        await initializeUser(userId);
        
        // Create alpha session
        const alphaSession = {
          user: {
            id: userId,
            email: `alpha-${userId.split('-')[0]}@movieme.app`
          }
        };
        
        setSession(alphaSession);
        setUserProfile({
          id: alphaSession.user.id,
          username: 'Alpha User',
          email: alphaSession.user.email,
          role: 'core',
          include_rentals: false
        });
      } catch (error) {
        console.error('Error setting up alpha user:', error);
      } finally {
        setLoading(false);
      }
    }

    setupAlphaUser();
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