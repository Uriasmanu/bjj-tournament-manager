"use client"

import { useState, useEffect, useRef } from "react"

interface ScoreboardTimerProps {
  onTimeEnd?: () => void
}

export function ScoreboardTimer({ onTimeEnd }: ScoreboardTimerProps) {
  const [seconds, setSeconds] = useState(300)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const isWarning = seconds <= 10 && seconds > 0
  const isFinished = seconds === 0

  useEffect(() => {
    if (isRunning && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            setIsRunning(false)
            onTimeEnd?.()
            return 0
          }
          return s - 1
        })
      }, 1000)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, seconds, onTimeEnd])

  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setSeconds(300)
  }

  const setTime = (value: number) => {
    setIsRunning(false)
    setSeconds(value)
  }

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60)
    const sec = s % 60
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`
  }

  return (
    <div className="flex flex-col items-center">
      <div className="text-xs text-white uppercase font-bold mb-1">Tempo Restante</div>
      <div
        className={`text-8xl font-black font-mono leading-none mb-2 ${
          isWarning ? "text-red-500" : "text-green-500"
        } ${isFinished ? "text-gray-500" : ""}`}
      >
        {formatTime(seconds)}
      </div>
      <div className="flex gap-2 w-full">
        <button
          onClick={toggleTimer}
          className="flex-1 bg-white text-black font-bold py-1 rounded text-sm uppercase"
        >
          {isRunning ? "Parar" : "Iniciar"}
        </button>
        <button
          onClick={resetTimer}
          className="bg-red-600 text-white font-bold py-1 px-3 rounded text-sm uppercase"
        >
          Reiniciar
        </button>
      </div>
      <select
        onChange={(e) => setTime(Number(e.target.value))}
        className="mt-2 bg-gray-800 text-white text-[10px] w-full p-1 rounded"
        defaultValue="300"
      >
        <option value="120">2 Minutos</option>
        <option value="300">5 Minutos</option>
        <option value="360">6 Minutos</option>
        <option value="600">10 Minutos</option>
      </select>
    </div>
  )
}