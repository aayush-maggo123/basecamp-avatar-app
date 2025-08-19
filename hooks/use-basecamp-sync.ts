"use client"

import { useState, useEffect, useCallback } from "react"
import {
  basecampAPI,
  type SyncStatus,
  type BasecampProject,
  type BasecampTodoList,
  type BasecampTodo,
} from "@/lib/basecamp-api"

export function useBasecampSync() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isConnected: false,
    lastSync: null,
    syncInProgress: false,
    error: null,
    projectsCount: 0,
    todoListsCount: 0,
    todosCount: 0,
  })

  const [projects, setProjects] = useState<BasecampProject[]>([])
  const [syncLogs, setSyncLogs] = useState<
    Array<{
      timestamp: Date
      type: "info" | "success" | "error"
      message: string
    }>
  >([])

  const addLog = useCallback((type: "info" | "success" | "error", message: string) => {
    setSyncLogs((prev) => [...prev.slice(-9), { timestamp: new Date(), type, message }])
  }, [])

  const checkConnection = useCallback(async () => {
    try {
      const isConnected = basecampAPI.isConnected()
      setSyncStatus((prev) => ({ ...prev, isConnected, error: null }))

      if (isConnected) {
        addLog("success", "Connected to Basecamp successfully")
      } else {
        addLog("error", "Basecamp credentials not configured")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Connection failed"
      setSyncStatus((prev) => ({ ...prev, isConnected: false, error: errorMessage }))
      addLog("error", `Connection failed: ${errorMessage}`)
    }
  }, [addLog])

  const syncProjects = useCallback(async (): Promise<BasecampProject[]> => {
    addLog("info", "Syncing projects from Basecamp...")

    try {
      const basecampProjects = await basecampAPI.getProjects()
      setProjects(basecampProjects)

      // In a real implementation, this would save to Supabase
      // await saveProjectsToDatabase(basecampProjects)

      addLog("success", `Synced ${basecampProjects.length} projects`)
      return basecampProjects
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to sync projects"
      addLog("error", errorMessage)
      throw error
    }
  }, [addLog])

  const syncTodoLists = useCallback(
    async (projectId: number): Promise<BasecampTodoList[]> => {
      addLog("info", `Syncing todo lists for project ${projectId}...`)

      try {
        const todoLists = await basecampAPI.getTodoLists(projectId)

        // In a real implementation, this would save to Supabase
        // await saveTodoListsToDatabase(todoLists, projectId)

        addLog("success", `Synced ${todoLists.length} todo lists`)
        return todoLists
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to sync todo lists"
        addLog("error", errorMessage)
        throw error
      }
    },
    [addLog],
  )

  const syncTodos = useCallback(
    async (todoListId: number): Promise<BasecampTodo[]> => {
      addLog("info", `Syncing todos for list ${todoListId}...`)

      try {
        const todos = await basecampAPI.getTodos(todoListId)

        // In a real implementation, this would save to Supabase
        // await saveTodosToDatabase(todos, todoListId)

        addLog("success", `Synced ${todos.length} todos`)
        return todos
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to sync todos"
        addLog("error", errorMessage)
        throw error
      }
    },
    [addLog],
  )

  const performFullSync = useCallback(async () => {
    if (syncStatus.syncInProgress) {
      addLog("info", "Sync already in progress")
      return
    }

    setSyncStatus((prev) => ({ ...prev, syncInProgress: true, error: null }))
    addLog("info", "Starting full sync...")

    try {
      // Sync projects
      const projects = await syncProjects()

      let totalTodoLists = 0
      let totalTodos = 0

      // Sync todo lists and todos for each project
      for (const project of projects) {
        const todoLists = await syncTodoLists(project.id)
        totalTodoLists += todoLists.length

        for (const todoList of todoLists) {
          const todos = await syncTodos(todoList.id)
          totalTodos += todos.length
        }
      }

      setSyncStatus((prev) => ({
        ...prev,
        syncInProgress: false,
        lastSync: new Date(),
        projectsCount: projects.length,
        todoListsCount: totalTodoLists,
        todosCount: totalTodos,
        error: null,
      }))

      addLog(
        "success",
        `Full sync completed: ${projects.length} projects, ${totalTodoLists} lists, ${totalTodos} todos`,
      )
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Sync failed"
      setSyncStatus((prev) => ({
        ...prev,
        syncInProgress: false,
        error: errorMessage,
      }))
      addLog("error", `Full sync failed: ${errorMessage}`)
    }
  }, [syncStatus.syncInProgress, syncProjects, syncTodoLists, syncTodos, addLog])

  // Auto-sync every 15 minutes when connected
  useEffect(() => {
    if (!syncStatus.isConnected) return

    const interval = setInterval(
      () => {
        if (!syncStatus.syncInProgress) {
          performFullSync()
        }
      },
      15 * 60 * 1000,
    ) // 15 minutes

    return () => clearInterval(interval)
  }, [syncStatus.isConnected, syncStatus.syncInProgress, performFullSync])

  // Check connection on mount
  useEffect(() => {
    checkConnection()
  }, [checkConnection])

  return {
    syncStatus,
    projects,
    syncLogs,
    checkConnection,
    performFullSync,
    syncProjects,
    syncTodoLists,
    syncTodos,
  }
}
