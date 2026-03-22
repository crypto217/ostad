'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateClass } from '@/app/actions'
import type { ClassItem } from '@/app/classes/page'
import { X } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

const COLORS = [
    { name: 'Bleu', hex: '#DBEAFE' },
    { name: 'Vert', hex: '#D1FAE5' },
    { name: 'Violet', hex: '#EDE9FE' },
    { name: 'Jaune', hex: '#FEF3C7' },
    { name: 'Rose', hex: '#FCE7F3' },
    { name: 'Orange', hex: '#FFEDD5' },
    { name: 'Menthe', hex: '#F0FDF4' },
    { name: 'Ciel', hex: '#EFF6FF' },
]

interface EditClassModalProps {
    classItem: ClassItem
}

export default function EditClassModal({ classItem }: EditClassModalProps) {
    const router = useRouter()
    const { t, language } = useLanguage()
    const [name, setName] = useState(classItem.class_name)
    const [cycle, setCycle] = useState(classItem.cycle?.toLowerCase() || 'cem')
    const [color, setColor] = useState(classItem.color_code || COLORS[0].hex)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const rtl = language === 'ar'

    const handleClose = () => router.push('/classes')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return

        setIsSubmitting(true)
        try {
            await updateClass(classItem.id, { class_name: name.trim(), cycle, color_code: color })
            handleClose()
        } catch (error) {
            alert(t('classes_error_edit'))
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

            <div className={`bg-white rounded-2xl shadow-xl w-full max-w-md relative z-10 overflow-hidden flex flex-col max-h-[90vh] ${rtl ? 'text-right' : 'text-left'}`}>
                <div className={`px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 ${rtl ? 'flex-row-reverse' : ''}`}>
                    <h2 className="text-xl font-bold text-gray-900">{t('classes_edit_title')}</h2>
                    <button
                        onClick={handleClose}
                        className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <form id="editClassForm" onSubmit={handleSubmit} className="space-y-6">
                        <div className={`${rtl ? 'text-right' : 'text-left'}`}>
                            <label className="block text-sm font-bold text-gray-700 mb-2">{t('classes_form_name')} <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className={`w-full bg-white border border-gray-200 rounded-xl focus:border-green-400 focus:ring-4 focus:ring-green-50 outline-none p-3 transition-all text-gray-900 font-medium placeholder:font-normal placeholder:text-gray-400 ${rtl ? 'text-right' : 'text-left'}`}
                            />
                        </div>

                        <div className={`${rtl ? 'text-right' : 'text-left'}`}>
                            <label className="block text-sm font-bold text-gray-700 mb-2">{t('classes_form_cycle')}</label>
                            <div className="relative">
                                <select
                                    value={cycle}
                                    onChange={(e) => setCycle(e.target.value)}
                                    className={`w-full bg-white border border-gray-200 rounded-xl focus:border-green-400 focus:ring-4 focus:ring-green-50 outline-none p-3 transition-all text-gray-900 font-medium appearance-none ${rtl ? 'text-right pr-3 pl-10' : 'text-left pr-10 pl-3'}`}
                                >
                                    <option value="primaire">{t('classes_cycle_primary')}</option>
                                    <option value="cem">{t('classes_cycle_cem')}</option>
                                    <option value="lycee">{t('classes_cycle_lycee')}</option>
                                </select>
                                <div className={`absolute ${rtl ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 pointer-events-none text-gray-400`}>
                                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className={`${rtl ? 'text-right' : 'text-left'}`}>
                            <label className="block text-sm font-bold text-gray-700 mb-3">{t('classes_form_color')}</label>
                            <div className="grid grid-cols-4 gap-3">
                                {COLORS.map((c) => (
                                    <button
                                        key={c.hex}
                                        type="button"
                                        onClick={() => setColor(c.hex)}
                                        className={`w-full aspect-square rounded-2xl transition-all border-2 ${color === c.hex
                                            ? 'border-gray-900 scale-105 shadow-sm'
                                            : 'border-transparent hover:scale-105 hover:shadow-sm'
                                            }`}
                                        style={{ backgroundColor: c.hex }}
                                        title={c.name}
                                    />
                                ))}
                            </div>
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
                        form="editClassForm"
                        disabled={isSubmitting || !name.trim()}
                        className="px-6 py-2.5 rounded-3xl font-bold text-white bg-green-500 hover:bg-green-600 transition-colors disabled:opacity-50 text-sm shadow-sm"
                    >
                        {isSubmitting ? t('classes_form_editing') : t('classes_form_edit')}
                    </button>
                </div>
            </div>
        </div>
    )
}
