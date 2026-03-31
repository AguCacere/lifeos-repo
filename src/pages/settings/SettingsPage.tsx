import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

const COOLDOWN_DAYS = 30

export default function SettingsPage() {
  const { user, displayName } = useAuth()

  // Read when the name was last changed (stored in user_metadata)
  const lastChanged = user?.user_metadata?.name_changed_at as string | undefined
  const daysSinceChange = lastChanged
    ? Math.floor((Date.now() - new Date(lastChanged).getTime()) / (1000 * 60 * 60 * 24))
    : null
  const canChange = daysSinceChange === null || daysSinceChange >= COOLDOWN_DAYS
  const daysLeft = canChange ? 0 : COOLDOWN_DAYS - (daysSinceChange ?? 0)

  const [name, setName] = useState(displayName)
  const [saving, setSaving] = useState(false)

  // Keep input in sync when displayName updates after refreshSession()
  useEffect(() => { setName(displayName) }, [displayName])
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    if (!canChange || !name.trim()) return
    setSaving(true)
    setError(null)
    setSuccess(false)

    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: name.trim(),
        name_changed_at: new Date().toISOString(),
      },
    })

    if (error) {
      setError(error.message)
    } else {
      // Force session refresh so user_metadata (full_name, name_changed_at)
      // is immediately reflected in useAuth without requiring a page reload
      await supabase.auth.refreshSession()
      setSuccess(true)
    }
    setSaving(false)
  }

  return (
    <div className="max-w-lg pt-6 md:pt-0">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Configuración</h1>
        <p className="text-sm text-gray-400 mt-0.5">Gestioná tu perfil y preferencias.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6">
        <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-5">Perfil</p>

        {/* Avatar + current info */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-50">
          <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <span className="text-indigo-700 text-xl font-bold uppercase">
              {name.charAt(0) || '?'}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{displayName}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>

        {/* Name field */}
        <div className="mb-1">
          <label className="block text-[10px] font-bold tracking-[0.15em] text-gray-400 uppercase mb-2">
            Nombre para mostrar
          </label>
          <input
            type="text"
            value={name}
            onChange={e => { setName(e.target.value); setSuccess(false) }}
            disabled={!canChange}
            placeholder="Tu nombre completo"
            className={`w-full text-sm border-b pb-2.5 outline-none transition-colors bg-transparent placeholder:text-gray-300 ${
              canChange
                ? 'border-gray-200 focus:border-indigo-500 text-gray-700'
                : 'border-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          />
        </div>

        {/* Cooldown notice */}
        {!canChange && (
          <div className="flex items-start gap-2.5 mt-4 px-3.5 py-3 bg-amber-50 rounded-xl border border-amber-100">
            <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <p className="text-xs text-amber-700 leading-relaxed">
              Solo podés cambiar tu nombre una vez por mes.{' '}
              Disponible en{' '}
              <span className="font-semibold">{daysLeft} día{daysLeft !== 1 ? 's' : ''}</span>.
            </p>
          </div>
        )}

        {error && <p className="text-xs text-red-500 mt-4">{error}</p>}
        {success && (
          <p className="text-xs text-green-600 mt-4 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Nombre actualizado correctamente.
          </p>
        )}

        <div className="mt-5">
          <button
            onClick={handleSave}
            disabled={!canChange || saving || !name.trim() || name.trim() === displayName}
            className="px-5 py-3 min-h-[44px] bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  )
}
