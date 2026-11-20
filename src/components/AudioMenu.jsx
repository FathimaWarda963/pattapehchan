import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Volume2 } from 'lucide-react'
import { languages } from '../languages'
import { listen, stopAll } from '../audio'
import { loadSettings, saveSettings, applySettings } from '../settings'

const HOLD_MS = 700

const buzz = (ms) => {
  try {
    if (navigator.vibrate) navigator.vibrate(ms)
  } catch {
    /* vibration not supported */
  }
}

// options: [{ id, text, hint?, lang?, clip?, onChoose }]
// Tap = hear the next option. Press and hold = choose the option you just heard.
export default function AudioMenu({ options, onActive, announce, gate = false, className = '' }) {
  const { t, i18n } = useTranslation()
  const [index, setIndex] = useState(-1)
  const [problem, setProblem] = useState(null)
  const timer = useRef(null)
  const held = useRef(false)
  const lang = i18n.language

  // Say a short orientation when the screen opens (only when the page asks for it)
  useEffect(() => {
    if (!announce) return
    listen({ pieces: [announce], lang, rate: 0.9, onEnd: () => {}, onProblem: () => {} })
  }, [announce, lang])

  useEffect(
    () => () => {
      clearTimeout(timer.current)
      stopAll()
    },
    [],
  )

  const speakOption = (i) => {
    const o = options[i]
    const optionLang = o.lang || lang
    setProblem(null)
    listen({
      clipUrl: o.clip,
      pieces: [`${o.text}. ${o.hint || t('spoken.hold')}`],
      lang: optionLang,
      rate: 0.9,
      onEnd: () => {},
      onProblem: () => setProblem(optionLang),
    })
  }

  const step = () => {
    if (options.length === 0) return
    const i = (index + 1) % options.length
    setIndex(i)
    if (onActive) onActive(i)
    buzz(40)
    speakOption(i)
  }

  // Choosing with the audio helper means the person wants audio, so keep it on
  const keepAudioOn = () => {
    const s = loadSettings()
    if (!s.audio) {
      const next = { ...s, audio: true }
      saveSettings(next)
      applySettings(next)
    }
  }

  const choose = () => {
    if (index < 0) {
      step()
      return
    }
    buzz(150)
    keepAudioOn()
    options[index].onChoose()
  }

  const down = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    held.current = false
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      held.current = true
      choose()
    }, HOLD_MS)
  }
  const up = () => {
    clearTimeout(timer.current)
    if (!held.current) step()
    held.current = false
  }
  const cancel = () => {
    clearTimeout(timer.current)
    held.current = false
  }

  // Keyboard and screen readers: Enter = next option, Shift+Enter = choose
  const click = (e) => {
    if (e.detail === 0) step()
  }
  const key = (e) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault()
      choose()
    }
  }

  const problemName = languages.find((l) => l.code === problem)?.name ?? ''

  return (
    <div className={'w-24 shrink-0 ' + className} data-no-read>
      <button
        type="button"
        aria-label={gate ? languages.map((l) => l.listen).join(' / ') : t('spoken.stripHelp')}
        onPointerDown={down}
        onPointerUp={up}
        onPointerLeave={cancel}
        onPointerCancel={cancel}
        onClick={click}
        onKeyDown={key}
        onContextMenu={(e) => e.preventDefault()}
        className="flex h-full min-h-[240px] w-full touch-manipulation select-none flex-col items-center justify-center gap-4 rounded-3xl border-4 border-forest bg-forest px-1 text-white shadow-xl transition [-webkit-touch-callout:none] active:bg-forest-dark focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-gold"
      >
        <Volume2 size={48} aria-hidden="true" />
        {gate ? (
          <span className="flex flex-col items-center gap-1 text-center text-sm font-bold leading-tight">
            {languages.map((l) => (
              <span key={l.code} lang={l.code}>
                {l.listen}
              </span>
            ))}
          </span>
        ) : (
          <span className="text-base font-bold">{t('spoken.listen')}</span>
        )}
      </button>

      {problem && (
        <p
          role="alert"
          className="fixed inset-x-4 bottom-4 z-30 mx-auto max-w-lg rounded-xl border-2 border-forest bg-paper p-4 text-ink shadow-xl"
        >
          {t('spoken.noVoice', { language: problemName })}
        </p>
      )}
    </div>
  )
}