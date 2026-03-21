'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateStudent } from '@/app/actions'
import type { StudentItem } from '@/app/classes/[classId]/students/page'
import { X } from 'lucide-react'

export default function EditStudentModal({ student }: { student: StudentItem }) {
    const router = useRouter()

    // Properly format date to YYYY-MM-DD for the input type="date"
    const initialDate = student.date_of_birth ? new Date(student.date_of_birth).toISOString().split('T')[0] : ''

    const [firstName, setFirstName] = useState(student.first_name)
    const [lastName, setLastName] = useState(student.last_name)
    const [gender, setGender] = useState<'Garçon' | 'Fille'>(student.gender)
    const [dob, setDob] = useState(initialDate)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleClose = () => router.push(`/classes/${student.class_id}/students`)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!firstName.trim() || !lastName.trim() || !dob) return

        setIsSubmitting(true)
        try {
            await updateStudent(student.id, student.class_id, {
                first_name: firstName.trim(),
                last_name: lastName.trim().toUpperCase(),
                gender,
                date_of_birth: dob
            })
            handleClose()
        } catch (error) {
            alert("Erreur lors de la modification de l'élève.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm transition-opacity"
                onClick={handleClose}
            />

            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0">
                    <h2 className="text-xl font-bold text-gray-900">Modifier l'élève</h2>
                    <button
                        onClick={handleClose}
                        className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <form id="editStudentForm" onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Prénom <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                    className="w-full bg-white border border-gray-200 rounded-xl focus:border-green-400 focus:ring-4 focus:ring-green-50 outline-none p-3 transition-all text-gray-900 font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Nom <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required
                                    className="w-full bg-white border border-gray-200 rounded-xl focus:border-green-400 focus:ring-4 focus:ring-green-50 outline-none p-3 transition-all text-gray-900 font-bold uppercase"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-3">Genre <span className="text-red-500">*</span></label>
                            <div className="grid grid-cols-2 gap-4">
                                <label className={`flex items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all ${gender === 'Garçon' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <input type="radio" name="gender" value="Garçon" checked={gender === 'Garçon'} onChange={(e) => setGender(e.target.value as 'Garçon' | 'Fille')} className="hidden" />
                                    <span className="font-bold text-gray-900">👦 Garçon</span>
                                </label>
                                <label className={`flex items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all ${gender === 'Fille' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <input type="radio" name="gender" value="Fille" checked={gender === 'Fille'} onChange={(e) => setGender(e.target.value as 'Garçon' | 'Fille')} className="hidden" />
                                    <span className="font-bold text-gray-900">👧 Fille</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Date de naissance <span className="text-red-500">*</span></label>
                            <input
                                type="date"
                                value={dob}
                                onChange={(e) => setDob(e.target.value)}
                                required
                                max={new Date().toISOString().split('T')[0]} // max today
                                className="w-full bg-white border border-gray-200 rounded-xl focus:border-green-400 focus:ring-4 focus:ring-green-50 outline-none p-3 transition-all text-gray-900 font-medium"
                            />
                        </div>
                    </form>
                </div>

                <div className="px-6 py-5 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3 sticky bottom-0">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="px-5 py-2.5 rounded-3xl font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors text-sm"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        form="editStudentForm"
                        disabled={isSubmitting || !firstName.trim() || !lastName.trim() || !dob}
                        className="px-6 py-2.5 rounded-3xl font-bold text-white bg-green-500 hover:bg-green-600 transition-colors disabled:opacity-50 shadow-sm text-sm"
                    >
                        {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                </div>
            </div>
        </div>
    )
}
