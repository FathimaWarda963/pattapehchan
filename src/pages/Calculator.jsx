import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronRight, Minus, Plus, AlertTriangle, RotateCcw } from 'lucide-react'
import { getSaved } from '../storage'
import Stepper from '../components/Stepper'
import { lawsByCountry, laws } from '../data/inheritance/rulesets'
import { toNumber, show } from '../data/inheritance/engine'

const initial = {
  spouse: null,
  children: 0,
  childDied: null,
  otherRelatives: null,
  gender: null,
  husband: null,
  wives: 0,
  sons: 0,
  daughters: 0,
  father: null,
  mother: null,
  siblings: null,
}

const btnBase =
  'min-h-[56px] rounded-2xl border px-4 text-lg font-semibold transition focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-forest '

function Pick({ legend, options, current, onChange }) {
  return (
    <fieldset className="mt-6">
      <legend className="text-lg font-semibold text-forest">{legend}</legend>
      <div className="mt-2 grid grid-cols-2 gap-3">
        {options.map((o) => (
          <button
            key={String(o.value)}
            type="button"
            aria-pressed={current === o.value}
            onClick={() => onChange(o.value)}
            className={
              btnBase +
              (current === o.value
                ? 'border-forest bg-forest text-white shadow-md'
                : 'border-line bg-paper text-forest hover:border-forest')
            }
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

function Counter({ legend, count, onChange, max = 12 }) {
  const { t } = useTranslation()
  const btn =
    'flex h-14 w-14 items-center justify-center rounded-2xl border border-line bg-paper text-forest disabled:opacity-40 focus-visible:outline-4 focus-visible:outline-forest'
  return (
    <div className="mt-6" role="group" aria-label={legend}>
      <p className="text-lg font-semibold text-forest">{legend}</p>
      <div className="mt-2 flex items-center gap-5">
        <button
          type="button"
          className={btn}
          aria-label={t('calc.less')}
          disabled={count <= 0}
          onClick={() => onChange(count - 1)}
        >
          <Minus size={24} aria-hidden="true" />
        </button>
        <output className="min-w-[3rem] text-center text-3xl font-bold text-forest" aria-live="polite">
          {count}
        </output>
        <button
          type="button"
          className={btn}
          aria-label={t('calc.more')}
          disabled={count >= max}
          onClick={() => onChange(count + 1)}
        >
          <Plus size={24} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

const ready = (law, f) => {
  if (law.form === 'spouseChildren') {
    if (f.spouse === null || f.childDied === null) return false
    if (f.children === 0 && f.spouse && f.otherRelatives === null) return false
    return true
  }
  if (law.form === 'islamic') {
    if (!f.gender || f.father === null || f.mother === null || f.childDied === null) return false
    if (f.gender === 'female' && f.husband === null) return false
    if (f.sons === 0 && f.siblings === null) return false
    return true
  }
  return true
}

const fmt = (n) => Number(n.toFixed(2)).toLocaleString('en-US')

function Notice({ children }) {
  return (
    <p className="mt-5 flex gap-3 rounded-2xl border border-line bg-paper p-4 text-ink/90">
      <AlertTriangle className="shrink-0 text-gold" size={24} aria-hidden="true" />
      <span>{children}</span>
    </p>
  )
}

function Result({ lawId, form, size, country }) {
  const { t } = useTranslation()
  const law = laws[lawId]
  const basis = law.basis ? <p className="mt-4 text-sm text-ink/70">{t('calc.basis', { basis: law.basis })}</p> : null
  const disclaimer = (
    <p className="mt-6 rounded-2xl border border-line bg-paper p-4 text-sm text-ink/80">
      {t('calc.disclaimer')}
    </p>
  )

  // Laws we do not calculate: explain what decides the shares
  if (!law.form) {
    const points = t(`calc.laws.${lawId}.points`, { returnObjects: true })
    return (
      <div>
        <h2 className="text-2xl font-bold text-forest">{t('calc.explain.title')}</h2>
        <p className="mt-3 text-lg text-ink/80">{t('calc.explain.intro')}</p>
        <section className="mt-5 rounded-2xl border border-line bg-paper p-5 shadow-md">
          <h3 className="text-xl font-bold text-forest">{t('calc.explain.pointsTitle')}</h3>
          <ul className="mt-3 grid list-disc gap-3 ps-6">
            {(Array.isArray(points) ? points : []).map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </section>
        {basis}
        <p className="mt-4 font-semibold text-forest">{t('calc.review.advice')}</p>
        {disclaimer}
      </div>
    )
  }

  const result = law.run(form)

  if (result.status === 'review') {
    return (
      <div>
        <h2 className="text-2xl font-bold text-forest">{t('calc.review.title')}</h2>
        <Notice>{t(`calc.review.${result.reason}`)}</Notice>
        <p className="mt-4 font-semibold text-forest">{t('calc.review.advice')}</p>
        {disclaimer}
      </div>
    )
  }

  const unit = t(`calc.units.${country}`)
  const sizeNum = parseFloat(String(size).replace(',', '.'))
  const hasSize = Number.isFinite(sizeNum) && sizeNum > 0

  return (
    <div>
      {!law.reviewed && (
        <p className="rounded-xl bg-gold/15 px-4 py-3 text-sm font-semibold text-ink">
          {t('calc.draft')}
        </p>
      )}

      <ul className="mt-5 grid gap-4">
        {result.rows.map((r) => {
          const eachPct = Number((toNumber(r.each) * 100).toFixed(2))
          const totalPct = Number((toNumber(r.total) * 100).toFixed(2))
          return (
            <li key={r.id} className="rounded-2xl border border-line bg-paper p-5 shadow-md">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-xl font-bold text-forest">
                  {t(`calc.people.${r.id}`)}
                  {r.count > 1 && <span dir="ltr"> × {r.count}</span>}
                </h3>
                <p className="text-xl font-bold text-forest">
                  <span dir="ltr">{show(r.each)}</span>{' '}
                  <span className="text-base font-semibold text-ink/80">
                    (<span dir="ltr">{eachPct}%</span>)
                    {r.count > 1 && ` ${t('calc.each')}`}
                  </span>
                </p>
              </div>
              <div
                className="mt-3 h-3 w-full overflow-hidden rounded-full bg-line"
                role="img"
                aria-label={`${totalPct}%`}
              >
                <div className="h-full rounded-full bg-forest" style={{ width: `${totalPct}%` }} />
              </div>
              {hasSize && (
                <p className="mt-3 font-semibold">
                  {t('calc.portion', { amount: fmt(sizeNum * toNumber(r.each)), unit })}
                  {r.count > 1 && ` (${t('calc.each')})`}
                </p>
              )}
              <p className="mt-2 text-ink/90">{t(`calc.r.${r.reason}`, r.params)}</p>
            </li>
          )
        })}
      </ul>

      {result.notes.includes('awl') && <Notice>{t('calc.awl')}</Notice>}
      {basis}
      {disclaimer}
    </div>
  )
}

export default function Calculator() {
  const { t } = useTranslation()
  const country = getSaved('pp-country')
  const [step, setStep] = useState(1)
  const [lawId, setLawId] = useState(null)
  const [form, setForm] = useState(initial)
  const [size, setSize] = useState('')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [step])

  if (!country) return <Navigate to="/" replace />

  const law = lawId ? laws[lawId] : null
  const set = (patch) => setForm((f) => ({ ...f, ...patch }))
  const yesNo = [
    { value: true, label: t('calc.yes') },
    { value: false, label: t('calc.no') },
  ]
  const labels = [t('calc.stepLaw'), t('calc.stepFamily'), t('calc.stepResult')]

  const chooseLaw = (id) => {
    setLawId(id)
    setForm(initial)
    setStep(laws[id].form ? 2 : 3)
  }
  const restart = () => {
    setLawId(null)
    setForm(initial)
    setSize('')
    setStep(1)
  }
  const goBack = () => setStep(step === 3 && !law.form ? 1 : step - 1)

  const backButton = (
    <button
      type="button"
      onClick={goBack}
      className="mt-4 min-h-[56px] w-full rounded-2xl border border-line bg-paper px-4 text-lg font-semibold text-forest focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-forest"
    >
      {t('back')}
    </button>
  )

  return (
    <div>
      <Stepper step={step} labels={labels} />

      {step === 1 && (
        <section>
          <h1 className="font-display mt-6 text-3xl font-bold text-forest">{t('calc.lawTitle')}</h1>
          <p className="mt-3 text-ink/80">{t('calc.lawHint')}</p>
          <ul className="mt-6 grid gap-3">
            {lawsByCountry[country].map((id) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => chooseLaw(id)}
                  className="flex min-h-[76px] w-full items-center gap-3 rounded-2xl border border-line bg-paper p-4 text-start shadow-md transition hover:border-forest hover:shadow-lg focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-forest"
                >
                  <span className="flex-1">
                    <span className="block text-lg font-bold text-forest">
                      {t(`calc.laws.${id}.title`)}
                    </span>
                    <span className="block text-ink/80">{t(`calc.laws.${id}.desc`)}</span>
                  </span>
                  <ChevronRight className="shrink-0 text-forest rtl:rotate-180" size={24} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {step === 2 && law && (
        <section>
          <h1 className="font-display mt-6 text-3xl font-bold text-forest">{t('calc.familyTitle')}</h1>
          <p className="mt-2 text-ink/80">{t('calc.familyHint')}</p>

          {law.form === 'spouseChildren' && (
            <>
              <Pick legend={t('calc.q.spouse')} options={yesNo} current={form.spouse} onChange={(v) => set({ spouse: v })} />
              <Counter legend={t('calc.q.children')} count={form.children} onChange={(v) => set({ children: v })} />
              <Pick legend={t('calc.q.childDied')} options={yesNo} current={form.childDied} onChange={(v) => set({ childDied: v })} />
              {form.children === 0 && form.spouse && (
                <Pick
                  legend={t('calc.q.otherRelatives')}
                  options={yesNo}
                  current={form.otherRelatives}
                  onChange={(v) => set({ otherRelatives: v })}
                />
              )}
            </>
          )}

          {law.form === 'islamic' && (
            <>
              <Pick
                legend={t('calc.q.gender')}
                options={[
                  { value: 'male', label: t('calc.gender.male') },
                  { value: 'female', label: t('calc.gender.female') },
                ]}
                current={form.gender}
                onChange={(v) => set({ gender: v })}
              />
              {form.gender === 'female' && (
                <Pick legend={t('calc.q.husband')} options={yesNo} current={form.husband} onChange={(v) => set({ husband: v })} />
              )}
              {form.gender === 'male' && (
                <Counter legend={t('calc.q.wives')} count={form.wives} max={4} onChange={(v) => set({ wives: v })} />
              )}
              <Counter legend={t('calc.q.sons')} count={form.sons} onChange={(v) => set({ sons: v })} />
              <Counter legend={t('calc.q.daughters')} count={form.daughters} onChange={(v) => set({ daughters: v })} />
              <Pick legend={t('calc.q.father')} options={yesNo} current={form.father} onChange={(v) => set({ father: v })} />
              <Pick legend={t('calc.q.mother')} options={yesNo} current={form.mother} onChange={(v) => set({ mother: v })} />
              <Pick legend={t('calc.q.childDied')} options={yesNo} current={form.childDied} onChange={(v) => set({ childDied: v })} />
              {form.sons === 0 && (
                <Pick legend={t('calc.q.siblings')} options={yesNo} current={form.siblings} onChange={(v) => set({ siblings: v })} />
              )}
            </>
          )}

          <div className="mt-8">
            <label htmlFor="size" className="block text-lg font-semibold text-forest">
              {t('calc.size.label')} ({t(`calc.units.${country}`)})
            </label>
            <input
              id="size"
              type="text"
              inputMode="decimal"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="mt-2 w-full min-h-[56px] rounded-2xl border-2 border-line bg-paper px-4 text-lg focus:border-forest focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-forest"
            />
            <p className="mt-2 text-sm text-ink/70">{t('calc.size.hint')}</p>
          </div>

          <button
            type="button"
            disabled={!ready(law, form)}
            onClick={() => setStep(3)}
            className="mt-8 min-h-[56px] w-full rounded-2xl bg-forest px-4 text-lg font-semibold text-white shadow-md transition active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-ink/30 disabled:shadow-none focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-forest"
          >
            {t('calc.continue')}
          </button>
          {backButton}
        </section>
      )}

      {step === 3 && law && (
        <section>
          <h1 className="font-display mt-6 text-3xl font-bold text-forest">{t('calc.resultTitle')}</h1>
          <Result lawId={lawId} form={form} size={size} country={country} />
          {backButton}
          <button
            type="button"
            onClick={restart}
            className="mt-3 inline-flex min-h-[56px] w-full items-center justify-center gap-2 rounded-2xl border border-line bg-paper px-4 text-lg font-semibold text-forest focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-forest"
          >
            <RotateCcw size={20} aria-hidden="true" />
            {t('calc.startOver')}
          </button>
        </section>
      )}
    </div>
  )
}