import { useState } from 'react'
import {
  AreaChart, Area, XAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import { useHabits, calculateStreak } from '../../hooks/useHabits'
import type { Habit, HabitLog } from '../../types'

const CATEGORIES = ['general', 'salud', 'aprendizaje', 'trabajo', 'personal'] as const
const COLORS = ['#6366f1', '#f97316', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

const CATEGORY_COLORS: Record<string, string> = {
  salud: '#10b981',
  aprendizaje: '#6366f1',
  trabajo: '#f97316',
  personal: '#8b5cf6',
  general: '#6b7280',
}

// ── Weekly data builder ────────────────────────────────────────────────────
function buildWeeklyData(habits: Habit[], logs: HabitLog[]) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return Array.from({ length: 5 }, (_, i) => {
    // i=0 → SEMANA 1 (oldest), i=4 → ACTUAL
    const weeksAgo = 4 - i
    const weekEnd = new Date(today)
    weekEnd.setDate(today.getDate() - weeksAgo * 7)
    const weekStart = new Date(weekEnd)
    weekStart.setDate(weekEnd.getDate() - 6)

    let total = 0
    let count = 0

    for (let d = 0; d < 7; d++) {
      const day = new Date(weekStart)
      day.setDate(weekStart.getDate() + d)
      if (day > today) continue

      const dateStr = day.toISOString().split('T')[0]
      const done = habits.filter(h =>
        logs.some(l => l.habit_id === h.id && l.log_date === dateStr && l.completed)
      ).length

      if (habits.length > 0) {
        total += (done / habits.length) * 100
        count++
      }
    }

    return {
      week: weeksAgo === 0 ? 'ACTUAL' : `SEMANA ${i + 1}`,
      pct: count > 0 ? Math.round(total / count) : 0,
    }
  })
}

// ── Custom tooltip ─────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#1e1b4b',
      borderRadius: 8,
      padding: '8px 12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
    }}>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, marginBottom: 2, letterSpacing: '0.08em' }}>
        {label}
      </p>
      <p style={{ color: 'white', fontSize: 14, fontWeight: 700, margin: 0 }}>
        Completado: {payload[0].value}%
      </p>
    </div>
  )
}

// ── Custom dot ─────────────────────────────────────────────────────────────
function buildDotRenderer(maxPct: number) {
  return function CustomDot(props: {
    cx?: number; cy?: number; payload?: { pct: number }
  }) {
    const { cx, cy, payload } = props
    if (cx == null || cy == null || !payload) return null
    const isMax = payload.pct === maxPct && maxPct > 0
    return (
      <circle
        cx={cx}
        cy={cy}
        r={isMax ? 5 : 2.5}
        fill="#6366f1"
        stroke={isMax ? 'white' : 'none'}
        strokeWidth={isMax ? 2 : 0}
        fillOpacity={isMax ? 1 : 0.45}
      />
    )
  }
}

// ── Main component ─────────────────────────────────────────────────────────
export default function HabitsPage({ userId }: { userId: string }) {
  const { habits, logs, loading, addHabit, toggleHabit, deleteHabit, isCompletedToday } = useHabits(userId)

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

  if (loading) return <p className="text-gray-400 text-sm pt-4">Cargando hábitos...</p>

  // Group habits by category
  const grouped = CATEGORIES.reduce((acc, cat) => {
    const catHabits = habits.filter(h => h.category === cat)
    if (catHabits.length > 0) acc[cat] = catHabits
    return acc
  }, {} as Record<string, typeof habits>)

  const streak = calculateStreak(habits, logs)
  const completedToday = habits.filter(h => isCompletedToday(h.id)).length

  // Chart
  const uniqueDates = new Set(logs.map(l => l.log_date))
  const showChart = uniqueDates.size >= 7 && habits.length > 0
  const weeklyData = showChart ? buildWeeklyData(habits, logs) : []
  const maxPct = weeklyData.length > 0 ? Math.max(...weeklyData.map(d => d.pct)) : 0
  const CustomDot = buildDotRenderer(maxPct)

  return (
    <div className="max-w-4xl mx-auto pt-6 md:pt-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Habit Tracker</h1>
          <p className="text-sm text-gray-400 mt-0.5">Building the architecture of your discipline.</p>
        </div>

        {/* Streak card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex items-center gap-4 self-start">
          <div>
            <p className="text-[9px] tracking-[0.2em] text-gray-400 uppercase font-semibold mb-2">Racha actual</p>
            <div className="flex gap-1">
              {Array.from({ length: 7 }, (_, i) => {
                const filled = i < Math.min(streak % 7 === 0 && streak > 0 ? 7 : streak % 7, 7)
                return (
                  <div
                    key={i}
                    className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold transition-colors"
                    style={{
                      backgroundColor: filled ? '#6366f1' : '#eef2ff',
                      color: filled ? 'white' : '#a5b4fc',
                    }}
                  >
                    {i + 1}
                  </div>
                )
              })}
            </div>
          </div>
          <div className="text-center pl-3 border-l border-gray-100">
            <p className="text-2xl font-bold text-gray-900">{streak}</p>
            <p className="text-[9px] tracking-[0.15em] text-gray-400 uppercase">Días</p>
          </div>
        </div>
      </div>

      {/* Weekly evolution chart */}
      {showChart && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 pt-4 pb-2 mb-6">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">Evolución semanal</p>
            <p className="text-xs font-semibold text-indigo-600">{weeklyData[4]?.pct ?? 0}% esta semana</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={weeklyData} margin={{ top: 16, right: 8, left: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="habitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="week"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 9, fill: '#9ca3af', fontWeight: 700, letterSpacing: '0.1em' }}
                dy={8}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 2' }}
              />
              <Area
                type="monotone"
                dataKey="pct"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#habitGrad)"
                dot={<CustomDot />}
                activeDot={{ r: 5, fill: '#6366f1', stroke: 'white', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* New habit form */}
      {showForm && (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 md:p-5 mb-5 shadow-sm">
          <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-4">Nuevo hábito</p>
          <input
            type="text"
            placeholder="Nombre del hábito..."
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full text-sm border-b border-gray-200 pb-2.5 mb-5 outline-none focus:border-indigo-500 bg-transparent text-gray-700 placeholder:text-gray-300 transition-colors"
          />

          {/* Category pills */}
          <div className="mb-4">
            <p className="text-[10px] font-bold tracking-[0.15em] text-gray-400 uppercase mb-2">Categoría</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all capitalize ${
                    category === c
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div className="mb-5">
            <p className="text-[10px] font-bold tracking-[0.15em] text-gray-400 uppercase mb-2">Color</p>
            <div className="flex gap-2.5 items-center">
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full transition-transform flex-shrink-0"
                  style={{
                    backgroundColor: c,
                    transform: color === c ? 'scale(1.3)' : 'scale(1)',
                    boxShadow: color === c ? `0 0 0 2px white, 0 0 0 3.5px ${c}` : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="flex-1 md:flex-none px-4 py-3 min-h-[44px] bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Guardar
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 md:flex-none px-4 py-3 min-h-[44px] text-gray-500 text-sm rounded-xl hover:bg-gray-50 transition-colors border border-gray-100"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {habits.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-16 px-6">
          <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-gray-700 mb-1">No tenés hábitos todavía</p>
          <p className="text-xs text-gray-400 mb-4">Creá tu primero con el botón de abajo</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-5 py-3 min-h-[44px] bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
          >
            + Nuevo hábito
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Today's summary */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">
              <span className="font-semibold text-gray-700">{completedToday}</span> de {habits.length} hábitos completos hoy
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition-colors min-h-[36px]"
            >
              + Nuevo hábito
            </button>
          </div>

          {/* Category sections */}
          {Object.entries(grouped).map(([cat, catHabits]) => {
            const doneInCat = catHabits.filter(h => isCompletedToday(h.id)).length
            const catColor = CATEGORY_COLORS[cat] ?? '#6b7280'
            return (
              <div key={cat}>
                {/* Category header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: catColor }} />
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500">{cat}</span>
                  <span className="text-[10px] text-gray-400 font-medium">{doneInCat}/{catHabits.length} Done</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>

                {/* Habit cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {catHabits.map(habit => {
                    const done = isCompletedToday(habit.id)
                    return (
                      <div
                        key={habit.id}
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:border-gray-200 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold leading-tight ${done ? 'text-gray-400' : 'text-gray-800'}`}>
                              {habit.name}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-0.5 capitalize">{habit.frequency}</p>
                          </div>
                          <button
                            onClick={() => toggleHabit(habit.id)}
                            className="w-7 h-7 md:w-6 md:h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ml-2"
                            style={{
                              borderColor: done ? habit.color : '#e5e7eb',
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

                        <div className="h-0.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: done ? '100%' : '0%', backgroundColor: habit.color }}
                          />
                        </div>

                        {done && (
                          <p className="text-[10px] text-gray-400">Completado hoy</p>
                        )}

                        <div className="flex items-center justify-between mt-1">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: habit.color }} />
                          <button
                            onClick={() => deleteHabit(habit.id)}
                            className="text-gray-200 hover:text-red-400 text-xs transition-colors p-1"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    )
                  })}

                  {/* Add habit in category */}
                  <button
                    onClick={() => { setCategory(cat as typeof CATEGORIES[number]); setShowForm(true) }}
                    className="bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-4 flex flex-col items-center justify-center gap-2 hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors min-h-[100px]"
                  >
                    <div className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 text-sm">
                      +
                    </div>
                    <span className="text-[10px] text-gray-400">New Habit</span>
                  </button>
                </div>
              </div>
            )
          })}

          {/* Global add button */}
          <button
            onClick={() => setShowForm(true)}
            className="w-full py-3.5 rounded-2xl border border-dashed border-gray-200 text-sm text-gray-400 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50/30 transition-colors font-medium"
          >
            + Nuevo hábito
          </button>
        </div>
      )}
    </div>
  )
}
