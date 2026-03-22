import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Navigation from '@/components/layout/Navigation'
import WeekGrid from '@/components/planning/WeekGrid'

export const metadata = {
    title: 'Planning | Ostad',
}

export default async function PlanningPage() {
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

    // Fetch classes
    const { data: classes } = await supabase
        .from('classes')
        .select('*')
        .eq('teacher_id', user.id)

    // Fetch weekly schedules (Template)
    const { data: weeklySchedules } = await supabase
        .from('weekly_schedules')
        .select(`*, class:classes(class_name, color_code)`)
        .eq('teacher_id', user.id)

    // Calculate current week (Sunday → Saturday)
    const today = new Date()
    const dayOfWeek = today.getDay()
    const sunday = new Date(today)
    sunday.setDate(today.getDate() - dayOfWeek)
    sunday.setHours(0, 0, 0, 0)

    const saturday = new Date(sunday)
    saturday.setDate(sunday.getDate() + 6)
    saturday.setHours(23, 59, 59, 999)

    // Fetch course sessions for the current week
    const { data: courseSessions } = await supabase
        .from('course_sessions')
        .select(`*, class:classes(class_name, color_code)`)
        .eq('teacher_id', user.id)
        .gte('scheduled_time', sunday.toISOString())
        .lte('scheduled_time', saturday.toISOString())

    return (
        <div className="min-h-screen bg-[#F9F9F6]">
            <Navigation />
            <main className="md:pl-[220px] xl:pl-[260px] pb-24 md:pb-0">
                <div className="max-w-7xl mx-auto px-4 pt-10 md:p-8 lg:p-12">
                    <WeekGrid
                        weeklySchedules={weeklySchedules || []}
                        courseSessions={courseSessions || []}
                        classes={classes || []}
                        weekStart={sunday.toISOString()}
                    />
                </div>
            </main>
        </div>
    )
}
