import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import AttendanceList from '@/components/attendance/AttendanceList'
import AttendanceSummary from '@/components/attendance/AttendanceSummary'
import { finishAttendance } from '@/app/actions'
import BackButton from '@/components/layout/BackButton'

export const metadata = {
    title: 'Journal d\'Appel | Ostad',
}

export default async function AttendancePage({ params }: { params: { sessionId: string } }) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll() },
                setAll() { }
            }
        }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Fetch session details and associated class
    const { data: session, error: sessionError } = await supabase
        .from('course_sessions')
        .select(`
            id,
            status,
            start_time,
            end_time,
            lesson_title,
            classes!inner(
                id,
                name,
                level,
                teacher_id
            )
        `)
        .eq('id', params.sessionId)
        .eq('classes.teacher_id', user.id)
        .single()

    if (sessionError || !session) notFound()

    const classData = Array.isArray(session.classes) ? (session.classes as any)[0] : (session.classes as any)

    // Fetch all students for this class
    const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('id, first_name, last_name, gender')
        .eq('class_id', classData.id)

    if (studentsError) throw new Error(studentsError.message)

    // Fetch existing attendances for this session
    const { data: attendances, error: attendancesError } = await supabase
        .from('attendances')
        .select('id, student_id, status, participation_note')
        .eq('session_id', session.id)

    if (attendancesError) throw new Error(attendancesError.message)

    // Ensure start_time is a valid date string before formatting
    const formattedDate = session.start_time
        ? new Date(session.start_time).toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
        : 'Date inconnue';

    const formattedTime = session.start_time && session.end_time
        ? `${new Date(session.start_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - ${new Date(session.end_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
        : '';

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <BackButton />
            {/* Header */}
            <div className="flex items-center justify-between pb-6 border-b border-gray-100">
                <div className="flex items-center gap-4">
                    <Link
                        href="/planning"
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-500" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Journal d'Appel - {classData.name}
                        </h1>
                        <p className="text-gray-500 capitalize">
                            {formattedDate} {formattedTime && `• ${formattedTime}`}
                        </p>
                        {session.lesson_title && (
                            <p className="text-sm font-medium text-blue-600 mt-1">
                                📘 {session.lesson_title}
                            </p>
                        )}
                    </div>
                </div>

                <form action={async () => {
                    'use server'
                    await finishAttendance(session.id)
                }}>
                    <button
                        type="submit"
                        disabled={session.status === 'done'}
                        className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-3xl font-medium transition-all"
                    >
                        {session.status === 'done' ? 'Appel Terminé' : 'Terminer l\'appel'}
                    </button>
                </form>
            </div>

            {/* Content */}
            <AttendanceSummary totalStudents={students.length} attendances={attendances || []} />
            <AttendanceList sessionId={session.id} students={students || []} initialAttendances={attendances || []} />
        </div>
    )
}
