import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { getSaved } from './storage'

// Loads every src/locales/<language>/<file>.json automatically
const modules = import.meta.glob('./locales/*/*.json', { eager: true })
const resources = {}
for (const [path, mod] of Object.entries(modules)) {
  const lng = path.split('/')[2]
  resources[lng] = resources[lng] || { translation: {} }
  Object.assign(resources[lng].translation, mod.default)
}

i18n.use(initReactI18next).init({
  resources,
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