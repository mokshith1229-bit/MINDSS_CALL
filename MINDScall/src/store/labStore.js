import { create } from 'zustand';
import api from '../utils/api';

const useLabStore = create((set, get) => ({
  labs: [],
  equipment: [],
  isLoading: false,
  error: null,

  fetchLabs: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/labs');
      set({ labs: response.data.data, isLoading: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch labs', 
        isLoading: false 
      });
    }
  },

  fetchEquipmentByLab: async (labId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/labs/${labId}/equipment`);
      set({ equipment: response.data.data, isLoading: false });
      return response.data.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch equipment', 
        isLoading: false 
      });
      return [];
    }
  }
}));

export default useLabStore;
