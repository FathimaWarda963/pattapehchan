import { useEffect, useState } from 'react'

export const rates = { slow: 0.75, normal: 1, fast: 1.25 }

const synth =
  typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null

const FALLBACK_LANG = { en: 'en-US', ur: 'ur-PK', si: 'si-LK', ta: 'ta-IN' }

let session = 0 // changes every time audio is stopped, so old callbacks are ignored
let current = null // the clip playing right now

const base = (tag) => (tag || '').toLowerCase().replace('_', '-').split('-')[0]
const voiceFor = (lang) => (synth ? synth.getVoices().find((v) => base(v.lang) === lang) : undefined)

// Each sentence has a clip named after a short code made from its text.
// tools/make-audio.py uses the same recipe, so the two always agree.
const normalize = (text) =>
  text.replace(/\s+/g, ' ').trim().replace(/[.!?۔।]+$/u, '').trim()
const encoder = new TextEncoder()
export function clipKey(lang, text) {
  let h = 0x811c9dc5
  for (const byte of encoder.encode(`${lang}|${normalize(text)}`)) {
    h ^= byte
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h.toString(16).padStart(8, '0')
}
const clipPath = (lang, text) => `/audio/${lang}/${clipKey(lang, text)}.mp3`

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
  if (current) {
    current.onended = null
    current.onerror = null
    current.pause()
    current = null
  }
  if (synth) synth.cancel()
}

// Resolves true if the clip played to the end, false if it is missing or cannot play
function playClip(url, rate) {
  return new Promise((resolve) => {
    const a = new Audio(url)
    a.playbackRate = rate
    current = a
    let settled = false
    const finish = (ok) => {
      if (settled) return
      settled = true
      if (current === a) current = null
      resolve(ok)
    }
    a.onended = () => finish(true)
    a.onerror = () => finish(false)
    a.play().catch(() => finish(false))
  })
}

// Resolves 'ok', 'stopped', 'no-voice' or 'error'
function speakChunk(text, lang, rate) {
  return new Promise((resolve) => {
    const voice = voiceFor(lang)
    const u = new SpeechSynthesisUtterance(text)
    u.lang = voice ? voice.lang : FALLBACK_LANG[lang] || lang
    if (voice) u.voice = voice
    u.rate = rate
    u.onend = () => resolve('ok')
    u.onerror = (e) => {
      if (e.error === 'interrupted' || e.error === 'canceled') resolve('stopped')
      else resolve(e.error === 'language-unavailable' ? 'no-voice' : 'error')
    }
    synth.speak(u)
  })
}

// Reads the pieces aloud, one sentence at a time. For each sentence it plays the
// prepared clip if there is one, and otherwise uses the phone's voice.
// clipUrl (optional) is a recording of the whole text, tried first.
export function listen({ clipUrl, pieces, lang, rate = 1, onEnd, onProblem }) {
  stopAll()
  const my = session
  const live = () => session === my
  const chunks = toChunks(pieces)

  ;(async () => {
    if (clipUrl) {
      const ok = await playClip(clipUrl, rate)
      if (!live()) return
      if (ok) {
        onEnd()
        return
      }
    }

    let problem = null
    for (const text of chunks) {
      if (!live()) return
      const played = await playClip(clipPath(lang, text), rate)
      if (!live()) return
      if (played) continue

      // No prepared clip for this sentence: use the phone's voice
      if (!synth) {
        problem = 'unsupported'
        break
      }
      const voices = synth.getVoices()
      if (lang !== 'en' && voices.length > 0 && !voiceFor(lang)) {
        problem = 'no-voice'
        break
      }
      const result = await speakChunk(text, lang, rate)
      if (!live() || result === 'stopped') return
      if (result !== 'ok') {
        problem = result
        break
      }
    }

    if (!live()) return
    if (problem) onProblem(problem)
    else onEnd()
  })()
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
  timer = setTimeout(done, 5000)
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