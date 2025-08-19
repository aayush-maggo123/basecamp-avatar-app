"use client"

import type React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Trophy, Target, Clock, Flame, Star } from "lucide-react"
import { useGamification, type Achievement } from "@/hooks/use-gamification"

interface ProfileModalProps {
  children: React.ReactNode
}

export function ProfileModal({ children }: ProfileModalProps) {
  const { stats, achievements, getXpProgress, getLevelTitle, getXpForNextLevel } = useGamification()

  const unlockedAchievements = achievements.filter((a) => a.unlocked)
  const lockedAchievements = achievements.filter((a) => !a.unlocked)

  const getAchievementsByCategory = (category: Achievement["category"], unlocked: boolean) => {
    return achievements.filter((a) => a.category === category && a.unlocked === unlocked)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Avatar Profile
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Level Progress */}
            <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold">Level {stats.currentLevel}</h3>
                    <p className="text-blue-100">{getLevelTitle(stats.currentLevel)}</p>
                  </div>
                  <Star className="h-12 w-12 text-yellow-300" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress to Level {stats.currentLevel + 1}</span>
                    <span>
                      {stats.totalXp} / {getXpForNextLevel(stats.currentLevel)} XP
                    </span>
                  </div>
                  <Progress value={getXpProgress(stats.totalXp, stats.currentLevel)} className="h-3 bg-white/20" />
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{stats.tasksCompletedTotal}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Total Tasks</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{Math.floor(stats.focusMinutesTotal / 60)}h</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Focus Time</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Flame className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{stats.longestStreak}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Best Streak</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Trophy className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{unlockedAchievements.length}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Achievements</div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {unlockedAchievements.slice(-3).map((achievement) => (
                    <div
                      key={achievement.id}
                      className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg"
                    >
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{achievement.title}</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{achievement.description}</p>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                        +{achievement.xpReward} XP
                      </Badge>
                    </div>
                  ))}
                  {unlockedAchievements.length === 0 && (
                    <p className="text-center text-slate-500 py-4">No achievements unlocked yet. Keep going!</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <div className="grid gap-6">
              {/* Unlocked Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-600" />
                    Unlocked ({unlockedAchievements.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {unlockedAchievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                      >
                        <div className="text-2xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-green-800 dark:text-green-400">{achievement.title}</h4>
                          <p className="text-sm text-green-600 dark:text-green-500">{achievement.description}</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          +{achievement.xpReward} XP
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Locked Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-slate-600" />
                    Locked ({lockedAchievements.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {lockedAchievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 opacity-75"
                      >
                        <div className="text-2xl grayscale">{achievement.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-600 dark:text-slate-400">{achievement.title}</h4>
                          <p className="text-sm text-slate-500 dark:text-slate-500">{achievement.description}</p>
                        </div>
                        <Badge variant="secondary">+{achievement.xpReward} XP</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Productivity Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-3xl font-bold text-blue-600">{stats.tasksCompletedTotal}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Total Tasks Completed</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-3xl font-bold text-green-600">
                        {Math.floor(stats.focusMinutesTotal / 60)}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Hours Focused</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <div className="text-3xl font-bold text-orange-600">{stats.currentStreak}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Current Streak</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-3xl font-bold text-purple-600">{stats.longestStreak}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Longest Streak</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Today's Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="text-2xl font-bold">{stats.tasksCompletedToday}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Tasks Today</div>
                    </div>
                    <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="text-2xl font-bold">{stats.focusMinutesToday}m</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Focus Time Today</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
