import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const sections = [
  {
    label: 'GENERAL',
    links: [
      { to: '/dashboard', label: 'Dashboard' },
      { to: '/habits', label: 'Hábitos' },
      { to: '/goals', label: 'Metas' },
    ],
  },
  {
    label: 'ORGANIZACIÓN',
    links: [
      { to: '/routines', label: 'Rutinas' },
      { to: '/projects', label: 'Proyectos' },
    ],
  },
]

export default function Sidebar() {
  const location = useLocation()
  const { signOut } = useAuth()

  return (
    <aside className="w-56 min-h-screen bg-white border-r border-gray-100 flex flex-col py-6 px-4">
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
          <span className="text-white text-xs font-bold">L</span>
        </div>
        <span className="text-base font-semibold text-gray-900 tracking-tight">LifeOS</span>
      </div>

      <nav className="flex flex-col gap-5 flex-1">
        {sections.map(section => (
          <div key={section.label}>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1 px-2">
              {section.label}
            </p>
            <div className="flex flex-col gap-0.5">
              {section.links.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-2 py-1.5 rounded-md text-sm transition-colors ${
                    location.pathname === link.to
                      ? 'bg-indigo-50 text-indigo-600 font-medium'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-gray-100 pt-4 px-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center">
              <span className="text-orange-500 text-xs font-semibold">A</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 leading-none">Agus</p>
              <p className="text-xs text-gray-400 mt-0.5">Ver perfil</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="text-xs text-gray-400 hover:text-red-400 transition-colors"
          >
            Salir
          </button>
        </div>
      </div>
    </aside>
  )
}