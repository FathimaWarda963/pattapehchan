import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { languages } from '../languages'
import { save } from '../storage'
import Logo from '../components/Logo'

export default function LanguageGate() {
  const { i18n } = useTranslation()
  const navigate = useNavigate()

  const choose = (code) => {
    i18n.changeLanguage(code)
    save('pp-lang', code)
    navigate('/country')
  }

  return (
    <main dir="ltr" className="min-h-screen flex flex-col items-center px-4 py-10">
      <Logo />

      <div className="mt-8 text-center text-ink/80">
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

      <div className="mt-8 w-full max-w-md grid gap-4">
        {languages.map((l) => (
          <button
            key={l.code}
            type="button"
            lang={l.code}
            onClick={() => choose(l.code)}
            style={{ fontFamily: l.font }}
            className="w-full min-h-[76px] rounded-2xl bg-paper border border-line shadow-md px-6 py-4 text-2xl font-semibold text-forest leading-loose transition hover:border-forest hover:shadow-lg active:scale-[0.99] focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-forest"
          >
            {l.name}
          </button>
        ))}
      </div>
    </main>
  )
}