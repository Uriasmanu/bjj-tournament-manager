"use client"

import { useState, useEffect, useCallback } from "react"
import { Play, Pause, RotateCcw, Settings } from "lucide-react"

interface TimerProps {
  initialMinutes?: number
  initialSeconds?: number
  onTimeEnd?: () => void
}

export function Timer({ initialMinutes = 5, initialSeconds = 0, onTimeEnd }: TimerProps) {
  const [minutes, setMinutes] = useState(initialMinutes)
  const [seconds, setSeconds] = useState(initialSeconds)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isWarning, setIsWarning] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [configMinutes, setConfigMinutes] = useState(initialMinutes)
  const [configSeconds, setConfigSeconds] = useState(initialSeconds)

  const totalSeconds = minutes * 60 + seconds
  const isEnded = totalSeconds === 0

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRunning && !isPaused && totalSeconds > 0) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            setIsRunning(false)
            onTimeEnd?.()
          } else {
            setMinutes((m) => m - 1)
            setSeconds(59)
          }
        } else {
          setSeconds((s) => s - 1)
        }
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isRunning, isPaused, seconds, minutes, totalSeconds, onTimeEnd])

  useEffect(() => {
    setIsWarning(totalSeconds <= 30 && totalSeconds > 0)
  }, [totalSeconds])

  const handleStart = () => {
    setIsRunning(true)
    setIsPaused(false)
  }

  const handlePause = () => {
    setIsPaused(true)
  }

  const handleResume = () => {
    setIsPaused(false)
  }

  const handleReset = () => {
    setIsRunning(false)
    setIsPaused(false)
    setMinutes(initialMinutes)
    setSeconds(initialSeconds)
    setIsWarning(false)
  }

  const handleApplySettings = () => {
    setMinutes(configMinutes)
    setSeconds(configSeconds)
    setIsRunning(false)
    setIsPaused(false)
    setIsWarning(false)
    setShowSettings(false)
  }

  const formatTime = (value: number) => value.toString().padStart(2, "0")

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Timer Display */}
      <div
        className={`
          relative text-8xl md:text-9xl font-bold font-mono tabular-nums
          ${isWarning ? "text-red-500 animate-pulse" : "text-white"}
          ${isEnded ? "text-gray-500" : ""}
        `}
      >
        {formatTime(minutes)}:{formatTime(seconds)}
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        {!isRunning ? (
          <button
            onClick={handleStart}
            disabled={isEnded}
            className="flex items-center gap-2 bg-[#4338CA] hover:bg-[#5a47e8] disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <Play className="w-5 h-5" />
            Iniciar
          </button>
        ) : isPaused ? (
          <button
            onClick={handleResume}
            className="flex items-center gap-2 bg-[#4338CA] hover:bg-[#5a47e8] text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <Play className="w-5 h-5" />
            Continuar
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#f0c844] text-black px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <Pause className="w-5 h-5" />
            Pausar
          </button>
        )}

        <button
          onClick={handleReset}
          className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
          Reiniciar
        </button>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-white font-semibold mb-4">Configurar Tempo</h3>
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <label className="text-gray-400 text-sm mb-1">Minutos</label>
              <input
                type="number"
                min="0"
                max="59"
                value={configMinutes}
                onChange={(e) => setConfigMinutes(Number(e.target.value))}
                className="bg-gray-700 text-white px-4 py-2 rounded border border-gray-600 w-20"
              />
            </div>
            <span className="text-white text-2xl">:</span>
            <div className="flex flex-col">
              <label className="text-gray-400 text-sm mb-1">Segundos</label>
              <input
                type="number"
                min="0"
                max="59"
                value={configSeconds}
                onChange={(e) => setConfigSeconds(Number(e.target.value))}
                className="bg-gray-700 text-white px-4 py-2 rounded border border-gray-600 w-20"
              />
            </div>
          </div>
          <button
            onClick={handleApplySettings}
            className="mt-4 w-full bg-[#4338CA] hover:bg-[#5a47e8] text-white px-4 py-2 rounded font-semibold transition-colors"
          >
            Aplicar
          </button>
        </div>
      )}

      {/* Status */}
      <div className="flex gap-4 text-sm">
        {isRunning && !isPaused && (
          <span className="text-green-400 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Cronômetro em execução
          </span>
        )}
        {isPaused && (
          <span className="text-yellow-400 flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-400 rounded-full" />
            Cronômetro pausado
          </span>
        )}
        {isEnded && (
          <span className="text-red-400">Tempo encerrado!</span>
        )}
      </div>
    </div>
  )
}