import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ClipboardList, CalendarDays, ChevronRight } from 'lucide-react'
import Navigation from '@/components/layout/Navigation'
import BackButton from '@/components/layout/BackButton'

export const metadata = {
    title: 'Séances | Ostad',
}

const STATUS_CONFIG = {
    planned: { label: 'Planifiée', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    in_progress: { label: 'En cours', className: 'bg-green-50 text-green-700 border-green-200' },
    done: { label: 'Terminée', className: 'bg-blue-50 text-blue-700 border-blue-200' },
    cancelled: { label: 'Annulée', className: 'bg-red-50 text-red-600 border-red-200' },
}

const FILTER_TABS = [
    { key: '', label: 'Toutes' },
    { key: 'planned', label: 'Planifiées' },
    { key: 'in_progress', label: 'En cours' },
    { key: 'done', label: 'Terminées' },
]

export default async function SessionsPage({
    searchParams,
}: {
    searchParams: Promise<{ status?: string; class?: string }>
}) {
    const resolved = await searchParams
    const statusFilter = resolved.status || ''
    const classFilter = resolved.class || ''

    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll() },
                setAll() { },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Build query — join classes to ensure teacher ownership
    let query = supabase
        .from('course_sessions')
        .select(`
            id,
            scheduled_time,
            status,
            lesson_title,
            classes!inner(
                id,
                class_name,
                color_code,
                teacher_id
            )
        `)
        .eq('classes.teacher_id', user.id)
        .order('scheduled_time', { ascending: false })

    if (statusFilter) {
        query = query.eq('status', statusFilter)
    }
    if (classFilter) {
        query = query.eq('class_id', classFilter)
    }

    const { data: sessions, error } = await query

    if (error) throw new Error(error.message)

    const sessionList = (sessions as any[]) || []

    // Build filter href helpers
    const buildHref = (statusKey: string) => {
        const params = new URLSearchParams()
        if (statusKey) params.set('status', statusKey)
        if (classFilter) params.set('class', classFilter)
        const q = params.toString()
        return `/sessions${q ? `?${q}` : ''}`
    }

    return (
        <div className="min-h-screen bg-[#F9F9F6] pb-24 md:pb-0 md:pl-[220px] xl:pl-[260px] font-sans selection:bg-green-100 selection:text-green-900 transition-all">
            <div className="max-w-md md:max-w-none md:container mx-auto px-6 pt-12 md:p-8 lg:p-12">
                <BackButton />

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                            <span className="w-10 h-10 bg-green-500 rounded-2xl flex items-center justify-center">
                                <ClipboardList size={22} className="text-white" />
                            </span>
                            Journal d'Appel
                        </h1>
                        <p className="text-gray-500 text-sm font-medium mt-1 ml-[52px]">
                            {sessionList.length} séance{sessionList.length !== 1 ? 's' : ''} {statusFilter ? `• filtre actif` : ''}
                        </p>
                    </div>
                </div>

                {/* Status Filter Tabs */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
                    {FILTER_TABS.map((tab) => {
                        const isActive = statusFilter === tab.key
                        return (
                            <Link
                                key={tab.key}
                                href={buildHref(tab.key)}
                                className={`shrink-0 px-4 py-2 rounded-2xl text-sm font-bold transition-all ${isActive
                                        ? 'bg-gray-900 text-white shadow-sm'
                                        : 'bg-white text-gray-500 border border-gray-100 hover:border-gray-200 hover:text-gray-700'
                                    }`}
                            >
                                {tab.label}
                            </Link>
                        )
                    })}
                </div>

                {/* Sessions List */}
                {sessionList.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm max-w-lg mx-auto">
                        <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <CalendarDays size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            Aucune séance trouvée
                        </h3>
                        <p className="text-sm text-gray-500 font-medium">
                            {statusFilter ? 'Essayez un autre filtre.' : 'Planifiez des séances depuis la page Planning pour les voir ici.'}
                        </p>
                        {statusFilter && (
                            <Link
                                href="/sessions"
                                className="mt-6 inline-flex px-5 py-2.5 bg-gray-900 text-white rounded-2xl font-bold text-sm hover:bg-black transition-colors"
                            >
                                Voir toutes les séances
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {sessionList.map((session: any) => {
                            const cls = Array.isArray(session.classes) ? session.classes[0] : session.classes
                            const statusCfg = STATUS_CONFIG[session.status as keyof typeof STATUS_CONFIG] ?? {
                                label: session.status,
                                className: 'bg-gray-100 text-gray-600 border-gray-200',
                            }
                            const scheduledDate = session.scheduled_time
                                ? new Date(session.scheduled_time)
                                : null
                            const formattedDate = scheduledDate
                                ? scheduledDate.toLocaleDateString('fr-FR', {
                                    weekday: 'short',
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                })
                                : 'Date inconnue'
                            const formattedTime = scheduledDate
                                ? scheduledDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                                : ''

                            const isDone = session.status === 'done'

                            return (
                                <div
                                    key={session.id}
                                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex items-stretch hover:shadow-md hover:border-gray-200 transition-all"
                                >
                                    {/* Color accent bar */}
                                    <div
                                        className="w-1.5 shrink-0"
                                        style={{ backgroundColor: cls?.color_code || '#e5e7eb' }}
                                    />

                                    <div className="flex flex-1 items-center gap-4 p-4 min-w-0">
                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <span
                                                    className="text-[10px] font-bold px-2.5 py-0.5 rounded-full text-white shrink-0"
                                                    style={{ backgroundColor: cls?.color_code || '#6b7280' }}
                                                >
                                                    {cls?.class_name ?? '—'}
                                                </span>
                                                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-lg border ${statusCfg.className}`}>
                                                    {statusCfg.label}
                                                </span>
                                            </div>

                                            <p className="font-bold text-gray-900 text-sm line-clamp-1">
                                                {session.lesson_title || 'Séance sans titre'}
                                            </p>
                                            <p className="text-xs text-gray-400 font-medium mt-0.5 capitalize">
                                                {formattedDate}{formattedTime ? ` • ${formattedTime}` : ''}
                                            </p>
                                        </div>

                                        {/* CTA Button */}
                                        <Link
                                            href={`/sessions/${session.id}/attendance`}
                                            className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all ${isDone
                                                    ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                                    : 'bg-green-500 text-white hover:bg-green-600 shadow-sm active:scale-95'
                                                }`}
                                        >
                                            {isDone ? 'Voir l\'appel' : 'Faire l\'appel'}
                                            <ChevronRight size={16} />
                                        </Link>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            <Navigation />
        </div>
    )
}
