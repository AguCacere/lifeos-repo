import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Habit, HabitLog, Goal, Project } from '../types'

export function useDashboard(userId: string) {
  const [habits, setHabits] = useState<Habit[]>([])
  const [todayLogs, setTodayLogs] = useState<HabitLog[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    fetchAll()
  }, [userId])

  async function fetchAll() {
    const from = new Date()
    from.setUTCDate(from.getUTCDate() - 30)
    const fromStr = from.toISOString().split('T')[0]

    const [habitsRes, logsRes, goalsRes, projectsRes] = await Promise.all([
      supabase.from('habits').select('*').eq('user_id', userId).eq('is_active', true),
      supabase.from('habit_logs').select('*').gte('log_date', fromStr),
      supabase.from('goals').select('*').eq('user_id', userId).eq('status', 'activo').order('created_at', { ascending: false }).limit(4),
      supabase.from('projects').select('*').eq('user_id', userId).eq('status', 'en_progreso').order('created_at', { ascending: false }).limit(4),
    ])

    setHabits(habitsRes.data ?? [])
    setTodayLogs(logsRes.data ?? [])
    setGoals(goalsRes.data ?? [])
    setProjects(projectsRes.data ?? [])
    setLoading(false)
  }

  async function toggleHabit(habitId: string) {
    const today = new Date().toISOString().split('T')[0]
    const existing = todayLogs.find(l => l.habit_id === habitId && l.log_date === today)

    if (existing) {
      await supabase.from('habit_logs').update({ completed: !existing.completed }).eq('id', existing.id)
      setTodayLogs(prev => prev.map(l => l.id === existing.id ? { ...l, completed: !l.completed } : l))
    } else {
      const { data } = await supabase.from('habit_logs').insert({ habit_id: habitId, log_date: today, completed: true }).select().single()
      if (data) setTodayLogs(prev => [...prev, data])
    }
  }

  function isCompletedToday(habitId: string) {
    const today = new Date().toISOString().split('T')[0]
    return todayLogs.some(l => l.habit_id === habitId && l.log_date === today && l.completed)
  }

  return { habits, logs: todayLogs, goals, projects, loading, toggleHabit, isCompletedToday }
}