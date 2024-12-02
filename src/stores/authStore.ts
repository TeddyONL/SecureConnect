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

      // ... (keep other existing methods)
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
  // ... (keep existing monitoring code)
};

// Mock API calls (replace with real API calls)
const mockLoginCall = async (email: string, hash: string, salt: string): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

  // Demo users
  const users = {
    'admin@test.com': {
      id: 'admin-1',
      email: 'admin@test.com',
      name: 'Admin User',
      role: 'admin',
      token: security.generateToken()
    },
    'support@test.com': {
      id: 'support-1',
      email: 'support@test.com',
      name: 'Support User',
      role: 'support',
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

// ... (keep other existing helper functions)