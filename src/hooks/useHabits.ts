import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Habit, HabitLog } from '../types'

// Returns the number of consecutive days (going back from today) where
// ALL active habits were completed. If today is not yet complete, starts
// counting from yesterday.
// Dates are always computed in UTC to match how toggleHabit stores log_date.
export function calculateStreak(habits: Habit[], logs: HabitLog[]): number {
  if (habits.length === 0 || logs.length === 0) return 0

  // UTC date string N days before now — matches the format stored by toggleHabit
  function utcDateStrDaysAgo(n: number): string {
    const d = new Date()
    d.setUTCDate(d.getUTCDate() - n)
    return d.toISOString().split('T')[0]
  }

  function allDoneOn(dateStr: string): boolean {
    return habits.every(h =>
      logs.some(l => l.habit_id === h.id && l.log_date === dateStr && l.completed)
    )
  }

  const todayStr = utcDateStrDaysAgo(0)
  const todayComplete = allDoneOn(todayStr)

  // If today isn't fully done yet, start counting from yesterday
  let daysBack = todayComplete ? 0 : 1
  let streak = 0

  while (daysBack < 31) {
    const dateStr = utcDateStrDaysAgo(daysBack)
    if (!allDoneOn(dateStr)) break
    streak++
    daysBack++
  }

  return streak
}

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
    fetchRecentLogs()
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

  async function fetchRecentLogs() {
    const fromDate = new Date()
    fromDate.setDate(fromDate.getDate() - 29) // last 30 days inclusive
    const fromStr = fromDate.toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('habit_logs')
      .select('*')
      .gte('log_date', fromStr)

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
