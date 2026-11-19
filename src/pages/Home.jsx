import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getSaved } from '../storage'
import Logo from '../components/Logo'

export default function Home() {
  const { t } = useTranslation()

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-10">
      <Logo />
      <h1 className="font-display mt-10 text-3xl font-bold text-forest">{t('home.welcome')}</h1>
      <p className="mt-4 text-ink/80">
        Language: {getSaved('pp-lang')} | Country: {getSaved('pp-country')}
      </p>
      <Link to="/" className="mt-6 min-h-[44px] inline-flex items-center text-forest font-semibold underline">
        Change language
      </Link>
    </main>
  )
}