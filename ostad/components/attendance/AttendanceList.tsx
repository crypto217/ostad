'use client'

import { useState, useTransition } from 'react'
import { upsertAttendance } from '@/app/actions'
import { Check, Clock, X, MessageSquarePlus } from 'lucide-react'

type Student = {
    id: string
    first_name: string
    last_name: string
    gender: string
}

type Attendance = {
    id: string
    student_id: string
    status: 'present' | 'late' | 'absent'
    participation_note: string | null
}

export default function AttendanceList({
    sessionId,
    students,
    initialAttendances
}: {
    sessionId: string
    students: Student[]
    initialAttendances: Attendance[]
}) {
    const [attendances, setAttendances] = useState<Attendance[]>(initialAttendances)
    const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    // Sort students alphabetically by last_name
    const sortedStudents = [...students].sort((a, b) => a.last_name.localeCompare(b.last_name))

    const handleStatusUpdate = async (studentId: string, status: 'present' | 'late' | 'absent') => {
        // Optimistic update
        const existingInput = attendances.find(a => a.student_id === studentId)
        const note = existingInput?.participation_note || ''

        setAttendances(prev => {
            const filtered = prev.filter(a => a.student_id !== studentId)
            return [...filtered, { id: existingInput?.id || `temp-${studentId}`, student_id: studentId, status, participation_note: note }]
        })

        // Server action
        startTransition(async () => {
            try {
                await upsertAttendance({ session_id: sessionId, student_id: studentId, status, participation_note: note })
            } catch (error) {
                console.error("Failed to update status", error)
                // In a real scenario, we might want to revert the optimistic update or show a toast
            }
        })
    }

    const handleNoteUpdate = async (studentId: string, note: string) => {
        const existingInput = attendances.find(a => a.student_id === studentId)
        if (!existingInput || existingInput.status === 'absent') return // Note usually doesn't apply to absent

        setAttendances(prev => {
            const index = prev.findIndex(a => a.student_id === studentId)
            if (index === -1) return prev
            const newArray = [...prev]
            newArray[index] = { ...newArray[index], participation_note: note }
            return newArray
        })

        startTransition(async () => {
            try {
                await upsertAttendance({ session_id: sessionId, student_id: studentId, status: existingInput.status, participation_note: note })
            } catch (error) {
                console.error("Failed to update note", error)
            }
        })
    }

    const getAvatarColor = (index: number) => {
        const colors = ['bg-orange-100 text-orange-600', 'bg-blue-100 text-blue-600', 'bg-green-100 text-green-600', 'bg-purple-100 text-purple-600', 'bg-pink-100 text-pink-600']
        return colors[index % colors.length]
    }

    return (
        <div className="space-y-4">
            {sortedStudents.map((student, index) => {
                const attendance = attendances.find(a => a.student_id === student.id)
                const isPresent = attendance?.status === 'present'
                const isLate = attendance?.status === 'late'
                const isAbsent = attendance?.status === 'absent'
                const isSelected = selectedStudent === student.id

                return (
                    <div key={student.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div
                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => setSelectedStudent(isSelected ? null : student.id)}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${getAvatarColor(index)}`}>
                                    {student.last_name.charAt(0)}{student.first_name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 uppercase">{student.last_name} <span className="capitalize font-normal">{student.first_name}</span></p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <button
                                    onClick={() => handleStatusUpdate(student.id, 'present')}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isPresent ? 'bg-green-500 text-white shadow-md' : 'border border-gray-200 text-gray-400 hover:border-green-500 hover:text-green-500'
                                        }`}
                                >
                                    <Check className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate(student.id, 'late')}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isLate ? 'bg-yellow-500 text-white shadow-md' : 'border border-gray-200 text-gray-400 hover:border-yellow-500 hover:text-yellow-500'
                                        }`}
                                >
                                    <Clock className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate(student.id, 'absent')}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isAbsent ? 'bg-red-500 text-white shadow-md' : 'border border-gray-200 text-gray-400 hover:border-red-500 hover:text-red-500'
                                        }`}
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Note Input - Expanded View */}
                        {isSelected && attendance && attendance.status !== 'absent' && (
                            <div className="px-4 pb-4 pt-2 bg-gray-50 border-t border-gray-100 flex items-start gap-3">
                                <MessageSquarePlus className="w-5 h-5 text-gray-400 mt-2" />
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        placeholder="Note de participation (optionnelle)..."
                                        className="w-full text-sm bg-white border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                                        value={attendance.participation_note || ''}
                                        onChange={(e) => handleNoteUpdate(student.id, e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>
                            </div>
                        )}
                        {isSelected && !attendance && (
                            <div className="px-4 pb-4 pt-2 text-sm text-gray-500 text-center bg-gray-50 border-t border-gray-100">
                                Veuillez d'abord valider une présence (✅ ou ⏰) pour ajouter une note.
                            </div>
                        )}
                    </div>
                )
            })}

            {students.length === 0 && (
                <div className="p-8 text-center text-gray-500 bg-white rounded-2xl shadow-sm">
                    Aucun élève trouvé dans cette classe.
                </div>
            )}
        </div>
    )
}
