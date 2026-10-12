// A short two-note chime synthesized with Web Audio, so there's no audio file to ship.
const NOTES = [
  { frequency: 880, offset: 0 },
  { frequency: 1320, offset: 0.12 },
]
const VOLUME = 0.15
const NOTE_LENGTH = 0.35
// Tabs receive the same event within moments of each other; holding the lock this long
// makes the others skip it instead of ringing in chorus.
const LOCK_HOLD_MS = 2000

let context: AudioContext | undefined

function ring() {
  // Browsers block audio until the user has interacted with the page; skip until then.
  if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return
  context ??= new AudioContext()
  void context.resume()
  const start = context.currentTime
  for (const { frequency, offset } of NOTES) {
    const oscillator = new OscillatorNode(context, { type: "sine", frequency })
    const gain = new GainNode(context, { gain: 0 })
    const t = start + offset
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(VOLUME, t + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + NOTE_LENGTH)
    oscillator.connect(gain).connect(context.destination)
    oscillator.start(t)
    oscillator.stop(t + NOTE_LENGTH + 0.05)
  }
}

/**
 * Plays a short notification chime in the browser. When several tabs get the same event,
 * only the first to take a Web Lock plays it. Does nothing before the user has interacted
 * with the page, because browsers block autoplaying audio.
 */
export function playChime() {
  if (!navigator.locks) return ring()
  void navigator.locks.request("chime", { ifAvailable: true }, async (lock) => {
    if (!lock) return
    ring()
    await new Promise((resolve) => setTimeout(resolve, LOCK_HOLD_MS))
  })
}
