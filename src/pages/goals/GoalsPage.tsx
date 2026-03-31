import { useState } from 'react'
import { useGoals } from '../../hooks/useGoals'
import type { Goal } from '../../types'

const HORIZONS: { value: Goal['horizon'], label: string, color: string }[] = [
  { value: 'corto', label: 'Corto plazo', color: 'bg-green-100 text-green-700' },
  { value: 'mediano', label: 'Mediano plazo', color: 'bg-amber-100 text-amber-700' },
  { value: 'largo', label: 'Largo plazo', color: 'bg-indigo-100 text-indigo-700' },
]

const MONTHS_ES = [
  { v: '01', l: 'Ene' }, { v: '02', l: 'Feb' }, { v: '03', l: 'Mar' },
  { v: '04', l: 'Abr' }, { v: '05', l: 'May' }, { v: '06', l: 'Jun' },
  { v: '07', l: 'Jul' }, { v: '08', l: 'Ago' }, { v: '09', l: 'Sep' },
  { v: '10', l: 'Oct' }, { v: '11', l: 'Nov' }, { v: '12', l: 'Dic' },
]
const CUR_YEAR = new Date().getFullYear()
const YEARS_LIST = Array.from({ length: 6 }, (_, i) => String(CUR_YEAR + i))
const DAYS_LIST = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'))

function CustomSelect({
  value, onChange, children, className,
}: { value: string; onChange: (v: string) => void; children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative ${className ?? ''}`}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:bg-white transition-all text-gray-700 pr-8 cursor-pointer"
      >
        {children}
      </select>
      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </div>
    </div>
  )
}

export default function GoalsPage({ userId }: { userId: string }) {
  const { goals, loading, addGoal, updateProgress, updateStatus, addMilestone, toggleMilestone, deleteGoal } = useGoals(userId)

  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [horizon, setHorizon] = useState<Goal['horizon']>('corto')
  const [dueDate, setDueDate] = useState('')
  const [ddDay, setDdDay] = useState('')
  const [ddMonth, setDdMonth] = useState('')
  const [ddYear, setDdYear] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [newMilestone, setNewMilestone] = useState('')

  function handleDateChange(day: string, month: string, year: string) {
    setDdDay(day)
    setDdMonth(month)
    setDdYear(year)
    if (day && month && year) {
      setDueDate(`${year}-${month}-${day}`)
    } else {
      setDueDate('')
    }
  }

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
    setDdDay('')
    setDdMonth('')
    setDdYear('')
    setShowForm(false)
  }

  async function handleAddMilestone(goalId: string) {
    if (!newMilestone.trim()) return
    await addMilestone(goalId, newMilestone)
    setNewMilestone('')
  }

  if (loading) return <p className="text-gray-400 text-sm">Cargando metas...</p>

  return (
    <div className="max-w-2xl pt-6 md:pt-0">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Metas</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {goals.filter(g => g.status === 'activo').length} activas
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-3 min-h-[44px] bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
        >
          + Nueva meta
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-5 shadow-sm">
          <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-4">Nueva meta</p>

          <input
            type="text"
            placeholder="Título de la meta..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full text-sm border-b border-gray-200 pb-2.5 mb-4 outline-none focus:border-indigo-500 bg-transparent text-gray-700 placeholder:text-gray-300 transition-colors"
          />

          <textarea
            placeholder="Descripción (opcional)..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
            className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 mb-4 outline-none focus:border-indigo-400 focus:bg-white transition-all resize-none text-gray-700 placeholder:text-gray-300"
          />

          {/* Horizon pill buttons */}
          <div className="mb-4">
            <p className="text-[10px] font-bold tracking-[0.15em] text-gray-400 uppercase mb-2">Horizonte</p>
            <div className="flex gap-2">
              {HORIZONS.map(h => (
                <button
                  key={h.value}
                  onClick={() => setHorizon(h.value)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
                    horizon === h.value
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {h.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom date picker */}
          <div className="mb-5">
            <p className="text-[10px] font-bold tracking-[0.15em] text-gray-400 uppercase mb-2">Fecha límite (opcional)</p>
            <div className="grid grid-cols-3 gap-2">
              <CustomSelect value={ddDay} onChange={d => handleDateChange(d, ddMonth, ddYear)}>
                <option value="">Día</option>
                {DAYS_LIST.map(d => <option key={d} value={d}>{d}</option>)}
              </CustomSelect>
              <CustomSelect value={ddMonth} onChange={m => handleDateChange(ddDay, m, ddYear)}>
                <option value="">Mes</option>
                {MONTHS_ES.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
              </CustomSelect>
              <CustomSelect value={ddYear} onChange={y => handleDateChange(ddDay, ddMonth, y)}>
                <option value="">Año</option>
                {YEARS_LIST.map(y => <option key={y} value={y}>{y}</option>)}
              </CustomSelect>
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
                            className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-400 focus:bg-white transition-all"
                          />
                          <button
                            onClick={() => handleAddMilestone(goal.id)}
                            className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs rounded-xl hover:bg-gray-200 transition-colors font-medium"
                          >
                            + Agregar
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="relative">
                          <select
                            value={goal.status}
                            onChange={e => updateStatus(goal.id, e.target.value as Goal['status'])}
                            className="appearance-none text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 pr-7 outline-none focus:border-indigo-400 focus:bg-white transition-all text-gray-700 cursor-pointer"
                          >
                            <option value="activo">Activo</option>
                            <option value="completado">Completado</option>
                            <option value="pausado">Pausado</option>
                            <option value="abandonado">Abandonado</option>
                          </select>
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                          </div>
                        </div>
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
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-16 px-6">
          <p className="text-sm font-semibold text-gray-700 mb-1">No tenés metas todavía</p>
          <p className="text-xs text-gray-400 mt-1">Creá tu primera con el botón de arriba</p>
        </div>
      )}
    </div>
  )
}
