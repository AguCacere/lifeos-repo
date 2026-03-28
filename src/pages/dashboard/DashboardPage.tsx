import { useDashboard } from '../../hooks/useDashboard'
import { Link } from 'react-router-dom'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

export default function DashboardPage({ userId }: { userId: string }) {
  const { habits, goals, projects, loading, toggleHabit, isCompletedToday } = useDashboard(userId)

  const completedToday = habits.filter(h => isCompletedToday(h.id)).length
  const today = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
  const pct = habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0

  if (loading) return <p className="text-gray-400 text-sm">Cargando...</p>

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs text-gray-400 capitalize tracking-wide mb-1">{today}</p>
        <h1 className="text-2xl font-light text-gray-900">
          {getGreeting()}, Agus.{' '}
          <span className="font-bold">Hagamos que hoy cuente.</span>
        </h1>
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-2 gap-5 mb-5">

        {/* Hábitos Diarios */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              <h2 className="text-sm font-semibold text-gray-800">Hábitos Diarios</h2>
            </div>
            {habits.length > 0 && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                En racha: {completedToday} días
              </span>
            )}
          </div>

          {habits.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-xs text-gray-400">
                No tenés hábitos —{' '}
                <Link to="/habits" className="text-indigo-500 font-medium">creá uno</Link>
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {habits.slice(0, 4).map(habit => {
                const done = isCompletedToday(habit.id)
                return (
                  <div key={habit.id}>
                    <div className="flex items-center gap-3 mb-1.5">
                      <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: habit.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium leading-none ${done ? 'text-gray-400' : 'text-gray-800'}`}>
                          {habit.name}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5 capitalize">{habit.category}</p>
                      </div>
                      <span className="text-xs font-semibold text-gray-500">{done ? '100%' : '0%'}</span>
                      <button
                        onClick={() => toggleHabit(habit.id)}
                        className="w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all"
                        style={{
                          borderColor: done ? habit.color : '#d1d5db',
                          backgroundColor: done ? habit.color : 'transparent',
                        }}
                      >
                        {done && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        )}
                      </button>
                    </div>
                    <div className="ml-10 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: done ? '100%' : '0%', backgroundColor: habit.color }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {habits.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-50">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-gray-400">Progreso del día</span>
                <span className="text-[10px] font-semibold text-gray-500">{pct}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Proyectos en curso */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
              <h2 className="text-sm font-semibold text-gray-800">Proyectos en curso</h2>
            </div>
            <Link to="/projects">
              <button className="w-6 h-6 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-indigo-50 hover:text-indigo-500 hover:border-indigo-200 transition-colors text-sm leading-none">
                +
              </button>
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Todo listo para despegar</p>
              <p className="text-xs text-gray-400 leading-relaxed max-w-[180px]">
                Creá tu primer proyecto para empezar a organizar tus tareas de forma{' '}
                <Link to="/projects" className="text-indigo-500 font-medium">eficiente</Link>.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {projects.map(project => (
                <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{project.title}</p>
                    <p className="text-xs text-gray-400 capitalize">{project.category}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600 font-semibold">
                    en progreso
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Metas activas */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.25 9.71 2 12 2c2.291 0 4.545.25 6.75.721v1.515M5.25 4.236A6.003 6.003 0 0 1 7.73 9.728m10.52-5.492c.982.143 1.954.317 2.916.52a6.003 6.003 0 0 1-5.395 5.492m2.479-5.492V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492V2.721" />
              </svg>
              <h2 className="text-sm font-semibold text-gray-800">Metas activas</h2>
            </div>
            <Link to="/goals" className="text-xs text-indigo-500 hover:text-indigo-700 transition-colors">
              Ver todas
            </Link>
          </div>

          {goals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <svg className="w-10 h-10 text-amber-200 mb-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 0 0 .95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 0 0-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 0 0-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 0 0-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 0 0 .951-.69l1.519-4.674Z" />
              </svg>
              <p className="text-sm font-semibold text-gray-700 mb-1">Sin metas activas</p>
              <p className="text-xs text-gray-400 leading-relaxed max-w-[200px] mb-4">
                Definí tus grandes hitos para este trimestre y nosotros te ayudaremos a descomponerlos.
              </p>
              <Link to="/goals">
                <button className="px-4 py-1.5 text-xs font-semibold text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors">
                  Establecer nueva meta
                </button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {goals.map(goal => (
                <div key={goal.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm text-gray-700 font-medium">{goal.title}</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                        goal.horizon === 'corto' ? 'bg-green-100 text-green-700' :
                        goal.horizon === 'mediano' ? 'bg-amber-100 text-amber-700' :
                        'bg-indigo-100 text-indigo-700'
                      }`}>
                        {goal.horizon}
                      </span>
                      <span className="text-xs text-gray-400">{goal.progress_pct}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
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

        {/* Tip de Arquitecto */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
            <span className="text-xs font-bold text-orange-500 tracking-wide uppercase">Tip de Arquitecto</span>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            Agrupá tus tareas por <span className="font-semibold text-gray-800">'Contexto'</span> para reducir la carga cognitiva al cambiar de actividad.
          </p>
        </div>

      </div>

      {/* Quick capture banner */}
      <div className="rounded-2xl p-5 flex items-center justify-between" style={{ background: '#1e1e3a' }}>
        <div>
          <p className="text-white font-semibold text-sm mb-0.5">¿Tenés algo en mente?</p>
          <p className="text-white/50 text-xs leading-relaxed max-w-xs">
            No dejes que las ideas se escapen. Capturá pensamientos, tareas o notas rápidas en tu bandeja de entrada en segundos.
          </p>
        </div>
        <div className="flex items-center gap-2 ml-6 flex-shrink-0">
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors">
            Captura Rápida
          </button>
          <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition-colors">
            Ver Inbox
          </button>
        </div>
      </div>
    </div>
  )
}
