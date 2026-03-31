import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HabitsPage from './pages/habits/HabitsPage'
import GoalsPage from './pages/goals/GoalsPage'
import LoginPage from './pages/auth/LoginPage'
import { useAuth } from './hooks/useAuth'
import ProjectsPage from './pages/projects/ProjectsPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import RoutinesPage from './pages/routines/RoutinesPage'


export default function App() {
  const { user, loading, displayName } = useAuth()

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-sm text-gray-400">Cargando...</p>
    </div>
  )

  if (!user) return <LoginPage />

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage userId={user.id} displayName={displayName} />} />
          <Route path="habits" element={<HabitsPage userId={user.id} />} />
          <Route path="goals" element={<GoalsPage userId={user.id} />} />
          <Route path="routines" element={<RoutinesPage userId={user.id} />} />
          <Route path="projects" element={<ProjectsPage userId={user.id} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}