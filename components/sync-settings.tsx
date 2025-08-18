"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Database,
  Settings,
  ArrowLeft,
  AlertCircle,
  Activity,
} from "lucide-react"
import { useBasecampSync } from "@/hooks/use-basecamp-sync"

interface SyncSettingsProps {
  onBack: () => void
}

export function SyncSettings({ onBack }: SyncSettingsProps) {
  const { syncStatus, projects, syncLogs, checkConnection, performFullSync } = useBasecampSync()

  const getStatusIcon = () => {
    if (syncStatus.syncInProgress) {
      return <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
    }
    if (syncStatus.error) {
      return <XCircle className="h-5 w-5 text-red-600" />
    }
    if (syncStatus.isConnected) {
      return <CheckCircle className="h-5 w-5 text-green-600" />
    }
    return <AlertCircle className="h-5 w-5 text-yellow-600" />
  }

  const getStatusText = () => {
    if (syncStatus.syncInProgress) return "Syncing..."
    if (syncStatus.error) return "Error"
    if (syncStatus.isConnected) return "Connected"
    return "Not Connected"
  }

  const getStatusColor = () => {
    if (syncStatus.syncInProgress) return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
    if (syncStatus.error) return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
    if (syncStatus.isConnected) return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Basecamp Sync</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage your Basecamp integration and sync settings</p>
        </div>
      </div>

      {/* Connection Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {getStatusIcon()}
              <div>
                <p className="font-semibold">{getStatusText()}</p>
                {syncStatus.lastSync && (
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Last sync: {syncStatus.lastSync.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
            <Badge className={getStatusColor()}>{getStatusText()}</Badge>
          </div>

          {syncStatus.error && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{syncStatus.error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3">
            <Button onClick={checkConnection} variant="outline" disabled={syncStatus.syncInProgress}>
              <Settings className="h-4 w-4 mr-2" />
              Test Connection
            </Button>
            <Button
              onClick={performFullSync}
              disabled={!syncStatus.isConnected || syncStatus.syncInProgress}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {syncStatus.syncInProgress ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {syncStatus.syncInProgress ? "Syncing..." : "Sync Now"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="logs">Sync Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Sync Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{syncStatus.projectsCount}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Projects Synced</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{syncStatus.todoListsCount}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Todo Lists</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{syncStatus.todosCount}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Tasks Synced</div>
              </CardContent>
            </Card>
          </div>

          {/* Sync Progress */}
          {syncStatus.syncInProgress && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Sync in Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Progress value={65} className="h-2" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Syncing projects and tasks from Basecamp...
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Configuration Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-slate-600" />
                Sync Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Auto-sync interval</span>
                <Badge variant="secondary">15 minutes</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Sync direction</span>
                <Badge variant="secondary">Basecamp → Avatar App</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Data types</span>
                <Badge variant="secondary">Projects, Lists, Tasks</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-600" />
                Synced Projects ({projects.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {projects.length > 0 ? (
                  projects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                    >
                      <div>
                        <h4 className="font-semibold">{project.name}</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{project.description}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Synced
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <Database className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No projects synced yet</p>
                    <p className="text-sm">Run a sync to import your Basecamp projects</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-slate-600" />
                Sync Activity Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {syncLogs.length > 0 ? (
                  syncLogs
                    .slice()
                    .reverse()
                    .map((log, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div className="mt-0.5">
                          {log.type === "success" && <CheckCircle className="h-4 w-4 text-green-600" />}
                          {log.type === "error" && <XCircle className="h-4 w-4 text-red-600" />}
                          {log.type === "info" && <Clock className="h-4 w-4 text-blue-600" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">{log.message}</p>
                          <p className="text-xs text-slate-500 mt-1">{log.timestamp.toLocaleString()}</p>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No sync activity yet</p>
                    <p className="text-sm">Sync logs will appear here</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
