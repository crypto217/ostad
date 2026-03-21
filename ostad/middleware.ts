import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value)
                        supabaseResponse.cookies.set(name, value, options)
                    })
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register')
    const isOnboardingPage = request.nextUrl.pathname.startsWith('/onboarding')
    const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname === '/'

    // 1. Si non connecté → redirect /login
    if (!user && (isOnboardingPage || isDashboardPage)) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Si connecté
    if (user) {
        // Vérifier si un profil existe
        const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle()

        // 2. Si connecté mais pas de profil dans `profiles` → redirect /onboarding
        if (!profile && !isOnboardingPage && !request.nextUrl.pathname.startsWith('/auth/callback')) {
            return NextResponse.redirect(new URL('/onboarding', request.url))
        }

        // 3. Si connecté + profil existant → laisser passer vers /dashboard
        if (profile && (isAuthPage || isOnboardingPage || request.nextUrl.pathname === '/')) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
