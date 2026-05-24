import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserSettings, loadSettings } from '../utils';

interface SettingsCtx {
   settings: UserSettings;
   refresh:  () => void;
}

const Ctx = createContext<SettingsCtx | null>(null);

/** Dispatched by SettingsPage after every save */
export const SETTINGS_CHANGED = 'app:settings-changed';

export const SettingsProvider: React.FC<{ userId: string; children: React.ReactNode }> = ({
   userId,
   children,
}) => {
   const [settings, setSettings] = useState<UserSettings>(() => loadSettings(userId));

   const refresh = useCallback(
      () => setSettings(loadSettings(userId)),
      [userId],
   );

   // Re-read when SettingsPage saves (same tab)
   useEffect(() => {
      window.addEventListener(SETTINGS_CHANGED, refresh);
      return () => window.removeEventListener(SETTINGS_CHANGED, refresh);
   }, [refresh]);

   // Re-read if userId changes (shouldn't normally happen)
   useEffect(() => { setSettings(loadSettings(userId)); }, [userId]);

   return <Ctx.Provider value={{ settings, refresh }}>{children}</Ctx.Provider>;
};

/** Returns current settings — updates immediately when SettingsPage saves */
export const useAppSettings = (): UserSettings => {
   const ctx = useContext(Ctx);
   // Fallback for components rendered outside the provider
   return ctx?.settings ?? loadSettings('');
};
