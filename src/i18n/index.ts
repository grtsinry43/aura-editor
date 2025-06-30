import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import en from './locales/en.json'
import zh from './locales/zh.json'

const resources = {
  en: {
    translation: en
  },
  zh: {
    translation: zh
  }
}

// 检测用户的首选语言
const getPreferredLanguage = () => {
  // 首先检查localStorage
  const stored = localStorage.getItem('i18nextLng')
  if (stored && ['zh', 'en'].includes(stored)) {
    return stored
  }
  
  // 然后检查浏览器语言
  const browserLang = navigator.language || navigator.languages?.[0] || ''
  if (browserLang.startsWith('zh')) {
    return 'zh'
  }
  
  // 默认返回中文（因为这是中文项目）
  return 'zh'
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: getPreferredLanguage(), // 直接设置检测到的语言
    fallbackLng: 'zh', // 改为中文作为fallback
    debug: true, // 临时开启调试模式
    
    interpolation: {
      escapeValue: false,
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage']
    },
    
    supportedLngs: ['zh', 'en'], // 支持的语言列表
  })

export default i18n 