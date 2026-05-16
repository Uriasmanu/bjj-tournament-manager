import { useRef, useCallback } from "react"

export function useScoreSound() {
  const audioCtxRef = useRef<AudioContext | null>(null)

  const playScoreSound = useCallback((isIncrement: boolean) => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      audioCtxRef.current = new AudioCtx()
    }
    const ctx = audioCtxRef.current
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = "sine"
    osc.frequency.value = isIncrement ? 800 : 400
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.1)
    osc.stop(ctx.currentTime + 0.1)
  }, [])

  return { playScoreSound }
}