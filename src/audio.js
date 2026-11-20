import { useEffect, useState } from 'react'

export const rates = { slow: 0.75, normal: 1, fast: 1.25 }

const synth =
  typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null

const FALLBACK_LANG = { en: 'en-US', ur: 'ur-PK', si: 'si-LK', ta: 'ta-IN' }

let session = 0 // changes every time audio is stopped, so old callbacks are ignored
let clip = null

const base = (tag) => (tag || '').toLowerCase().replace('_', '-').split('-')[0]
const voiceFor = (lang) => (synth ? synth.getVoices().find((v) => base(v.lang) === lang) : undefined)

// Collects the readable text of a page, skipping icons and anything marked data-no-read
export function collectText(root) {
  if (!root) return []
  const pieces = []
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const el = node.parentElement
      if (!el || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT
      if (el.closest('[aria-hidden="true"],[data-no-read],script,style')) {
        return NodeFilter.FILTER_REJECT
      }
      return NodeFilter.FILTER_ACCEPT
    },
  })
  while (walker.nextNode()) pieces.push(walker.currentNode.nodeValue.trim())
  return pieces
}

// Short sentences are more reliable than one long block
const toChunks = (pieces) => {
  const out = []
  pieces.forEach((p) => {
    p.split(/(?<=[.!?۔।])\s+/).forEach((s) => {
      if (s.trim()) out.push(s.trim())
    })
  })
  return out
}

export function stopAll() {
  session += 1
  if (clip) {
    clip.onended = null
    clip.onerror = null
    clip.pause()
    clip = null
  }
  if (synth) synth.cancel()
}

// Plays a recorded clip if there is one, otherwise reads the text with the phone's voice
export function listen({ clipUrl, pieces, lang, rate = 1, onEnd, onProblem }) {
  stopAll()
  const my = session
  const live = () => session === my

  const speak = () => {
    if (!live()) return
    if (!synth) {
      onProblem('unsupported')
      return
    }
    const voices = synth.getVoices()
    const voice = voiceFor(lang)
    if (lang !== 'en' && voices.length > 0 && !voice) {
      onProblem('no-voice')
      return
    }
    const chunks = toChunks(pieces)
    if (chunks.length === 0) {
      onEnd()
      return
    }
    chunks.forEach((text, i) => {
      const u = new SpeechSynthesisUtterance(text)
      u.lang = voice ? voice.lang : FALLBACK_LANG[lang] || lang
      if (voice) u.voice = voice
      u.rate = rate
      if (i === chunks.length - 1) u.onend = () => live() && onEnd()
      u.onerror = (e) => {
        if (!live() || e.error === 'interrupted' || e.error === 'canceled') return
        stopAll()
        onProblem(e.error === 'language-unavailable' ? 'no-voice' : 'error')
      }
      synth.speak(u)
    })
  }

  if (!clipUrl) {
    speak()
    return
  }

  let fellBack = false
  const fallBack = () => {
    if (fellBack || !live()) return
    fellBack = true
    clip = null
    speak()
  }
  const a = new Audio(clipUrl)
  a.playbackRate = rate
  a.onended = () => live() && onEnd()
  a.onerror = fallBack
  clip = a
  a.play().catch(fallBack)
}

// Says one phrase, then runs `then`. It still runs `then` if nothing can be spoken.
export function speakThen({ clipUrl, text, lang, rate = 0.9, then }) {
  let moved = false
  let timer
  const done = () => {
    if (moved) return
    moved = true
    clearTimeout(timer)
    then()
  }
  timer = setTimeout(done, 4000)
  listen({ clipUrl, pieces: [text], lang, rate, onEnd: done, onProblem: done })
}

// Tells us whether this device has a voice for the language
export function useVoiceStatus(lang) {
  const [status, setStatus] = useState('checking')
  useEffect(() => {
    if (!synth) {
      setStatus('unsupported')
      return undefined
    }
    const check = () => {
      const voices = synth.getVoices()
      if (voices.length === 0) return false
      setStatus(voices.some((v) => base(v.lang) === lang) ? 'yes' : 'no')
      return true
    }
    if (!check()) setStatus('checking')
    const onChange = () => check()
    synth.addEventListener('voiceschanged', onChange)
    const timer = setTimeout(() => {
      if (!check()) setStatus('unknown')
    }, 1500)
    return () => {
      synth.removeEventListener('voiceschanged', onChange)
      clearTimeout(timer)
    }
  }, [lang])
  return status
}