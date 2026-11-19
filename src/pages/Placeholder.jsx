import { useTranslation } from 'react-i18next'

export default function Placeholder({ titleKey }) {
  const { t } = useTranslation()
  return (
    <div className="pt-6 text-center">
      <h1 className="font-display text-3xl font-bold text-forest">{t(titleKey)}</h1>
      <p className="mt-4 text-ink/80">{t('comingSoon')}</p>
    </div>
  )
}