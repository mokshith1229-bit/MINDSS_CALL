import { create } from 'zustand';
import api from '../utils/api';

const useScheduleStore = create((set, get) => ({
  schedules: [],
  pendingReviews: [],
  isLoading: false,
  error: null,

  fetchSchedules: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await api.get(`/test-schedules?${queryParams}`);
      
      const allSchedules = response.data.data;
      set({ 
        schedules: allSchedules,
        pendingReviews: allSchedules.filter(s => s.status === 'PENDING_LAB_REVIEW'),
        isLoading: false 
      });
      return allSchedules;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch schedules', 
        isLoading: false 
      });
      return [];
    }
  },

  checkAvailability: async (data) => {
    try {
      const response = await api.post('/test-schedules/check-availability', data);
      return response.data;
    } catch (error) {
      return { available: false, reason: error.response?.data?.message || 'Failed to check availability' };
    }
  },

  requestSchedule: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/test-schedules', data);
      await get().fetchSchedules(); // Refresh
      return response.data;
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to request schedule';
      set({ error: errMsg, isLoading: false });
      throw new Error(errMsg);
    }
  },

  approveSchedule: async (id, remarks = '') => {
    set({ isLoading: true, error: null });
    try {
      await api.post(`/test-schedules/${id}/approve`, { remarks });
      await get().fetchSchedules();
      return true;
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to approve schedule';
      set({ error: errMsg, isLoading: false });
      throw new Error(errMsg);
    }
  },

  rejectSchedule: async (id, remarks) => {
    set({ isLoading: true, error: null });
    try {
      await api.post(`/test-schedules/${id}/reject`, { remarks });
      await get().fetchSchedules();
      return true;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to reject schedule', isLoading: false });
      throw error;
    }
  },

  requestChanges: async (id, remarks) => {
    set({ isLoading: true, error: null });
    try {
      await api.post(`/test-schedules/${id}/request-changes`, { remarks });
      await get().fetchSchedules();
      return true;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to request changes', isLoading: false });
      throw error;
    }
  },

}));

export default useScheduleStore;
