'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Users, ChevronRight } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface Student {
    id: string
    first_name: string
    last_name: string
    gender: 'Garçon' | 'Fille' | 'male' | 'female' | null
}

interface ClassWithStudents {
    id: string
    class_name: string
    color_code: string
    students: Student[]
}

export default function ElevesClient({ classes }: { classes: ClassWithStudents[] }) {
    const [searchQuery, setSearchQuery] = useState('')
    const { t, language } = useLanguage()
    const rtl = language === 'ar'

    const genderDisplay = (gender: string | null | undefined) => {
        if (!gender) return '—'
        const g = gender.trim().toLowerCase()
        if (g === 'male' || g === 'garçon') return '👦 ' + (language === 'ar' ? 'ذكر' : language === 'en' ? 'Male' : 'Garçon')
        if (g === 'female' || g === 'fille') return '👧 ' + (language === 'ar' ? 'أنثى' : language === 'en' ? 'Female' : 'Fille')
        return gender
    }

    const filteredClasses = classes.map(cls => ({
        ...cls,
        students: cls.students.filter(student => {
            const fullName = `${student.first_name} ${student.last_name}`.toLowerCase()
            return fullName.includes(searchQuery.toLowerCase())
        }).sort((a, b) => a.last_name.localeCompare(b.last_name))
    })).filter(cls => cls.students.length > 0)

    const totalStudents = classes.reduce((sum, cls) => sum + cls.students.length, 0)

    return (
        <div className="space-y-8">
            <div className={`flex flex-col md:flex-row md:items-center justify-between gap-6 ${rtl ? 'md:flex-row-reverse text-right' : ''}`}>
                <div>
                    <h1 className={`text-2xl md:text-3xl font-bold text-gray-900 flex flex-wrap items-center gap-3 ${rtl ? 'flex-row-reverse' : ''}`}>
                        {t('students_title')}
                        <span className="bg-green-50 text-green-600 text-[11px] font-bold px-3 py-1.5 rounded-full border border-green-100 uppercase tracking-widest shrink-0">
                            {totalStudents} {totalStudents > 1 ? t('students_count_plural') : t('students_count_singular')}
                        </span>
                    </h1>
                    <p className="text-gray-500 mt-2">{t('students_subtitle')}</p>
                </div>
            </div>

            <div className={`relative max-w-xl ${rtl ? 'mr-0 ml-auto' : ''}`}>
                <div className={`absolute inset-y-0 ${rtl ? 'right-0 pr-4' : 'left-0 pl-4'} flex items-center pointer-events-none text-gray-400`}>
                    <Search size={20} />
                </div>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('students_search_placeholder')}
                    className={`w-full ${rtl ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4'} py-3 bg-white border border-gray-200 rounded-2xl focus:border-green-400 focus:ring-4 focus:ring-green-50 outline-none transition-all shadow-sm`}
                />
            </div>

            {filteredClasses.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 shadow-sm mt-8">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <Users size={28} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{t('students_empty_title')}</h3>
                    <p className="text-gray-500">{t('students_empty_subtitle')}</p>
                </div>
            ) : (
                <div className="space-y-8 mt-8">
                    {filteredClasses.map((cls) => (
                        <div key={cls.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className={`px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between ${rtl ? 'flex-row-reverse' : ''}`}>
                                <div className={`flex items-center gap-3 ${rtl ? 'flex-row-reverse' : ''}`}>
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cls.color_code || '#22c55e' }}></div>
                                    <h2 className="text-lg font-bold text-gray-900">{cls.class_name}</h2>
                                    <span className="text-xs font-bold text-green-600 bg-green-50 border border-green-100 px-2.5 py-1 rounded-full">
                                        {cls.students.length} {cls.students.length > 1 ? t('students_count_plural') : t('students_count_singular')}
                                    </span>
                                </div>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {cls.students.map((student) => (
                                    <Link
                                        key={student.id}
                                        href={`/classes/${cls.id}/students`}
                                        className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group ${rtl ? 'flex-row-reverse' : ''}`}
                                    >
                                        <div className={`flex items-center gap-4 ${rtl ? 'flex-row-reverse text-right' : ''}`}>
                                            <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-sm">
                                                {student.first_name.charAt(0)}{student.last_name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                                                    {student.last_name} {student.first_name}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {genderDisplay(student.gender)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={`text-gray-300 group-hover:text-green-500 transition-colors flex items-center gap-2 text-sm font-medium ${rtl ? 'flex-row-reverse' : ''}`}>
                                            {t('students_view_class')}
                                            <ChevronRight size={18} className={rtl ? 'rotate-180' : ''} />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
