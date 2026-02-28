import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import en from './locales/en.json'
import zh from './locales/zh.json'

export const auraI18nResources = {
  en: { translation: en },
  zh: { translation: zh },
}

export interface AuraI18nOptions {
  /** Default language. If not set, auto-detects from browser. */
  lng?: string
  /** Fallback language. Defaults to 'en'. */
  fallbackLng?: string
  /** Enable debug mode. Defaults to false. */
  debug?: boolean
  /** Additional i18next resources to merge. */
  resources?: Record<string, { translation: Record<string, unknown> }>
  /** Set to true to skip initialization (if you manage i18next yourself). */
  skipInit?: boolean
}

let initialized = false

export function initAuraI18n(options: AuraI18nOptions = {}) {
  if (initialized || options.skipInit) return i18n

  const mergedResources = {
    ...auraI18nResources,
    ...options.resources,
  }

  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: mergedResources,
      lng: options.lng,
      fallbackLng: options.fallbackLng ?? 'en',
      debug: options.debug ?? false,
      interpolation: { escapeValue: false },
      detection: {
        order: ['localStorage', 'navigator', 'htmlTag'],
        lookupLocalStorage: 'i18nextLng',
        caches: ['localStorage'],
      },
      supportedLngs: Object.keys(mergedResources),
    })

  initialized = true
  return i18n
}

export default i18n
