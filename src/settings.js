import { getSaved, save } from './storage'

const KEY = 'pp-settings'

export const defaults = { text: 'normal', contrast: false, audio: false }

export const loadSettings = () => {
  try {
    return { ...defaults, ...JSON.parse(getSaved(KEY) || '{}') }
  } catch {
    return defaults
  }
}

export const saveSettings = (s) => save(KEY, JSON.stringify(s))

// Puts the choices on the page so the CSS can react to them
export const applySettings = (s = loadSettings()) => {
  const root = document.documentElement
  root.dataset.text = s.text
  root.dataset.contrast = s.contrast ? 'high' : 'normal'
}