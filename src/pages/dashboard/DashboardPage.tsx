import { useDashboard } from '../../hooks/useDashboard'
import { Link } from 'react-router-dom'

export default function DashboardPage({ userId }: { userId: string }) {
  const { habits, goals, projects, loading, toggleHabit, isCompletedToday } = useDashboard(userId)

  const completedToday = habits.filter(h => isCompletedToday(h.id)).length
  const today = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })

  if (loading) return <p className="text-gray-400 text-sm">Cargando...</p>

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-gray-900 capitalize">{today}</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {completedToday} de {habits.length} hábitos completados hoy
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">

        {/* Hábitos de hoy */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">Hábitos de hoy</h2>
            <Link to="/habits" className="text-xs text-indigo-500 hover:text-indigo-700 transition-colors">
              Ver todos
            </Link>
          </div>

          {habits.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">
              No tenés hábitos — <Link to="/habits" className="text-indigo-500">creá uno</Link>
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {habits.map(habit => {
                const done = isCompletedToday(habit.id)
                return (
                  <div key={habit.id} className="flex items-center gap-3">
                    <button
                      onClick={() => toggleHabit(habit.id)}
                      className="w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all"
                      style={{
                        borderColor: done ? habit.color : '#d1d5db',
                        backgroundColor: done ? habit.color : 'transparent',
                      }}
                    />
                    <span className={`text-sm ${done ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                      {habit.name}
                    </span>
                    <span className="text-xs text-gray-400 capitalize ml-auto">{habit.category}</span>
                  </div>
                )
              })}
            </div>
          )}

          {habits.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">Progreso del día</span>
                <span className="text-xs text-gray-400">{Math.round((completedToday / habits.length) * 100)}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all"
                  style={{ width: `${(completedToday / habits.length) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Metas activas */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">Metas activas</h2>
            <Link to="/goals" className="text-xs text-indigo-500 hover:text-indigo-700 transition-colors">
              Ver todas
            </Link>
          </div>

          {goals.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">
              No tenés metas — <Link to="/goals" className="text-indigo-500">creá una</Link>
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {goals.map(goal => (
                <div key={goal.id}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm text-gray-700">{goal.title}</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                        goal.horizon === 'corto' ? 'bg-green-100 text-green-700' :
                        goal.horizon === 'mediano' ? 'bg-amber-100 text-amber-700' :
                        'bg-indigo-100 text-indigo-700'
                      }`}>
                        {goal.horizon}
                      </span>
                      <span className="text-xs text-gray-400">{goal.progress_pct}%</span>
                    </div>
                  </div>
                  <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all"
                      style={{ width: `${goal.progress_pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Proyectos en progreso */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">Proyectos en progreso</h2>
            <Link to="/projects" className="text-xs text-indigo-500 hover:text-indigo-700 transition-colors">
              Ver todos
            </Link>
          </div>

          {projects.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">
              No tenés proyectos en progreso — <Link to="/projects" className="text-indigo-500">empezá uno</Link>
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {projects.map(project => (
                <div key={project.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-700">{project.title}</p>
                    <p className="text-xs text-gray-400 capitalize">{project.category}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600 font-medium">
                    en progreso
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}