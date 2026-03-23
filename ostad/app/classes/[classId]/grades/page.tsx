'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { notFound, useRouter } from 'next/navigation'
import { Loader2, Plus, ArrowLeft } from 'lucide-react'
import GradesTable from '@/components/grades/GradesTable'
import AddEvaluationModal from '@/components/grades/AddEvaluationModal'
import { seedDefaultGradesForExistingStudents } from '@/app/actions'
import BackButton from '@/components/layout/BackButton'
import { useLanguage } from '@/lib/i18n/LanguageContext'

export default function GradesPage({ params }: { params: { classId: string } }) {
    const { t, language } = useLanguage()
    const rtl = language === 'ar'
    const router = useRouter()
    const supabase = createClient()

    const [loading, setLoading] = useState(true)
    const [classData, setClassData] = useState<any>(null)
    const [students, setStudents] = useState<any[]>([])
    const [evaluations, setEvaluations] = useState<any[]>([])
    const [grades, setGrades] = useState<any[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [currentTrimester, setCurrentTrimester] = useState(1)

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }

            // Fetch class details
            const { data: classDetails, error: classError } = await supabase
                .from('classes')
                .select('*')
                .eq('id', params.classId)
                .eq('teacher_id', user.id)
                .single()

            if (classError || !classDetails) {
                setLoading(false)
                return
            }

            setClassData(classDetails)

            // Auto-seed default evaluations (Comportement) if missing
            await seedDefaultGradesForExistingStudents(params.classId)

            // Fetch students
            const { data: studentsData } = await supabase
                .from('students')
                .select('*')
                .eq('class_id', params.classId)
                .order('last_name')

            setStudents(studentsData || [])

            // Fetch evaluations for current trimester
            const { data: evalsData } = await supabase
                .from('evaluations')
                .select('*')
                .eq('class_id', params.classId)
                .eq('trimester', currentTrimester)
                .order('date')

            setEvaluations(evalsData || [])

            // Fetch all grades for these evaluations
            if (evalsData && evalsData.length > 0) {
                const evalIds = evalsData.map(e => e.id)
                const { data: gradesData } = await supabase
                    .from('grades')
                    .select('*')
                    .in('evaluation_id', evalIds)

                setGrades(gradesData || [])
            } else {
                setGrades([])
            }

            setLoading(false)
        }

        fetchData()
    }, [params.classId, currentTrimester, supabase, router])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        )
    }

    if (!classData) return notFound()

    return (
        <div className={`max-w-[1400px] mx-auto space-y-6 ${rtl ? 'text-right' : ''}`}>
            <BackButton />
            {/* Header */}
            <div className={`flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-gray-100 ${rtl ? 'md:flex-row-reverse' : ''}`}>
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-gray-900">
                        {t('grades_title')} - {classData.name}
                    </h1>
                    <p className="text-gray-500">
                        {t('grades_desc')} ({classData.level})
                    </p>
                </div>

                <div className={`flex flex-wrap items-center gap-3 ${rtl ? 'flex-row-reverse' : ''}`}>
                    {/* Trimester Selector */}
                    <div className={`flex bg-gray-100 p-1 rounded-2xl ${rtl ? 'flex-row-reverse' : ''}`}>
                        {[1, 2, 3].map((tri) => (
                            <button
                                key={tri}
                                onClick={() => setCurrentTrimester(tri)}
                                className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${currentTrimester === tri
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {t('grades_trimester')} {tri}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className={`bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-2xl font-medium transition-all shadow-sm flex items-center justify-center gap-2 ${rtl ? 'flex-row-reverse' : ''}`}
                    >
                        <Plus className="w-4 h-4" />
                        {t('grades_new_eval')}
                    </button>
                </div>
            </div>

            {/* Grades Table */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                <GradesTable
                    students={students}
                    evaluations={evaluations}
                    initialGrades={grades}
                    trimester={currentTrimester}
                    classId={params.classId}
                />
            </div>

            {/* Add Evaluation Modal */}
            <AddEvaluationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                classId={params.classId}
                trimester={currentTrimester}
                onSuccess={() => {
                    setIsModalOpen(false)
                    router.refresh()
                }}
            />
        </div>
    )
}
