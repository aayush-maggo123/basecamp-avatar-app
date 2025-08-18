"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Play, Pause, Square, Flame, Zap, Clock, Target, ArrowLeft } from "lucide-react"
import { useGamification } from "@/hooks/use-gamification"

interface FocusModeProps {
  onBack: () => void
}

type TimerState = "idle" | "running" | "paused" | "completed"
type SessionType = "focus" | "short-break" | "long-break"

const SESSION_DURATIONS = {
  focus: 25 * 60, // 25 minutes
  "short-break": 5 * 60, // 5 minutes
  "long-break": 15 * 60, // 15 minutes
}

const AVATAR_QUOTES = {
  focus: [
    "When we hit our lowest point, we are open to the greatest change. - Aang",
    "It's time to look inward and start asking yourself the big questions. - Iroh",
    "Life happens wherever you are, whether you make it or not. - Iroh",
    "Sometimes the best way to solve your own problems is to help someone else. - Iroh",
  ],
  break: [
    "Take time to rest. The mind needs peace to grow stronger. - Iroh",
    "A moment of rest is not wasted time, but preparation for what's ahead. - Toph",
    "Even the Avatar needs time to recharge. - Katara",
    "Balance is not something you find, it's something you create. - Jana",
  ],
}

export function FocusMode({ onBack }: FocusModeProps) {
  const [sessionType, setSessionType] = useState<SessionType>("focus")
  const [timeLeft, setTimeLeft] = useState(SESSION_DURATIONS.focus)
  const [timerState, setTimerState] = useState<TimerState>("idle")
  const [sessionsCompleted, setSessionsCompleted] = useState(0)
  const [currentQuote, setCurrentQuote] = useState(AVATAR_QUOTES.focus[0])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const { completeFocusSession } = useGamification()

  useEffect(() => {
    if (timerState === "running") {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setTimerState("completed")
            if (sessionType === "focus") {
              setSessionsCompleted((prev) => prev + 1)
              completeFocusSession(25)
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [timerState, sessionType, completeFocusSession])

  useEffect(() => {
    // Update quote when session type changes
    const quotes = sessionType === "focus" ? AVATAR_QUOTES.focus : AVATAR_QUOTES.break
    setCurrentQuote(quotes[Math.floor(Math.random() * quotes.length)])
  }, [sessionType])

  const startTimer = () => {
    setTimerState("running")
  }

  const pauseTimer = () => {
    setTimerState("paused")
  }

  const stopTimer = () => {
    setTimerState("idle")
    setTimeLeft(SESSION_DURATIONS[sessionType])
  }

  const switchSession = (newType: SessionType) => {
    setSessionType(newType)
    setTimeLeft(SESSION_DURATIONS[newType])
    setTimerState("idle")
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getProgressPercentage = () => {
    const totalTime = SESSION_DURATIONS[sessionType]
    return ((totalTime - timeLeft) / totalTime) * 100
  }

  const getSessionColor = () => {
    switch (sessionType) {
      case "focus":
        return "from-orange-500 to-red-500"
      case "short-break":
        return "from-blue-500 to-cyan-500"
      case "long-break":
        return "from-green-500 to-emerald-500"
    }
  }

  const getSessionIcon = () => {
    switch (sessionType) {
      case "focus":
        return <Flame className="h-6 w-6" />
      case "short-break":
        return <Clock className="h-6 w-6" />
      case "long-break":
        return <Target className="h-6 w-6" />
    }
  }

  const getXPReward = () => {
    switch (sessionType) {
      case "focus":
        return 50
      case "short-break":
        return 10
      case "long-break":
        return 25
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Focus Mode</h1>
          <p className="text-slate-600 dark:text-slate-400">Enter the Avatar State of productivity</p>
        </div>
      </div>

      {/* Session Type Selector */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex gap-2 mb-4">
            <Button
              variant={sessionType === "focus" ? "default" : "outline"}
              size="sm"
              onClick={() => switchSession("focus")}
              className={sessionType === "focus" ? "bg-orange-600 hover:bg-orange-700" : ""}
            >
              <Flame className="h-4 w-4 mr-1" />
              Focus (25m)
            </Button>
            <Button
              variant={sessionType === "short-break" ? "default" : "outline"}
              size="sm"
              onClick={() => switchSession("short-break")}
              className={sessionType === "short-break" ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              <Clock className="h-4 w-4 mr-1" />
              Short Break (5m)
            </Button>
            <Button
              variant={sessionType === "long-break" ? "default" : "outline"}
              size="sm"
              onClick={() => switchSession("long-break")}
              className={sessionType === "long-break" ? "bg-green-600 hover:bg-green-700" : ""}
            >
              <Target className="h-4 w-4 mr-1" />
              Long Break (15m)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Timer */}
      <Card className={`mb-6 bg-gradient-to-br ${getSessionColor()} text-white border-0`}>
        <CardHeader>
          <CardTitle className="text-center text-xl font-semibold capitalize">
            {sessionType.replace("-", " ")} Session
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">{getSessionIcon()}</div>
            <div className="text-6xl font-bold font-mono mb-4">{formatTime(timeLeft)}</div>
            <Progress value={getProgressPercentage()} className="h-2 bg-white/20" />
          </div>

          {/* Timer Controls */}
          <div className="flex justify-center gap-3">
            {timerState === "idle" || timerState === "paused" ? (
              <Button
                onClick={startTimer}
                size="lg"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <Play className="h-5 w-5 mr-2" />
                {timerState === "paused" ? "Resume" : "Start"}
              </Button>
            ) : (
              <Button
                onClick={pauseTimer}
                size="lg"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <Pause className="h-5 w-5 mr-2" />
                Pause
              </Button>
            )}
            {timerState !== "idle" && (
              <Button
                onClick={stopTimer}
                size="lg"
                variant="outline"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <Square className="h-5 w-5 mr-2" />
                Stop
              </Button>
            )}
          </div>

          {timerState === "completed" && (
            <div className="mt-6 p-4 bg-white/20 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Session Complete!</h3>
              <div className="flex items-center justify-center gap-2">
                <Zap className="h-5 w-5" />
                <span>+{getXPReward()} XP earned</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{sessionsCompleted}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Focus Sessions Today</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{sessionsCompleted * 25}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Minutes Focused</div>
          </CardContent>
        </Card>
      </div>

      {/* Inspirational Quote */}
      <Card>
        <CardContent className="p-6 text-center">
          <blockquote className="text-lg italic text-slate-700 dark:text-slate-300 mb-2">"{currentQuote}"</blockquote>
          <Badge
            variant="secondary"
            className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
          >
            Avatar Wisdom
          </Badge>
        </CardContent>
      </Card>
    </div>
  )
}
