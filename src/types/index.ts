export interface User {
    id: string
    email: string
    full_name: string | null
    bio: string | null
    avatar_url: string | null
    is_public: boolean
    created_at: string
  }
  
  export interface Project {
    id: string
    user_id: string
    title: string
    description: string | null
    status: 'en_progreso' | 'completado' | 'pausado' | 'idea'
    category: 'tech' | 'negocio' | 'personal' | 'estudio' | 'salud' | 'otro'
    tags: string[]
    repo_url: string | null
    demo_url: string | null
    image_url: string | null
    is_public: boolean
    order_index: number
    created_at: string
    updated_at: string
    updates?: ProjectUpdate[]
    tasks?: ProjectTask[]
  }
  
  export interface Habit {
    id: string
    user_id: string
    name: string
    description: string | null
    category: 'salud' | 'aprendizaje' | 'trabajo' | 'personal' | 'general'
    frequency: 'diario' | 'semanal'
    target_streak: number
    color: string
    is_active: boolean
    created_at: string
  }
  
  export interface HabitLog {
    id: string
    habit_id: string
    log_date: string
    completed: boolean
    note: string | null
    created_at: string
  }
  
  export interface Goal {
    id: string
    user_id: string
    title: string
    description: string | null
    horizon: 'corto' | 'mediano' | 'largo'
    progress_pct: number
    status: 'activo' | 'completado' | 'pausado' | 'abandonado'
    due_date: string | null
    created_at: string
    updated_at: string
    milestones?: GoalMilestone[]
  }
  
  export interface GoalMilestone {
    id: string
    goal_id: string
    title: string
    completed: boolean
    due_date: string | null
    created_at: string
  }
  
  export interface Routine {
    id: string
    user_id: string
    name: string
    period: 'manana' | 'tarde' | 'noche' | 'personalizado'
    is_active: boolean
    order_index: number
    created_at: string
    blocks?: RoutineBlock[]
  }
  
  export interface RoutineBlock {
    id: string
    routine_id: string
    title: string
    start_time: string
    end_time: string
    color: string
    note: string | null
    order_index: number
  }
  
  export interface AiInsight {
    id: string
    user_id: string
    type: 'habito' | 'meta' | 'rutina' | 'general'
    content: string
    is_read: boolean
    created_at: string
  }

  export interface ProjectUpdate {
    id: string
    project_id: string
    content: string
    image_url: string | null
    created_at: string
  }
  
  export interface ProjectTask {
    id: string
    project_id: string
    title: string
    completed: boolean
    order_index: number
    created_at: string
  }

  export interface RoutineBlock {
    id: string
    routine_id: string
    title: string
    start_time: string
    end_time: string
    color: string
    note: string | null
    order_index: number
    habit_id: string | null
  }