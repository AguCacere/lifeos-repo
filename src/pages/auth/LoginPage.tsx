import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function LoginPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    setMessage(null)

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName.trim() || email.split('@')[0] } },
      })
      if (error) setError(error.message)
      else setMessage('Revisá tu email para confirmar la cuenta')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError('Email o contraseña incorrectos')
    }

    setLoading(false)
  }

  if (!isSignUp) {
    return (
      <div
        className="min-h-screen flex flex-col"
        style={{ background: 'radial-gradient(ellipse at center, #1e1e3a 0%, #0f0f1e 100%)' }}
      >
        {/* Dot texture overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Top-left label */}
        <div className="relative z-10 p-5 flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-white/10 flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">L</span>
          </div>
          <span className="text-white/50 text-xs font-medium tracking-wide">LifeOS Login</span>
        </div>

        {/* Card */}
        <div className="relative z-10 flex-1 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-sm">
            {/* Brand */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">LifeOS</h1>
              <p className="text-[10px] tracking-[0.25em] text-gray-400 uppercase mt-1">The Digital Architect</p>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-1">Bienvenido de nuevo</h2>
            <p className="text-sm text-gray-400 mb-8">Accede a tu espacio de trabajo diseñado.</p>

            <div className="flex flex-col gap-6">
              <div>
                <label className="block text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="nombre@dominio.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full text-sm border-b border-gray-200 pb-2.5 outline-none focus:border-indigo-500 bg-transparent text-gray-700 placeholder:text-gray-300 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  className="w-full text-sm border-b border-gray-200 pb-2.5 outline-none focus:border-indigo-500 bg-transparent text-gray-700 placeholder:text-gray-300 transition-colors"
                />
              </div>

              {error && <p className="text-xs text-red-500 -mt-2">{error}</p>}
              {message && <p className="text-xs text-green-600 -mt-2">{message}</p>}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-3 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 active:bg-indigo-800 transition-colors disabled:opacity-50 mt-1"
              >
                {loading ? 'Cargando...' : 'Ingresar'}
              </button>

              <div className="text-center -mt-2">
                <button
                  onClick={() => { setIsSignUp(true); setError(null); setMessage(null) }}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ¿No tienes una cuenta?{' '}
                  <span className="text-indigo-600 font-semibold">Crear una cuenta</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-center py-4">
          <p className="text-[10px] tracking-[0.15em] text-white/25 uppercase">
            © 2026 LifeOS · V1.0 Graphite
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'radial-gradient(ellipse at center, #1e1e3a 0%, #0f0f1e 100%)' }}
    >
      {/* Dot texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Top-left label */}
      <div className="relative z-10 p-5 flex items-center gap-2">
        <div className="w-5 h-5 rounded bg-white/10 flex items-center justify-center">
          <span className="text-white text-[10px] font-bold">L</span>
        </div>
        <span className="text-white/50 text-xs font-medium tracking-wide">LifeOS Register</span>
      </div>

      {/* Card */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-6">
        <div
          className="rounded-2xl shadow-2xl p-10 w-full max-w-lg"
          style={{ background: '#eeeef8' }}
        >
          {/* Brand */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-lg">
              <span className="text-white text-lg font-bold">A</span>
            </div>
            <h1 className="text-base font-bold text-gray-900">LifeOS</h1>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Diseña tu flujo de trabajo con la<br />precisión de un arquitecto digital.
            </p>
          </div>

          {/* Form with left accent */}
          <div className="flex gap-6">
            <div className="w-0.5 bg-indigo-500 rounded-full flex-shrink-0" />

            <div className="flex-1 flex flex-col gap-6">
              <div>
                <label className="block text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase mb-2">
                  Nombre completo
                </label>
                <input
                  type="text"
                  placeholder="Tu nombre"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full text-sm border-b border-gray-300 pb-2.5 outline-none focus:border-indigo-500 bg-transparent text-gray-700 placeholder:text-gray-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="arquitecto@lifeos.digital"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full text-sm border-b border-gray-300 pb-2.5 outline-none focus:border-indigo-500 bg-transparent text-gray-700 placeholder:text-gray-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    className="w-full text-sm border-b border-gray-300 pb-2.5 outline-none focus:border-indigo-500 bg-transparent text-gray-700 placeholder:text-gray-400 transition-colors pr-8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 bottom-2.5 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {error && <p className="text-xs text-red-500 -mt-2">{error}</p>}
              {message && <p className="text-xs text-green-600 -mt-2">{message}</p>}

              <p className="text-[10px] text-gray-400 -mt-2 leading-relaxed">
                Al crear tu cuenta, aceptas nuestros{' '}
                <span className="text-indigo-500 cursor-default">Términos de Arquitectura Digital</span>
                {' '}y nuestra{' '}
                <span className="text-indigo-500 cursor-default">Política de Privacidad</span>.
              </p>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-3 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 active:bg-indigo-800 transition-colors disabled:opacity-50"
              >
                {loading ? 'Cargando...' : 'Crear Cuenta'}
              </button>

              <div className="text-center -mt-2">
                <button
                  onClick={() => { setIsSignUp(false); setError(null); setMessage(null) }}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ¿Ya tienes cuenta?{' '}
                  <span className="text-indigo-600 font-semibold">Ingresar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 flex justify-between items-center px-8 py-4">
        <div className="flex gap-6">
          {['Privacidad', 'Términos', 'Soporte'].map(item => (
            <span key={item} className="text-[10px] tracking-[0.15em] text-white/25 uppercase cursor-default hover:text-white/40 transition-colors">
              {item}
            </span>
          ))}
        </div>
        <span className="text-[10px] tracking-[0.1em] text-white/25 uppercase">
          © 2026 LifeOS, The Digital Architect
        </span>
      </div>
    </div>
  )
}
