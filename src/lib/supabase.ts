import { createBrowserClient } from '@supabase/ssr'

// Support des variables Vite (VITE_) localement, avec fallback pour Next.js au cas où ce code serait copié
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Variables d'environnement Supabase manquantes.")
}

export const supabase = createBrowserClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
)
