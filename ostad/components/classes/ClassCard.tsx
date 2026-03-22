'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MoreVertical, Edit2, Trash2, Users, ClipboardList } from 'lucide-react'
import { deleteClass } from '@/app/actions'
import type { ClassItem } from '@/app/classes/page'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface ClassCardProps {
    classItem: ClassItem
}

export default function ClassCard({ classItem }: ClassCardProps) {
    const router = useRouter()
    const { t, language } = useLanguage()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const rtl = language === 'ar'

    const count = classItem.students?.[0]?.count || 0

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsMenuOpen(false)

        if (window.confirm(t('classes_confirm_delete'))) {
            setIsDeleting(true)
            try {
                await deleteClass(classItem.id)
            } catch (err) {
                alert(t('classes_error_delete'))
                setIsDeleting(false)
            }
        }
    }

    if (isDeleting) return null

    return (
        <div
            onClick={() => router.push(`/classes/${classItem.id}/students`)}
            className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md hover:border-gray-200 transition-all relative flex flex-col h-[200px] ${rtl ? 'text-right' : 'text-left'}`}
        >
            {/* Color band */}
            <div className="h-3 w-full shrink-0" style={{ backgroundColor: classItem.color_code }} />

            <div className="p-5 flex flex-col flex-1">
                <div className={`flex justify-between items-start mb-4 ${rtl ? 'flex-row-reverse' : ''}`}>
                    <span className="bg-gray-50 text-gray-600 text-[10px] font-bold px-3 py-1.5 rounded-full border border-gray-100 uppercase tracking-widest">
                        {classItem.cycle}
                    </span>

                    <div className="relative">
                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsMenuOpen(!isMenuOpen) }}
                            className="text-gray-400 hover:text-gray-900 transition-colors p-1 rounded-full hover:bg-gray-50"
                        >
                            <MoreVertical size={20} />
                        </button>

                        {isMenuOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsMenuOpen(false) }}
                                />
                                <div
                                    className={`absolute ${rtl ? 'left-0' : 'right-0'} top-8 w-48 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 z-20 overflow-hidden`}
                                    onClick={e => { e.preventDefault(); e.stopPropagation() }}
                                >
                                    <Link
                                        href={`/classes?edit=${classItem.id}`}
                                        onClick={() => setIsMenuOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 w-full transition-colors ${rtl ? 'flex-row-reverse text-right' : 'text-left'}`}
                                    >
                                        <Edit2 size={16} className="text-gray-400" /> {t('classes_edit')}
                                    </Link>
                                    <Link
                                        href={`/sessions?class=${classItem.id}`}
                                        onClick={() => setIsMenuOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 w-full transition-colors ${rtl ? 'flex-row-reverse text-right' : 'text-left'}`}
                                    >
                                        <ClipboardList size={16} className="text-green-500" /> {rtl ? 'كشف الغياب 📋' : '📋 Appel'}
                                    </Link>
                                    <button
                                        onClick={handleDelete}
                                        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 w-full transition-colors ${rtl ? 'flex-row-reverse text-right' : 'text-left'}`}
                                    >
                                        <Trash2 size={16} className="text-red-400" /> {t('classes_delete')}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <h3 className="font-bold text-xl text-gray-900 line-clamp-1 mb-auto" title={classItem.class_name}>
                    {classItem.class_name}
                </h3>

                <div className={`mt-3 flex items-center justify-between ${rtl ? 'flex-row-reverse text-right' : ''}`}>
                    <div className={`flex items-center gap-2 text-gray-500 font-medium text-sm ${rtl ? 'flex-row-reverse' : ''}`}>
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 shrink-0">
                            <Users size={16} className="text-gray-400" />
                        </div>
                        <span>{count} {count > 1 ? t('common_students') : t('common_student')}</span>
                    </div>

                    {/* Notes button — visible directly on card */}
                    <Link
                        href={`/classes/${classItem.id}/grades`}
                        onClick={e => e.stopPropagation()}
                        className="bg-blue-50 text-blue-600 rounded-xl text-xs font-bold px-3 py-1 hover:bg-blue-100 transition-colors shrink-0"
                    >
                        📊 {t('classes_notes')}
                    </Link>
                </div>
            </div>
        </div>
    )
}
