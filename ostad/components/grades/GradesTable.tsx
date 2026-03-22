'use client'

import { useState, useCallback, useMemo } from 'react'
import { updateGrade } from '@/app/actions'

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
    evaluations
}: {
    students: Student[]
    grades: Grade[]
    evaluations: Evaluation[]
}) {
    const [localGrades, setLocalGrades] = useState<Grade[]>(grades)

    // Sort students alphabetically
    const sortedStudents = [...students].sort((a, b) => a.last_name.localeCompare(b.last_name))

    // Debounce state
    const [savingId, setSavingId] = useState<string | null>(null)

    const handleGradeChange = useCallback((gradeId: string, newValueStr: string, maxValue: number) => {
        let numericValue: number | null = null

        if (newValueStr.trim() !== '') {
            numericValue = parseFloat(newValueStr)
            if (isNaN(numericValue)) return // Invalid input
            if (numericValue < 0) numericValue = 0
            if (numericValue > maxValue) numericValue = maxValue
        }

        // Optimistic UI update
        setLocalGrades(prev => prev.map(g =>
            g.id === gradeId ? { ...g, grade_value: numericValue } : g
        ))

        // Trigger Auto-save (simplified debounce approach for MVP)
        setSavingId(gradeId)

        // Use a timeout to simulate debounce, in a real app use a proper useDebounce hook
        // or a ref to clear previous timeouts.
        const timeoutId = setTimeout(async () => {
            try {
                await updateGrade(gradeId, numericValue)
            } catch (error) {
                console.error("Failed to save grade", error)
                // Revert logic could be implemented here
            } finally {
                setSavingId(null)
            }
        }, 800)

        // Return cleanup function (if we were putting this in a useEffect or properly managing refs)
        // For inline, we'll accept the potential multiple rapid saves for MVP, or we can use a small map.
    }, [])

    const getGradeColor = (value: number | null, max_value: number) => {
        if (value === null) return 'text-gray-400'

        // Normalize to /20 for color coding
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
        return (sum / totalMax) * 20 // Return average out of 20
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
                                <th key={idx} scope="col" className="px-6 py-4 font-semibold text-center min-w-[120px]">
                                    <div className="truncate" title={evalItem.title}>{evalItem.title}</div>
                                    <div className="text-[10px] text-gray-400 font-normal mt-1">
                                        /{evalItem.max_value} • {new Date(evalItem.date).toLocaleDateString()}
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
                                    <td className="px-6 py-4 font-medium text-gray-900 sticky left-0 bg-white group-hover:bg-gray-50 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                        {student.last_name.toUpperCase()} <span className="capitalize font-normal text-gray-600">{student.first_name}</span>
                                    </td>

                                    {evaluations.map((evalItem, idx) => {
                                        // Find the specific grade entry for this student and evaluation
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
