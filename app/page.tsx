import { TodayView } from "@/components/today-view"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 dark:from-slate-900 dark:to-slate-800">
      <TodayView />
    </main>
  )
}
