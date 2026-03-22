import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import SettingsClient from './SettingsClient'
import Navigation from '@/components/layout/Navigation'

export const metadata = {
    title: 'Paramètres | Ostad',
}

export default async function SettingsPage() {
    const cookieStore = await cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        cookies: { getAll() { return cookieStore.getAll() }, setAll() { } }
    })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

    if (!profile) redirect('/onboarding')

    return (
        <div className="min-h-screen bg-[#F9F9F6] pb-24 md:pb-0 md:pl-[220px] xl:pl-[260px] font-sans selection:bg-green-100 selection:text-green-900 transition-all">
            <div className="max-w-3xl mx-auto px-6 pt-12 md:p-8 lg:p-12 xl:p-12">
                <h1 className="text-2xl font-bold text-gray-900 mb-8">Paramètres</h1>
                <SettingsClient initialProfile={profile} />
            </div>
            <Navigation />
        </div>
    )
}
