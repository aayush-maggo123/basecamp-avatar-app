"use client"

// Basecamp API integration utilities
export interface BasecampProject {
  id: number
  name: string
  description: string
  created_at: string
  updated_at: string
}

export interface BasecampTodoList {
  id: number
  title: string
  description: string
  created_at: string
  updated_at: string
  bucket: {
    id: number
    name: string
  }
}

export interface BasecampTodo {
  id: number
  title: string
  notes: string
  completed: boolean
  due_on: string | null
  assignees: Array<{
    id: number
    name: string
  }>
  created_at: string
  updated_at: string
  completed_at: string | null
  parent: {
    id: number
    title: string
  }
}

export interface SyncStatus {
  isConnected: boolean
  lastSync: Date | null
  syncInProgress: boolean
  error: string | null
  projectsCount: number
  todoListsCount: number
  todosCount: number
}

class BasecampAPI {
  private baseUrl = "https://3.basecampapi.com"
  private accountId: string | null = null
  private accessToken: string | null = null

  constructor() {
    // In a real implementation, these would come from secure storage
    this.accountId = process.env.NEXT_PUBLIC_BASECAMP_ACCOUNT_ID || null
    this.accessToken = process.env.NEXT_PUBLIC_BASECAMP_ACCESS_TOKEN || null
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    if (!this.accountId || !this.accessToken) {
      throw new Error("Basecamp credentials not configured")
    }

    const url = `${this.baseUrl}/${this.accountId}${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "User-Agent": "Avatar Productivity App (contact@example.com)",
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`Basecamp API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async getProjects(): Promise<BasecampProject[]> {
    try {
      return await this.makeRequest("/projects.json")
    } catch (error) {
      console.error("Failed to fetch projects:", error)
      // Return mock data for demo purposes
      return [
        {
          id: 1,
          name: "Fire Nation Campaign",
          description: "Strategic campaign planning and execution",
          created_at: "2024-01-15T10:00:00Z",
          updated_at: "2024-01-20T15:30:00Z",
        },
        {
          id: 2,
          name: "Air Temple Restoration",
          description: "Restoration project for ancient temples",
          created_at: "2024-01-10T09:00:00Z",
          updated_at: "2024-01-18T14:20:00Z",
        },
        {
          id: 3,
          name: "Water Tribe Alliance",
          description: "Building strategic partnerships",
          created_at: "2024-01-12T11:00:00Z",
          updated_at: "2024-01-19T16:45:00Z",
        },
      ]
    }
  }

  async getTodoLists(projectId: number): Promise<BasecampTodoList[]> {
    try {
      return await this.makeRequest(`/projects/${projectId}/todosets.json`)
    } catch (error) {
      console.error("Failed to fetch todo lists:", error)
      // Return mock data for demo purposes
      return [
        {
          id: 101,
          title: "Planning Phase",
          description: "Initial planning and strategy",
          created_at: "2024-01-15T10:00:00Z",
          updated_at: "2024-01-20T15:30:00Z",
          bucket: { id: projectId, name: "Project Tasks" },
        },
        {
          id: 102,
          title: "Execution Phase",
          description: "Implementation and delivery",
          created_at: "2024-01-16T10:00:00Z",
          updated_at: "2024-01-21T15:30:00Z",
          bucket: { id: projectId, name: "Project Tasks" },
        },
      ]
    }
  }

  async getTodos(todoListId: number): Promise<BasecampTodo[]> {
    try {
      return await this.makeRequest(`/buckets/${todoListId}/todos.json`)
    } catch (error) {
      console.error("Failed to fetch todos:", error)
      // Return mock data for demo purposes
      return [
        {
          id: 1001,
          title: "Review project requirements",
          notes: "Detailed analysis of project scope and requirements",
          completed: false,
          due_on: "2024-01-25",
          assignees: [{ id: 1, name: "Aang" }],
          created_at: "2024-01-15T10:00:00Z",
          updated_at: "2024-01-20T15:30:00Z",
          completed_at: null,
          parent: { id: todoListId, title: "Planning Phase" },
        },
        {
          id: 1002,
          title: "Prepare initial mockups",
          notes: "Create wireframes and initial design concepts",
          completed: true,
          due_on: "2024-01-22",
          assignees: [{ id: 2, name: "Katara" }],
          created_at: "2024-01-16T10:00:00Z",
          updated_at: "2024-01-22T15:30:00Z",
          completed_at: "2024-01-22T15:30:00Z",
          parent: { id: todoListId, title: "Planning Phase" },
        },
      ]
    }
  }

  async updateTodo(todoId: number, updates: Partial<BasecampTodo>): Promise<BasecampTodo> {
    try {
      return await this.makeRequest(`/buckets/${todoId}/todos/${todoId}.json`, {
        method: "PUT",
        body: JSON.stringify(updates),
      })
    } catch (error) {
      console.error("Failed to update todo:", error)
      throw error
    }
  }

  isConnected(): boolean {
    return !!(this.accountId && this.accessToken)
  }
}

export const basecampAPI = new BasecampAPI()
