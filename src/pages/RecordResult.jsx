import { Link, Navigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { getSaved } from '../storage'
import { getRecord } from '../data/records'

const directions = ['north', 'east', 'south', 'west']
const SQFT_PER_PERCH = 272.25

function Card({ title, children }) {
  return (
    <section className="mt-5 rounded-2xl border border-line bg-paper p-5 shadow-md">
      <h2 className="text-xl font-bold text-forest">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  )
}

export default function RecordResult() {
  const { id } = useParams()
  const { t } = useTranslation()
  const country = getSaved('pp-country')

  if (!country) return <Navigate to="/" replace />
  const record = getRecord(country, id)

  const back = (
    <Link
      to="/search"
      className="inline-flex items-center gap-2 min-h-[44px] rounded-lg px-1 font-semibold text-forest focus-visible:outline-4 focus-visible:outline-forest"
    >
      <ArrowLeft className="rtl:rotate-180" size={22} aria-hidden="true" />
      {t('record.back')}
    </Link>
  )

  if (!record) {
    return (
      <div>
        {back}
        <p className="mt-4">{t('record.notFound')}</p>
      </div>
    )
  }

  const sqft = Math.round(record.perches * SQFT_PER_PERCH).toLocaleString('en-US')
  const roadSides = directions
    .filter((d) => record.boundaries[d].type === 'road')
    .map((d) => t('record.' + d))
  const hasOpenDispute = record.history.some((h) => h.type === 'dispute' && h.open)

  return (
    <div>
      {back}

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl font-bold text-forest">{record.ownerName}</h1>
        <span className="rounded-full bg-gold/15 px-3 py-1 text-sm font-semibold text-ink">
          {t('record.sample')}
        </span>
      </div>

      <Card title={t('record.deed')}>
        <dl className="grid gap-3">
          <div>
            <dt className="text-sm text-ink/70">{t('record.plot')}</dt>
            <dd className="text-lg font-semibold">{record.plotNumber}</dd>
          </div>
          <div>
            <dt className="text-sm text-ink/70">{t('record.deed')}</dt>
            <dd className="text-lg font-semibold">{record.deedNumber}</dd>
          </div>
          <div>
            <dt className="text-sm text-ink/70">{t('record.place')}</dt>
            <dd className="text-lg font-semibold">{record.place}</dd>
          </div>
          <div>
            <dt className="text-sm text-ink/70">{t('record.extent')}</dt>
            <dd className="text-lg font-semibold">
              {record.perches} {t('record.perches')} ({sqft} {t('record.sqft')})
            </dd>
          </div>
        </dl>
      </Card>

      <Card title={t('record.boundaries')}>
        <ul className="grid gap-3">
          {directions.map((d) => (
            <li key={d} className="flex items-baseline gap-3">
              <span className="w-24 shrink-0 font-bold text-forest">{t('record.' + d)}</span>
              <span>
                {t('record.' + record.boundaries[d].type)}: {record.boundaries[d].name}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 rounded-xl bg-cream p-3 font-semibold">
          <span className="text-forest">{t('record.roadAccess')}: </span>
          {roadSides.length > 0
            ? t('record.roadOn', { sides: roadSides.join(', ') })
            : t('record.noRoad')}
        </p>
      </Card>

      <Card title={t('record.history')}>
        <ol className="ms-2 border-s-2 border-line">
          {record.history.map((h, i) => (
            <li key={i} className="relative ps-6 pb-6 last:pb-0">
              <span
                className={
                  'absolute -start-[9px] top-1 h-4 w-4 rounded-full border-2 border-paper ' +
                  (h.type === 'dispute' ? 'bg-red-700' : 'bg-forest')
                }
                aria-hidden="true"
              />
              <p className="text-lg font-bold text-forest">
                {h.year} · {t('record.' + h.type)}
              </p>
              {h.from && (
                <p className="text-ink/90">
                  {t('record.from')}: {h.from}
                </p>
              )}
              {h.to && (
                <p className="text-ink/90">
                  {t('record.to')}: {h.to}
                </p>
              )}
              {h.open && (
                <span className="mt-1 inline-block rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-900">
                  {t('record.open')}
                </span>
              )}
            </li>
          ))}
        </ol>
      </Card>

      <Card title={t('record.attention')}>
        {hasOpenDispute ? (
          <p className="flex gap-3 text-red-900">
            <AlertTriangle className="shrink-0" size={24} aria-hidden="true" />
            <span className="font-semibold">{t('record.attentionOpen')}</span>
          </p>
        ) : (
          <p className="flex gap-3">
            <CheckCircle2 className="shrink-0 text-forest" size={24} aria-hidden="true" />
            <span>{t('record.allClear')}</span>
          </p>
        )}
      </Card>

      <p className="mt-6 rounded-2xl border border-line bg-paper p-4 text-sm text-ink/80">
        {t('record.disclaimer')}
      </p>
    </div>
  )
}