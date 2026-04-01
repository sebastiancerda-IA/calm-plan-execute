import { useState, useCallback, useEffect } from 'react';

export type Density = 'compact' | 'normal' | 'expanded';

interface UserPreferences {
  density: Density;
  animationsEnabled: boolean;
  sidebarCollapsed: boolean;
  visibleWidgets: {
    globalMetrics: boolean;
    institutionalMetrics: boolean;
    agentMap: boolean;
    pulse: boolean;
    activityFeed: boolean;
    accreditationGuide: boolean;
    actionCenter: boolean;
    dataChecklist: boolean;
    infraFooter: boolean;
  };
}

const DEFAULTS: UserPreferences = {
  density: 'normal',
  animationsEnabled: true,
  sidebarCollapsed: false,
  visibleWidgets: {
    globalMetrics: true,
    institutionalMetrics: true,
    agentMap: true,
    pulse: true,
    activityFeed: true,
    accreditationGuide: true,
    actionCenter: true,
    dataChecklist: true,
    infraFooter: true,
  },
};

const STORAGE_KEY = 'idma-preferences';

function load(): UserPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

export function useUserPreferences() {
  const [prefs, setPrefsState] = useState<UserPreferences>(load);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    // Apply density CSS variable
    const factor = prefs.density === 'compact' ? '0.75' : prefs.density === 'expanded' ? '1.25' : '1';
    document.documentElement.style.setProperty('--density-factor', factor);
  }, [prefs]);

  const setPrefs = useCallback((partial: Partial<UserPreferences>) => {
    setPrefsState(prev => ({ ...prev, ...partial }));
  }, []);

  const setWidgetVisible = useCallback((key: keyof UserPreferences['visibleWidgets'], visible: boolean) => {
    setPrefsState(prev => ({
      ...prev,
      visibleWidgets: { ...prev.visibleWidgets, [key]: visible },
    }));
  }, []);

  return { prefs, setPrefs, setWidgetVisible };
}
