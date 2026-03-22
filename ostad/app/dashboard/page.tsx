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
import ClassesList from '@/components/dashboard/ClassesList'

/**
 * DashboardContent - The brain of the dashboard and primary data orchestrator.
 * Preserves all business logic and Supabase queries while reorganizing the layout for the 'Kinetic Classroom' aesthetic.
 */
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

    // Parallel Data Fetching (Logic STRICTLY UNTOUCHED)
    const [
        { data: profile },
        { count: classesCount },
        { data: classesData },
        { data: nextSessionData },
        { data: pendingTodosAll },
        { data: attendancesThisWeek },
        { data: sessionsToday },
        { count: totalStudents }
    ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('classes').select('id', { count: 'exact', head: true }).eq('teacher_id', user.id),
        supabase.from('classes')
            .select('id, class_name, students(count)')
            .eq('teacher_id', user.id)
            .limit(4),
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

    // Data Formatting for components
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
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-8 md:py-12 animate-in fade-in duration-700">
            {/* Conditional Empty State Alert (Redesigned) */}
            {classesCount === 0 && (
                <div className="bg-[#FEFCE8] border-none rounded-[3rem] p-8 mb-12 relative overflow-hidden shadow-sm flex items-center gap-8">
                    <div className="relative z-10 flex-1">
                        <h4 className="font-black text-2xl text-yellow-900 mb-2 uppercase tracking-tight">C&apos;est un début ! 🌱</h4>
                        <p className="text-lg mb-6 text-yellow-800 opacity-80 font-bold leading-relaxed">Vous n&apos;avez pas encore configuré vos classes. Commençons par là pour activer votre dashboard.</p>
                        <Link href="/classes/new" className="inline-flex items-center gap-3 bg-[#EAB308] text-white font-black py-4 px-8 rounded-2xl hover:bg-[#CA8A04] transition-all shadow-xl active:scale-95 text-lg">
                            Configurer mes classes
                            <span className="text-xl">➔</span>
                        </Link>
                    </div>
                    <div className="hidden lg:block shrink-0 relative z-10 w-48 h-48 bg-yellow-400/20 rounded-full flex items-center justify-center text-yellow-600 rotate-12">
                        <Presentation size={80} strokeWidth={2.5} />
                    </div>
                    <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl" />
                </div>
            )}

            {/* Kinetic Header Component */}
            {profile && (
                <div className="mb-12">
                    <Header profile={profile} />
                </div>
            )}

            {/* Main Dashboard Grid System (2/3 + 1/3) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left Content Area (8/12) */}
                <div className="lg:col-span-8 space-y-10">
                    <HeroCard nextCourse={nextCourseFormatted} />
                    <div className="pt-2">
                        <KPIGrid stats={stats} />
                    </div>
                    <div>
                        <ClassesList classes={classesData || []} />
                    </div>
                </div>

                {/* Right Sidebar Area (4/12) */}
                <div className="lg:col-span-4 min-w-0">
                    <div className="sticky top-12">
                        <TodoBlock initialTodos={topPendingTodos} />
                    </div>
                </div>
            </div>
        </div>
    )
}

/**
 * DashboardSkeleton - High-precision loading state for seamless transitions.
 */
function DashboardSkeleton() {
    return (
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-8 md:py-12 animate-pulse">
            <div className="flex justify-between items-center mb-12">
                <div>
                    <div className="h-14 bg-gray-100 rounded-full w-64 mb-4"></div>
                    <div className="h-6 bg-gray-100 rounded-full w-40"></div>
                </div>
                <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-10">
                    <div className="bg-gray-50 rounded-[3rem] h-80 w-full shadow-inner"></div>
                    <div className="grid grid-cols-3 gap-8">
                        <div className="h-48 bg-gray-100 rounded-[2.5rem]"></div>
                        <div className="h-48 bg-gray-100 rounded-[2.5rem]"></div>
                        <div className="h-48 bg-gray-100 rounded-[2.5rem]"></div>
                    </div>
                </div>
                <div className="lg:col-span-4">
                    <div className="bg-gray-50 rounded-[3rem] h-[600px] w-full shadow-inner"></div>
                </div>
            </div>
        </div>
    )
}

/**
 * DashboardPage - Client-side wrapper for the server-rendered dashboard.
 * Manages the top-level layout, persistent navigation, and background layers.
 */
export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-[#F9F9F6] font-sans selection:bg-green-100 selection:text-green-900 overflow-x-hidden">
            <Navigation />

            {/* Content Offset for the Kinetic Sidebar */}
            <main className="md:pl-[260px] xl:pl-[300px] pb-32 md:pb-0 relative">
                {/* Visual Depth Overlay */}
                <div className="fixed top-0 right-0 w-[50vw] h-screen bg-green-500/5 -z-10 blur-[150px] opacity-20 pointer-events-none" />

                <Suspense fallback={<DashboardSkeleton />}>
                    <DashboardContent />
                </Suspense>
            </main>
        </div>
    )
}
