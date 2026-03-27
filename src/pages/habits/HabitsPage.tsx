import { useState } from 'react'
import { useHabits } from '../../hooks/useHabits'

const CATEGORIES = ['general', 'salud', 'aprendizaje', 'trabajo', 'personal'] as const
const COLORS = ['#6366f1', '#f97316', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function HabitsPage({ userId }: { userId: string }) {
  const { habits, loading, addHabit, toggleHabit, deleteHabit, isCompletedToday } = useHabits(userId)

  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [category, setCategory] = useState<typeof CATEGORIES[number]>('general')
  const [color, setColor] = useState(COLORS[0])

  async function handleAdd() {
    if (!name.trim()) return
    await addHabit({
      name,
      description: null,
      category,
      frequency: 'diario',
      target_streak: 21,
      color,
      is_active: true,
    })
    setName('')
    setShowForm(false)
  }

  if (loading) return <p className="text-gray-400 text-sm">Cargando hábitos...</p>

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Hábitos</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + Nuevo hábito
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-100 rounded-xl p-4 mb-4 shadow-sm">
          <p className="text-sm font-medium text-gray-700 mb-3">Nuevo hábito</p>
          <input
            type="text"
            placeholder="Nombre del hábito..."
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 mb-3 outline-none focus:border-indigo-400"
          />
          <div className="flex items-center gap-3 mb-3">
            <select
              value={category}
              onChange={e => setCategory(e.target.value as typeof CATEGORIES[number])}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <div className="flex gap-1.5">
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-5 h-5 rounded-full transition-transform ${color === c ? 'scale-125' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
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

      {habits.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-sm">No tenés hábitos todavía</p>
          <p className="text-xs mt-1">Creá tu primero con el botón de arriba</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {habits.map(habit => {
            const done = isCompletedToday(habit.id)
            return (
              <div
                key={habit.id}
                className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm hover:border-gray-200 transition-colors"
              >
                <button
                  onClick={() => toggleHabit(habit.id)}
                  className="w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all"
                  style={{
                    borderColor: done ? habit.color : '#d1d5db',
                    backgroundColor: done ? habit.color : 'transparent',
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${done ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                    {habit.name}
                  </p>
                  <p className="text-xs text-gray-400 capitalize">{habit.category}</p>
                </div>
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: habit.color }}
                />
                <button
                  onClick={() => deleteHabit(habit.id)}
                  className="text-gray-300 hover:text-red-400 text-xs transition-colors ml-1"
                >
                  ✕
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}