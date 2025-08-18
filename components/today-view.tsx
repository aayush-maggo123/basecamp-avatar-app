"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Clock, Flame, Zap, Target, Plus, Focus, User, Trophy, BarChart3, Database } from "lucide-react"
import { FocusMode } from "./focus-mode"
import { ProfileModal } from "./profile-modal"
import { AnalyticsDashboard } from "./analytics-dashboard"
import { SyncSettings } from "./sync-settings"
import { QuickTaskModal } from "./quick-task-modal"
import { useGamification } from "@/hooks/use-gamification"
import { useBasecampSync } from "@/hooks/use-basecamp-sync"

interface Task {
  id: number
  title: string
  project: string
  completed: boolean
  xp: number
  notes?: string
  dueDate?: Date
}

// Mock data - will be replaced with real data from Supabase
const initialMockTasks: Task[] = [
  { id: 1, title: "Review project proposals", project: "Fire Nation Campaign", completed: false, xp: 25 },
  { id: 2, title: "Update team on progress", project: "Air Temple Restoration", completed: false, xp: 15 },
  { id: 3, title: "Prepare presentation slides", project: "Water Tribe Alliance", completed: true, xp: 30 },
  { id: 4, title: "Schedule client meeting", project: "Earth Kingdom Trade", completed: false, xp: 20 },
]

export function TodayView() {
  const [tasks, setTasks] = useState<Task[]>(initialMockTasks)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showFocusMode, setShowFocusMode] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [showSyncSettings, setShowSyncSettings] = useState(false)

  const { stats, achievements, getLevelTitle, completeTask, addXp, getXpProgress, getXpForNextLevel } =
    useGamification()
  const { syncStatus } = useBasecampSync()

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const toggleTask = (taskId: number) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === taskId && !task.completed) {
          completeTask()
          return { ...task, completed: true }
        }
        return task
      }),
    )
  }

  const handleTaskCreate = (newTaskData: Omit<Task, "id" | "completed">) => {
    const newTask: Task = {
      ...newTaskData,
      id: Math.max(...tasks.map((t) => t.id), 0) + 1,
      completed: false,
    }

    setTasks((prev) => [newTask, ...prev])

    // Award XP for creating a task
    addXp(5, "Quest created")
  }

  const completedTasks = tasks.filter((task) => task.completed).length
  const totalTasks = tasks.length
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return "Good morning, Avatar"
    if (hour < 17) return "Good afternoon, Avatar"
    return "Good evening, Avatar"
  }

  const recentAchievements = achievements.filter((a) => a.unlocked).slice(-2)

  if (showFocusMode) {
    return <FocusMode onBack={() => setShowFocusMode(false)} />
  }

  if (showAnalytics) {
    return <AnalyticsDashboard onBack={() => setShowAnalytics(false)} />
  }

  if (showSyncSettings) {
    return <SyncSettings onBack={() => setShowSyncSettings(false)} />
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header with Avatar-themed greeting */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-2">{getGreeting()}</h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              {currentTime.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {syncStatus.isConnected && (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                <Database className="h-3 w-3 mr-1" />
                Basecamp Connected
              </Badge>
            )}
            <ProfileModal>
              <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                <User className="h-4 w-4" />
                Level {stats.currentLevel}
              </Button>
            </ProfileModal>
          </div>
        </div>
        <div className="mt-4 flex gap-3 flex-wrap">
          <Button onClick={() => setShowFocusMode(true)} className="bg-orange-600 hover:bg-orange-700">
            <Focus className="h-4 w-4 mr-2" />
            Enter Focus Mode
          </Button>
          <Button
            onClick={() => setShowAnalytics(true)}
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            View Analytics
          </Button>
          <Button
            onClick={() => setShowSyncSettings(true)}
            variant="outline"
            className="border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
          >
            <Database className="h-4 w-4 mr-2" />
            Basecamp Sync
          </Button>
          {recentAchievements.length > 0 && (
            <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 px-3 py-1">
              <Trophy className="h-3 w-3 mr-1" />
              {recentAchievements.length} new achievement{recentAchievements.length > 1 ? "s" : ""}!
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Level</p>
                <p className="text-2xl font-bold">{stats.currentLevel}</p>
                <p className="text-blue-100 text-xs">{getLevelTitle(stats.currentLevel)}</p>
              </div>
              <Zap className="h-8 w-8 text-blue-200" />
            </div>
            <div className="mt-3">
              <Progress value={getXpProgress(stats.totalXp, stats.currentLevel)} className="h-2 bg-blue-400/30" />
              <p className="text-blue-100 text-xs mt-1">
                {stats.totalXp} / {getXpForNextLevel(stats.currentLevel)} XP
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Total XP</p>
                <p className="text-2xl font-bold">{stats.totalXp}</p>
                <p className="text-orange-100 text-xs">Lifetime earned</p>
              </div>
              <Flame className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Focus Time</p>
                <p className="text-2xl font-bold">{stats.focusMinutesToday}m</p>
                <p className="text-green-100 text-xs">Today</p>
              </div>
              <Clock className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Streak</p>
                <p className="text-2xl font-bold">{stats.currentStreak}</p>
                <p className="text-purple-100 text-xs">Days</p>
              </div>
              <Target className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Progress */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Today's Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Tasks Completed</span>
                <span>
                  {completedTasks}/{totalTasks}
                </span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {completedTasks} completed
              </Badge>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                {totalTasks - completedTasks} remaining
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Tasks */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-600" />
              Today's Quests
            </CardTitle>
            <QuickTaskModal onTaskCreate={handleTaskCreate}>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-1" />
                Add Quest
              </Button>
            </QuickTaskModal>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  task.completed
                    ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                    : "bg-white border-slate-200 hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700"
                }`}
              >
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => toggleTask(task.id)}
                  className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                />
                <div className="flex-1">
                  <p
                    className={`font-medium ${
                      task.completed
                        ? "text-green-700 line-through dark:text-green-400"
                        : "text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-slate-500 dark:text-slate-400">{task.project}</p>
                    {task.dueDate && (
                      <Badge variant="outline" className="text-xs">
                        Due {task.dueDate.toLocaleDateString()}
                      </Badge>
                    )}
                  </div>
                  {task.notes && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{task.notes}</p>}
                </div>
                <Badge
                  variant="secondary"
                  className={`${
                    task.completed
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                  }`}
                >
                  +{task.xp} XP
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
