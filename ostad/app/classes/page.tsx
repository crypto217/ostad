import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Users } from 'lucide-react'
import Navigation from '@/components/layout/Navigation'
import ClassCard from '@/components/classes/ClassCard'
import CreateClassModal from '@/components/classes/CreateClassModal'
import EditClassModal from '@/components/classes/EditClassModal'

export interface ClassItem {
    id: string
    class_name: string
    color_code: string
    cycle: string
    students: { count: number }[]
}

export default async function ClassesPage({ searchParams }: { searchParams: Promise<{ new?: string, edit?: string }> }) {
    const resolvedSearchParams = await searchParams;
    const cookieStore = await cookies()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
            getAll() { return cookieStore.getAll() },
            setAll() { /* handled by middleware */ },
        },
    })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Fetch classes + student counts
    const { data, error } = await supabase
        .from('classes')
        .select(`
            id, class_name, color_code, cycle,
            students(count)
        `)
        .eq('teacher_id', user.id)
        .order('class_name', { ascending: true })

    const classes = (data as unknown as ClassItem[]) || []

    const isCreating = resolvedSearchParams.new === '1'
    const classToEdit = resolvedSearchParams.edit ? classes.find(c => c.id === resolvedSearchParams.edit) : null

    return (
        <div className="min-h-screen bg-[#F9F9F6] pb-24 md:pb-0 md:pl-[220px] xl:pl-[260px] font-sans selection:bg-green-100 selection:text-green-900 transition-all">
            <div className="max-w-md md:max-w-none md:container mx-auto px-6 pt-12 md:p-8 lg:p-12 xl:p-12">

                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-900">Mes Classes</h1>
                    <Link
                        href="/classes?new=1"
                        className="flex items-center gap-2 px-5 py-3 bg-green-500 text-white font-bold rounded-3xl shadow-sm hover:bg-green-600 transition-all active:scale-95 text-sm"
                    >
                        <Plus size={20} className="stroke-[3]" />
                        <span className="hidden md:inline">Nouvelle Classe</span>
                    </Link>
                </div>

                {classes.length === 0 ? (
                    <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 shadow-sm max-w-lg mx-auto mt-12">
                        <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-green-500">
                            <Users size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune classe pour le moment</h3>
                        <p className="text-sm font-medium text-gray-400 mb-8 leading-relaxed">
                            Votre espace est vide ! Commencez par créer votre première classe pour organiser vos élèves et votre planning.
                        </p>
                        <Link
                            href="/classes?new=1"
                            className="inline-flex items-center justify-center px-6 py-3 bg-green-500 text-white rounded-3xl font-bold hover:bg-green-600 transition-colors shadow-sm text-sm"
                        >
                            Créer ma première classe
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {classes.map((cls) => (
                            <ClassCard key={cls.id} classItem={cls} />
                        ))}
                    </div>
                )}
            </div>

            <Navigation />

            {/* Modals triggered by query params */}
            {isCreating && <CreateClassModal />}
            {classToEdit && <EditClassModal classItem={classToEdit} />}
        </div>
    )
}
