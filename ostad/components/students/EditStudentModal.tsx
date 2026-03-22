'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateStudent } from '@/app/actions'
import type { StudentItem } from '@/app/classes/[classId]/students/page'
import { X } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

export default function EditStudentModal({ student }: { student: StudentItem }) {
    const router = useRouter()
    const { t, language } = useLanguage()
    const rtl = language === 'ar'

    // Properly format date to YYYY-MM-DD for the input type="date"
    const initialDate = student.birth_date ? new Date(student.birth_date).toISOString().split('T')[0] : ''

    const [firstName, setFirstName] = useState(student.first_name)
    const [lastName, setLastName] = useState(student.last_name)
    // Map DB gender to FR for UI
    const initialGender = (student.gender as string) === 'male' || student.gender === 'Garçon' ? 'Garçon' : 'Fille'
    const [gender, setGender] = useState<'Garçon' | 'Fille'>(initialGender as 'Garçon' | 'Fille')
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
                birth_date: dob
            })
            handleClose()
        } catch (error) {
            alert(t('students_error_edit'))
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

            <div className={`bg-white rounded-2xl shadow-xl w-full max-w-md relative z-10 overflow-hidden flex flex-col max-h-[90vh] ${rtl ? 'rtl text-right' : ''}`}>
                <div className={`px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 ${rtl ? 'flex-row-reverse' : ''}`}>
                    <h2 className="text-xl font-bold text-gray-900">{t('students_edit_title')}</h2>
                    <button
                        onClick={handleClose}
                        className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <form id="editStudentForm" onSubmit={handleSubmit} className="space-y-6">
                        <div className={`grid grid-cols-2 gap-4 ${rtl ? 'grid-cols-reverse' : ''}`}>
                            <div className={rtl ? 'order-2' : ''}>
                                <label className="block text-sm font-bold text-gray-700 mb-2">{t('students_form_firstname')} <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                    className={`w-full bg-white border border-gray-200 rounded-xl focus:border-green-400 focus:ring-4 focus:ring-green-50 outline-none p-3 transition-all text-gray-900 font-medium ${rtl ? 'text-right' : ''}`}
                                />
                            </div>
                            <div className={rtl ? 'order-1' : ''}>
                                <label className="block text-sm font-bold text-gray-700 mb-2">{t('students_form_lastname')} <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required
                                    className={`w-full bg-white border border-gray-200 rounded-xl focus:border-green-400 focus:ring-4 focus:ring-green-50 outline-none p-3 transition-all text-gray-900 font-bold uppercase ${rtl ? 'text-right' : ''}`}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-3">{t('students_form_gender')} <span className="text-red-500">*</span></label>
                            <div className={`grid grid-cols-2 gap-4 ${rtl ? 'grid-cols-reverse' : ''}`}>
                                <label className={`flex items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all ${gender === 'Garçon' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'} ${rtl ? 'order-2' : ''}`}>
                                    <input type="radio" name="gender" value="Garçon" checked={gender === 'Garçon'} onChange={(e) => setGender(e.target.value as 'Garçon' | 'Fille')} className="hidden" />
                                    <span className="font-bold text-gray-900">👦 {language === 'ar' ? 'ذكر' : language === 'en' ? 'Boy/Male' : 'Garçon'}</span>
                                </label>
                                <label className={`flex items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all ${gender === 'Fille' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'} ${rtl ? 'order-1' : ''}`}>
                                    <input type="radio" name="gender" value="Fille" checked={gender === 'Fille'} onChange={(e) => setGender(e.target.value as 'Garçon' | 'Fille')} className="hidden" />
                                    <span className="font-bold text-gray-900">👧 {language === 'ar' ? 'أنثى' : language === 'en' ? 'Girl/Female' : 'Fille'}</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">{t('students_form_dob')} <span className="text-red-500">*</span></label>
                            <input
                                type="date"
                                value={dob}
                                onChange={(e) => setDob(e.target.value)}
                                required
                                max={new Date().toISOString().split('T')[0]} // max today
                                className={`w-full bg-white border border-gray-200 rounded-xl focus:border-green-400 focus:ring-4 focus:ring-green-50 outline-none p-3 transition-all text-gray-900 font-medium ${rtl ? 'text-right' : ''}`}
                            />
                        </div>
                    </form>
                </div>

                <div className={`px-6 py-5 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3 sticky bottom-0 ${rtl ? 'flex-row-reverse' : ''}`}>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="px-5 py-2.5 rounded-3xl font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors text-sm"
                    >
                        {t('common_cancel')}
                    </button>
                    <button
                        type="submit"
                        form="editStudentForm"
                        disabled={isSubmitting || !firstName.trim() || !lastName.trim() || !dob}
                        className="px-6 py-2.5 rounded-3xl font-bold text-white bg-green-500 hover:bg-green-600 transition-colors disabled:opacity-50 shadow-sm text-sm"
                    >
                        {isSubmitting ? t('classes_form_editing') : t('classes_form_edit')}
                    </button>
                </div>
            </div>
        </div>
    )
}
