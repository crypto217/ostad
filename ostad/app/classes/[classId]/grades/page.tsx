import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import GradesTable from '@/components/grades/GradesTable'
import AddEvaluationModal from '@/components/grades/AddEvaluationModal'
import BackButton from '@/components/layout/BackButton'

export const metadata = {
    title: 'Carnet de Notes | Ostad',
}

export default async function GradesPage({
    params,
    searchParams
}: {
    params: { classId: string }
    searchParams: { t: string }
}) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll() },
                setAll() { }
            }
        }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const selectedTrimester = searchParams.t ? parseInt(searchParams.t) : 1

    // Fetch class details to verify ownership
    const { data: currentClass, error: classError } = await supabase
        .from('classes')
        .select('*')
        .eq('id', params.classId)
        .eq('teacher_id', user.id)
        .single()

    if (classError || !currentClass) notFound()

    // Fetch all students in the class
    const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .eq('class_id', params.classId)

    if (studentsError) throw new Error(studentsError.message)

    // Fetch grades for this class and trimester
    const { data: grades, error: gradesError } = await supabase
        .from('grades')
        .select('*')
        .eq('class_id', params.classId)
        .eq('trimester', selectedTrimester)

    if (gradesError) throw new Error(gradesError.message)

    // Group evaluations
    const evaluationsSet = new Set<string>()
    grades?.forEach(g => evaluationsSet.add(JSON.stringify({
        title: g.evaluation_title,
        max_value: g.max_value,
        date: g.evaluation_date
    })))

    // Parse the unique stringified objects back to an array
    const evaluations = Array.from(evaluationsSet).map((e: string) => JSON.parse(e))

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <BackButton />
            {/* Header */}
            <div className="flex items-center justify-between pb-6 border-b border-gray-100">
                <div className="flex items-center gap-4">
                    <Link
                        href={`/classes/${params.classId}/students`}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-500" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Carnet de Notes - {currentClass.name}
                        </h1>
                        <p className="text-gray-500 capitalize">
                            Gérez les notes et évaluations de la classe
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Trimester Selector */}
                    <div className="bg-white border border-gray-200 rounded-xl p-1 flex">
                        {[1, 2, 3].map((t) => (
                            <Link
                                key={t}
                                href={`/classes/${params.classId}/grades?t=${t}`}
                                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedTrimester === t
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Trimestre {t}
                            </Link>
                        ))}
                    </div>

                    <AddEvaluationModal classId={params.classId} trimester={selectedTrimester} />
                </div>
            </div>

            <GradesTable
                students={students || []}
                grades={grades || []}
                evaluations={evaluations}
            />
        </div>
    )
}
