import { useTranslation } from 'react-i18next'

export default function Stepper({ step, labels }) {
  const { t } = useTranslation()
  const text = t('calc.stepOf', { n: step, total: labels.length })

  return (
    <nav aria-label={text}>
      <p className="text-sm font-semibold text-ink/80">{text}</p>
      <ol className="mt-2 flex gap-2">
        {labels.map((label, i) => {
          const n = i + 1
          const current = n === step
          return (
            <li key={label} className="flex-1" aria-current={current ? 'step' : undefined}>
              <div className={'h-2 rounded-full ' + (n <= step ? 'bg-forest' : 'bg-line')} />
              <span
                className={
                  'mt-1 block text-sm ' + (current ? 'font-bold text-forest' : 'text-ink/70')
                }
              >
                {label}
              </span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}