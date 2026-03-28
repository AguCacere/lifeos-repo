import { useState, useRef, useEffect } from 'react'
import { useRoutines } from '../../hooks/useRoutines'
import type { Routine } from '../../types'

const PERIODS: { value: Routine['period'], label: string, icon: string }[] = [
  { value: 'manana', label: 'Mañana', icon: '☀️' },
  { value: 'tarde',  label: 'Tarde',  icon: '🌤️' },
  { value: 'noche',  label: 'Noche',  icon: '🌙' },
]

const COLORS = ['#6366f1', '#f97316', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

type PendingBlock = {
  title: string
  start_time: string
  end_time: string
  color: string
  habit_id: string | null
}

function getBlockDuration(start: string, end: string) {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  const mins = (eh * 60 + em) - (sh * 60 + sm)
  if (mins <= 0) return '—'
  if (mins < 60) return `${mins}m`
  return `${Math.floor(mins / 60)}h${mins % 60 > 0 ? `${mins % 60}m` : ''}`
}

function getTotalMins(blocks: PendingBlock[]) {
  return blocks.reduce((acc, b) => {
    const [sh, sm] = b.start_time.split(':').map(Number)
    const [eh, em] = b.end_time.split(':').map(Number)
    const mins = (eh * 60 + em) - (sh * 60 + sm)
    return acc + Math.max(0, mins)
  }, 0)
}

export default function RoutinesPage({ userId }: { userId: string }) {
  const { routines, habits, completedBlocks, loading, addRoutine, addBlock, toggleBlock, deleteBlock, deleteRoutine } = useRoutines(userId)

  // ── Existing state ──────────────────────────────────────────────────────────
  const [showRoutineForm, setShowRoutineForm] = useState(false)
  const [routineName, setRoutineName] = useState('')
  const [routinePeriod, setRoutinePeriod] = useState<Routine['period']>('manana')

  const [addingBlockTo, setAddingBlockTo] = useState<string | null>(null)
  const [blockTitle, setBlockTitle] = useState('')
  const [blockStart, setBlockStart] = useState('07:00')
  const [blockEnd, setBlockEnd] = useState('07:30')
  const [blockColor, setBlockColor] = useState(COLORS[0])
  const [blockHabitId, setBlockHabitId] = useState<string>('')

  // ── Modal-only state (pending blocks + reminder fields — UI only) ────────────
  const [pendingBlocks, setPendingBlocks] = useState<PendingBlock[]>([])
  const [showBlockForm, setShowBlockForm] = useState(false)
  const [pbTitle, setPbTitle] = useState('')
  const [pbStart, setPbStart] = useState('07:00')
  const [pbEnd, setPbEnd] = useState('07:30')
  const [pbColor, setPbColor] = useState(COLORS[0])
  const [reminder, setReminder] = useState('07:30')
  const [frequency, setFrequency] = useState('Lun - Vie')

  // Ref trick: add pending blocks after routine is created
  const pendingBlocksRef = useRef<PendingBlock[]>([])
  const prevRoutinesLenRef = useRef(routines.length)

  useEffect(() => {
    if (pendingBlocksRef.current.length > 0 && routines.length > prevRoutinesLenRef.current) {
      const newRoutine = routines[routines.length - 1]
      pendingBlocksRef.current.forEach(b =>
        addBlock(newRoutine.id, {
          title: b.title,
          start_time: b.start_time,
          end_time: b.end_time,
          color: b.color,
          note: null,
          habit_id: b.habit_id,
        })
      )
      pendingBlocksRef.current = []
    }
    prevRoutinesLenRef.current = routines.length
  }, [routines])

  // ── Handlers ────────────────────────────────────────────────────────────────
  async function handleAddRoutine() {
    if (!routineName.trim()) return
    pendingBlocksRef.current = pendingBlocks
    await addRoutine(routineName, routinePeriod)
    setRoutineName('')
    setPendingBlocks([])
    setShowRoutineForm(false)
  }

  function handleAddPendingBlock() {
    if (!pbTitle.trim()) return
    setPendingBlocks(prev => [...prev, { title: pbTitle, start_time: pbStart, end_time: pbEnd, color: pbColor, habit_id: null }])
    setPbTitle('')
    setPbStart('07:00')
    setPbEnd('07:30')
    setPbColor(COLORS[0])
    setShowBlockForm(false)
  }

  function handleDiscard() {
    setRoutineName('')
    setRoutinePeriod('manana')
    setPendingBlocks([])
    setShowBlockForm(false)
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

  if (loading) return <p className="text-gray-400 text-sm pt-4">Cargando rutinas...</p>

  const totalMins = getTotalMins(pendingBlocks)

  return (
    <div className="max-w-2xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Rutinas</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {routines.length} rutina{routines.length !== 1 ? 's' : ''} activa{routines.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowRoutineForm(true)}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
        >
          + Nueva rutina
        </button>
      </div>

      {/* ── MODAL OVERLAY ─────────────────────────────────────────────────── */}
      {showRoutineForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={handleDiscard}
          />

          {/* Panel */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">

            {/* Header accent + title */}
            <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-gray-100">
              <div className="w-1 h-6 bg-indigo-600 rounded-full flex-shrink-0" />
              <h2 className="text-base font-bold text-gray-900 flex-1">Nueva Rutina</h2>
              <button
                onClick={handleDiscard}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors text-sm"
              >
                ✕
              </button>
            </div>

            <div className="px-5 py-4 flex flex-col gap-5">

              {/* Routine name */}
              <div>
                <label className="block text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-2">
                  Nombre de la Rutina
                </label>
                <input
                  type="text"
                  placeholder="Ej: Enfoque Profundo Matutino"
                  value={routineName}
                  onChange={e => setRoutineName(e.target.value)}
                  className="w-full text-sm border-b border-gray-200 pb-2.5 outline-none focus:border-indigo-500 bg-transparent text-gray-700 placeholder:text-gray-300 transition-colors"
                  autoFocus
                />
              </div>

              {/* Period selector */}
              <div className="grid grid-cols-3 gap-2">
                {PERIODS.map(p => (
                  <button
                    key={p.value}
                    onClick={() => setRoutinePeriod(p.value)}
                    className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                      routinePeriod === p.value
                        ? 'border-indigo-600 text-indigo-600 bg-indigo-50'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-base">{p.icon}</span>
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Blocks section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">
                    Bloques de Tareas
                  </label>
                  {totalMins > 0 && (
                    <span className="text-xs font-semibold text-indigo-500">{totalMins} min total</span>
                  )}
                </div>

                {/* Pending blocks list */}
                <div className="flex flex-col gap-2 mb-2">
                  {pendingBlocks.map((b, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 rounded-xl group"
                    >
                      <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM8 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM8 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM16 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM16 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM16 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
                      </svg>
                      <div
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: b.color }}
                      />
                      <span className="flex-1 text-sm text-gray-700 font-medium">{b.title}</span>
                      <span
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${b.color}20`, color: b.color }}
                      >
                        {getBlockDuration(b.start_time, b.end_time)}
                      </span>
                      <button
                        onClick={() => setPendingBlocks(prev => prev.filter((_, idx) => idx !== i))}
                        className="text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                {/* Inline mini form for pending block */}
                {showBlockForm ? (
                  <div className="border border-dashed border-indigo-200 bg-indigo-50/50 rounded-xl p-3 flex flex-col gap-2.5">
                    <input
                      type="text"
                      placeholder="Nombre del bloque..."
                      value={pbTitle}
                      onChange={e => setPbTitle(e.target.value)}
                      className="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400"
                    />
                    <div className="flex gap-2">
                      <input
                        type="time"
                        value={pbStart}
                        onChange={e => setPbStart(e.target.value)}
                        className="flex-1 text-xs bg-white border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-indigo-400"
                      />
                      <input
                        type="time"
                        value={pbEnd}
                        onChange={e => setPbEnd(e.target.value)}
                        className="flex-1 text-xs bg-white border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-indigo-400"
                      />
                    </div>
                    <div className="flex gap-1.5">
                      {COLORS.map(c => (
                        <button
                          key={c}
                          onClick={() => setPbColor(c)}
                          className="w-5 h-5 rounded-full transition-transform flex-shrink-0"
                          style={{
                            backgroundColor: c,
                            transform: pbColor === c ? 'scale(1.25)' : 'scale(1)',
                            boxShadow: pbColor === c ? `0 0 0 2px white, 0 0 0 3px ${c}` : 'none',
                          }}
                        />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddPendingBlock}
                        className="flex-1 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Añadir
                      </button>
                      <button
                        onClick={() => setShowBlockForm(false)}
                        className="flex-1 py-1.5 text-gray-500 text-xs rounded-lg hover:bg-white transition-colors border border-gray-200"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowBlockForm(true)}
                    className="w-full py-2.5 border border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50/30 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Añadir Sub-tarea
                  </button>
                )}
              </div>

              {/* Reminder + Frequency */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                    </svg>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Recordatorio</span>
                  </div>
                  <input
                    type="time"
                    value={reminder}
                    onChange={e => setReminder(e.target.value)}
                    className="text-sm font-semibold text-gray-700 bg-transparent outline-none w-full"
                  />
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                    </svg>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Frecuencia</span>
                  </div>
                  <input
                    type="text"
                    value={frequency}
                    onChange={e => setFrequency(e.target.value)}
                    className="text-sm font-semibold text-gray-700 bg-transparent outline-none w-full"
                  />
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
              <div className="flex items-center gap-1">
                {pendingBlocks.slice(0, 3).map((b, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-white -ml-1 first:ml-0"
                    style={{ backgroundColor: b.color }}
                  >
                    {b.title.charAt(0).toUpperCase()}
                  </div>
                ))}
                {pendingBlocks.length > 3 && (
                  <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[9px] font-bold text-gray-600 -ml-1">
                    +{pendingBlocks.length - 3}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDiscard}
                  className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors font-medium"
                >
                  Descartar
                </button>
                <button
                  onClick={handleAddRoutine}
                  disabled={!routineName.trim()}
                  className="px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-40"
                >
                  Crear Rutina
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── ROUTINE CARDS LIST ─────────────────────────────────────────────── */}
      {routines.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-16 px-6">
          <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-gray-700 mb-1">No tenés rutinas todavía</p>
          <p className="text-xs text-gray-400 mb-4">Creá tu primera rutina con el botón de arriba</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {routines.map(routine => {
            const completed = routine.blocks?.filter(b => completedBlocks.includes(b.id)).length ?? 0
            const total = routine.blocks?.length ?? 0
            const periodLabel = PERIODS.find(p => p.value === routine.period)

            return (
              <div key={routine.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                {/* Card header */}
                <div className="px-4 py-3.5 flex items-center justify-between border-b border-gray-50">
                  <div className="flex items-center gap-3">
                    {periodLabel && (
                      <span className="text-lg">{periodLabel.icon}</span>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{routine.name}</p>
                      <p className="text-xs text-gray-400">
                        {periodLabel?.label} · {completed}/{total} completados
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAddingBlockTo(addingBlockTo === routine.id ? null : routine.id)}
                      className="text-xs text-indigo-500 hover:text-indigo-700 font-medium transition-colors px-2 py-1 rounded-lg hover:bg-indigo-50"
                    >
                      + Bloque
                    </button>
                    <button
                      onClick={() => deleteRoutine(routine.id)}
                      className="w-6 h-6 rounded-full text-gray-300 hover:text-red-400 hover:bg-red-50 flex items-center justify-center transition-colors text-xs"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Block add form */}
                {addingBlockTo === routine.id && (
                  <div className="px-4 py-3 bg-indigo-50/50 border-b border-indigo-100">
                    <p className="text-xs font-semibold text-indigo-600 mb-2">Nuevo bloque</p>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="time"
                        value={blockStart}
                        onChange={e => setBlockStart(e.target.value)}
                        className="flex-1 text-xs border border-gray-200 bg-white rounded-lg px-2 py-1.5 outline-none focus:border-indigo-400"
                      />
                      <input
                        type="time"
                        value={blockEnd}
                        onChange={e => setBlockEnd(e.target.value)}
                        className="flex-1 text-xs border border-gray-200 bg-white rounded-lg px-2 py-1.5 outline-none focus:border-indigo-400"
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
                      className="w-full text-xs border border-gray-200 bg-white rounded-lg px-2 py-1.5 mb-2 outline-none focus:border-indigo-400"
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
                      className="w-full text-xs border border-gray-200 bg-white rounded-lg px-2 py-1.5 mb-2 outline-none focus:border-indigo-400"
                    />
                    <div className="flex items-center gap-2 mb-2">
                      {COLORS.map(c => (
                        <button
                          key={c}
                          onClick={() => setBlockColor(c)}
                          className="w-5 h-5 rounded-full transition-transform flex-shrink-0"
                          style={{
                            backgroundColor: c,
                            transform: blockColor === c ? 'scale(1.25)' : 'scale(1)',
                            boxShadow: blockColor === c ? `0 0 0 2px white, 0 0 0 3px ${c}` : 'none',
                          }}
                        />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddBlock(routine.id)}
                        className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => setAddingBlockTo(null)}
                        className="px-3 py-1.5 text-gray-500 text-xs rounded-lg hover:bg-white border border-gray-200 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {/* Blocks */}
                <div className="px-4 py-3">
                  {total === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-4">
                      Sin bloques — agregá uno con "+ Bloque"
                    </p>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      {routine.blocks?.map(block => {
                        const done = completedBlocks.includes(block.id)
                        const linkedHabit = habits.find(h => h.id === block.habit_id)
                        return (
                          <div
                            key={block.id}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${done ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
                          >
                            <button
                              onClick={() => toggleBlock(block)}
                              className="w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all"
                              style={{
                                borderColor: done ? block.color : '#d1d5db',
                                backgroundColor: done ? block.color : 'transparent',
                              }}
                            >
                              {done && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                              )}
                            </button>
                            <div className="w-1 h-7 rounded-full flex-shrink-0" style={{ backgroundColor: block.color }} />
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${done ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                {block.title}
                              </p>
                              <p className="text-[10px] text-gray-400">
                                {block.start_time} — {block.end_time} · {getBlockDuration(block.start_time, block.end_time)}
                                {linkedHabit && <span className="ml-1 text-indigo-400">· hábito vinculado</span>}
                              </p>
                            </div>
                            <span
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: `${block.color}20`, color: block.color }}
                            >
                              {getBlockDuration(block.start_time, block.end_time)}
                            </span>
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

                {/* Progress bar */}
                {total > 0 && (
                  <div className="px-4 pb-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] text-gray-400">Progreso</span>
                      <span className="text-[10px] font-semibold text-gray-500">{Math.round((completed / total) * 100)}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
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
