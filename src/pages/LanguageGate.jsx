import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { languages } from '../languages'
import { getSaved, save } from '../storage'
import { speakThen } from '../audio'
import Logo from '../components/Logo'
import AudioMenu from '../components/AudioMenu'

export default function LanguageGate() {
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const [active, setActive] = useState(-1)

  // First visit: show the welcome guide. Returning visitors skip it.
  const go = () => navigate(getSaved('pp-welcomed') ? '/country' : '/welcome')

  const pick = (code) => {
    i18n.changeLanguage(code)
    save('pp-lang', code)
  }

  // Touch or click on a card
  const choose = (code) => {
    pick(code)
    go()
  }

  // Chosen with the audio helper: say it out loud first, then move on
  const options = languages.map((l) => ({
    id: l.code,
    text: l.name,
    hint: l.hold,
    lang: l.code,
    clip: `/audio/gate/${l.code}.mp3`,
    onChoose: () => {
      pick(l.code)
      speakThen({ text: l.chosen, lang: l.code, then: go })
    },
  }))

  return (
    <main dir="ltr" className="min-h-screen px-4 py-6">
      <div className="mx-auto flex max-w-lg items-start gap-3">
        <div className="flex min-w-0 flex-1 flex-col items-center">
          <Logo />

          <div className="mt-6 text-center text-ink/80">
            {languages.map((l) => (
              <p
                key={l.code}
                lang={l.code}
                dir={l.dir}
                style={{ fontFamily: l.font }}
                className="text-base leading-loose"
              >
                {l.prompt}
              </p>
            ))}
          </div>

          <div className="mt-6 grid w-full gap-4">
            {languages.map((l, i) => (
              <button
                key={l.code}
                type="button"
                lang={l.code}
                onClick={() => choose(l.code)}
                style={{ fontFamily: l.font }}
                className={
                  'w-full min-h-[76px] rounded-2xl bg-paper border px-4 py-4 text-2xl font-semibold text-forest leading-loose shadow-md transition hover:border-forest hover:shadow-lg active:scale-[0.99] focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-forest ' +
                  (active === i ? 'border-forest ring-4 ring-forest/40' : 'border-line')
                }
              >
                {l.name}
              </button>
            ))}
          </div>
        </div>

        <AudioMenu
          gate
          options={options}
          onActive={setActive}
          className="sticky top-4 h-[calc(100svh-2rem)]"
        />
      </div>
    </main>
  )
}