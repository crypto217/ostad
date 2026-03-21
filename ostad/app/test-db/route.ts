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

    let userClasses = [];
    if (user) {
        const { data } = await supabase.from('classes').select('*').eq('teacher_id', user.id);
        userClasses = data || [];
    }

    const { data: allClasses } = await supabase.from('classes').select('*');

    return NextResponse.json({
        userId: user?.id,
        userClasses,
        allClassesCount: allClasses?.length || 0,
        allClasses
    })
}
