import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const StoreSettingsContext = createContext();

export const StoreSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/store-settings');
      if (res.data.success) {
        setSettings(res.data.settings);
      }
    } catch (err) {
      console.warn('Failed to fetch store settings:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <StoreSettingsContext.Provider
      value={{
        settings,
        loading,
        refreshSettings: fetchSettings,
      }}
    >
      {children}
    </StoreSettingsContext.Provider>
  );
};

export const useStoreSettings = () => useContext(StoreSettingsContext);
