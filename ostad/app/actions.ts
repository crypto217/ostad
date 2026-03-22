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

    console.log('USER ID:', user?.id)
    console.log('DATA:', JSON.stringify(data))
    console.log("AUTH USER ERROR:", authError);

    if (!user) {
        console.error("No user found!");
        return { error: "Unauthorized", code: "401" }
    }

    console.log("INSERTING INTO CLASSES...");
    const { error } = await supabase.from('classes').insert({
        teacher_id: user.id,
        class_name: data.class_name,
        color_code: data.color_code,
        cycle: data.cycle
    })

    if (error) {
        console.error('SUPABASE ERROR:', JSON.stringify(error))
        return { error: error.message, code: error.code }
    }

    revalidatePath('/classes')
    return { success: true }
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

export async function createStudent(data: { class_id: string; first_name: string; last_name: string; gender: string; birth_date: string }) {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    console.log('STUDENT DATA:', JSON.stringify(data))
    console.log('USER:', user?.id)

    const { error } = await supabase.from('students').insert({
        class_id: data.class_id,
        first_name: data.first_name,
        last_name: data.last_name,
        gender: data.gender,
        birth_date: data.birth_date
    })

    if (error) {
        console.error('STUDENT ERROR:', JSON.stringify(error))
        return { error: error.message, code: error.code }
    }

    revalidatePath(`/classes/${data.class_id}/students`)
    revalidatePath('/eleves')
    return { success: true }
}

export async function updateStudent(id: string, class_id: string, data: { first_name: string; last_name: string; gender: string; birth_date: string }) {
    const supabase = await getSupabase()
    const { error } = await supabase.from('students').update(data).eq('id', id)
    if (error) throw new Error(error.message)
    revalidatePath(`/classes/${class_id}/students`)
    revalidatePath('/eleves')
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

// ----------------------
// PLANNING ACTIONS
// ----------------------

export async function createWeeklySlot(data: { class_id: string; day_of_week: number; start_time: string; end_time: string }) {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: insertedData, error } = await supabase.from('weekly_schedules').insert({
        ...data,
        teacher_id: user.id
    }).select('id').single()

    if (error) throw new Error(error.message)
    revalidatePath('/planning')
    return { success: true, slotId: insertedData.id }
}

export async function deleteWeeklySlot(id: string) {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { error } = await supabase.from('weekly_schedules').delete().eq('id', id).eq('teacher_id', user.id)

    if (error) throw new Error(error.message)
    revalidatePath('/planning')
    return { success: true }
}

export async function createCourseSession(data: { class_id: string; scheduled_time: string; status?: string; weekly_schedule_id?: string }) {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: classData, error: classError } = await supabase.from('classes').select('id').eq('id', data.class_id).eq('teacher_id', user.id).single()
    if (classError || !classData) throw new Error('Class not found or unauthorized')

    const { error } = await supabase.from('course_sessions').insert(data)

    if (error) throw new Error(error.message)
    revalidatePath('/planning')
    revalidatePath('/dashboard')
    return { success: true }
}

export async function updateSessionStatus(id: string, status: string) {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { error } = await supabase.from('course_sessions').update({ status }).eq('id', id)

    if (error) throw new Error(error.message)
    revalidatePath('/planning')
    revalidatePath('/dashboard')
    return { success: true }
}

export async function updateSessionDetails(id: string, data: { lesson_title?: string; trimester?: number | string; lesson_notes?: string; attachment_url?: string; status?: string }) {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { error } = await supabase.from('course_sessions').update(data).eq('id', id)

    if (error) throw new Error(error.message)
    revalidatePath('/planning')
    return { success: true }
}

// ----------------------
// ATTENDANCE ACTIONS
// ----------------------

export async function upsertAttendance(data: { session_id: string; student_id: string; status: string; participation_note?: string }) {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        console.error("No user found!");
        throw new Error("Unauthorized")
    }

    // Verify session belongs to teacher
    const { data: sessionData, error: sessionError } = await supabase
        .from('course_sessions')
        .select(`
            id,
            classes!inner(teacher_id)
        `)
        .eq('id', data.session_id)
        .eq('classes.teacher_id', user.id)
        .single();

    if (sessionError || !sessionData) throw new Error("Unauthorized or session not found");

    const { error } = await supabase
        .from('attendances')
        .upsert(
            {
                session_id: data.session_id,
                student_id: data.student_id,
                status: data.status,
                participation_note: data.participation_note
            },
            { onConflict: 'session_id,student_id' }
        )

    if (error) throw new Error(error.message)
    revalidatePath(`/sessions/${data.session_id}/attendance`)
    return { success: true }
}

export async function finishAttendance(sessionId: string) {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Verify session belongs to teacher
    const { data: sessionData, error: sessionError } = await supabase
        .from('course_sessions')
        .select(`id, classes!inner(teacher_id)`)
        .eq('id', sessionId)
        .eq('classes.teacher_id', user.id)
        .single();

    if (sessionError || !sessionData) throw new Error("Unauthorized or session not found");

    const { error } = await supabase
        .from('course_sessions')
        .update({ status: 'done' })
        .eq('id', sessionId)

    if (error) throw new Error(error.message)
    revalidatePath('/dashboard')
    revalidatePath('/planning')
    revalidatePath(`/sessions/${sessionId}/attendance`)
    return { success: true }
}

// ----------------------
// GRADES ACTIONS
// ----------------------

export async function createEvaluation(data: { class_id: string; evaluation_title: string; max_value: number; trimester: number; evaluation_date: string }) {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Verify class belongs to teacher
    const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('id')
        .eq('id', data.class_id)
        .eq('teacher_id', user.id)
        .single();

    if (classError || !classData) throw new Error("Unauthorized or class not found");

    // Fetch all students in the class
    const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('id')
        .eq('class_id', data.class_id);

    if (studentsError) throw new Error(studentsError.message);
    if (!students || students.length === 0) return { success: true }; // No students to grade

    // Prepare batch insert
    const gradesToInsert = students.map(student => ({
        class_id: data.class_id,
        student_id: student.id,
        evaluation_title: data.evaluation_title,
        grade_value: null,
        max_value: data.max_value,
        trimester: data.trimester,
        evaluation_date: data.evaluation_date
    }));

    const { error } = await supabase.from('grades').insert(gradesToInsert);

    if (error) throw new Error(error.message)
    revalidatePath(`/classes/${data.class_id}/grades`)
    return { success: true }
}

export async function updateGrade(gradeId: string, value: number | null) {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Verify grade belongs to a class owned by the teacher
    const { data: gradeData, error: gradeError } = await supabase
        .from('grades')
        .select(`id, classes!inner(teacher_id)`)
        .eq('id', gradeId)
        .eq('classes.teacher_id', user.id)
        .single();

    if (gradeError || !gradeData) throw new Error("Unauthorized or grade not found");

    const { error } = await supabase
        .from('grades')
        .update({ grade_value: value })
        .eq('id', gradeId)

    if (error) throw new Error(error.message)
    // Client side will handle optimistic UI, no strict revalidate needed for the table itself, 
    // but maybe useful if refreshed.
    return { success: true }
}

// ----------------------
// PROFILE ACTIONS
// ----------------------

export async function updateProfile(data: { full_name: string; subject: string; cycle: string; preferred_language: string; gender: string }) {
    const supabase = await getSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error('Unauthorized')

    const { error } = await supabase.from('profiles').update(data).eq('id', user.id)
    if (error) throw new Error(error.message)
    revalidatePath('/settings')
    revalidatePath('/dashboard')
    revalidatePath('/planning')
    revalidatePath('/classes')
    revalidatePath('/eleves')
    return { success: true }
}
