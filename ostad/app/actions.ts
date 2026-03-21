'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getSupabase() {
    const cookieStore = await cookies()
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll() {
                    // Handled by middleware.ts for Server Components
                },
            },
        }
    )
}

// ----------------------
// CLASSES ACTIONS
// ----------------------

export async function createClass(data: { class_name: string; color_code: string; cycle: string }) {
    console.log("createClass ACTION STARTED with:", data);
    const supabase = await getSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log("AUTH USER:", user?.id, "ERROR:", authError);
    if (!user) {
        console.error("No user found!");
        throw new Error("Unauthorized")
    }

    console.log("INSERTING INTO CLASSES...");
    const { error } = await supabase.from('classes').insert({
        teacher_id: user.id,
        class_name: data.class_name,
        color_code: data.color_code,
        cycle: data.cycle
    })
    console.log("INSERT RESULT ERROR:", error);

    if (error) {
        console.error("Throwing error from createClass:", error.message);
        throw new Error(error.message)
    }
    console.log("Revalidating /classes...");
    revalidatePath('/classes')
}

export async function updateClass(id: string, data: { class_name: string; color_code: string; cycle: string }) {
    const supabase = await getSupabase()
    const { error } = await supabase.from('classes').update(data).eq('id', id)
    if (error) throw new Error(error.message)
    revalidatePath('/classes')
}

export async function deleteClass(id: string) {
    const supabase = await getSupabase()

    // In Supabase, if students reference class_id with ON DELETE CASCADE, they are auto-deleted.
    // If not, we might need a manual delete here, but typically cascading is set up.
    // Assuming cascading or that the user requested just the class wipe:
    const { error } = await supabase.from('classes').delete().eq('id', id)
    if (error) throw new Error(error.message)
    revalidatePath('/classes')
}

// ----------------------
// STUDENTS ACTIONS
// ----------------------

export async function createStudent(data: { class_id: string; first_name: string; last_name: string; gender: string; date_of_birth: string }) {
    const supabase = await getSupabase()
    const { error } = await supabase.from('students').insert(data)
    if (error) throw new Error(error.message)
    revalidatePath(`/classes/${data.class_id}/students`)
}

export async function updateStudent(id: string, class_id: string, data: { first_name: string; last_name: string; gender: string; date_of_birth: string }) {
    const supabase = await getSupabase()
    const { error } = await supabase.from('students').update(data).eq('id', id)
    if (error) throw new Error(error.message)
    revalidatePath(`/classes/${class_id}/students`)
}

export async function deleteStudent(id: string, class_id: string) {
    const supabase = await getSupabase()
    const { error } = await supabase.from('students').delete().eq('id', id)
    if (error) throw new Error(error.message)
    revalidatePath(`/classes/${class_id}/students`)
}

// ----------------------
// TODOS ACTIONS
// ----------------------

export async function createTodo(task: string) {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    const { data, error } = await supabase
        .from('todos')
        .insert({ teacher_id: user.id, task: task, is_completed: false })
        .select()
        .single()

    if (error) {
        console.error('Error creating todo:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard')
    return { success: true, data }
}

export async function toggleTodo(todoId: string, isCompleted: boolean) {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    const { error } = await supabase
        .from('todos')
        .update({ is_completed: isCompleted })
        .eq('id', todoId)
        .eq('teacher_id', user.id)

    if (error) {
        console.error('Error toggling todo:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard')
    return { success: true }
}
