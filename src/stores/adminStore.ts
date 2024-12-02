import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AdminStore, User, Business, UserFilters, BusinessFilters, ReportedContent } from '../types';
import { adminApi } from '../lib/api';
import { socket, connectSocket, subscribeToAdminEvents } from '../lib/socket';

export const useAdminStore = create<AdminStore>()(
  persist(
    (set, get) => ({
      stats: {
        totalUsers: 0,
        totalBusinesses: 0,
        totalReviews: 0,
        verifiedBusinesses: 0,
        pendingVerifications: 0,
        activeUsers: 0,
        totalReports: 0,
        pendingReports: 0,
      },
      filteredUsers: [],
      filteredBusinesses: [],
      pendingReviews: [],
      reportedContent: [],
      activityLogs: [],
      isLoading: false,
      error: null,

      initializeRealTimeUpdates: (userId: string, role: string) => {
        connectSocket(userId, role);
        
        return subscribeToAdminEvents({
          onStatsUpdate: (stats) => set({ stats }),
          onNewBusiness: (business: Business) => {
            set((state: AdminStore) => ({
              stats: {
                ...state.stats,
                totalBusinesses: state.stats.totalBusinesses + 1,
                pendingVerifications: state.stats.pendingVerifications + 1,
              },
              filteredBusinesses: [business, ...state.filteredBusinesses],
            }));
          },
          onNewReport: (report: ReportedContent) => {
            set((state: AdminStore) => ({
              stats: {
                ...state.stats,
                totalReports: state.stats.totalReports + 1,
                pendingReports: state.stats.pendingReports + 1,
              },
              reportedContent: [report, ...state.reportedContent],
            }));
          },
          onUserActivity: (activity) => {
            set((state: AdminStore) => ({
              activityLogs: [activity, ...state.activityLogs],
            }));
          },
        });
      },

      fetchStats: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await adminApi.getStats();
          set({ stats: data, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch admin stats',
            isLoading: false 
          });
          throw error;
        }
      },

      fetchUsers: async (filters: UserFilters) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await adminApi.getUsers(filters);
          set({ filteredUsers: data, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch users',
            isLoading: false 
          });
          throw error;
        }
      },

      fetchBusinesses: async (filters: BusinessFilters) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await adminApi.getBusinesses(filters);
          set({ filteredBusinesses: data, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch businesses',
            isLoading: false 
          });
          throw error;
        }
      },

      updateUserRole: async (userId: string, role: 'user' | 'admin' | 'super_admin') => {
        set({ isLoading: true, error: null });
        try {
          await adminApi.updateUserRole(userId, role);
          set((state: AdminStore) => ({
            filteredUsers: state.filteredUsers.map(user =>
              user.id === userId ? { ...user, role } : user
            ),
            isLoading: false
          }));
          
          socket.emit('admin:userRoleUpdated', { userId, role });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update user role',
            isLoading: false 
          });
          throw error;
        }
      },

      deleteUser: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
          await adminApi.deleteUser(userId);
          set((state: AdminStore) => ({
            filteredUsers: state.filteredUsers.filter(user => user.id !== userId),
            stats: {
              ...state.stats,
              totalUsers: state.stats.totalUsers - 1
            },
            isLoading: false
          }));
          
          socket.emit('admin:userDeleted', { userId });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete user',
            isLoading: false 
          });
          throw error;
        }
      },

      verifyBusiness: async (businessId: string) => {
        set({ isLoading: true, error: null });
        try {
          await adminApi.verifyBusiness(businessId);
          set((state: AdminStore) => ({
            filteredBusinesses: state.filteredBusinesses.map(business =>
              business.id === businessId ? { ...business, isVerified: true } : business
            ),
            stats: {
              ...state.stats,
              verifiedBusinesses: state.stats.verifiedBusinesses + 1,
              pendingVerifications: state.stats.pendingVerifications - 1
            },
            isLoading: false
          }));
          
          socket.emit('admin:businessVerified', { businessId });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to verify business',
            isLoading: false 
          });
          throw error;
        }
      },

      deleteBusiness: async (businessId: string) => {
        set({ isLoading: true, error: null });
        try {
          await adminApi.deleteBusiness(businessId);
          set((state: AdminStore) => ({
            filteredBusinesses: state.filteredBusinesses.filter(business => business.id !== businessId),
            stats: {
              ...state.stats,
              totalBusinesses: state.stats.totalBusinesses - 1
            },
            isLoading: false
          }));
          
          socket.emit('admin:businessDeleted', { businessId });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete business',
            isLoading: false 
          });
          throw error;
        }
      },

      handleReport: async (reportId: string, action: 'resolved' | 'dismissed') => {
        set({ isLoading: true, error: null });
        try {
          await adminApi.handleReport(reportId, action);
          set((state: AdminStore) => ({
            reportedContent: state.reportedContent.map(report =>
              report.id === reportId ? { ...report, status: action } : report
            ),
            stats: {
              ...state.stats,
              pendingReports: state.stats.pendingReports - 1
            },
            isLoading: false
          }));
          
          socket.emit('admin:reportHandled', { reportId, action });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to handle report',
            isLoading: false 
          });
          throw error;
        }
      },
    }),
    {
      name: 'admin-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        stats: state.stats,
      }),
    }
  )
);
