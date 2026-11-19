import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { getSaved } from './storage'
import en from './locales/en/common.json'
import ur from './locales/ur/common.json'
import si from './locales/si/common.json'
import ta from './locales/ta/common.json'

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ur: { translation: ur },
    si: { translation: si },
    ta: { translation: ta },
  },
  lng: getSaved('pp-lang') || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

// Keep the page's language and direction in sync (only Urdu is right-to-left)
const applyLanguage = (lng) => {
  document.documentElement.lang = lng
  document.documentElement.dir = lng === 'ur' ? 'rtl' : 'ltr'
}
applyLanguage(i18n.language)
i18n.on('languageChanged', applyLanguage)

export default i18n