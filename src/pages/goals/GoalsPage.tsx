import { useState } from 'react'
import { useGoals } from '../../hooks/useGoals'
import type { Goal } from '../../types'

const HORIZONS: { value: Goal['horizon'], label: string, color: string }[] = [
  { value: 'corto', label: 'Corto plazo', color: 'bg-green-100 text-green-700' },
  { value: 'mediano', label: 'Mediano plazo', color: 'bg-amber-100 text-amber-700' },
  { value: 'largo', label: 'Largo plazo', color: 'bg-indigo-100 text-indigo-700' },
]

export default function GoalsPage({ userId }: { userId: string }) {
  const { goals, loading, addGoal, updateProgress, updateStatus, addMilestone, toggleMilestone, deleteGoal } = useGoals(userId)

  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [horizon, setHorizon] = useState<Goal['horizon']>('corto')
  const [dueDate, setDueDate] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [newMilestone, setNewMilestone] = useState('')

  async function handleAdd() {
    if (!title.trim()) return
    await addGoal({
      title,
      description: description || null,
      horizon,
      progress_pct: 0,
      status: 'activo',
      due_date: dueDate || null,
    })
    setTitle('')
    setDescription('')
    setDueDate('')
    setShowForm(false)
  }

  async function handleAddMilestone(goalId: string) {
    if (!newMilestone.trim()) return
    await addMilestone(goalId, newMilestone)
    setNewMilestone('')
  }

  if (loading) return <p className="text-gray-400 text-sm">Cargando metas...</p>

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Metas</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {goals.filter(g => g.status === 'activo').length} activas
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + Nueva meta
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-100 rounded-xl p-4 mb-4 shadow-sm">
          <p className="text-sm font-medium text-gray-700 mb-3">Nueva meta</p>
          <input
            type="text"
            placeholder="Título de la meta..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 mb-2 outline-none focus:border-indigo-400"
          />
          <textarea
            placeholder="Descripción (opcional)..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 mb-2 outline-none focus:border-indigo-400 resize-none"
          />
          <div className="flex gap-2 mb-3">
            <select
              value={horizon}
              onChange={e => setHorizon(e.target.value as Goal['horizon'])}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400"
            >
              {HORIZONS.map(h => (
                <option key={h.value} value={h.value}>{h.label}</option>
              ))}
            </select>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Guardar
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 text-gray-500 text-sm rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {HORIZONS.map(h => {
        const filtered = goals.filter(g => g.horizon === h.value)
        if (filtered.length === 0) return null
        return (
          <div key={h.value} className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${h.color}`}>
                {h.label}
              </span>
              <span className="text-xs text-gray-400">{filtered.length}</span>
            </div>
            <div className="flex flex-col gap-2">
              {filtered.map(goal => (
                <div key={goal.id} className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                  <div
                    className="px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedId(expandedId === goal.id ? null : goal.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${goal.status === 'completado' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                          {goal.title}
                        </p>
                        {goal.description && (
                          <p className="text-xs text-gray-400 mt-0.5 truncate">{goal.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {goal.due_date && (
                          <span className="text-xs text-gray-400">
                            {new Date(goal.due_date).toLocaleDateString('es-AR')}
                          </span>
                        )}
                        <span className="text-xs font-medium text-indigo-600">{goal.progress_pct}%</span>
                      </div>
                    </div>
                    <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all"
                        style={{ width: `${goal.progress_pct}%` }}
                      />
                    </div>
                  </div>

                  {expandedId === goal.id && (
                    <div className="px-4 pb-4 border-t border-gray-50">
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-medium text-gray-500">Progreso</p>
                          <span className="text-xs text-gray-400">{goal.progress_pct}%</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={goal.progress_pct}
                          onChange={e => updateProgress(goal.id, Number(e.target.value))}
                          className="w-full accent-indigo-600"
                        />
                      </div>
                      <div className="mt-3">
                        <p className="text-xs font-medium text-gray-500 mb-2">Hitos</p>
                        {goal.milestones?.map(m => (
                          <div key={m.id} className="flex items-center gap-2 py-1">
                            <button
                              onClick={() => toggleMilestone(m)}
                              className={`w-4 h-4 rounded border flex-shrink-0 transition-colors ${m.completed ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'}`}
                            />
                            <span className={`text-xs ${m.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                              {m.title}
                            </span>
                          </div>
                        ))}
                        <div className="flex gap-2 mt-2">
                          <input
                            type="text"
                            placeholder="Nuevo hito..."
                            value={newMilestone}
                            onChange={e => setNewMilestone(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAddMilestone(goal.id)}
                            className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-indigo-400"
                          />
                          <button
                            onClick={() => handleAddMilestone(goal.id)}
                            className="px-2 py-1.5 bg-gray-100 text-gray-600 text-xs rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            + Agregar
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <select
                          value={goal.status}
                          onChange={e => updateStatus(goal.id, e.target.value as Goal['status'])}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-indigo-400"
                        >
                          <option value="activo">Activo</option>
                          <option value="completado">Completado</option>
                          <option value="pausado">Pausado</option>
                          <option value="abandonado">Abandonado</option>
                        </select>
                        <button
                          onClick={() => deleteGoal(goal.id)}
                          className="text-xs text-red-400 hover:text-red-600 transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {goals.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-sm">No tenés metas todavía</p>
          <p className="text-xs mt-1">Creá tu primera con el botón de arriba</p>
        </div>
      )}
    </div>
  )
}