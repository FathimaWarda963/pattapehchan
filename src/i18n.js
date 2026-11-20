import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { getSaved } from './storage'
import en from './locales/en/common.json'
import ur from './locales/ur/common.json'
import si from './locales/si/common.json'
import ta from './locales/ta/common.json'
import enRecords from './locales/en/records.json'
import urRecords from './locales/ur/records.json'
import siRecords from './locales/si/records.json'
import taRecords from './locales/ta/records.json'
import enCheck from './locales/en/check.json'
import urCheck from './locales/ur/check.json'
import siCheck from './locales/si/check.json'
import taCheck from './locales/ta/check.json'
import enCalc from './locales/en/calc.json'
import urCalc from './locales/ur/calc.json'
import siCalc from './locales/si/calc.json'
import taCalc from './locales/ta/calc.json'
import enTs from './locales/en/trackSettings.json'
import urTs from './locales/ur/trackSettings.json'
import siTs from './locales/si/trackSettings.json'
import taTs from './locales/ta/trackSettings.json'

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: { ...en, ...enRecords, ...enCheck, ...enCalc, ...enTs } },
    ur: { translation: { ...ur, ...urRecords, ...urCheck, ...urCalc, ...urTs } },
    si: { translation: { ...si, ...siRecords, ...siCheck, ...siCalc, ...siTs } },
    ta: { translation: { ...ta, ...taRecords, ...taCheck, ...taCalc, ...taTs } },
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