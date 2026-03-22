import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Navigation from '@/components/layout/Navigation'
import ElevesClient from './ElevesClient'
import { translations, TranslationKey, Language } from '@/lib/i18n/translations'

export const metadata = {
    title: 'Élèves | Ostad',
}

async function getProfileLanguage() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll() { return cookieStore.getAll(); }, setAll() { } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return "fr";

    const { data: profile } = await supabase
        .from("profiles")
        .select("preferred_language")
        .eq("id", user.id)
        .single();

    return (profile?.preferred_language as Language) || "fr";
}

export default async function ElevesPage() {
    const cookieStore = await cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        cookies: { getAll() { return cookieStore.getAll() }, setAll() { } }
    })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const language = await getProfileLanguage()
    const rtl = language === 'ar'

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
        <div className={`min-h-screen bg-[#F9F9F6] pb-24 md:pb-0 font-sans selection:bg-green-100 selection:text-green-900 transition-all ${rtl ? 'md:pr-[220px] xl:pr-[260px] md:pl-0' : 'md:pl-[220px] xl:pl-[260px]'}`}>
            <div className="max-w-5xl mx-auto px-6 pt-12 md:p-8 lg:p-12 xl:p-12">
                <ElevesClient classes={classes} />
            </div>
            <Navigation />
        </div>
    )
}
