"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, TrendingUp, Target, Clock, Flame, Zap, BarChart3 } from "lucide-react"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

interface AnalyticsDashboardProps {
  onBack: () => void
}

// Mock analytics data
const weeklyTaskData = [
  { day: "Mon", completed: 8, planned: 10, xp: 200 },
  { day: "Tue", completed: 12, planned: 12, xp: 300 },
  { day: "Wed", completed: 6, planned: 8, xp: 150 },
  { day: "Thu", completed: 15, planned: 16, xp: 375 },
  { day: "Fri", completed: 10, planned: 12, xp: 250 },
  { day: "Sat", completed: 5, planned: 6, xp: 125 },
  { day: "Sun", completed: 7, planned: 8, xp: 175 },
]

const monthlyProgressData = [
  { month: "Jan", tasks: 180, focus: 1200, xp: 4500 },
  { month: "Feb", tasks: 165, focus: 1100, xp: 4125 },
  { month: "Mar", tasks: 220, focus: 1500, xp: 5500 },
  { month: "Apr", tasks: 195, focus: 1350, xp: 4875 },
  { month: "May", tasks: 240, focus: 1600, xp: 6000 },
  { month: "Jun", tasks: 210, focus: 1400, xp: 5250 },
]

const focusSessionData = [
  { time: "9:00", sessions: 2, productivity: 85 },
  { time: "10:00", sessions: 4, productivity: 92 },
  { time: "11:00", sessions: 3, productivity: 88 },
  { time: "14:00", sessions: 5, productivity: 95 },
  { time: "15:00", sessions: 3, productivity: 82 },
  { time: "16:00", sessions: 2, productivity: 78 },
]

const projectDistribution = [
  { name: "Fire Nation Campaign", value: 35, color: "#EF4444" },
  { name: "Air Temple Restoration", value: 25, color: "#3B82F6" },
  { name: "Water Tribe Alliance", value: 20, color: "#06B6D4" },
  { name: "Earth Kingdom Trade", value: 20, color: "#10B981" },
]

const streakData = [
  { week: "Week 1", streak: 3 },
  { week: "Week 2", streak: 7 },
  { week: "Week 3", streak: 5 },
  { week: "Week 4", streak: 12 },
  { week: "Week 5", streak: 8 },
  { week: "Week 6", streak: 15 },
]

export function AnalyticsDashboard({ onBack }: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState("week")

  const totalTasksCompleted = weeklyTaskData.reduce((sum, day) => sum + day.completed, 0)
  const totalXpEarned = weeklyTaskData.reduce((sum, day) => sum + day.xp, 0)
  const averageCompletionRate = Math.round(
    (totalTasksCompleted / weeklyTaskData.reduce((sum, day) => sum + day.planned, 0)) * 100,
  )
  const totalFocusMinutes = 420 // Mock data

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Analytics Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400">Track your Avatar journey to mastery</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Tasks Completed</p>
                <p className="text-2xl font-bold">{totalTasksCompleted}</p>
                <p className="text-blue-100 text-xs">This week</p>
              </div>
              <Target className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">XP Earned</p>
                <p className="text-2xl font-bold">{totalXpEarned}</p>
                <p className="text-orange-100 text-xs">This week</p>
              </div>
              <Zap className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Focus Time</p>
                <p className="text-2xl font-bold">{totalFocusMinutes}m</p>
                <p className="text-green-100 text-xs">This week</p>
              </div>
              <Clock className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Completion Rate</p>
                <p className="text-2xl font-bold">{averageCompletionRate}%</p>
                <p className="text-purple-100 text-xs">This week</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="productivity">Productivity</TabsTrigger>
          <TabsTrigger value="focus">Focus Sessions</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Weekly Task Completion */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Weekly Task Completion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyTaskData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" fill="#3B82F6" name="Completed" />
                  <Bar dataKey="planned" fill="#E5E7EB" name="Planned" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* XP Progress Over Time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-orange-600" />
                XP Progress This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={weeklyTaskData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="xp" stroke="#F59E0B" fill="#FEF3C7" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="productivity" className="space-y-6">
          {/* Monthly Progress Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Monthly Progress Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlyProgressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="tasks" stroke="#3B82F6" strokeWidth={3} name="Tasks Completed" />
                  <Line type="monotone" dataKey="focus" stroke="#10B981" strokeWidth={3} name="Focus Minutes" />
                  <Line type="monotone" dataKey="xp" stroke="#F59E0B" strokeWidth={3} name="XP Earned" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Streak Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-600" />
                Streak Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={streakData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="streak" fill="#F59E0B" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="focus" className="space-y-6">
          {/* Focus Session Patterns */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-600" />
                Focus Session Patterns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={focusSessionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sessions" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Productivity by Time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Productivity Score by Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={focusSessionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis domain={[70, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="productivity" stroke="#3B82F6" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Focus Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">92%</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Average Productivity</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">14:00</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Peak Focus Time</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">19</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Sessions This Week</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          {/* Project Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Task Distribution by Project
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={projectDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {projectDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-600" />
                  Project Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {projectDistribution.map((project, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{project.name}</span>
                      <Badge style={{ backgroundColor: project.color, color: "white" }}>
                        {project.value}% complete
                      </Badge>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${project.value}%`,
                          backgroundColor: project.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Project Insights */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">35%</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Fire Nation Campaign</div>
                <div className="text-xs text-slate-500">Most Active</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">25%</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Air Temple Restoration</div>
                <div className="text-xs text-slate-500">Steady Progress</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-cyan-600">20%</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Water Tribe Alliance</div>
                <div className="text-xs text-slate-500">On Track</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">20%</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Earth Kingdom Trade</div>
                <div className="text-xs text-slate-500">Balanced</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
