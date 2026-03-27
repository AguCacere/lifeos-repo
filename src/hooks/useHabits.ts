import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Habit, HabitLog } from '../types'

export function useHabits(userId: string) {
  const [habits, setHabits] = useState<Habit[]>([])
  const [logs, setLogs] = useState<HabitLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId || userId === 'temp-user-id') {
      setLoading(false)
      return
    }
    fetchHabits()
    fetchTodayLogs()
  }, [userId])

  async function fetchHabits() {
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: true })

    if (error) setError(error.message)
    else setHabits(data ?? [])
    setLoading(false)
  }

  async function fetchTodayLogs() {
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('log_date', today)

    if (error) setError(error.message)
    else setLogs(data ?? [])
  }

  async function addHabit(habit: Omit<Habit, 'id' | 'user_id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('habits')
      .insert({ ...habit, user_id: userId })
      .select()
      .single()

    if (error) setError(error.message)
    else setHabits(prev => [...prev, data])
  }

  async function toggleHabit(habitId: string) {
    const today = new Date().toISOString().split('T')[0]
    const existing = logs.find(l => l.habit_id === habitId && l.log_date === today)

    if (existing) {
      const { error } = await supabase
        .from('habit_logs')
        .update({ completed: !existing.completed })
        .eq('id', existing.id)

      if (!error) {
        setLogs(prev =>
          prev.map(l => l.id === existing.id ? { ...l, completed: !l.completed } : l)
        )
      }
    } else {
      const { data, error } = await supabase
        .from('habit_logs')
        .insert({ habit_id: habitId, log_date: today, completed: true })
        .select()
        .single()

      if (!error) setLogs(prev => [...prev, data])
    }
  }

  async function deleteHabit(habitId: string) {
    const { error } = await supabase
      .from('habits')
      .update({ is_active: false })
      .eq('id', habitId)

    if (!error) setHabits(prev => prev.filter(h => h.id !== habitId))
  }

  function isCompletedToday(habitId: string) {
    const today = new Date().toISOString().split('T')[0]
    return logs.some(l => l.habit_id === habitId && l.log_date === today && l.completed)
  }

  return { habits, logs, loading, error, addHabit, toggleHabit, deleteHabit, isCompletedToday }
}