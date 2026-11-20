import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { RotateCcw, BookOpen } from 'lucide-react'
import { loadSettings, saveSettings, applySettings, defaults } from '../settings'

function Switch({ label, description, checked, onChange, onText, offText }) {
  return (
    <div className="mt-5 flex items-center gap-4 rounded-2xl border border-line bg-paper p-5 shadow-md">
      <div className="flex-1">
        <p id={label} className="text-lg font-bold text-forest">
          {label}
        </p>
        <p className="mt-1 text-ink/80">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={label}
        onClick={() => onChange(!checked)}
        className={
          'min-h-[48px] min-w-[84px] rounded-full border-2 px-4 text-base font-bold transition focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-forest ' +
          (checked ? 'border-forest bg-forest text-white' : 'border-line bg-cream text-ink')
        }
      >
        {checked ? onText : offText}
      </button>
    </div>
  )
}

export default function Settings() {
  const { t } = useTranslation()
  const [settings, setSettings] = useState(loadSettings)

  const update = (patch) => {
    const next = { ...settings, ...patch }
    setSettings(next)
    saveSettings(next)
    applySettings(next)
  }

  const sizes = [
    { value: 'normal', label: t('settings.normal') },
    { value: 'large', label: t('settings.large') },
    { value: 'xlarge', label: t('settings.xlarge') },
  ]

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-forest">{t('header.settings')}</h1>
      <p className="mt-3 text-lg text-ink/80">{t('settings.intro')}</p>

      <fieldset className="mt-6 rounded-2xl border border-line bg-paper p-5 shadow-md">
        <legend className="px-1 text-lg font-bold text-forest">{t('settings.textSize')}</legend>
        <div className="mt-2 grid grid-cols-3 gap-3">
          {sizes.map((s) => (
            <button
              key={s.value}
              type="button"
              aria-pressed={settings.text === s.value}
              onClick={() => update({ text: s.value })}
              className={
                'min-h-[56px] rounded-2xl border px-2 text-base font-semibold transition focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-forest ' +
                (settings.text === s.value
                  ? 'border-forest bg-forest text-white shadow-md'
                  : 'border-line bg-cream text-forest hover:border-forest')
              }
            >
              {s.label}
            </button>
          ))}
        </div>
        <p className="mt-4 rounded-xl bg-cream p-3">{t('settings.preview')}</p>
      </fieldset>

      <Switch
        label={t('settings.contrast')}
        description={t('settings.contrastDesc')}
        checked={settings.contrast}
        onChange={(v) => update({ contrast: v })}
        onText={t('settings.on')}
        offText={t('settings.off')}
      />

      <Switch
        label={t('settings.audio')}
        description={t('settings.audioDesc')}
        checked={settings.audio}
        onChange={(v) => update({ audio: v })}
        onText={t('settings.on')}
        offText={t('settings.off')}
      />

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => update(defaults)}
          className="inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-line bg-paper px-4 font-semibold text-forest focus-visible:outline-4 focus-visible:outline-forest"
        >
          <RotateCcw size={20} aria-hidden="true" />
          {t('settings.reset')}
        </button>
        <Link
          to="/welcome"
          className="inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-line bg-paper px-4 font-semibold text-forest focus-visible:outline-4 focus-visible:outline-forest"
        >
          <BookOpen size={20} aria-hidden="true" />
          {t('welcome.reopen')}
        </Link>
      </div>
    </div>
  )
}