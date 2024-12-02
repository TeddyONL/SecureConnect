import { create } from 'zustand';
import { ChatStore } from '../types';
import { persist } from 'zustand/middleware';

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      messages: [],
      isLoading: false,
      error: null,

      addMessage: (role, content) => {
        try {
          set((state) => {
            const newMessage = {
              id: Math.random().toString(36).substr(2, 9),
              role,
              content,
              timestamp: new Date().toISOString(),
            };
            return { 
              messages: [...state.messages, newMessage],
              error: null
            };
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to add message'
          });
        }
      },

      clearMessages: () => {
        try {
          set({ messages: [], error: null });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to clear messages'
          });
        }
      },

      setIsLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'chat-storage',
    }
  )
);