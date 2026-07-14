import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { authStore } from '../store/authStore';

const VisibilityContext = createContext(null);

/**
 * VisibilityProvider — wraps the entire app.
 * Fetches feature visibility config once on mount (after auth).
 * Provides isVisible(featureKey) based on the current user's role.
 */
export const VisibilityProvider = ({ children }) => {
  const [visibilityMap, setVisibilityMap] = useState({});   // { featureKey: { ROLE: bool } }
  const [features, setFeatures] = useState([]);             // raw array from backend
  const [loading, setLoading] = useState(true);
  const [lastFetched, setLastFetched] = useState(null);

  const fetchVisibility = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setVisibilityMap({});
        setFeatures([]);
        setLoading(false);
        return;
      }
      const res = await api.get('/developer/visibility');
      setVisibilityMap(res.data.data.visibilityMap || {});
      setFeatures(res.data.data.features || []);
      setLastFetched(Date.now());
    } catch {
      // If fetch fails (network etc.), default to all visible so app still works
      setVisibilityMap({});
      setFeatures([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchVisibility();
  }, [fetchVisibility]);

  // Re-fetch when auth state changes (login / logout)
  useEffect(() => {
    const unsub = authStore.subscribe((state) => {
      if (state.isAuthenticated) {
        fetchVisibility();
      } else {
        setVisibilityMap({});
        setFeatures([]);
      }
    });
    return unsub;
  }, [fetchVisibility]);

  /**
   * Check if a feature is visible for the current user's role.
   * DEVELOPER always returns true.
   * If featureKey is not found in config (new feature), defaults to true.
   */
  const isVisible = useCallback((featureKey) => {
    const user = authStore.getState().user;
    if (!user) return false;
    const role = user.role;

    // DEVELOPER always has full access
    if (role === 'DEVELOPER') return true;

    const featureRoles = visibilityMap[featureKey];
    // If no config found, default to visible (fail-open for new features)
    if (!featureRoles) return true;
    // If role not listed in config, default visible
    return featureRoles[role] !== false;
  }, [visibilityMap]);

  const value = {
    visibilityMap,
    features,
    loading,
    lastFetched,
    isVisible,
    refresh: fetchVisibility,
  };

  return (
    <VisibilityContext.Provider value={value}>
      {children}
    </VisibilityContext.Provider>
  );
};

export const useVisibility = () => {
  const ctx = useContext(VisibilityContext);
  if (!ctx) throw new Error('useVisibility must be used inside VisibilityProvider');
  return ctx;
};

export default VisibilityContext;
