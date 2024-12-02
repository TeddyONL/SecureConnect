import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthStore, User } from '../types';
import { security } from '../lib/security';
import { schemas, validate } from '../utils/validation';

const REFRESH_TOKEN_INTERVAL = 1000 * 60 * 14; // 14 minutes
const SESSION_TIMEOUT = 1000 * 60 * 60; // 1 hour

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isInitialized: false,
      lastActivity: Date.now(),
      refreshTokenTimeout: null,

      login: async (email: string, password: string) => {
        try {
          // Validate input
          const validation = validate(schemas.login)({ email, password });
          if (validation.error) {
            throw new Error(validation.error[0].message);
          }

          // Sanitize email
          const sanitizedEmail = email.toLowerCase().trim();

          // Hash password with salt and pepper
          const { hash, salt } = await security.hashPassword(password);

          // Make API call (mocked for demo)
          const user = await mockLoginCall(sanitizedEmail, hash, salt);

          // Set up refresh token rotation
          const refreshTimeout = setInterval(async () => {
            await get().refreshToken();
          }, REFRESH_TOKEN_INTERVAL);

          set({ 
            user,
            isInitialized: true,
            lastActivity: Date.now(),
            refreshTokenTimeout: refreshTimeout
          });

          // Set up session monitoring
          setupSessionMonitoring(get, set);

          return user;
        } catch (error) {
          set({ user: null, isInitialized: true });
          throw error;
        }
      },

      register: async (email: string, password: string, name: string) => {
        try {
          // Validate input
          const validation = validate(schemas.registration)({ email, password, name });
          if (validation.error) {
            throw new Error(validation.error[0].message);
          }

          // Sanitize email and name
          const sanitizedEmail = email.toLowerCase().trim();
          const sanitizedName = name.trim();

          // Hash password
          const { hash, salt } = await security.hashPassword(password);

          // Mock registration (replace with actual API call)
          const user: User = {
            id: `user-${Date.now()}`,
            email: sanitizedEmail,
            name: sanitizedName,
            role: 'user',
            token: security.generateToken()
          };

          set({ 
            user,
            isInitialized: true,
            lastActivity: Date.now()
          });

          return user;
        } catch (error) {
          set({ user: null, isInitialized: true });
          throw error;
        }
      },

      logout: () => {
        const { refreshTokenTimeout } = get();
        if (refreshTokenTimeout) {
          clearInterval(refreshTokenTimeout);
        }
        set({ 
          user: null,
          isInitialized: true,
          lastActivity: 0,
          refreshTokenTimeout: null
        });
      },

      refreshToken: async () => {
        try {
          const { user } = get();
          if (!user) return;

          // Mock token refresh (replace with actual API call)
          const newToken = security.generateToken();
          set({
            user: { ...user, token: newToken },
            lastActivity: Date.now()
          });
        } catch (error) {
          console.error('Failed to refresh token:', error);
          get().logout();
        }
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user,
        lastActivity: state.lastActivity
      }),
    }
  )
);

// Helper functions
const setupSessionMonitoring = (get: any, set: any) => {
  const checkSession = () => {
    const { lastActivity, user } = get();
    if (user && Date.now() - lastActivity > SESSION_TIMEOUT) {
      get().logout();
    }
  };

  // Check session every minute
  const interval = setInterval(checkSession, 60000);

  // Update last activity on user interaction
  const updateActivity = () => {
    if (get().user) {
      set({ lastActivity: Date.now() });
    }
  };

  window.addEventListener('mousemove', updateActivity);
  window.addEventListener('keydown', updateActivity);

  // Cleanup
  return () => {
    clearInterval(interval);
    window.removeEventListener('mousemove', updateActivity);
    window.removeEventListener('keydown', updateActivity);
  };
};

// Mock API calls (replace with real API calls)
const mockLoginCall = async (email: string, _hash: string, _salt: string): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

  // Demo users
  const users: Record<string, User> = {
    'admin@test.com': {
      id: 'admin-1',
      email: 'admin@test.com',
      name: 'Admin User',
      role: 'admin',
      token: security.generateToken()
    },
    'user@test.com': {
      id: 'user-1',
      email: 'user@test.com',
      name: 'Regular User',
      role: 'user',
      token: security.generateToken()
    },
    'super@test.com': {
      id: 'super-1',
      email: 'super@test.com',
      name: 'Super Admin',
      role: 'super_admin',
      token: security.generateToken()
    }
  };

  const user = users[email];
  if (user) {
    return user;
  }

  throw new Error('Invalid credentials');
};
