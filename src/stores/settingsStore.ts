import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppSettings } from '../types'

interface SettingsState {
  settings: AppSettings
  updateSettings: (partial: Partial<AppSettings>) => void
}

const defaults: AppSettings = {
  autoUpdate: true,
  updateMode: 'cache_expire',
  preferredHour: 7,
  wifiOnly: false,
  skipLowBattery: true,
  pushEnabled: false,
  inAppBannerEnabled: true,
  notifyThreshold: 5,
  quietStart: 22,
  quietEnd: 7,
  quietEnabled: true,
  claudeApiKey: '',
  newsApiKey: '',
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: defaults,
      updateSettings: (partial) =>
        set((state) => ({ settings: { ...state.settings, ...partial } })),
    }),
    { name: 'pulse_settings' }
  )
)
