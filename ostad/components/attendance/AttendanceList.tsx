'use client'

import { useState } from 'react'
import { Check, Clock, X, Loader2, MessageSquare } from 'lucide-react'
import { updateAttendance } from '@/app/actions'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface Student {
    id: string
    first_name: string
    last_name: string
    gender: 'M' | 'F'
}

interface Attendance {
    student_id: string
    status: 'present' | 'late' | 'absent'
    participation_note?: string
}

interface AttendanceListProps {
    sessionId: string
    students: Student[]
    initialAttendances: Attendance[]
}

export default function AttendanceList({ sessionId, students, initialAttendances }: AttendanceListProps) {
    const { t, language } = useLanguage()
    const rtl = language === 'ar'
    const [attendances, setAttendances] = useState<Attendance[]>(initialAttendances)
    const [updatingId, setUpdatingId] = useState<string | null>(null)
    const [activeNoteId, setActiveNoteId] = useState<string | null>(null)

    const getStatus = (studentId: string) => {
        return attendances.find(a => a.student_id === studentId)?.status
    }

    const getNote = (studentId: string) => {
        return attendances.find(a => a.student_id === studentId)?.participation_note || ''
    }

    const handleStatusUpdate = async (studentId: string, status: 'present' | 'late' | 'absent') => {
        const currentStatus = getStatus(studentId)
        if (currentStatus === status) return

        setUpdatingId(studentId)

        // Optimistic update
        const newAttendances = [...attendances]
        const index = newAttendances.findIndex(a => a.student_id === studentId)
        if (index > -1) {
            newAttendances[index] = { ...newAttendances[index], status }
        } else {
            newAttendances.push({ student_id: studentId, status })
        }
        setAttendances(newAttendances)

        try {
            await updateAttendance(sessionId, studentId, status)
        } catch (error) {
            // Revert on error
            setAttendances(initialAttendances)
            console.error(error)
        } finally {
            setUpdatingId(null)
        }
    }

    const handleNoteUpdate = async (studentId: string, note: string) => {
        const currentAttendance = attendances.find(a => a.student_id === studentId)
        if (!currentAttendance) {
            alert(t('att_note_error'))
            return
        }

        // Update local state
        const newAttendances = [...attendances]
        const index = newAttendances.findIndex(a => a.student_id === studentId)
        newAttendances[index] = { ...newAttendances[index], participation_note: note }
        setAttendances(newAttendances)

        try {
            await updateAttendance(sessionId, studentId, currentAttendance.status, note)
        } catch (error) {
            console.error(error)
        }
    }

    if (students.length === 0) {
        return (
            <div className={`p-8 bg-white rounded-3xl border border-dashed border-gray-200 text-center ${rtl ? 'text-right' : ''}`}>
                <p className="text-gray-500">{t('att_not_found')}</p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className={`w-full text-left border-collapse ${rtl ? 'text-right' : ''}`}>
                    <thead>
                        <tr className="bg-gray-50/50">
                            <th className={`px-6 py-4 text-sm font-semibold text-gray-600 ${rtl ? 'text-right' : 'text-left'}`}>
                                {t('grades_student')}
                            </th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-center">
                                {t('att_summary')}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {students.map((student) => {
                            const status = getStatus(student.id)
                            const note = getNote(student.id)
                            const civility = student.gender === 'M' ? (language === 'ar' ? 'السيد' : 'M.') : (language === 'ar' ? 'السيدة' : 'Mme')

                            return (
                                <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className={`flex items-center gap-3 ${rtl ? 'flex-row-reverse' : ''}`}>
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 ${student.gender === 'M' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'
                                                }`}>
                                                {student.first_name[0]}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-gray-900 truncate">
                                                    {civility} {student.last_name} {student.first_name}
                                                </p>
                                                <div className={`flex items-center gap-2 mt-1 ${rtl ? 'flex-row-reverse' : ''}`}>
                                                    <button
                                                        onClick={() => setActiveNoteId(activeNoteId === student.id ? null : student.id)}
                                                        className={`text-xs flex items-center gap-1 transition-colors ${note ? 'text-blue-600 font-medium' : 'text-gray-400 hover:text-gray-600'
                                                            } ${rtl ? 'flex-row-reverse' : ''}`}
                                                    >
                                                        <MessageSquare className="w-3 h-3" />
                                                        {note ? t('plan_notes') : t('att_note_placeholder').split('(')[0]}
                                                    </button>
                                                </div>
                                                {activeNoteId === student.id && (
                                                    <input
                                                        type="text"
                                                        value={note}
                                                        onChange={(e) => handleNoteUpdate(student.id, e.target.value)}
                                                        placeholder={t('att_note_placeholder')}
                                                        className={`mt-2 w-full text-sm p-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-400 transition-all ${rtl ? 'text-right' : ''}`}
                                                        autoFocus
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`flex items-center justify-center gap-2 sm:gap-4 ${rtl ? 'flex-row-reverse' : ''}`}>
                                            <button
                                                onClick={() => handleStatusUpdate(student.id, 'present')}
                                                disabled={updatingId === student.id}
                                                className={`p-3 rounded-2xl transition-all ${status === 'present'
                                                        ? 'bg-green-100 text-green-600 ring-2 ring-green-500/20'
                                                        : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                                                    }`}
                                                title={t('att_present')}
                                            >
                                                <Check className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(student.id, 'late')}
                                                disabled={updatingId === student.id}
                                                className={`p-3 rounded-2xl transition-all ${status === 'late'
                                                        ? 'bg-amber-100 text-amber-600 ring-2 ring-amber-500/20'
                                                        : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                                                    }`}
                                                title={t('att_late')}
                                            >
                                                <Clock className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(student.id, 'absent')}
                                                disabled={updatingId === student.id}
                                                className={`p-3 rounded-2xl transition-all ${status === 'absent'
                                                        ? 'bg-red-100 text-red-600 ring-2 ring-red-500/20'
                                                        : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                                                    }`}
                                                title={t('att_absent')}
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                            {updatingId === student.id && (
                                                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                            )}
                                        </div>
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
