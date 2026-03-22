import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import GradesTable from '@/components/grades/GradesTable'
import AddEvaluationModal from '@/components/grades/AddEvaluationModal'
import BackButton from '@/components/layout/BackButton'
import Navigation from '@/components/layout/Navigation'
import { seedDefaultGradesForExistingStudents } from '@/app/actions'


export const metadata = {
    title: 'Carnet de Notes | Ostad',
}

export default async function GradesPage({
    params,
    searchParams,
}: {
    params: Promise<{ classId: string }>
    searchParams: Promise<{ t?: string }>
}) {
    const { classId } = await params
    const { t } = await searchParams

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

    const selectedTrimester = t ? parseInt(t) : 1

    // Fetch class details to verify ownership
    const { data: currentClass, error: classError } = await supabase
        .from('classes')
        .select('*')
        .eq('id', classId)
        .eq('teacher_id', user.id)
        .single()

    if (classError || !currentClass) notFound()

    // Fetch all students in the class
    const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('id, first_name, last_name')
        .eq('class_id', classId)

    if (studentsError) throw new Error(studentsError.message)

    // Fetch grades for this class and trimester
    const { data: grades, error: gradesError } = await supabase
        .from('grades')
        .select('*')
        .eq('class_id', classId)
        .eq('trimester', selectedTrimester)

    if (gradesError) throw new Error(gradesError.message)

    // Auto-seed default evaluations for existing students if none exist yet
    let gradesData = grades
    if ((!grades || grades.length === 0) && students && students.length > 0) {
        try {
            await seedDefaultGradesForExistingStudents(classId)
            // Re-fetch grades after seeding
            const { data: seededGrades } = await supabase
                .from('grades')
                .select('*')
                .eq('class_id', classId)
                .eq('trimester', selectedTrimester)
            gradesData = seededGrades || []
        } catch (e) {
            console.error('Auto-seed failed:', e)
        }
    }

    // Deduplicate evaluations (by title)
    const evalMap = new Map<string, { title: string; max_value: number; date: string }>()
    gradesData?.forEach(g => {

        if (!evalMap.has(g.evaluation_title)) {
            evalMap.set(g.evaluation_title, {
                title: g.evaluation_title,
                max_value: g.max_value,
                date: g.evaluation_date,
            })
        }
    })
    const evaluations = Array.from(evalMap.values())

    return (
        <div className="min-h-screen bg-[#F9F9F6] pb-24 md:pb-0 md:pl-[220px] xl:pl-[260px] font-sans transition-all">
            <div className="max-w-md md:max-w-none md:container mx-auto px-6 pt-12 md:p-8 lg:p-12 xl:p-12 space-y-6">
                <BackButton />

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                        <Link
                            href={`/classes/${classId}/students`}
                            className="w-11 h-11 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors shadow-sm shrink-0"
                        >
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                                Carnet de Notes
                            </h1>
                            <p className="text-gray-500 text-sm mt-0.5">
                                {currentClass.class_name ?? currentClass.name} — Gérez les évaluations et notes
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Trimester Selector */}
                        <div className="bg-white border border-gray-200 rounded-xl p-1 flex shadow-sm">
                            {[1, 2, 3].map((tri) => (
                                <Link
                                    key={tri}
                                    href={`/classes/${classId}/grades?t=${tri}`}
                                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedTrimester === tri
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    Trim. {tri}
                                </Link>
                            ))}
                        </div>

                        {/* + Nouvelle Évaluation button */}
                        <AddEvaluationModal classId={classId} trimester={selectedTrimester} />
                    </div>
                </div>

                {/* Grades Table */}
                <GradesTable
                    students={students || []}
                    grades={gradesData || []}
                    evaluations={evaluations}
                    classId={classId}
                    trimester={selectedTrimester}
                />


            </div>

            <Navigation />
        </div>
    )
}
