/**
 * Smart AI Tracker — Sync Context
 * Shared state for Cloud Sync toggle, so Drawer and Settings stay in sync.
 */
import React, {createContext, useState, useContext, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SYNC_KEY = '@cloud_sync_enabled';

type SyncContextType = {
  syncEnabled: boolean;
  setSyncEnabled: (value: boolean) => void;
};

const SyncContext = createContext<SyncContextType>({
  syncEnabled: true,
  setSyncEnabled: () => {},
});

export const SyncProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [syncEnabled, setSyncEnabledState] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(SYNC_KEY).then(val => {
      if (val !== null) setSyncEnabledState(val === 'true');
    });
  }, []);

  const setSyncEnabled = async (value: boolean) => {
    setSyncEnabledState(value);
    await AsyncStorage.setItem(SYNC_KEY, value.toString());
  };

  return (
    <SyncContext.Provider value={{syncEnabled, setSyncEnabled}}>
      {children}
    </SyncContext.Provider>
  );
};

export const useSyncEnabled = () => useContext(SyncContext);
