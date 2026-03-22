import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Navigation from '@/components/layout/Navigation'
import ElevesClient from './ElevesClient'

export const metadata = {
    title: 'Élèves | Ostad',
}

export default async function ElevesPage() {
    const cookieStore = await cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        cookies: { getAll() { return cookieStore.getAll() }, setAll() { } }
    })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: classesWithStudents } = await supabase
        .from('classes')
        .select(`
            id,
            class_name,
            color_code,
            students (
                id,
                first_name,
                last_name,
                gender
            )
        `)
        .eq('teacher_id', user.id)
        .order('class_name', { ascending: true })

    const classes = classesWithStudents || []

    return (
        <div className="min-h-screen bg-[#F9F9F6] pb-24 md:pb-0 md:pl-[220px] xl:pl-[260px] font-sans selection:bg-green-100 selection:text-green-900 transition-all">
            <div className="max-w-5xl mx-auto px-6 pt-12 md:p-8 lg:p-12 xl:p-12">
                <ElevesClient classes={classes} />
            </div>
            <Navigation />
        </div>
    )
}
