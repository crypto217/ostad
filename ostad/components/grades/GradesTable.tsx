'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { updateGrade, deleteEvaluation } from '@/app/actions'

type Student = {
    id: string
    first_name: string
    last_name: string
}

type Grade = {
    id: string
    student_id: string
    evaluation_title: string
    grade_value: number | null
    max_value: number
}

type Evaluation = {
    title: string
    max_value: number
    date: string
}

export default function GradesTable({
    students,
    grades,
    evaluations,
    classId,
    trimester,
}: {
    students: Student[]
    grades: Grade[]
    evaluations: Evaluation[]
    classId: string
    trimester: number
}) {
    const router = useRouter()
    const [localGrades, setLocalGrades] = useState<Grade[]>(grades)
    const [savingId, setSavingId] = useState<string | null>(null)
    const [deletingEval, setDeletingEval] = useState<string | null>(null)

    // Sort students alphabetically
    const sortedStudents = [...students].sort((a, b) => a.last_name.localeCompare(b.last_name))

    const handleGradeChange = useCallback((gradeId: string, newValueStr: string, maxValue: number) => {
        let numericValue: number | null = null

        if (newValueStr.trim() !== '') {
            numericValue = parseFloat(newValueStr)
            if (isNaN(numericValue)) return
            if (numericValue < 0) numericValue = 0
            if (numericValue > maxValue) numericValue = maxValue
        }

        // Optimistic update
        setLocalGrades(prev => prev.map(g =>
            g.id === gradeId ? { ...g, grade_value: numericValue } : g
        ))

        setSavingId(gradeId)
        setTimeout(async () => {
            try {
                await updateGrade(gradeId, numericValue)
            } catch (error) {
                console.error('Failed to save grade', error)
            } finally {
                setSavingId(null)
            }
        }, 800)
    }, [])

    const handleDeleteEvaluation = useCallback(async (evalTitle: string) => {
        const confirmed = window.confirm(
            `Supprimer l'évaluation "${evalTitle}" pour tous les élèves ?\n\nCette action est irréversible.`
        )
        if (!confirmed) return

        setDeletingEval(evalTitle)
        try {
            await deleteEvaluation(classId, evalTitle, trimester)
            router.refresh()
        } catch (error) {
            console.error('Failed to delete evaluation', error)
            alert("Erreur lors de la suppression de l'évaluation.")
        } finally {
            setDeletingEval(null)
        }
    }, [classId, trimester, router])

    const getGradeColor = (value: number | null, max_value: number) => {
        if (value === null) return 'text-gray-400'
        const normalized = (value / max_value) * 20
        if (normalized < 10) return 'text-red-600 font-semibold'
        if (normalized >= 10 && normalized < 15) return 'text-orange-500 font-semibold'
        return 'text-green-600 font-semibold'
    }

    const calculateAverage = (studentId: string) => {
        const studentGrades = localGrades.filter(g => g.student_id === studentId && g.grade_value !== null)
        if (studentGrades.length === 0) return null

        let sum = 0
        let totalMax = 0
        studentGrades.forEach(g => {
            sum += g.grade_value!
            totalMax += g.max_value
        })

        if (totalMax === 0) return null
        return (sum / totalMax) * 20
    }

    if (evaluations.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center border border-gray-100">
                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-serif">A+</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune évaluation</h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                    Créez votre première évaluation pour commencer à saisir les notes de vos élèves.
                </p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th scope="col" className="px-6 py-4 font-semibold sticky left-0 bg-gray-50 z-10">
                                Élève
                            </th>
                            {evaluations.map((evalItem, idx) => (
                                <th key={idx} scope="col" className="px-4 py-4 font-semibold text-center min-w-[130px]">
                                    <div className="flex items-center justify-center gap-1.5 group">
                                        <div className="flex flex-col items-center">
                                            <span className="truncate max-w-[90px]" title={evalItem.title}>
                                                {evalItem.title}
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-normal mt-0.5">
                                                /{evalItem.max_value} • {new Date(evalItem.date).toLocaleDateString('fr-FR')}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteEvaluation(evalItem.title)}
                                            disabled={deletingEval === evalItem.title}
                                            title={`Supprimer "${evalItem.title}"`}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-50 shrink-0"
                                        >
                                            {deletingEval === evalItem.title ? (
                                                <span className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin inline-block" />
                                            ) : (
                                                <Trash2 size={13} />
                                            )}
                                        </button>
                                    </div>
                                </th>
                            ))}
                            <th scope="col" className="px-6 py-4 font-semibold text-center border-l bg-gray-50">
                                Moyenne /20
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {sortedStudents.map((student) => {
                            const avgValue = calculateAverage(student.id)

                            return (
                                <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900 sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                        {student.last_name.toUpperCase()}{' '}
                                        <span className="capitalize font-normal text-gray-600">{student.first_name}</span>
                                    </td>

                                    {evaluations.map((evalItem, idx) => {
                                        const gradeEntry = localGrades.find(
                                            g => g.student_id === student.id && g.evaluation_title === evalItem.title
                                        )

                                        return (
                                            <td key={idx} className="px-4 py-2 text-center">
                                                {gradeEntry ? (
                                                    <div className="relative inline-block w-20">
                                                        <input
                                                            type="number"
                                                            step="0.25"
                                                            min="0"
                                                            max={evalItem.max_value}
                                                            value={gradeEntry.grade_value === null ? '' : gradeEntry.grade_value}
                                                            onChange={(e) => handleGradeChange(gradeEntry.id, e.target.value, gradeEntry.max_value)}
                                                            className={`w-full text-center px-2 py-1.5 border border-transparent hover:border-gray-200 focus:border-blue-500 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-transparent transition-all ${getGradeColor(gradeEntry.grade_value, gradeEntry.max_value)}`}
                                                            placeholder="—"
                                                        />
                                                        {savingId === gradeEntry.id && (
                                                            <span className="absolute right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" title="Sauvegarde en cours..." />
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-300">—</span>
                                                )}
                                            </td>
                                        )
                                    })}

                                    <td className={`px-6 py-4 text-center border-l font-bold bg-gray-50/30 ${getGradeColor(avgValue, 20)}`}>
                                        {avgValue !== null ? avgValue.toFixed(2) : '—'}
                                    </td>
                                </tr>
                            )
                        })}

                        {sortedStudents.length === 0 && (
                            <tr>
                                <td colSpan={evaluations.length + 2} className="px-6 py-8 text-center text-gray-500">
                                    Aucun élève dans cette classe.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
