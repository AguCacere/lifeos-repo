import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Project } from '../types'

export function useProjects(userId: string) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return
    fetchProjects()
  }, [userId])

  async function fetchProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select('*, updates:project_updates(*), tasks:project_tasks(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) setError(error.message)
    else setProjects(data ?? [])
    setLoading(false)
  }

  async function addProject(project: Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'updates' | 'tasks'>) {
    const { data, error } = await supabase
      .from('projects')
      .insert({ ...project, user_id: userId })
      .select('*, updates:project_updates(*), tasks:project_tasks(*)')
      .single()

    if (error) setError(error.message)
    else setProjects(prev => [data, ...prev])
  }

  async function updateProject(projectId: string, updates: Partial<Project>) {
    const { error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId)

    if (!error) {
      setProjects(prev =>
        prev.map(p => p.id === projectId ? { ...p, ...updates } : p)
      )
    }
  }

  async function deleteProject(projectId: string) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)

    if (!error) setProjects(prev => prev.filter(p => p.id !== projectId))
  }

  async function addUpdate(projectId: string, content: string) {
    const { data, error } = await supabase
      .from('project_updates')
      .insert({ project_id: projectId, content })
      .select()
      .single()

    if (!error) {
      setProjects(prev =>
        prev.map(p => p.id === projectId
          ? { ...p, updates: [data, ...(p.updates || [])] }
          : p
        )
      )
    }
  }

  async function addTask(projectId: string, title: string) {
    const { data, error } = await supabase
      .from('project_tasks')
      .insert({ project_id: projectId, title, completed: false })
      .select()
      .single()

    if (!error) {
      setProjects(prev =>
        prev.map(p => p.id === projectId
          ? { ...p, tasks: [...(p.tasks || []), data] }
          : p
        )
      )
    }
  }

  async function toggleTask(projectId: string, taskId: string, completed: boolean) {
    const { error } = await supabase
      .from('project_tasks')
      .update({ completed })
      .eq('id', taskId)

    if (!error) {
      setProjects(prev =>
        prev.map(p => p.id === projectId
          ? { ...p, tasks: p.tasks?.map(t => t.id === taskId ? { ...t, completed } : t) }
          : p
        )
      )
    }
  }

  return { projects, loading, error, addProject, updateProject, deleteProject, addUpdate, addTask, toggleTask }
}