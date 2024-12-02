import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthStore, User } from '../types';
import { validate, schemas } from '../utils/validation';
import axios from 'axios';

const REFRESH_TOKEN_INTERVAL = 1000 * 60 * 14; // 14 minutes
const SESSION_TIMEOUT = 1000 * 60 * 60; // 1 hour

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  withCredentials: true,
});

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isInitialized: false,
      lastActivity: Date.now(),
      refreshTokenTimeout: null,

      login: async (email: string, password: string) => {
        try {
          // Validate input using Zod schema
          const validation = validate(schemas.login)({ email, password });
          if (validation.error) {
            throw new Error(validation.error[0].message);
          }

          // Make API call
          const response = await api.post('/auth/login', {
            email: email.toLowerCase().trim(),
            password
          });

          const { user, accessToken } = response.data;

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

          // Set authorization header for future requests
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

          return user;
        } catch (error) {
          set({ user: null, isInitialized: true });
          throw error;
        }
      },

      register: async (email: string, password: string, name: string) => {
        try {
          // Validate input using Zod schema
          const validation = validate(schemas.registration)({ email, password, name });
          if (validation.error) {
            throw new Error(validation.error[0].message);
          }

          // Make API call
          const response = await api.post('/auth/register', {
            email: email.toLowerCase().trim(),
            password,
            name: name.trim()
          });

          const { user, accessToken } = response.data;

          set({ 
            user,
            isInitialized: true,
            lastActivity: Date.now()
          });

          // Set authorization header for future requests
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

          return user;
        } catch (error) {
          set({ user: null, isInitialized: true });
          throw error;
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout');
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
          // Clear authorization header
          delete api.defaults.headers.common['Authorization'];
        } catch (error) {
          console.error('Logout failed:', error);
          throw error;
        }
      },

      refreshToken: async () => {
        try {
          const response = await api.post('/auth/refresh-token');
          const { user, accessToken } = response.data;

          set({
            user,
            lastActivity: Date.now()
          });

          // Update authorization header
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
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
