import { useEffect, useId, useRef, useState } from 'react'

// Shows a large explanation card for an icon.
// Opens on mouse hover, keyboard focus, or a half-second press-and-hold on touch.
// Press Escape to close it.
export default function HoverTip({ Icon, title, body, children }) {
  const id = useId()
  const wrap = useRef(null)
  const press = useRef({ timer: null, hide: null, long: false })
  const [open, setOpen] = useState(false)
  const [top, setTop] = useState(80)

  const show = () => {
    if (wrap.current) setTop(wrap.current.getBoundingClientRect().bottom + 8)
    setOpen(true)
  }
  const hide = () => setOpen(false)

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  useEffect(() => {
    const p = press.current
    return () => {
      clearTimeout(p.timer)
      clearTimeout(p.hide)
    }
  }, [])

  const touchStart = () => {
    press.current.long = false
    clearTimeout(press.current.timer)
    press.current.timer = setTimeout(() => {
      press.current.long = true
      show()
      clearTimeout(press.current.hide)
      press.current.hide = setTimeout(hide, 5000)
    }, 500)
  }
  const touchCancel = () => clearTimeout(press.current.timer)

  // After a long press, swallow the click so the page does not open
  const clickCapture = (e) => {
    if (press.current.long) {
      e.preventDefault()
      e.stopPropagation()
      press.current.long = false
    } else {
      hide()
    }
  }

  const onFocus = (e) => {
    try {
      if (e.target.matches(':focus-visible')) show()
    } catch {
      show()
    }
  }

  return (
    <div
      ref={wrap}
      onPointerEnter={(e) => e.pointerType === 'mouse' && show()}
      onPointerLeave={(e) => e.pointerType === 'mouse' && hide()}
      onFocus={onFocus}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) hide()
      }}
      onTouchStart={touchStart}
      onTouchEnd={touchCancel}
      onTouchMove={touchCancel}
      onTouchCancel={touchCancel}
      onClickCapture={clickCapture}
      onContextMenu={(e) => {
        if (press.current.long) e.preventDefault()
      }}
    >
      {children(id)}
      <div
        id={id}
        role="tooltip"
        style={{ top }}
        className={
          (open ? 'block' : 'hidden') +
          ' fixed inset-x-4 z-30 mx-auto max-w-sm rounded-2xl border-2 border-forest bg-paper p-5 text-start shadow-xl'
        }
      >
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-forest text-white">
            <Icon size={40} aria-hidden="true" />
          </span>
          <p className="text-2xl font-bold text-forest">{title}</p>
        </div>
        <p className="mt-3 text-base text-ink/90">{body}</p>
      </div>
    </div>
  )
}