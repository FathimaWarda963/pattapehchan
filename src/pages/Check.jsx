import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronDown, CheckCircle2, RotateCcw } from 'lucide-react'
import { getSaved, save } from '../storage'

const ids = ['seller', 'deed', 'boundaries', 'road', 'history', 'verify', 'forgery', 'legal', 'lawyer']

const storageKey = (country) => `pp-check-${country}`

const load = (country) => {
  try {
    const parsed = JSON.parse(getSaved(storageKey(country)) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export default function Check() {
  const { t } = useTranslation()
  const country = getSaved('pp-country')
  const [done, setDone] = useState(() => load(country))

  if (!country) return <Navigate to="/" replace />

  const toggle = (id) => {
    const next = done.includes(id) ? done.filter((x) => x !== id) : [...done, id]
    setDone(next)
    save(storageKey(country), JSON.stringify(next))
  }

  const reset = () => {
    setDone([])
    save(storageKey(country), '[]')
  }

  const percent = Math.round((done.length / ids.length) * 100)

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-forest">{t('home.check.title')}</h1>

      {country !== 'lk' ? (
        <p className="mt-4 rounded-2xl border border-line bg-paper p-4 text-ink/90">
          {t('check.pkNotice')}
        </p>
      ) : (
        <>
          <p className="mt-3 text-lg text-ink/80">{t('check.intro')}</p>

          <div className="mt-5">
            <p className="font-semibold text-forest" aria-live="polite">
              {t('check.progress', { done: done.length, total: ids.length })}
            </p>
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={ids.length}
              aria-valuenow={done.length}
              className="mt-2 h-3 w-full overflow-hidden rounded-full bg-line"
            >
              <div
                className="h-full rounded-full bg-forest transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          <ol className="mt-6 grid gap-3">
            {ids.map((id, i) => {
              const checked = done.includes(id)
              return (
                <li
                  key={id}
                  className={
                    'rounded-2xl border bg-paper p-4 shadow-md ' +
                    (checked ? 'border-forest' : 'border-line')
                  }
                >
                  <label className="flex min-h-[44px] cursor-pointer items-start gap-4">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(id)}
                      className="mt-1 h-7 w-7 shrink-0 accent-[#1f4d3a]"
                    />
                    <span className="flex-1 text-lg font-bold text-forest">
                      {i + 1}. {t(`check.items.${id}.title`)}
                    </span>
                  </label>

                  <details className="group mt-2 ms-11">
                    <summary className="flex min-h-[44px] cursor-pointer list-none items-center gap-2 font-semibold text-ink/80 focus-visible:outline-4 focus-visible:outline-forest">
                      <ChevronDown
                        size={20}
                        aria-hidden="true"
                        className="transition group-open:rotate-180"
                      />
                      {t('check.details')}
                    </summary>
                    <p className="pb-2 text-ink/90">{t(`check.items.${id}.detail`)}</p>
                  </details>
                </li>
              )
            })}
          </ol>

          {done.length === ids.length && (
            <p className="mt-6 flex gap-3 rounded-2xl border border-forest bg-paper p-4 font-semibold text-forest">
              <CheckCircle2 className="shrink-0" size={24} aria-hidden="true" />
              <span>{t('check.allDone')}</span>
            </p>
          )}

          <button
            type="button"
            onClick={reset}
            disabled={done.length === 0}
            className="mt-6 inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-line bg-paper px-4 font-semibold text-forest disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-4 focus-visible:outline-forest"
          >
            <RotateCcw size={20} aria-hidden="true" />
            {t('check.reset')}
          </button>

          <p className="mt-6 rounded-2xl border border-line bg-paper p-4 text-sm text-ink/80">
            {t('check.disclaimer')}
          </p>
        </>
      )}
    </div>
  )
}