import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, Clock, Circle, AlertTriangle } from 'lucide-react'
import applications from '../data/applications.json'

const stages = ['received', 'review', 'verified', 'complete']
const examples = ['PP-1001', 'PP-1002', 'PP-1003']

export default function Track() {
  const { t, i18n } = useTranslation()
  const [query, setQuery] = useState('')
  const [submitted, setSubmitted] = useState(null)

  const run = (value) => {
    setQuery(value)
    setSubmitted(value)
  }

  const onSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) setSubmitted(query)
  }

  const app =
    submitted === null ? null : applications.find((a) => a.id === submitted.trim().toUpperCase())

  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleDateString(i18n.language, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    } catch {
      return iso
    }
  }

  const stateOf = (n, app) => {
    if (n < app.stage) return 'done'
    if (n === app.stage) return app.stage === stages.length ? 'done' : 'current'
    return 'upcoming'
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-forest">{t('home.track.title')}</h1>
      <p className="mt-3 text-lg text-ink/80">{t('track.intro')}</p>

      <form onSubmit={onSubmit} className="mt-6">
        <label htmlFor="appId" className="block text-lg font-semibold text-forest">
          {t('track.label')}
        </label>
        <input
          id="appId"
          type="text"
          dir="ltr"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('track.placeholder')}
          autoComplete="off"
          autoCapitalize="characters"
          className="mt-2 w-full min-h-[56px] rounded-2xl border-2 border-line bg-paper px-4 text-lg focus:border-forest focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-forest"
        />
        <button
          type="submit"
          disabled={!query.trim()}
          className="mt-4 w-full min-h-[56px] rounded-2xl bg-forest px-4 text-lg font-semibold text-white shadow-md transition active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-ink/30 disabled:shadow-none focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-forest"
        >
          {t('track.button')}
        </button>
      </form>

      <div className="mt-5">
        <p className="text-ink/80">{t('track.tryThese')}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {examples.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => run(ex)}
              className="min-h-[44px] rounded-full border border-line bg-paper px-4 font-semibold text-forest hover:border-forest focus-visible:outline-4 focus-visible:outline-forest"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {submitted !== null && (
        <div className="mt-6" aria-live="polite">
          {!app ? (
            <p className="rounded-2xl border border-line bg-paper p-4">{t('track.notFound')}</p>
          ) : (
            <section className="rounded-2xl border border-line bg-paper p-5 shadow-md">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-bold text-forest" dir="ltr">
                  {app.id}
                </h2>
                <span className="rounded-full bg-gold/15 px-3 py-1 text-sm font-semibold text-ink">
                  {t('track.sample')}
                </span>
              </div>
              <p className="mt-1 text-ink/80">{t(`track.type.${app.type}`)}</p>

              {app.actionNeeded && (
                <p className="mt-4 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-900">
                  <AlertTriangle className="shrink-0" size={24} aria-hidden="true" />
                  <span>
                    <span className="block font-bold">{t('track.actionTitle')}</span>
                    {t(`track.action${app.actionNeeded[0].toUpperCase()}${app.actionNeeded.slice(1)}`)}
                  </span>
                </p>
              )}

              <ol className="ms-3 mt-6 border-s-2 border-line">
                {stages.map((s, i) => {
                  const n = i + 1
                  const state = stateOf(n, app)
                  const Icon = state === 'done' ? CheckCircle2 : state === 'current' ? Clock : Circle
                  return (
                    <li key={s} className="relative pb-7 ps-8 last:pb-0">
                      <span className="absolute -start-[15px] top-0 rounded-full bg-paper">
                        <Icon
                          size={28}
                          aria-hidden="true"
                          className={state === 'upcoming' ? 'text-ink/50' : 'text-forest'}
                        />
                      </span>
                      <p className="flex flex-wrap items-center gap-2 text-lg font-bold text-forest">
                        {t(`track.stage.${s}`)}
                        <span
                          className={
                            'rounded-full px-3 py-0.5 text-sm font-semibold ' +
                            (state === 'current'
                              ? 'bg-forest text-white'
                              : 'bg-cream text-ink/80')
                          }
                        >
                          {t(`track.state.${state}`)}
                        </span>
                      </p>
                      <p className="text-ink/90">{t(`track.stageDesc.${s}`)}</p>
                      {app.dates[i] && (
                        <p className="text-sm text-ink/70">{formatDate(app.dates[i])}</p>
                      )}
                    </li>
                  )
                })}
              </ol>

              <p className="mt-6 rounded-xl bg-cream p-3 font-semibold text-forest">
                {app.stage === stages.length
                  ? t('track.etaDone')
                  : t('track.eta', { days: app.etaDays })}
              </p>
            </section>
          )}
        </div>
      )}

      <p className="mt-6 text-sm text-ink/70">{t('track.sampleNote')}</p>
      <p className="mt-2 rounded-2xl border border-line bg-paper p-4 text-sm text-ink/80">
        {t('track.disclaimer')}
      </p>
    </div>
  )
}