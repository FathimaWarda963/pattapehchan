import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronRight } from 'lucide-react'
import { getSaved } from '../storage'
import { searchRecords } from '../data/records'

const examples = ['Perera', 'Lot 12', 'Selvam']

export default function Search() {
  const { t } = useTranslation()
  const country = getSaved('pp-country')
  const [query, setQuery] = useState('')
  const [submitted, setSubmitted] = useState(null)

  if (!country) return <Navigate to="/" replace />

  const run = (value) => {
    setQuery(value)
    setSubmitted(value)
  }

  const onSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) setSubmitted(query)
  }

  const results = submitted === null ? [] : searchRecords(country, submitted)

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-forest">{t('search.title')}</h1>

      {country !== 'lk' && (
        <p className="mt-4 rounded-2xl border border-line bg-paper p-4 text-ink/90">
          {t('search.pkNotice')}
        </p>
      )}

      <form onSubmit={onSubmit} className="mt-6">
        <label htmlFor="q" className="block text-lg font-semibold text-forest">
          {t('search.label')}
        </label>
        <input
          id="q"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('search.placeholder')}
          autoComplete="off"
          className="mt-2 w-full min-h-[56px] rounded-2xl border-2 border-line bg-paper px-4 text-lg focus:border-forest focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-forest"
        />
        <button
          type="submit"
          disabled={!query.trim()}
          className="mt-4 w-full min-h-[56px] rounded-2xl bg-forest px-4 text-lg font-semibold text-white shadow-md transition active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-ink/30 disabled:shadow-none focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-forest"
        >
          {t('search.button')}
        </button>
      </form>

      <div className="mt-5">
        <p className="text-ink/80">{t('search.tryThese')}</p>
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
          {results.length === 0 ? (
            <p className="rounded-2xl border border-line bg-paper p-4">{t('search.noResults')}</p>
          ) : (
            <ul className="grid gap-3">
              {results.map((r) => (
                <li key={r.id}>
                  <Link
                    to={`/record/${r.id}`}
                    className="flex items-center gap-3 min-h-[76px] rounded-2xl border border-line bg-paper p-4 shadow-md transition hover:border-forest hover:shadow-lg focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-forest"
                  >
                    <span className="flex-1">
                      <span className="block text-lg font-bold text-forest">{r.ownerName}</span>
                      <span className="block text-ink/80">
                        {r.plotNumber} · {r.perches} {t('record.perches')} · {r.place}
                      </span>
                    </span>
                    <ChevronRight className="shrink-0 text-forest rtl:rotate-180" size={24} aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <p className="mt-8 text-sm text-ink/70">{t('search.sampleNote')}</p>
    </div>
  )
}