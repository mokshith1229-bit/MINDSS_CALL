import { create } from 'zustand';
import api from '../utils/api';

const useRDCompletedStore = create((set, get) => ({
  imports: [],
  activeImport: null,
  kpis: {
    totalFiles: 0,
    totalRecords: 0,
    lastUpdated: null,
    lastUploadedBy: null,
  },
  isLoading: false,
  isUploading: false,
  isLoadingDetails: false,
  error: null,

  fetchImports: async (selectedId = null) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/admin/rd-completed');
      const { imports, kpis } = res.data?.data || { imports: [], kpis: {} };

      set({ imports, kpis, isLoading: false });

      // Automatically select import
      const currentActive = get().activeImport;
      const targetId = selectedId || (currentActive?._id ? currentActive._id : (imports.length > 0 ? imports[0]._id : null));

      if (targetId) {
        // Only re-fetch details if not already loaded or if target changed
        if (!currentActive || currentActive._id !== targetId || !currentActive.rows) {
          get().selectImport(targetId);
        }
      } else {
        set({ activeImport: null });
      }

      return imports;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to fetch R&D completed imports';
      set({ error: msg, isLoading: false });
      throw err;
    }
  },

  selectImport: async (id) => {
    if (!id) {
      set({ activeImport: null });
      return;
    }
    set({ isLoadingDetails: true, error: null });
    try {
      const res = await api.get(`/admin/rd-completed/${id}`);
      const importDetails = res.data?.data;
      set({ activeImport: importDetails, isLoadingDetails: false });
      return importDetails;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to load spreadsheet details';
      set({ error: msg, isLoadingDetails: false });
      throw err;
    }
  },

  uploadImport: async (formData) => {
    set({ isUploading: true, error: null });
    try {
      const res = await api.post('/admin/rd-completed/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const created = res.data?.data;
      set({ isUploading: false });

      // Refresh list and select the new import
      await get().fetchImports(created?._id);
      return created;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to upload and import Excel file';
      set({ isUploading: false, error: msg });
      throw err;
    }
  },

  deleteImport: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/admin/rd-completed/${id}`);
      const currentImports = get().imports.filter((item) => item._id !== id);
      const wasActive = get().activeImport?._id === id;
      const nextId = currentImports.length > 0 ? currentImports[0]._id : null;

      set({ isLoading: false });
      await get().fetchImports(wasActive ? nextId : get().activeImport?._id);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to delete import';
      set({ isLoading: false, error: msg });
      throw err;
    }
  },

  getDownloadUrl: async (id) => {
    try {
      const res = await api.get(`/admin/rd-completed/${id}/download`);
      return res.data?.data?.downloadUrl;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to get download URL';
      throw new Error(msg);
    }
  },
}));

export default useRDCompletedStore;
