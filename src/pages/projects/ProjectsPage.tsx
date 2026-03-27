import { useState } from 'react'
import { useProjects } from '../../hooks/useProjects'
import type { Project } from '../../types'

const CATEGORIES: { value: Project['category'], label: string }[] = [
  { value: 'tech', label: 'Tech' },
  { value: 'negocio', label: 'Negocio' },
  { value: 'personal', label: 'Personal' },
  { value: 'estudio', label: 'Estudio' },
  { value: 'salud', label: 'Salud' },
  { value: 'otro', label: 'Otro' },
]

const STATUS: { value: Project['status'], label: string, color: string }[] = [
  { value: 'idea', label: 'Idea', color: 'bg-gray-100 text-gray-600' },
  { value: 'en_progreso', label: 'En progreso', color: 'bg-indigo-100 text-indigo-600' },
  { value: 'pausado', label: 'Pausado', color: 'bg-amber-100 text-amber-600' },
  { value: 'completado', label: 'Completado', color: 'bg-green-100 text-green-600' },
]

export default function ProjectsPage({ userId }: { userId: string }) {
  const { projects, loading, addProject, updateProject, deleteProject, addUpdate, addTask, toggleTask } = useProjects(userId)

  const [showForm, setShowForm] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'updates' | 'tasks'>('updates')
  const [newUpdate, setNewUpdate] = useState('')
  const [newTask, setNewTask] = useState('')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<Project['category']>('personal')
  const [status, setStatus] = useState<Project['status']>('idea')
  const [isPublic, setIsPublic] = useState(false)

  async function handleAdd() {
    if (!title.trim()) return
    await addProject({
      title,
      description: description || null,
      category,
      status,
      tags: [],
      repo_url: null,
      demo_url: null,
      image_url: null,
      is_public: isPublic,
      order_index: 0,
    })
    setTitle('')
    setDescription('')
    setShowForm(false)
  }

  async function handleAddUpdate(projectId: string) {
    if (!newUpdate.trim()) return
    await addUpdate(projectId, newUpdate)
    setNewUpdate('')
  }

  async function handleAddTask(projectId: string) {
    if (!newTask.trim()) return
    await addTask(projectId, newTask)
    setNewTask('')
  }

  if (loading) return <p className="text-gray-400 text-sm">Cargando proyectos...</p>

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Proyectos</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {projects.filter(p => p.status === 'en_progreso').length} en progreso
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + Nuevo proyecto
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-100 rounded-xl p-4 mb-4 shadow-sm">
          <p className="text-sm font-medium text-gray-700 mb-3">Nuevo proyecto</p>
          <input
            type="text"
            placeholder="Nombre del proyecto..."
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
              value={category}
              onChange={e => setCategory(e.target.value as Project['category'])}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400"
            >
              {CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as Project['status'])}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400"
            >
              {STATUS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={e => setIsPublic(e.target.checked)}
              className="accent-indigo-600"
            />
            <label htmlFor="isPublic" className="text-sm text-gray-600">
              Visible en mi portfolio público
            </label>
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

      {projects.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-sm">No tenés proyectos todavía</p>
          <p className="text-xs mt-1">Creá tu primero con el botón de arriba</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {projects.map(project => {
            const statusInfo = STATUS.find(s => s.value === project.status)
            const isExpanded = expandedId === project.id
            const completedTasks = project.tasks?.filter(t => t.completed).length ?? 0
            const totalTasks = project.tasks?.length ?? 0

            return (
              <div key={project.id} className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                <div
                  className="px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : project.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-medium text-gray-800 truncate">{project.title}</p>
                        {project.is_public && (
                          <span className="text-xs text-indigo-400 flex-shrink-0">público</span>
                        )}
                      </div>
                      {project.description && (
                        <p className="text-xs text-gray-400 truncate">{project.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusInfo?.color}`}>
                        {statusInfo?.label}
                      </span>
                      <span className="text-xs text-gray-400 capitalize">{project.category}</span>
                    </div>
                  </div>

                  {totalTasks > 0 && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400">Tareas</span>
                        <span className="text-xs text-gray-400">{completedTasks}/{totalTasks}</span>
                      </div>
                      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all"
                          style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-50">
                    <div className="flex border-b border-gray-100">
                      <button
                        onClick={() => setActiveTab('updates')}
                        className={`flex-1 py-2 text-xs font-medium transition-colors ${
                          activeTab === 'updates'
                            ? 'text-indigo-600 border-b-2 border-indigo-600'
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        Updates ({project.updates?.length ?? 0})
                      </button>
                      <button
                        onClick={() => setActiveTab('tasks')}
                        className={`flex-1 py-2 text-xs font-medium transition-colors ${
                          activeTab === 'tasks'
                            ? 'text-indigo-600 border-b-2 border-indigo-600'
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        Tareas ({totalTasks})
                      </button>
                    </div>

                    <div className="px-4 py-3">
                      {activeTab === 'updates' && (
                        <div>
                          <div className="flex gap-2 mb-3">
                            <input
                              type="text"
                              placeholder="Nuevo update..."
                              value={newUpdate}
                              onChange={e => setNewUpdate(e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && handleAddUpdate(project.id)}
                              className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400"
                            />
                            <button
                              onClick={() => handleAddUpdate(project.id)}
                              className="px-3 py-2 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                              + Agregar
                            </button>
                          </div>
                          <div className="flex flex-col gap-2">
                            {project.updates?.length === 0 && (
                              <p className="text-xs text-gray-400 text-center py-4">Sin updates todavía</p>
                            )}
                            {project.updates?.map(update => (
                              <div key={update.id} className="flex gap-3">
                                <div className="flex flex-col items-center">
                                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1 flex-shrink-0" />
                                  <div className="w-px flex-1 bg-gray-100 mt-1" />
                                </div>
                                <div className="pb-3 flex-1">
                                  <p className="text-xs text-gray-500 mb-0.5">
                                    {new Date(update.created_at).toLocaleDateString('es-AR', {
                                      day: 'numeric', month: 'short', year: 'numeric'
                                    })}
                                  </p>
                                  <p className="text-sm text-gray-700">{update.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {activeTab === 'tasks' && (
                        <div>
                          <div className="flex gap-2 mb-3">
                            <input
                              type="text"
                              placeholder="Nueva tarea..."
                              value={newTask}
                              onChange={e => setNewTask(e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && handleAddTask(project.id)}
                              className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400"
                            />
                            <button
                              onClick={() => handleAddTask(project.id)}
                              className="px-3 py-2 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                              + Agregar
                            </button>
                          </div>
                          <div className="flex flex-col gap-1">
                            {project.tasks?.length === 0 && (
                              <p className="text-xs text-gray-400 text-center py-4">Sin tareas todavía</p>
                            )}
                            {project.tasks?.map(task => (
                              <div key={task.id} className="flex items-center gap-2 py-1">
                                <button
                                  onClick={() => toggleTask(project.id, task.id, !task.completed)}
                                  className={`w-4 h-4 rounded border flex-shrink-0 transition-colors ${
                                    task.completed
                                      ? 'bg-indigo-600 border-indigo-600'
                                      : 'border-gray-300'
                                  }`}
                                />
                                <span className={`text-sm ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                  {task.title}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                        <select
                          value={project.status}
                          onChange={e => updateProject(project.id, { status: e.target.value as Project['status'] })}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-indigo-400"
                        >
                          {STATUS.map(s => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => deleteProject(project.id)}
                          className="text-xs text-red-400 hover:text-red-600 transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
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