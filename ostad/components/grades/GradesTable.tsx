'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { Trash2, AlertCircle, Loader2, Save } from 'lucide-react'
import { updateGrade, deleteEvaluation } from '@/app/actions'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface Student {
    id: string
    first_name: string
    last_name: string
}

interface Evaluation {
    id: string
    title: string
    max_value: number
    date: string
    trimester: number
}

interface Grade {
    student_id: string
    evaluation_id: string
    value: number
}

interface GradesTableProps {
    students: Student[]
    evaluations: Evaluation[]
    initialGrades: Grade[]
    trimester: number
    classId: string
}

export default function GradesTable({ students, evaluations, initialGrades, trimester, classId }: GradesTableProps) {
    const { t, language } = useLanguage()
    const rtl = language === 'ar'
    const router = useRouter()
    const [grades, setGrades] = useState<Grade[]>(initialGrades)
    const [editing, setEditing] = useState<{ studentId: string, evalId: string } | null>(null)
    const [isDeleting, setIsDeleting] = useState<string | null>(null)
    const [updating, setUpdating] = useState<{ studentId: string, evalId: string } | null>(null)

    // Memoize the sorted evaluations to ensure fixed order
    const sortedEvaluations = useMemo(() => {
        return [...evaluations].sort((a, b) => {
            // "Comportement" always before Average (which is handled separately)
            if (a.title === 'Comportement') return -1;
            if (b.title === 'Comportement') return 1;
            return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
    }, [evaluations]);

    const getGrade = (studentId: string, evalId: string) => {
        return grades.find(g => g.student_id === studentId && g.evaluation_id === evalId)?.value
    }

    const calculateAverage = (studentId: string) => {
        const studentGrades = sortedEvaluations
            .map(e => {
                const grade = getGrade(studentId, e.id)
                if (grade === undefined) return null
                return (grade / e.max_value) * 10
            })
            .filter((g): g is number => g !== null)

        if (studentGrades.length === 0) return '-'
        const avg = studentGrades.reduce((a, b) => a + b, 0) / studentGrades.length
        return avg.toFixed(2)
    }

    const handleGradeUpdate = async (studentId: string, evalId: string, value: string) => {
        const numValue = parseFloat(value)
        const evaluation = evaluations.find(e => e.id === evalId)

        if (isNaN(numValue) || numValue < 0 || (evaluation && numValue > evaluation.max_value)) {
            setEditing(null)
            return
        }

        setUpdating({ studentId, evalId })
        try {
            const result = await updateGrade(studentId, evalId, numValue)
            const newGrades = [...grades]
            const index = newGrades.findIndex(g => g.student_id === studentId && g.evaluation_id === evalId)
            if (index > -1) {
                newGrades[index] = { ...newGrades[index], value: numValue }
            } else {
                newGrades.push({ student_id: studentId, evaluation_id: evalId, value: numValue })
            }
            setGrades(newGrades)
        } catch (error) {
            console.error(error)
        } finally {
            setUpdating(null)
            setEditing(null)
        }
    }

    const handleDeleteEval = async (evaluation: Evaluation) => {
        if (!confirm(t('grades_delete_confirm').replace('{title}', evaluation.title === 'Comportement' ? t('grades_eval_comportement') : evaluation.title))) return

        setIsDeleting(evaluation.id)
        try {
            await deleteEvaluation(classId, evaluation.title, evaluation.trimester)
            router.refresh()
        } catch (error) {
            alert(t('grades_delete_error'))
            console.error(error)
        } finally {
            setIsDeleting(null)
        }
    }

    const getGradeColor = (value: number | undefined, maxValue: number) => {
        if (value === undefined) return 'text-gray-400'
        const percentage = (value / maxValue) * 100
        if (percentage >= 70) return 'text-green-600 font-bold'
        if (percentage >= 50) return 'text-blue-600 font-medium'
        if (percentage >= 35) return 'text-amber-600 font-medium'
        return 'text-red-600 font-bold'
    }

    if (students.length === 0) {
        return (
            <div className={`p-12 text-center ${rtl ? 'text-right' : ''}`}>
                <div className="bg-gray-50 rounded-3xl p-8 max-w-md mx-auto">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('att_not_found')}</h3>
                </div>
            </div>
        )
    }

    if (sortedEvaluations.length === 0) {
        return (
            <div className={`p-12 text-center ${rtl ? 'text-right' : ''}`}>
                <div className="bg-gray-50 rounded-3xl p-8 max-w-md mx-auto border-2 border-dashed border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('grades_no_eval')}</h3>
                    <p className="text-gray-500">{t('grades_no_eval_desc')}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="relative">
            <div className="overflow-x-auto">
                <table className={`w-full text-sm border-collapse ${rtl ? 'text-right' : 'text-left'}`}>
                    <thead>
                        <tr>
                            <th className={`sticky left-0 ${rtl ? 'right-0 left-auto' : ''} z-20 bg-gray-50/80 backdrop-blur-sm px-6 py-4 font-bold text-gray-700 min-w-[200px] border-b border-gray-100 shadow-[2px_0_5px_rgba(0,0,0,0.02)]`}>
                                {t('grades_student')}
                            </th>
                            {sortedEvaluations.map((evaluation) => (
                                <th key={evaluation.id} className="px-6 py-4 font-semibold text-gray-600 border-b border-gray-100 text-center min-w-[120px] group relative bg-white">
                                    <div className="flex flex-col items-center">
                                        <span className="truncate max-w-[100px]" title={evaluation.title}>
                                            {evaluation.title === 'Comportement' ? t('grades_eval_comportement') : evaluation.title}
                                        </span>
                                        <span className="text-[10px] text-gray-400 font-normal">
                                            /{evaluation.max_value} • {new Date(evaluation.date).toLocaleDateString(language === 'ar' ? 'ar-DZ' : 'fr-FR', { day: 'numeric', month: 'short' })}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteEval(evaluation)}
                                        disabled={isDeleting === evaluation.id}
                                        className="absolute top-1/2 -translate-y-1/2 right-1 opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:text-red-600 transition-all rounded-lg hover:bg-red-50"
                                    >
                                        {isDeleting === evaluation.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                    </button>
                                </th>
                            ))}
                            <th className={`sticky right-0 ${rtl ? 'left-0 right-auto' : ''} z-20 bg-blue-50/80 backdrop-blur-sm px-6 py-4 font-bold text-blue-800 text-center min-w-[100px] border-b border-blue-100 shadow-[-2px_0_5px_rgba(0,0,0,0.02)]`}>
                                {t('grades_average')} /10
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {students.map((student) => {
                            const avg = calculateAverage(student.id)
                            return (
                                <tr key={student.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className={`sticky left-0 ${rtl ? 'right-0 left-auto' : ''} z-20 bg-white/80 group-hover:bg-gray-50/80 backdrop-blur-sm px-6 py-4 font-semibold text-gray-900 border-r border-gray-50 shadow-[2px_0_5px_rgba(0,0,0,0.02)]`}>
                                        <div className={`flex items-center gap-2 ${rtl ? 'flex-row-reverse' : ''}`}>
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs">
                                                {student.first_name[0]}{student.last_name[0]}
                                            </div>
                                            <span className="truncate">{student.last_name} {student.first_name}</span>
                                        </div>
                                    </td>
                                    {sortedEvaluations.map((evaluation) => {
                                        const grade = getGrade(student.id, evaluation.id)
                                        const isEditing = editing?.studentId === student.id && editing?.evalId === evaluation.id
                                        const isUpdating = updating?.studentId === student.id && updating?.evalId === evaluation.id

                                        return (
                                            <td key={evaluation.id} className="px-3 py-4 text-center">
                                                <div className="flex justify-center">
                                                    {isEditing ? (
                                                        <div className="relative">
                                                            <input
                                                                type="number"
                                                                step="0.25"
                                                                min="0"
                                                                max={evaluation.max_value}
                                                                defaultValue={grade}
                                                                autoFocus
                                                                className={`w-16 h-10 text-center p-1 bg-white border-2 border-blue-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 font-bold transition-all ${rtl ? 'text-right' : ''}`}
                                                                onBlur={(e) => handleGradeUpdate(student.id, evaluation.id, e.target.value)}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') handleGradeUpdate(student.id, evaluation.id, e.currentTarget.value)
                                                                    if (e.key === 'Escape') setEditing(null)
                                                                }}
                                                            />
                                                            {isUpdating && (
                                                                <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-xl">
                                                                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setEditing({ studentId: student.id, evalId: evaluation.id })}
                                                            className={`min-w-[60px] h-10 px-2 rounded-xl transition-all flex items-center justify-center font-bold text-base hover:bg-white hover:shadow-sm hover:scale-110 active:scale-95 ${getGradeColor(grade, evaluation.max_value)}`}
                                                        >
                                                            {grade !== undefined ? grade : '-'}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        )
                                    })}
                                    <td className={`sticky right-0 ${rtl ? 'left-0 right-auto' : ''} z-20 bg-blue-50/50 group-hover:bg-blue-100/50 backdrop-blur-sm px-6 py-4 text-center border-l border-blue-100 shadow-[-2px_0_5px_rgba(0,0,0,0.02)]`}>
                                        <span className={`text-base font-black ${avg === '-' ? 'text-gray-300' :
                                            parseFloat(avg) >= 7 ? 'text-green-700' :
                                                parseFloat(avg) >= 5 ? 'text-blue-700' :
                                                    'text-red-700'
                                            }`}>
                                            {avg}
                                        </span>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
