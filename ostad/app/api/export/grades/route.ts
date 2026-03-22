import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
    request: NextRequest,
    { params }: { params: any }
) {
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')
    const trimester = searchParams.get('trimester')

    if (!classId || !trimester) {
        return NextResponse.json({ error: 'Missing classId or trimester' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll() },
                setAll() { },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // 1. Fetch class details & verify ownership
    const { data: currentClass, error: classError } = await supabase
        .from('classes')
        .select('class_name, name')
        .eq('id', classId)
        .eq('teacher_id', user.id)
        .single()

    if (classError || !currentClass) {
        return NextResponse.json({ error: 'Class not found or unauthorized' }, { status: 404 })
    }

    // 2. Fetch students
    const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('id, first_name, last_name')
        .eq('class_id', classId)
        .order('last_name', { ascending: true })

    if (studentsError) return NextResponse.json({ error: studentsError.message }, { status: 500 })

    // 3. Fetch grades for this trimester
    const { data: grades, error: gradesError } = await supabase
        .from('grades')
        .select('student_id, evaluation_title, grade_value, max_value')
        .eq('class_id', classId)
        .eq('trimester', trimester)

    if (gradesError) return NextResponse.json({ error: gradesError.message }, { status: 500 })

    // Deduplicate evaluations for the schema
    const evalMap = new Map()
    grades?.forEach(g => {
        if (!evalMap.has(g.evaluation_title)) {
            evalMap.set(g.evaluation_title, { title: g.evaluation_title, max_value: g.max_value })
        }
    })
    const evaluations = Array.from(evalMap.values())

    // 4. Fetch sessions for this trimester
    // We filter by class_id and trimester
    const { data: sessions, error: sessionsError } = await supabase
        .from('course_sessions')
        .select('id, scheduled_time')
        .eq('class_id', classId)
        .eq('trimester', trimester)
        .order('scheduled_time', { ascending: true })

    if (sessionsError) return NextResponse.json({ error: sessionsError.message }, { status: 500 })

    const sessionIds = sessions.map(s => s.id)

    // 5. Fetch attendances for these sessions
    let attendances: any[] = []
    if (sessionIds.length > 0) {
        const { data: attendanceData, error: attendanceError } = await supabase
            .from('attendances')
            .select('student_id, session_id, status')
            .in('session_id', sessionIds)

        if (attendanceError) return NextResponse.json({ error: attendanceError.message }, { status: 500 })
        attendances = attendanceData || []
    }

    return NextResponse.json({
        className: currentClass.class_name || currentClass.name || 'Classe',
        trimester: parseInt(trimester),
        students: students || [],
        evaluations,
        grades: grades || [],
        sessions: sessions || [],
        attendances
    })
}
