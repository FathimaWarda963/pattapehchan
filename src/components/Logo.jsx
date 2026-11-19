export default function Logo({ compact = false }) {
  const size = compact ? 40 : 48
  return (
    <div className="flex items-center gap-3">
      <svg width={size} height={size} viewBox="0 0 44 44" aria-hidden="true">
        <rect width="44" height="44" rx="12" fill="#1f4d3a" />
        <polygon
          points="10,17 27,9 35,24 17,34"
          fill="none"
          stroke="#f3e3b8"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <circle cx="22" cy="21" r="3.2" fill="#d9a441" />
      </svg>
      <span
        className={
          compact
            ? 'hidden min-[420px]:inline font-serif text-xl font-bold text-forest'
            : 'font-serif text-2xl font-bold text-forest'
        }
      >
        PattaPehchan
      </span>
    </div>
  )
}