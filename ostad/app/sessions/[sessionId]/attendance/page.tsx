'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { notFound, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import AttendanceList from '@/components/attendance/AttendanceList'
import AttendanceSummary from '@/components/attendance/AttendanceSummary'
import { finishAttendance } from '@/app/actions'
import BackButton from '@/components/layout/BackButton'
import { useLanguage } from '@/lib/i18n/LanguageContext'

export default function AttendancePage({ params }: { params: { sessionId: string } }) {
    const { t, language } = useLanguage()
    const rtl = language === 'ar'
    const router = useRouter()
    const supabase = createClient()

    const [loading, setLoading] = useState(true)
    const [session, setSession] = useState<any>(null)
    const [students, setStudents] = useState<any[]>([])
    const [attendances, setAttendances] = useState<any[]>([])
    const [isFinishing, setIsFinishing] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }

            // Fetch session details and associated class
            const { data: sessionData, error: sessionError } = await supabase
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

            if (sessionError || !sessionData) {
                setLoading(false)
                return
            }

            setSession(sessionData)
            const classData = Array.isArray(sessionData.classes) ? (sessionData.classes as any)[0] : (sessionData.classes as any)

            // Fetch all students for this class
            const { data: studentsData } = await supabase
                .from('students')
                .select('id, first_name, last_name, gender')
                .eq('class_id', classData.id)

            setStudents(studentsData || [])

            // Fetch existing attendances for this session
            const { data: attendancesData } = await supabase
                .from('attendances')
                .select('id, student_id, status, participation_note')
                .eq('session_id', sessionData.id)

            setAttendances(attendancesData || [])
            setLoading(false)
        }

        fetchData()
    }, [params.sessionId, supabase, router])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-green-500" />
            </div>
        )
    }

    if (!session) return notFound()

    const classData = Array.isArray(session.classes) ? (session.classes as any)[0] : (session.classes as any)

    const locale = language === 'ar' ? 'ar-DZ' : language === 'en' ? 'en-US' : 'fr-FR'

    // Ensure start_time is a valid date string before formatting
    const formattedDate = session.start_time
        ? new Date(session.start_time).toLocaleDateString(locale, {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
        : t('att_date_unknown');

    const formattedTime = session.start_time && session.end_time
        ? `${new Date(session.start_time).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })} - ${new Date(session.end_time).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}`
        : '';

    const handleFinish = async () => {
        setIsFinishing(true)
        try {
            await finishAttendance(session.id)
            setSession({ ...session, status: 'done' })
            router.refresh()
        } catch (error) {
            console.error(error)
        } finally {
            setIsFinishing(false)
        }
    }

    return (
        <div className={`max-w-4xl mx-auto space-y-6 ${rtl ? 'text-right' : ''}`}>
            <BackButton />
            {/* Header */}
            <div className={`flex flex-col sm:flex-row items-center justify-between pb-6 border-b border-gray-100 gap-4 ${rtl ? 'sm:flex-row-reverse' : ''}`}>
                <div className={`flex items-center gap-4 w-full ${rtl ? 'flex-row-reverse' : ''}`}>
                    <Link
                        href="/planning"
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors shrink-0"
                    >
                        <ArrowLeft className={`w-5 h-5 text-gray-500 ${rtl ? 'rotate-180' : ''}`} />
                    </Link>
                    <div className="min-w-0 flex-1">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                            {t('att_title')} - {classData.name}
                        </h1>
                        <p className="text-gray-500 capitalize text-sm sm:text-base">
                            {formattedDate} {formattedTime && `• ${formattedTime}`}
                        </p>
                        {session.lesson_title && (
                            <p className="text-sm font-medium text-blue-600 mt-1">
                                📘 {session.lesson_title}
                            </p>
                        )}
                    </div>
                </div>

                <button
                    onClick={handleFinish}
                    disabled={session.status === 'done' || isFinishing}
                    className="w-full sm:w-auto bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-3xl font-medium transition-all shadow-sm flex items-center justify-center gap-2"
                >
                    {isFinishing && <Loader2 className="w-4 h-4 animate-spin" />}
                    {session.status === 'done' ? t('att_done') : t('att_finish')}
                </button>
            </div>

            {/* Content */}
            <AttendanceSummary totalStudents={students.length} attendances={attendances || []} />
            <AttendanceList sessionId={session.id} students={students || []} initialAttendances={attendances || []} />
        </div>
    )
}
