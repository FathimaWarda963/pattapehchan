import { Link, NavLink, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Home, Search, Calculator, ClipboardList, HelpCircle, Settings } from 'lucide-react'
import { languages } from '../languages'
import { save } from '../storage'
import Logo from './Logo'

const navItems = [
  { to: '/home', key: 'nav.home', Icon: Home, end: true },
  { to: '/search', key: 'nav.search', Icon: Search },
  { to: '/calculator', key: 'nav.calculator', Icon: Calculator },
  { to: '/track', key: 'nav.track', Icon: ClipboardList },
]

export default function Layout() {
  const { t, i18n } = useTranslation()

  const changeLanguage = (e) => {
    i18n.changeLanguage(e.target.value)
    save('pp-lang', e.target.value)
  }

  const iconLink =
    'inline-flex items-center justify-center min-w-[44px] min-h-[44px] rounded-xl text-forest hover:bg-cream focus-visible:outline-4 focus-visible:outline-forest'

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 bg-paper border-b border-line">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-2 px-4 py-2">
          <Link to="/home" aria-label="PattaPehchan" className="rounded-xl focus-visible:outline-4 focus-visible:outline-forest">
            <Logo compact />
          </Link>
          <div className="flex items-center gap-1">
            <select
              aria-label={t('header.language')}
              value={i18n.language}
              onChange={changeLanguage}
              className="min-h-[44px] rounded-xl border border-line bg-paper px-2 text-base font-semibold text-forest focus-visible:outline-4 focus-visible:outline-forest"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name}
                </option>
              ))}
            </select>
            <Link to="/help" aria-label={t('header.help')} className={iconLink}>
              <HelpCircle size={24} aria-hidden="true" />
            </Link>
            <Link to="/settings" aria-label={t('header.settings')} className={iconLink}>
              <Settings size={24} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 pt-6 pb-28">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 inset-x-0 z-10 bg-paper border-t border-line shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <ul className="max-w-2xl mx-auto grid grid-cols-4">
          {navItems.map(({ to, key, Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  'flex flex-col items-center justify-center gap-1 min-h-[64px] px-1 text-sm font-semibold focus-visible:outline-4 focus-visible:outline-offset-[-4px] focus-visible:outline-forest ' +
                  (isActive ? 'text-forest border-t-4 border-forest -mt-px' : 'text-ink/70')
                }
              >
                <Icon size={24} aria-hidden="true" />
                <span>{t(key)}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}