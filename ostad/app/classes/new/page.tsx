import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import CreateClassForm from '@/components/classes/CreateClassForm'

export default async function NewClassPage() {
    const cookieStore = await cookies()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
            getAll() {
                return cookieStore.getAll()
            },
            setAll() {
                // middleware handles setting cookies for server components
            },
        },
    })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    return (
        <div className="min-h-screen bg-[#F9F9F6] pb-24 font-sans selection:bg-green-100 selection:text-green-900">
            <div className="max-w-md mx-auto px-6 pt-12">
                <CreateClassForm teacherId={user.id} />
            </div>
        </div>
    )
}
