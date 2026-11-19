import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import { save } from '../storage'
import Logo from '../components/Logo'

const countries = [
  { code: 'pk', labelKey: 'country.pk' },
  { code: 'lk', labelKey: 'country.lk' },
]

export default function CountryStep() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const choose = (code) => {
    save('pp-country', code)
    navigate('/home')
  }

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-md">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 min-h-[44px] px-2 text-forest font-semibold focus-visible:outline-4 focus-visible:outline-forest rounded-lg"
        >
          <ArrowLeft className="rtl:rotate-180" size={22} aria-hidden="true" />
          {t('back')}
        </button>
      </div>

      <div className="mt-4">
        <Logo />
      </div>

      <h1 className="font-display mt-10 text-3xl font-bold text-forest text-center">
        {t('country.title')}
      </h1>
      <p className="mt-3 max-w-md text-center text-ink/80">{t('country.hint')}</p>

      <div className="mt-8 w-full max-w-md grid gap-4">
        {countries.map((c) => (
          <button
            key={c.code}
            type="button"
            onClick={() => choose(c.code)}
            className="w-full min-h-[76px] flex items-center justify-between rounded-2xl bg-paper border border-line shadow-md px-6 py-4 text-xl font-semibold text-forest transition hover:border-forest hover:shadow-lg active:scale-[0.99] focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-forest"
          >
            <span>{t(c.labelKey)}</span>
            <ChevronRight className="rtl:rotate-180" size={24} aria-hidden="true" />
          </button>
        ))}
      </div>
    </main>
  )
}