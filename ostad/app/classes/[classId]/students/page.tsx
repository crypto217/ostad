import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Users } from 'lucide-react'
import Navigation from '@/components/layout/Navigation'
import StudentCard from '@/components/students/StudentCard'
import AddStudentModal from '@/components/students/AddStudentModal'
import EditStudentModal from '@/components/students/EditStudentModal'
import BackButton from '@/components/layout/BackButton'

export interface StudentItem {
    id: string
    first_name: string
    last_name: string
    gender: 'Garçon' | 'Fille'
    birth_date: string
    class_id: string
}

export default async function StudentsPage({ params, searchParams }: { params: Promise<{ classId: string }>, searchParams: Promise<{ new?: string, edit?: string }> }) {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
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
    if (!user) redirect('/login')

    // Fetch class details
    const { data: classData } = await supabase
        .from('classes')
        .select('*')
        .eq('id', resolvedParams.classId)
        .eq('teacher_id', user.id)
        .single()

    if (!classData) redirect('/classes')

    // Fetch students
    const { data: studentsData } = await supabase
        .from('students')
        .select('*')
        .eq('class_id', resolvedParams.classId)
        .order('last_name', { ascending: true })

    const students = (studentsData as unknown as StudentItem[]) || []

    const isCreating = resolvedSearchParams.new === '1'
    const studentToEdit = resolvedSearchParams.edit ? students.find(s => s.id === resolvedSearchParams.edit) : null

    return (
        <div className="min-h-screen bg-[#F9F9F6] pb-24 md:pb-0 md:pl-[220px] xl:pl-[260px] font-sans selection:bg-green-100 selection:text-green-900 transition-all">
            <div className="max-w-md md:max-w-none md:container mx-auto px-6 pt-12 md:p-8 lg:p-12 xl:p-12">
                <BackButton />
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/classes"
                            className="w-11 h-11 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors shadow-sm shrink-0"
                        >
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex flex-wrap items-center gap-3">
                                {classData.class_name}
                                <span className="bg-green-50 text-green-600 text-[11px] font-bold px-3 py-1.5 rounded-full border border-green-100 uppercase tracking-widest shrink-0">
                                    {students.length} {students.length > 1 ? 'élèves' : 'élève'} au total
                                </span>
                            </h1>
                        </div>
                    </div>

                    <Link
                        href={`/classes/${resolvedParams.classId}/students?new=1`}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white font-bold rounded-3xl shadow-sm hover:bg-green-600 transition-all active:scale-95 text-sm shrink-0"
                    >
                        <Plus size={20} className="stroke-[3]" />
                        <span>Ajouter un élève</span>
                    </Link>
                </div>

                {/* Content */}
                {students.length === 0 ? (
                    <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 shadow-sm max-w-lg mx-auto mt-12">
                        <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-gray-400">
                            <Users size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun élève dans cette classe</h3>
                        <p className="text-sm font-medium text-gray-500 mb-8 leading-relaxed">
                            Commencez à ajouter vos élèves pour pouvoir gérer les présences et les évaluations associées à {classData.class_name}.
                        </p>
                        <Link
                            href={`/classes/${resolvedParams.classId}/students?new=1`}
                            className="inline-flex items-center justify-center px-6 py-3 bg-green-500 text-white rounded-3xl font-bold hover:bg-green-600 transition-colors shadow-sm text-sm"
                        >
                            Ajouter le premier élève
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/80 border-b border-gray-100 text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                                        <th className="px-6 py-4 rounded-tl-2xl">Élève</th>
                                        <th className="px-6 py-4">Genre</th>
                                        <th className="px-6 py-4">Date de naissance</th>
                                        <th className="px-6 py-4 text-right rounded-tr-2xl">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map(student => (
                                        <StudentCard key={student.id} student={student} view="desktop" />
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile List View */}
                        <div className="md:hidden space-y-4">
                            {students.map(student => (
                                <StudentCard key={student.id} student={student} view="mobile" />
                            ))}
                        </div>
                    </>
                )}
            </div>

            <Navigation />

            {/* Modals triggered by query params */}
            {isCreating && <AddStudentModal classId={resolvedParams.classId} />}
            {studentToEdit && <EditStudentModal student={studentToEdit} />}
        </div>
    )
}
