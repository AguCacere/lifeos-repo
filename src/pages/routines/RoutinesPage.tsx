import { useState } from 'react'
import { useRoutines } from '../../hooks/useRoutines'
import type { Routine } from '../../types'

const PERIODS: { value: Routine['period'], label: string }[] = [
  { value: 'manana', label: 'Mañana' },
  { value: 'tarde', label: 'Tarde' },
  { value: 'noche', label: 'Noche' },
  { value: 'personalizado', label: 'Personalizado' },
]

const COLORS = ['#6366f1', '#f97316', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function RoutinesPage({ userId }: { userId: string }) {
  const { routines, habits, completedBlocks, loading, addRoutine, addBlock, toggleBlock, deleteBlock, deleteRoutine } = useRoutines(userId)

  const [showRoutineForm, setShowRoutineForm] = useState(false)
  const [routineName, setRoutineName] = useState('')
  const [routinePeriod, setRoutinePeriod] = useState<Routine['period']>('manana')

  const [addingBlockTo, setAddingBlockTo] = useState<string | null>(null)
  const [blockTitle, setBlockTitle] = useState('')
  const [blockStart, setBlockStart] = useState('07:00')
  const [blockEnd, setBlockEnd] = useState('07:30')
  const [blockColor, setBlockColor] = useState(COLORS[0])
  const [blockHabitId, setBlockHabitId] = useState<string>('')

  async function handleAddRoutine() {
    if (!routineName.trim()) return
    await addRoutine(routineName, routinePeriod)
    setRoutineName('')
    setShowRoutineForm(false)
  }

  async function handleAddBlock(routineId: string) {
    await addBlock(routineId, {
      title: blockTitle || habits.find(h => h.id === blockHabitId)?.name || 'Bloque',
      start_time: blockStart,
      end_time: blockEnd,
      color: blockColor,
      note: null,
      habit_id: blockHabitId || null,
    })
    setBlockTitle('')
    setBlockStart('07:00')
    setBlockEnd('07:30')
    setBlockHabitId('')
    setAddingBlockTo(null)
  }

  function getBlockDuration(start: string, end: string) {
    const [sh, sm] = start.split(':').map(Number)
    const [eh, em] = end.split(':').map(Number)
    const mins = (eh * 60 + em) - (sh * 60 + sm)
    if (mins < 60) return `${mins}min`
    return `${Math.floor(mins / 60)}h${mins % 60 > 0 ? ` ${mins % 60}min` : ''}`
  }

  if (loading) return <p className="text-gray-400 text-sm">Cargando rutinas...</p>

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Rutinas</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {routines.length} rutina{routines.length !== 1 ? 's' : ''} activa{routines.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowRoutineForm(!showRoutineForm)}
          className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + Nueva rutina
        </button>
      </div>

      {showRoutineForm && (
        <div className="bg-white border border-gray-100 rounded-xl p-4 mb-4 shadow-sm">
          <p className="text-sm font-medium text-gray-700 mb-3">Nueva rutina</p>
          <input
            type="text"
            placeholder="Nombre de la rutina..."
            value={routineName}
            onChange={e => setRoutineName(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 mb-2 outline-none focus:border-indigo-400"
          />
          <select
            value={routinePeriod}
            onChange={e => setRoutinePeriod(e.target.value as Routine['period'])}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 mb-3 outline-none focus:border-indigo-400"
          >
            {PERIODS.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              onClick={handleAddRoutine}
              className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Guardar
            </button>
            <button
              onClick={() => setShowRoutineForm(false)}
              className="px-3 py-1.5 text-gray-500 text-sm rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {routines.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-sm">No tenés rutinas todavía</p>
          <p className="text-xs mt-1">Creá tu primera con el botón de arriba</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {routines.map(routine => {
            const completed = routine.blocks?.filter(b => completedBlocks.includes(b.id)).length ?? 0
            const total = routine.blocks?.length ?? 0

            return (
              <div key={routine.id} className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                <div className="px-4 py-3 flex items-center justify-between border-b border-gray-50">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{routine.name}</p>
                    <p className="text-xs text-gray-400 capitalize">
                      {PERIODS.find(p => p.value === routine.period)?.label} · {completed}/{total} completados
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAddingBlockTo(addingBlockTo === routine.id ? null : routine.id)}
                      className="text-xs text-indigo-500 hover:text-indigo-700 transition-colors"
                    >
                      + Bloque
                    </button>
                    <button
                      onClick={() => deleteRoutine(routine.id)}
                      className="text-xs text-gray-300 hover:text-red-400 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {addingBlockTo === routine.id && (
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <p className="text-xs font-medium text-gray-600 mb-2">Nuevo bloque</p>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="time"
                        value={blockStart}
                        onChange={e => setBlockStart(e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-indigo-400"
                      />
                      <input
                        type="time"
                        value={blockEnd}
                        onChange={e => setBlockEnd(e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-indigo-400"
                      />
                    </div>
                    <select
                      value={blockHabitId}
                      onChange={e => {
                        setBlockHabitId(e.target.value)
                        if (e.target.value) {
                          const habit = habits.find(h => h.id === e.target.value)
                          if (habit) setBlockTitle(habit.name)
                        }
                      }}
                      className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 mb-2 outline-none focus:border-indigo-400"
                    >
                      <option value="">Sin hábito vinculado</option>
                      {habits.map(h => (
                        <option key={h.id} value={h.id}>{h.name}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Título del bloque..."
                      value={blockTitle}
                      onChange={e => setBlockTitle(e.target.value)}
                      className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 mb-2 outline-none focus:border-indigo-400"
                    />
                    <div className="flex items-center gap-2 mb-2">
                      {COLORS.map(c => (
                        <button
                          key={c}
                          onClick={() => setBlockColor(c)}
                          className={`w-4 h-4 rounded-full transition-transform ${blockColor === c ? 'scale-125' : ''}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddBlock(routine.id)}
                        className="px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => setAddingBlockTo(null)}
                        className="px-3 py-1.5 text-gray-500 text-xs rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                <div className="px-4 py-3">
                  {total === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-4">
                      Sin bloques — agregá uno con "+ Bloque"
                    </p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {routine.blocks?.map(block => {
                        const done = completedBlocks.includes(block.id)
                        const linkedHabit = habits.find(h => h.id === block.habit_id)
                        return (
                          <div
                            key={block.id}
                            className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${done ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
                          >
                            <button
                              onClick={() => toggleBlock(block)}
                              className="w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all"
                              style={{
                                borderColor: done ? block.color : '#d1d5db',
                                backgroundColor: done ? block.color : 'transparent',
                              }}
                            />
                            <div
                              className="w-1 h-8 rounded-full flex-shrink-0"
                              style={{ backgroundColor: block.color }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${done ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                {block.title}
                              </p>
                              <p className="text-xs text-gray-400">
                                {block.start_time} — {block.end_time} · {getBlockDuration(block.start_time, block.end_time)}
                                {linkedHabit && <span className="ml-1 text-indigo-400">· hábito vinculado</span>}
                              </p>
                            </div>
                            <button
                              onClick={() => deleteBlock(routine.id, block.id)}
                              className="text-gray-300 hover:text-red-400 text-xs transition-colors"
                            >
                              ✕
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {total > 0 && (
                  <div className="px-4 pb-3">
                    <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all"
                        style={{ width: `${(completed / total) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}