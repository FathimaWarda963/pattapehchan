import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  Search,
  ShieldCheck,
  Calculator,
  ClipboardList,
  Globe,
  HelpCircle,
  Settings as GearIcon,
  Home as HomeIcon,
} from 'lucide-react'
import { save } from '../storage'
import { loadSettings, saveSettings, applySettings } from '../settings'
import { collectText, listen } from '../audio'
import Logo from '../components/Logo'
import AudioMenu from '../components/AudioMenu'

function Row({ Icon, title, body }) {
  return (
    <li className="flex items-start gap-4">
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-forest text-white">
        <Icon size={28} aria-hidden="true" />
      </span>
      <span className="flex-1">
        <span className="block text-lg font-bold text-forest">{title}</span>
        <span className="block text-ink/90">{body}</span>
      </span>
    </li>
  )
}

const card = 'mt-5 rounded-2xl border border-line bg-paper p-5 shadow-md'

export default function Welcome() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [s, setS] = useState(loadSettings)
  const [active, setActive] = useState(-1)
  const content = useRef(null)
  const dir = i18n.language === 'ur' ? 'rtl' : 'ltr'

  const update = (patch) => {
    const next = { ...s, ...patch }
    setS(next)
    saveSettings(next)
    applySettings(next)
  }

  const sizes = [
    { value: 'normal', label: t('settings.normal'), cls: 'text-lg' },
    { value: 'large', label: t('settings.large'), cls: 'text-2xl' },
    { value: 'xlarge', label: t('settings.xlarge'), cls: 'text-3xl' },
  ]

  const go = () => {
    save('pp-welcomed', '1')
    navigate('/country')
  }

  const readAloud = () =>
    listen({
      pieces: collectText(content.current),
      lang: i18n.language,
      rate: 0.9,
      onEnd: () => {},
      onProblem: () => {},
    })

  const options = [
    { id: 'read', text: t('spoken.readGuide'), onChoose: readAloud },
    { id: 'go', text: t('welcome.start'), onChoose: go },
  ]

  const choice = (on) =>
    'min-h-[56px] rounded-2xl border px-2 font-semibold transition focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-forest ' +
    (on
      ? 'border-forest bg-forest text-white shadow-md'
      : 'border-line bg-cream text-forest hover:border-forest')

  return (
    <main className="mx-auto max-w-2xl px-4 pt-6">
      <div dir="ltr" className="flex items-start gap-3">
        <div ref={content} dir={dir} className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg px-1 font-semibold text-forest focus-visible:outline-4 focus-visible:outline-forest"
          >
            <ArrowLeft className="rtl:rotate-180" size={22} aria-hidden="true" />
            {t('back')}
          </button>

          <div className="mt-4">
            <Logo />
          </div>
          <h1 className="font-display mt-6 text-3xl font-bold text-forest">{t('welcome.title')}</h1>
          <p className="mt-3 text-lg text-ink/90">{t('welcome.intro')}</p>

          <section className={card} aria-labelledby="size-title">
            <h2 id="size-title" className="text-xl font-bold text-forest">
              {t('welcome.sizeTitle')}
            </h2>
            <p className="mt-1 text-ink/80">{t('welcome.sizeHint')}</p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {sizes.map((z) => (
                <button
                  key={z.value}
                  type="button"
                  aria-pressed={s.text === z.value}
                  onClick={() => update({ text: z.value })}
                  className={choice(s.text === z.value)}
                >
                  <span className={'block font-bold ' + z.cls} aria-hidden="true">
                    Aa
                  </span>
                  <span className="block text-sm">{z.label}</span>
                </button>
              ))}
            </div>
            <p className="mt-5 text-lg font-semibold text-forest">{t('settings.contrast')}</p>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <button
                type="button"
                aria-pressed={!s.contrast}
                onClick={() => update({ contrast: false })}
                className={choice(!s.contrast)}
              >
                {t('settings.off')}
              </button>
              <button
                type="button"
                aria-pressed={s.contrast}
                onClick={() => update({ contrast: true })}
                className={choice(s.contrast)}
              >
                {t('settings.on')}
              </button>
            </div>
          </section>

          <section className={card} aria-labelledby="what-title">
            <h2 id="what-title" className="text-xl font-bold text-forest">
              {t('welcome.whatTitle')}
            </h2>
            <ul className="mt-4 grid gap-5">
              <Row Icon={Search} title={t('home.find.title')} body={t('home.find.desc')} />
              <Row Icon={ShieldCheck} title={t('home.check.title')} body={t('home.check.desc')} />
              <Row Icon={Calculator} title={t('home.inherit.title')} body={t('home.inherit.desc')} />
              <Row Icon={ClipboardList} title={t('home.track.title')} body={t('home.track.desc')} />
            </ul>
          </section>

          <section className={card} aria-labelledby="move-title">
            <h2 id="move-title" className="text-xl font-bold text-forest">
              {t('welcome.moveTitle')}
            </h2>
            <ul className="mt-4 grid gap-5">
              <Row Icon={Globe} title={t('header.language')} body={t('tip.language')} />
              <Row Icon={HelpCircle} title={t('header.help')} body={t('tip.help')} />
              <Row Icon={GearIcon} title={t('header.settings')} body={t('tip.settings')} />
              <Row
                Icon={HomeIcon}
                title={t('welcome.bottomBar.title')}
                body={t('welcome.bottomBar.body')}
              />
            </ul>
            <p className="mt-5 rounded-xl bg-cream p-3 text-ink/90">{t('welcome.holdTip')}</p>
          </section>

          <p className="mt-5 text-ink/80">{t('welcome.laterNote')}</p>

          <div className="sticky bottom-0 mt-6 border-t border-line bg-paper/95 py-4 backdrop-blur">
            <button
              type="button"
              onClick={go}
              className={
                'min-h-[56px] w-full rounded-2xl bg-forest px-4 text-lg font-semibold text-white shadow-md transition active:scale-[0.99] focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-forest ' +
                (active === 1 ? 'ring-4 ring-forest/40 ring-offset-2' : '')
              }
            >
              {t('welcome.start')}
            </button>
          </div>
        </div>

        <AudioMenu
          options={options}
          onActive={setActive}
          announce={t('spoken.announce.welcome')}
          className="sticky top-4 h-[calc(100svh-2rem)]"
        />
      </div>
    </main>
  )
}