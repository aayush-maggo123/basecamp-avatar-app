"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Plus, CalendarIcon, Zap, Flame, Target } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface Task {
  id: number
  title: string
  project: string
  completed: boolean
  xp: number
  notes?: string
  dueDate?: Date
}

interface QuickTaskModalProps {
  children: React.ReactNode
  onTaskCreate: (task: Omit<Task, "id" | "completed">) => void
}

const PROJECTS = [
  "Fire Nation Campaign",
  "Air Temple Restoration",
  "Water Tribe Alliance",
  "Earth Kingdom Trade",
  "Personal Development",
  "Avatar Training",
]

const TASK_TYPES = [
  { name: "Quick Task", xp: 15, icon: Target, color: "text-blue-600" },
  { name: "Important Task", xp: 25, icon: Flame, color: "text-orange-600" },
  { name: "Major Quest", xp: 50, icon: Zap, color: "text-purple-600" },
]

export function QuickTaskModal({ children, onTaskCreate }: QuickTaskModalProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [project, setProject] = useState("")
  const [notes, setNotes] = useState("")
  const [dueDate, setDueDate] = useState<Date>()
  const [taskType, setTaskType] = useState(TASK_TYPES[0])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Keyboard shortcut to open modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault()
        setOpen(true)
      }
      if (e.key === "Escape" && open) {
        setOpen(false)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) return

    setIsSubmitting(true)

    try {
      const newTask = {
        title: title.trim(),
        project: project || "Personal Development",
        xp: taskType.xp,
        notes: notes.trim() || undefined,
        dueDate: dueDate,
      }

      onTaskCreate(newTask)

      // Reset form
      setTitle("")
      setProject("")
      setNotes("")
      setDueDate(undefined)
      setTaskType(TASK_TYPES[0])
      setOpen(false)
    } catch (error) {
      console.error("Failed to create task:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleQuickAdd = (quickTitle: string) => {
    setTitle(quickTitle)
  }

  const quickSuggestions = [
    "Review daily goals",
    "Check project updates",
    "Plan tomorrow's tasks",
    "Practice meditation",
    "Update team status",
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-blue-600" />
            Create New Quest
            <Badge variant="secondary" className="ml-auto text-xs">
              Ctrl+N
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Task Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Quest Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be accomplished?"
              className="text-lg"
              autoFocus
            />
          </div>

          {/* Quick Suggestions */}
          <div className="space-y-2">
            <Label className="text-sm text-slate-600 dark:text-slate-400">Quick Suggestions</Label>
            <div className="flex flex-wrap gap-2">
              {quickSuggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAdd(suggestion)}
                  className="text-xs"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>

          {/* Task Type & XP */}
          <div className="space-y-2">
            <Label>Quest Type & XP Reward</Label>
            <div className="grid grid-cols-3 gap-3">
              {TASK_TYPES.map((type) => {
                const Icon = type.icon
                return (
                  <Button
                    key={type.name}
                    type="button"
                    variant={taskType.name === type.name ? "default" : "outline"}
                    onClick={() => setTaskType(type)}
                    className={cn(
                      "flex flex-col gap-2 h-auto py-3",
                      taskType.name === type.name && "bg-blue-600 hover:bg-blue-700",
                    )}
                  >
                    <Icon className={cn("h-5 w-5", taskType.name === type.name ? "text-white" : type.color)} />
                    <div className="text-center">
                      <div className="font-medium text-sm">{type.name}</div>
                      <div className="text-xs opacity-75">+{type.xp} XP</div>
                    </div>
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Project & Due Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Select value={project} onValueChange={setProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {PROJECTS.map((proj) => (
                    <SelectItem key={proj} value={proj}>
                      {proj}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Due Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !dueDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional details, context, or requirements..."
              rows={3}
            />
          </div>

          {/* XP Preview */}
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-600" />
              <span className="font-medium">Quest Reward Preview</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Completing this {taskType.name.toLowerCase()} will earn you <strong>+{taskType.xp} XP</strong> towards
              your Avatar mastery!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Quest
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
