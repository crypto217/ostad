export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          subject: string | null
          cycle: 'primaire' | 'cem' | 'lycee' | null
          gender: 'male' | 'female' | null
          preferred_language: 'fr' | 'ar' | 'en' | null
          expected_classes_count: number | null
          created_at: string
        }
        Insert: {
          id: string
          full_name: string
          subject?: string | null
          cycle?: 'primaire' | 'cem' | 'lycee' | null
          gender?: 'male' | 'female' | null
          preferred_language?: 'fr' | 'ar' | 'en' | null
          expected_classes_count?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          subject?: string | null
          cycle?: 'primaire' | 'cem' | 'lycee' | null
          gender?: 'male' | 'female' | null
          preferred_language?: 'fr' | 'ar' | 'en' | null
          expected_classes_count?: number | null
          created_at?: string
        }
      }
      classes: {
        Row: {
          id: string
          teacher_id: string
          class_name: string
          color_code: string
          created_at: string
        }
        Insert: {
          id?: string
          teacher_id: string
          class_name: string
          color_code: string
          created_at?: string
        }
        Update: {
          id?: string
          teacher_id?: string
          class_name?: string
          color_code?: string
          created_at?: string
        }
      }
      students: {
        Row: {
          id: string
          class_id: string
          first_name: string
          last_name: string
          gender: 'male' | 'female' | null
          birth_date: string
          created_at: string
        }
        Insert: {
          id?: string
          class_id: string
          first_name: string
          last_name: string
          gender?: 'male' | 'female' | null
          birth_date: string
          created_at?: string
        }
        Update: {
          id?: string
          class_id?: string
          first_name?: string
          last_name?: string
          gender?: 'male' | 'female' | null
          birth_date?: string
          created_at?: string
        }
      }
      weekly_schedules: {
        Row: {
          id: string
          teacher_id: string
          class_id: string
          day_of_week: number | null
          start_time: string
          end_time: string
          created_at: string
        }
        Insert: {
          id?: string
          teacher_id: string
          class_id: string
          day_of_week?: number | null
          start_time: string
          end_time: string
          created_at?: string
        }
        Update: {
          id?: string
          teacher_id?: string
          class_id?: string
          day_of_week?: number | null
          start_time?: string
          end_time?: string
          created_at?: string
        }
      }
      course_sessions: {
        Row: {
          id: string
          class_id: string
          scheduled_time: string
          lesson_title: string
          attachment_url: string | null
          trimester: number | null
          status: 'planned' | 'in_progress' | 'done' | 'cancelled' | null
          lesson_notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          class_id: string
          scheduled_time: string
          lesson_title: string
          attachment_url?: string | null
          trimester?: number | null
          status?: 'planned' | 'in_progress' | 'done' | 'cancelled' | null
          lesson_notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          class_id?: string
          scheduled_time?: string
          lesson_title?: string
          attachment_url?: string | null
          trimester?: number | null
          status?: 'planned' | 'in_progress' | 'done' | 'cancelled' | null
          lesson_notes?: string | null
          created_at?: string
        }
      }
      attendances: {
        Row: {
          id: string
          session_id: string
          student_id: string
          status: 'present' | 'absent' | 'late' | null
          participation_note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          student_id: string
          status?: 'present' | 'absent' | 'late' | null
          participation_note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          student_id?: string
          status?: 'present' | 'absent' | 'late' | null
          participation_note?: string | null
          created_at?: string
        }
      }
      grades: {
        Row: {
          id: string
          class_id: string
          student_id: string
          evaluation_title: string
          grade_value: number | null
          max_value: number
          evaluation_date: string | null
          trimester: number | null
          created_at: string
        }
        Insert: {
          id?: string
          class_id: string
          student_id: string
          evaluation_title: string
          grade_value?: number | null
          max_value?: number
          evaluation_date?: string | null
          trimester?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          class_id?: string
          student_id?: string
          evaluation_title?: string
          grade_value?: number | null
          max_value?: number
          evaluation_date?: string | null
          trimester?: number | null
          created_at?: string
        }
      }
      todos: {
        Row: {
          id: string
          teacher_id: string
          task: string
          is_completed: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          teacher_id: string
          task: string
          is_completed?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          teacher_id?: string
          task?: string
          is_completed?: boolean | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      cycle_type: 'primaire' | 'cem' | 'lycee'
      gender_type: 'male' | 'female'
      language_type: 'fr' | 'ar' | 'en'
      session_status: 'planned' | 'in_progress' | 'done' | 'cancelled'
      attendance_status: 'present' | 'absent' | 'late'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
