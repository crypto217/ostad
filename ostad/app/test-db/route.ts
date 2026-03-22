import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
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

    const { data: allSessions } = await supabase.from('course_sessions').select('*');

    return NextResponse.json({
        allSessions
    })
}
