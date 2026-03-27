
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Routine, RoutineBlock, Habit } from '../types'

export function useRoutines(userId: string) {
  const [routines, setRoutines] = useState<Routine[]>([])
  const [habits, setHabits] = useState<Habit[]>([])
  const [completedBlocks, setCompletedBlocks] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    fetchAll()
  }, [userId])

  async function fetchAll() {
    const today = new Date().toISOString().split('T')[0]

    const [routinesRes, habitsRes, logsRes] = await Promise.all([
      supabase
        .from('routines')
        .select('*, blocks:routine_blocks(*)')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('order_index', { ascending: true }),
      supabase
        .from('habits')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true),
      supabase
        .from('habit_logs')
        .select('*')
        .eq('log_date', today)
        .eq('completed', true),
    ])

    const routinesData = routinesRes.data ?? []
    const logsData = logsRes.data ?? []

    setRoutines(routinesData.map(r => ({
      ...r,
      blocks: (r.blocks ?? []).sort((a: RoutineBlock, b: RoutineBlock) =>
        a.start_time.localeCompare(b.start_time)
      )
    })))
    setHabits(habitsRes.data ?? [])

    const completedHabitIds = logsData.map(l => l.habit_id)
    const completedBlockIds = routinesData
      .flatMap(r => r.blocks ?? [])
      .filter((b: RoutineBlock) => b.habit_id && completedHabitIds.includes(b.habit_id))
      .map((b: RoutineBlock) => b.id)

    setCompletedBlocks(completedBlockIds)
    setLoading(false)
  }

  async function addRoutine(name: string, period: Routine['period']) {
    const { data, error } = await supabase
      .from('routines')
      .insert({ user_id: userId, name, period, is_active: true, order_index: routines.length })
      .select('*, blocks:routine_blocks(*)')
      .single()

    if (!error) setRoutines(prev => [...prev, { ...data, blocks: [] }])
  }

  async function addBlock(routineId: string, block: Omit<RoutineBlock, 'id' | 'routine_id' | 'order_index'>) {
    const routine = routines.find(r => r.id === routineId)
    const orderIndex = routine?.blocks?.length ?? 0

    const { data, error } = await supabase
      .from('routine_blocks')
      .insert({ ...block, routine_id: routineId, order_index: orderIndex })
      .select()
      .single()

    if (!error) {
      setRoutines(prev =>
        prev.map(r => r.id === routineId
          ? { ...r, blocks: [...(r.blocks ?? []), data].sort((a, b) => a.start_time.localeCompare(b.start_time)) }
          : r
        )
      )
    }
  }

  async function toggleBlock(block: RoutineBlock) {
    if (!block.habit_id) {
      setCompletedBlocks(prev =>
        prev.includes(block.id)
          ? prev.filter(id => id !== block.id)
          : [...prev, block.id]
      )
      return
    }

    const today = new Date().toISOString().split('T')[0]
    const isCompleted = completedBlocks.includes(block.id)

    const { data: existing } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('habit_id', block.habit_id)
      .eq('log_date', today)
      .single()

    if (existing) {
      await supabase
        .from('habit_logs')
        .update({ completed: !isCompleted })
        .eq('id', existing.id)
    } else {
      await supabase
        .from('habit_logs')
        .insert({ habit_id: block.habit_id, log_date: today, completed: true })
    }

    setCompletedBlocks(prev =>
      isCompleted
        ? prev.filter(id => id !== block.id)
        : [...prev, block.id]
    )
  }

  async function deleteBlock(routineId: string, blockId: string) {
    await supabase.from('routine_blocks').delete().eq('id', blockId)
    setRoutines(prev =>
      prev.map(r => r.id === routineId
        ? { ...r, blocks: r.blocks?.filter(b => b.id !== blockId) }
        : r
      )
    )
  }

  async function deleteRoutine(routineId: string) {
    await supabase.from('routines').delete().eq('id', routineId)
    setRoutines(prev => prev.filter(r => r.id !== routineId))
  }

  return { routines, habits, completedBlocks, loading, addRoutine, addBlock, toggleBlock, deleteBlock, deleteRoutine }
}