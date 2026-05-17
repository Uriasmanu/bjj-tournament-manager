"use client"

import { useState, useEffect, useRef } from "react"

interface ScoreboardTimerProps {
  onTimeEnd?: () => void
  onReset?: () => void
  onTimeUpdate?: (elapsedSeconds: number) => void
}

export function ScoreboardTimer({ onTimeEnd, onReset, onTimeUpdate }: ScoreboardTimerProps) {
  const [seconds, setSeconds] = useState(300)
  const [isRunning, setIsRunning] = useState(false)
  const [showManualInput, setShowManualInput] = useState(false)
  const [manualMin, setManualMin] = useState(5)
  const [manualSec, setManualSec] = useState(0)
  const [initialTime, setInitialTime] = useState(300)
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

  useEffect(() => {
    const elapsed = initialTime - seconds
    onTimeUpdate?.(elapsed)
  }, [seconds, initialTime, onTimeUpdate])

  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  const handleReset = () => {
    setIsRunning(false)
    setSeconds(300)
    setInitialTime(300)
    onReset?.()
  }

  const applyManualTime = () => {
    const totalSeconds = (manualMin * 60) + manualSec
    setSeconds(totalSeconds)
    setInitialTime(totalSeconds)
    setIsRunning(false)
    setShowManualInput(false)
  }

  const setTime = (value: number) => {
    setIsRunning(false)
    setSeconds(value)
    setInitialTime(value)
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
          onClick={handleReset}
          className="bg-red-600 text-white font-bold py-1 px-3 rounded text-sm uppercase"
        >
          Reiniciar
        </button>
      </div>

      <select
        onChange={(e) => setTime(Number(e.target.value))}
        className="mt-2 bg-gray-800 text-white text-[10px] w-full p-1 rounded"
        value={seconds}
      >
        <option value="120">2 Minutos</option>
        <option value="300">5 Minutos</option>
        <option value="360">6 Minutos</option>
        <option value="600">10 Minutos</option>
      </select>

      <button
        onClick={() => setShowManualInput(!showManualInput)}
        className="mt-1 text-[10px] text-gray-400 hover:text-white underline"
      >
        {showManualInput ? "Fechar" : "Definir tempo manualmente"}
      </button>

      {showManualInput && (
        <div className="mt-2 flex items-center gap-1 bg-gray-800 p-2 rounded">
          <input
            type="number"
            min="0"
            max="59"
            value={manualMin}
            onChange={(e) => setManualMin(Number(e.target.value))}
            className="w-12 bg-gray-700 text-white text-center text-sm rounded p-1"
            placeholder="Min"
          />
          <span className="text-white">:</span>
          <input
            type="number"
            min="0"
            max="59"
            value={manualSec}
            onChange={(e) => setManualSec(Number(e.target.value))}
            className="w-12 bg-gray-700 text-white text-center text-sm rounded p-1"
            placeholder="Seg"
          />
          <button
            onClick={applyManualTime}
            className="bg-[#4338CA] text-white text-xs px-2 py-1 rounded ml-1"
          >
            OK
          </button>
        </div>
      )}
    </div>
  )
}