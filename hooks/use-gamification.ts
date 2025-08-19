"use client"

import { useState } from "react"

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  xpReward: number
  unlocked: boolean
  unlockedAt?: Date
  category: "tasks" | "focus" | "streaks" | "levels"
}

export interface UserStats {
  totalXp: number
  currentLevel: number
  tasksCompletedToday: number
  tasksCompletedTotal: number
  focusMinutesToday: number
  focusMinutesTotal: number
  currentStreak: number
  longestStreak: number
  lastActivityDate: string
}

const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 1000, 1750, 2750, 4000, 5500, 7500, 10000, 13000, 16500, 20500, 25000, 30000,
]

const AVATAR_TITLES = [
  "Newcomer",
  "Air Nomad",
  "Air Nomad Apprentice",
  "Air Nomad Master",
  "Water Tribe Warrior",
  "Water Tribe Guardian",
  "Earth Kingdom Citizen",
  "Earth Kingdom Guardian",
  "Earth Kingdom Master",
  "Fire Nation Warrior",
  "Fire Nation Master",
  "Avatar Apprentice",
  "Avatar Guardian",
  "Avatar Master",
  "Fully Realized Avatar",
  "Avatar Legend",
]

const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-task",
    title: "First Steps",
    description: "Complete your first task",
    icon: "🎯",
    xpReward: 25,
    unlocked: false,
    category: "tasks",
  },
  {
    id: "task-creator",
    title: "Quest Creator",
    description: "Create your first custom quest",
    icon: "✨",
    xpReward: 15,
    unlocked: false,
    category: "tasks",
  },
  {
    id: "task-master",
    title: "Task Master",
    description: "Complete 10 tasks in a single day",
    icon: "⚡",
    xpReward: 100,
    unlocked: false,
    category: "tasks",
  },
  {
    id: "focus-warrior",
    title: "Focus Warrior",
    description: "Complete your first focus session",
    icon: "🔥",
    xpReward: 50,
    unlocked: false,
    category: "focus",
  },
  {
    id: "meditation-master",
    title: "Meditation Master",
    description: "Complete 25 focus sessions",
    icon: "🧘",
    xpReward: 200,
    unlocked: false,
    category: "focus",
  },
  {
    id: "streak-starter",
    title: "Streak Starter",
    description: "Maintain a 3-day streak",
    icon: "🔥",
    xpReward: 75,
    unlocked: false,
    category: "streaks",
  },
  {
    id: "dedication",
    title: "Dedication",
    description: "Maintain a 7-day streak",
    icon: "💎",
    xpReward: 150,
    unlocked: false,
    category: "streaks",
  },
  {
    id: "air-nomad",
    title: "Air Nomad",
    description: "Reach level 5",
    icon: "💨",
    xpReward: 100,
    unlocked: false,
    category: "levels",
  },
  {
    id: "avatar-master",
    title: "Avatar Master",
    description: "Reach level 15",
    icon: "🌟",
    xpReward: 500,
    unlocked: false,
    category: "levels",
  },
]

export function useGamification() {
  const [stats, setStats] = useState<UserStats>({
    totalXp: 1250,
    currentLevel: 8,
    tasksCompletedToday: 3,
    tasksCompletedTotal: 47,
    focusMinutesToday: 120,
    focusMinutesTotal: 2340,
    currentStreak: 5,
    longestStreak: 12,
    lastActivityDate: new Date().toISOString().split("T")[0],
  })

  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS)
  const [tasksCreated, setTasksCreated] = useState(0)

  const calculateLevel = (xp: number): number => {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (xp >= LEVEL_THRESHOLDS[i]) {
        return i + 1
      }
    }
    return 1
  }

  const getXpForNextLevel = (currentLevel: number): number => {
    if (currentLevel >= LEVEL_THRESHOLDS.length) {
      return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
    }
    return LEVEL_THRESHOLDS[currentLevel]
  }

  const getXpProgress = (currentXp: number, currentLevel: number): number => {
    const currentLevelXp = LEVEL_THRESHOLDS[currentLevel - 1] || 0
    const nextLevelXp = getXpForNextLevel(currentLevel)
    const progressXp = currentXp - currentLevelXp
    const totalXpNeeded = nextLevelXp - currentLevelXp
    return Math.min((progressXp / totalXpNeeded) * 100, 100)
  }

  const getLevelTitle = (level: number): string => {
    return AVATAR_TITLES[Math.min(level - 1, AVATAR_TITLES.length - 1)] || "Avatar Legend"
  }

  const addXp = (amount: number, reason: string) => {
    setStats((prevStats) => {
      const newTotalXp = prevStats.totalXp + amount
      const newLevel = calculateLevel(newTotalXp)
      const leveledUp = newLevel > prevStats.currentLevel

      // Check for level-based achievements
      if (leveledUp) {
        checkAchievements({ ...prevStats, totalXp: newTotalXp, currentLevel: newLevel })
      }

      return {
        ...prevStats,
        totalXp: newTotalXp,
        currentLevel: newLevel,
      }
    })
  }

  const completeTask = () => {
    setStats((prevStats) => {
      const newStats = {
        ...prevStats,
        tasksCompletedToday: prevStats.tasksCompletedToday + 1,
        tasksCompletedTotal: prevStats.tasksCompletedTotal + 1,
      }

      checkAchievements(newStats)
      return newStats
    })

    addXp(25, "Task completed")
  }

  const createTask = () => {
    setTasksCreated((prev) => {
      const newCount = prev + 1
      if (newCount === 1) {
        // Unlock task creator achievement
        setAchievements((prevAchievements) =>
          prevAchievements.map((achievement) =>
            achievement.id === "task-creator"
              ? { ...achievement, unlocked: true, unlockedAt: new Date() }
              : achievement,
          ),
        )
        setTimeout(() => addXp(15, "Achievement unlocked: Quest Creator"), 100)
      }
      return newCount
    })

    addXp(5, "Quest created")
  }

  const completeFocusSession = (minutes: number) => {
    setStats((prevStats) => {
      const newStats = {
        ...prevStats,
        focusMinutesToday: prevStats.focusMinutesToday + minutes,
        focusMinutesTotal: prevStats.focusMinutesTotal + minutes,
      }

      checkAchievements(newStats)
      return newStats
    })

    addXp(50, `Focus session completed (${minutes} minutes)`)
  }

  const checkAchievements = (currentStats: UserStats) => {
    setAchievements((prevAchievements) => {
      return prevAchievements.map((achievement) => {
        if (achievement.unlocked) return achievement

        let shouldUnlock = false

        switch (achievement.id) {
          case "first-task":
            shouldUnlock = currentStats.tasksCompletedTotal >= 1
            break
          case "task-master":
            shouldUnlock = currentStats.tasksCompletedToday >= 10
            break
          case "focus-warrior":
            shouldUnlock = currentStats.focusMinutesTotal >= 25
            break
          case "meditation-master":
            shouldUnlock = currentStats.focusMinutesTotal >= 625 // 25 sessions * 25 minutes
            break
          case "streak-starter":
            shouldUnlock = currentStats.currentStreak >= 3
            break
          case "dedication":
            shouldUnlock = currentStats.currentStreak >= 7
            break
          case "air-nomad":
            shouldUnlock = currentStats.currentLevel >= 5
            break
          case "avatar-master":
            shouldUnlock = currentStats.currentLevel >= 15
            break
        }

        if (shouldUnlock) {
          // Add XP reward for achievement
          setTimeout(() => addXp(achievement.xpReward, `Achievement unlocked: ${achievement.title}`), 100)

          return {
            ...achievement,
            unlocked: true,
            unlockedAt: new Date(),
          }
        }

        return achievement
      })
    })
  }

  return {
    stats,
    achievements,
    calculateLevel,
    getXpForNextLevel,
    getXpProgress,
    getLevelTitle,
    addXp,
    completeTask,
    createTask,
    completeFocusSession,
    checkAchievements,
  }
}
