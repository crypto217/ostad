import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Presentation } from 'lucide-react'
import { Suspense } from 'react'

import Header from '@/components/layout/Header'
import Navigation from '@/components/layout/Navigation'
import HeroCard from '@/components/dashboard/HeroCard'
import TodoBlock from '@/components/dashboard/TodoBlock'
import KPIGrid from '@/components/dashboard/KPIGrid'

async function DashboardContent() {
    const cookieStore = await cookies()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
            getAll() { return cookieStore.getAll() },
            setAll() { },
        },
    })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const now = new Date()
    const startOfToday = new Date(now)
    startOfToday.setHours(0, 0, 0, 0)
    const endOfToday = new Date(now)
    endOfToday.setHours(23, 59, 59, 999)

    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)) // Monday
    startOfWeek.setHours(0, 0, 0, 0)

    const [
        { data: profile },
        { count: classesCount },
        { data: nextSessionData },
        { data: pendingTodosAll },
        { data: attendancesThisWeek },
        { data: sessionsToday },
        { count: totalStudents }
    ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('classes').select('id', { count: 'exact', head: true }).eq('teacher_id', user.id),
        supabase
            .from('course_sessions')
            .select('*, classes!inner(class_name, teacher_id)')
            .eq('classes.teacher_id', user.id)
            .gte('scheduled_time', now.toISOString())
            .eq('status', 'planned')
            .order('scheduled_time', { ascending: true })
            .limit(1)
            .maybeSingle(),
        supabase.from('todos')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_completed', false)
            .order('created_at', { ascending: false }),
        supabase.from('attendances')
            .select('status, course_sessions!inner(scheduled_time, classes!inner(teacher_id))')
            .eq('course_sessions.classes.teacher_id', user.id)
            .gte('course_sessions.scheduled_time', startOfWeek.toISOString()),
        supabase.from('course_sessions')
            .select('class_id, classes!inner(teacher_id)')
            .eq('classes.teacher_id', user.id)
            .gte('scheduled_time', startOfToday.toISOString())
            .lte('scheduled_time', endOfToday.toISOString())
            .neq('status', 'cancelled'),
        supabase.from('students')
            .select('id, classes!inner(teacher_id)', { count: 'exact', head: true })
            .eq('classes.teacher_id', user.id)
    ])

    if (!profile) redirect('/onboarding')

    let nextCourseFormatted = null
    if (nextSessionData) {
        const startTime = new Date(nextSessionData.scheduled_time)
        const endTime = new Date(startTime.getTime() + (nextSessionData.duration_minutes || 60) * 60000)

        const colors = ['blue', 'green', 'purple', 'yellow'] as const
        const classNameStr = nextSessionData.classes?.class_name || ''
        const colorIndex = classNameStr.length % colors.length

        nextCourseFormatted = {
            id: nextSessionData.id,
            lesson_title: nextSessionData.title || `Cours: ${classNameStr || 'Inconnu'}`,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            class_name: classNameStr || 'Classe',
            color_code: colors[colorIndex]
        }
    }

    const totalPendingTodos = pendingTodosAll ? pendingTodosAll.length : 0
    const topPendingTodos = pendingTodosAll ? pendingTodosAll.slice(0, 3) : []

    let weeklyAttendanceRate: number | string = "—"
    if (attendancesThisWeek && attendancesThisWeek.length > 0) {
        const presentCount = attendancesThisWeek.filter(a => a.status === 'present').length
        weeklyAttendanceRate = Math.round((presentCount / attendancesThisWeek.length) * 100)
    }

    let uniqueClassesToday = 0
    if (sessionsToday) {
        uniqueClassesToday = new Set(sessionsToday.map(s => s.class_id)).size
    }

    const studentsCount = totalStudents || 0

    const stats = {
        pendingTodos: totalPendingTodos,
        weeklyAttendance: weeklyAttendanceRate,
        classesToday: uniqueClassesToday,
        totalStudents: studentsCount
    }

    return (
        <div className="max-w-md md:max-w-none md:container mx-auto px-6 pt-12 md:p-8 lg:p-12 xl:p-12">
            {classesCount === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 mb-8 relative overflow-hidden shadow-sm">
                    <div className="relative z-10 text-yellow-800">
                        <h4 className="font-bold text-base mb-1">Aucune classe</h4>
                        <p className="text-sm mb-4 opacity-90">Vous n'avez pas encore configuré vos classes.</p>
                        <Link href="/classes/new" className="inline-block bg-yellow-400 text-yellow-900 text-sm font-bold py-2.5 px-5 rounded-xl hover:bg-yellow-500 transition-colors shadow-sm">
                            Configurer mes classes →
                        </Link>
                    </div>
                    <Presentation size={100} className="absolute -right-6 -bottom-6 text-yellow-200 opacity-40 rotate-[-10deg]" />
                </div>
            )}

            {profile && <Header profile={profile} />}

            <div className="md:grid md:grid-cols-12 md:gap-8 items-start">
                <div className="md:col-span-12 xl:col-span-8 flex flex-col gap-8">
                    <HeroCard nextCourse={nextCourseFormatted} />
                    <KPIGrid stats={stats} />
                </div>
                <div className="md:col-span-12 xl:col-span-4 mt-8 xl:mt-0">
                    <TodoBlock initialTodos={topPendingTodos} />
                </div>
            </div>
        </div>
    )
}

function DashboardSkeleton() {
    return (
        <div className="max-w-md md:max-w-none md:container mx-auto px-6 pt-12 md:p-8 lg:p-12 xl:p-12">
            <div className="flex justify-between items-center mb-10 animate-pulse">
                <div>
                    <div className="h-8 bg-gray-200 rounded-full w-48 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded-full w-32"></div>
                </div>
                <div className="hidden md:flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                </div>
            </div>

            <div className="md:grid md:grid-cols-12 md:gap-8 items-start">
                <div className="md:col-span-12 xl:col-span-8 flex flex-col gap-8">
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 relative overflow-hidden h-[240px] animate-pulse">
                        <div className="flex justify-between items-start mb-6">
                            <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
                        </div>
                        <div className="h-8 w-3/4 bg-gray-200 rounded-full mb-4"></div>
                        <div className="h-4 w-1/2 bg-gray-200 rounded-full mb-8"></div>
                        <div className="h-14 w-full bg-gray-100 rounded-3xl mt-auto absolute bottom-6 left-6 right-6" style={{ width: 'calc(100% - 48px)' }}></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 flex flex-col justify-between aspect-[4/3] animate-pulse">
                                <div className="w-10 h-10 rounded-full bg-gray-100 mb-2"></div>
                                <div>
                                    <div className="h-8 w-16 bg-gray-200 rounded-lg mb-2"></div>
                                    <div className="h-3 w-20 bg-gray-200 rounded-full"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="md:col-span-12 xl:col-span-4 mt-8 xl:mt-0">
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-8 animate-pulse">
                        <div className="flex justify-between items-center mb-6">
                            <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
                        </div>
                        <div className="flex gap-3 mb-6">
                            <div className="flex-1 h-12 bg-gray-100 rounded-2xl"></div>
                            <div className="w-12 h-12 bg-gray-200 rounded-2xl"></div>
                        </div>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-4 py-2">
                                    <div className="w-6 h-6 rounded-full bg-gray-200 shrink-0"></div>
                                    <div className="h-4 bg-gray-100 rounded-full flex-1"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-[#F9F9F6] pb-24 md:pb-0 md:pl-[220px] xl:pl-[260px] font-sans selection:bg-green-100 selection:text-green-900 transition-all">
            <Suspense fallback={<DashboardSkeleton />}>
                <DashboardContent />
            </Suspense>
            <Navigation />
        </div>
    )
}
