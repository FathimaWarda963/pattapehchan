export default function Logo() {
  return (
    <div className="flex items-center gap-3">
      <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden="true">
        <circle cx="22" cy="22" r="22" fill="#1f4d3a" />
        <path d="M9 17 Q22 10 35 17" stroke="#f3e3b8" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M9 24 Q22 17 35 24" stroke="#f3e3b8" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M9 31 Q22 24 35 31" stroke="#f3e3b8" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </svg>
      <span className="font-serif text-2xl font-bold text-forest">PattaPehchan</span>
    </div>
  )
}