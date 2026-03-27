import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Goal, GoalMilestone } from '../types'

export function useGoals(userId: string) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId || userId === 'temp-user-id') {
      setLoading(false)
      return
    }
    fetchGoals()
  }, [userId])

  async function fetchGoals() {
    const { data, error } = await supabase
      .from('goals')
      .select('*, milestones:goal_milestones(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
  
    if (error) setError(error.message)
    else setGoals(data ?? [])
    setLoading(false)
  }

  async function addGoal(goal: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'milestones'>) {
    const { data, error } = await supabase
      .from('goals')
      .insert({ ...goal, user_id: userId })
      .select('*, milestones:goal_milestones(*)')
      .single()

    if (error) setError(error.message)
    else setGoals(prev => [data, ...prev])
  }

  async function updateProgress(goalId: string, progress: number) {
    const { error } = await supabase
      .from('goals')
      .update({ progress_pct: progress })
      .eq('id', goalId)

    if (!error) {
      setGoals(prev =>
        prev.map(g => g.id === goalId ? { ...g, progress_pct: progress } : g)
      )
    }
  }

  async function updateStatus(goalId: string, status: Goal['status']) {
    const { error } = await supabase
      .from('goals')
      .update({ status })
      .eq('id', goalId)

    if (!error) {
      setGoals(prev =>
        prev.map(g => g.id === goalId ? { ...g, status } : g)
      )
    }
  }

  async function addMilestone(goalId: string, title: string) {
    const { data, error } = await supabase
      .from('goal_milestones')
      .insert({ goal_id: goalId, title, completed: false })
      .select()
      .single()

    if (!error) {
      setGoals(prev =>
        prev.map(g => g.id === goalId
          ? { ...g, milestones: [...(g.milestones || []), data] }
          : g
        )
      )
    }
  }

  async function toggleMilestone(milestone: GoalMilestone) {
    const { error } = await supabase
      .from('goal_milestones')
      .update({ completed: !milestone.completed })
      .eq('id', milestone.id)

    if (!error) {
      setGoals(prev =>
        prev.map(g => ({
          ...g,
          milestones: g.milestones?.map(m =>
            m.id === milestone.id ? { ...m, completed: !m.completed } : m
          )
        }))
      )
    }
  }

  async function deleteGoal(goalId: string) {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', goalId)

    if (!error) setGoals(prev => prev.filter(g => g.id !== goalId))
  }

  return { goals, loading, error, addGoal, updateProgress, updateStatus, addMilestone, toggleMilestone, deleteGoal }
}