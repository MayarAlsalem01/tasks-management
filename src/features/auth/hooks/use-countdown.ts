"use client"

import { useEffect, useState } from "react"

/** Counts down from `seconds` once per second; restarts whenever `seconds` changes. */
export function useCountdown(seconds: number | null) {
  const [countdown, setCountdown] = useState({ from: seconds, left: seconds ?? 0 })
  if (countdown.from !== seconds) {
    setCountdown({ from: seconds, left: seconds ?? 0 })
  }

  useEffect(() => {
    if (!seconds) return
    const id = setInterval(() => {
      setCountdown((c) => ({ ...c, left: Math.max(0, c.left - 1) }))
    }, 1000)
    return () => clearInterval(id)
  }, [seconds])

  return countdown.from === seconds ? countdown.left : (seconds ?? 0)
}
