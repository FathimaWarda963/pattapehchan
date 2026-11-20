import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import { save } from '../storage'
import { loadSettings } from '../settings'
import { speakThen } from '../audio'
import Logo from '../components/Logo'
import AudioMenu from '../components/AudioMenu'

const countries = [
  { code: 'pk', labelKey: 'country.pk' },
  { code: 'lk', labelKey: 'country.lk' },
]

export default function CountryStep() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [audioOn] = useState(() => loadSettings().audio)
  const [active, setActive] = useState(-1)
  const dir = i18n.language === 'ur' ? 'rtl' : 'ltr'

  const choose = (code) => {
    save('pp-country', code)
    navigate('/home')
  }

  const options = countries.map((c) => ({
    id: c.code,
    text: t(c.labelKey),
    onChoose: () => {
      save('pp-country', c.code)
      speakThen({
        text: t('spoken.selected', { name: t(c.labelKey) }),
        lang: i18n.language,
        then: () => navigate('/home'),
      })
    },
  }))

  return (
    <main className="min-h-screen px-4 py-6">
      <div dir="ltr" className="mx-auto flex max-w-lg items-start gap-3">
        <div dir={dir} className="flex min-w-0 flex-1 flex-col items-center">
          <div className="w-full">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg px-2 font-semibold text-forest focus-visible:outline-4 focus-visible:outline-forest"
            >
              <ArrowLeft className="rtl:rotate-180" size={22} aria-hidden="true" />
              {t('back')}
            </button>
          </div>

          <div className="mt-4">
            <Logo />
          </div>

          <h1 className="font-display mt-8 text-center text-3xl font-bold text-forest">
            {t('country.title')}
          </h1>
          <p className="mt-3 text-center text-ink/80">{t('country.hint')}</p>

          <div className="mt-8 grid w-full gap-4">
            {countries.map((c, i) => (
              <button
                key={c.code}
                type="button"
                onClick={() => choose(c.code)}
                className={
                  'flex min-h-[76px] w-full items-center justify-between rounded-2xl border bg-paper px-5 py-4 text-xl font-semibold text-forest shadow-md transition hover:border-forest hover:shadow-lg active:scale-[0.99] focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-forest ' +
                  (active === i ? 'border-forest ring-4 ring-forest/40' : 'border-line')
                }
              >
                <span>{t(c.labelKey)}</span>
                <ChevronRight className="rtl:rotate-180" size={24} aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>

        {audioOn && (
          <AudioMenu
            options={options}
            onActive={setActive}
            announce={t('spoken.announce.country')}
            className="sticky top-4 h-[calc(100svh-2rem)]"
          />
        )}
      </div>
    </main>
  )
}