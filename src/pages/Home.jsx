import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, ShieldCheck, Calculator, ClipboardList, ChevronRight, MapPin } from 'lucide-react'
import { getSaved } from '../storage'
import { loadSettings } from '../settings'
import AudioMenu from '../components/AudioMenu'

const tasks = [
  { to: '/search', key: 'home.find', Icon: Search },
  { to: '/check', key: 'home.check', Icon: ShieldCheck },
  { to: '/calculator', key: 'home.inherit', Icon: Calculator },
  { to: '/track', key: 'home.track', Icon: ClipboardList },
]

export default function Home() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [audioOn] = useState(() => loadSettings().audio)
  const [active, setActive] = useState(-1)
  const country = getSaved('pp-country')

  if (!country) return <Navigate to="/" replace />

  const dir = i18n.language === 'ur' ? 'rtl' : 'ltr'
  const options = tasks.map(({ to, key }) => ({
    id: to,
    text: t(key + '.title'),
    onChoose: () => navigate(to),
  }))

  return (
    <div dir="ltr" className="flex items-start gap-3">
      <div dir={dir} className="min-w-0 flex-1">
        <Link
          to="/country"
          className="inline-flex items-center gap-2 min-h-[44px] rounded-full border border-line bg-paper px-4 text-forest font-semibold focus-visible:outline-4 focus-visible:outline-forest"
        >
          <MapPin size={18} aria-hidden="true" />
          <span>{t('country.' + country)}</span>
          <span className="text-ink/70 underline">{t('change')}</span>
        </Link>

        <h1 className="font-display mt-6 text-3xl font-bold text-forest">{t('home.welcome')}</h1>
        <p className="mt-2 text-lg text-ink/80">{t('home.subtitle')}</p>

        <ul className="mt-6 grid gap-4">
          {tasks.map(({ to, key, Icon }, i) => (
            <li key={to}>
              <Link
                to={to}
                className={
                  'flex items-center gap-4 min-h-[88px] rounded-2xl bg-paper border shadow-md p-4 transition hover:border-forest hover:shadow-lg active:scale-[0.99] focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-forest ' +
                  (active === i ? 'border-forest ring-4 ring-forest/40' : 'border-line')
                }
              >
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-forest text-white">
                  <Icon size={28} aria-hidden="true" />
                </span>
                <span className="flex-1">
                  <span className="block text-xl font-bold text-forest">{t(key + '.title')}</span>
                  <span className="block mt-1 text-base text-ink/80">{t(key + '.desc')}</span>
                </span>
                <ChevronRight className="shrink-0 text-forest rtl:rotate-180" size={24} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {audioOn && (
        <AudioMenu
          options={options}
          onActive={setActive}
          announce={t('spoken.announce.home')}
          className="sticky top-28 h-[calc(100svh-14rem)]"
        />
      )}
    </div>
  )
}