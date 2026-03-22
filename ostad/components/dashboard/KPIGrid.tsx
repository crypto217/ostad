'use client'

import { CheckSquare, Users, GraduationCap, Presentation } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface KPIProps {
    stats: {
        pendingTodos: number
        weeklyAttendance: number | string
        classesToday: number
        totalStudents: number
    }
}

export default function KPIGrid({ stats }: KPIProps) {
    const { t, language } = useLanguage()
    const rtl = language === 'ar'

    return (
        <div className="grid grid-cols-2 gap-4">
            {/* Devoirs à corriger */}
            <div className={`bg-white rounded-2xl shadow-sm p-5 border border-gray-100 flex flex-col justify-between aspect-[4/3] ${rtl ? 'text-right' : ''}`}>
                <div className={`w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 mb-2 ${rtl ? 'mr-auto ml-0' : ''}`}>
                    <CheckSquare size={20} />
                </div>
                <div>
                    <p className="text-3xl font-black text-gray-900 mb-0.5">{stats.pendingTodos}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest line-clamp-1">{t('dash_kpi_todos')}</p>
                </div>
            </div>

            {/* Taux de présence */}
            <div className={`bg-white rounded-2xl shadow-sm p-5 border border-gray-100 flex flex-col justify-between aspect-[4/3] ${rtl ? 'text-right' : ''}`}>
                <div className={`w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-500 mb-2 ${rtl ? 'mr-auto ml-0' : ''}`}>
                    <Users size={20} />
                </div>
                <div>
                    <p className="text-3xl font-black text-gray-900 mb-0.5">
                        {stats.weeklyAttendance}{typeof stats.weeklyAttendance === 'number' ? '%' : ''}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest line-clamp-1">{t('dash_kpi_attendance')}</p>
                </div>
            </div>

            {/* Total élèves */}
            <div className={`bg-white rounded-2xl shadow-sm p-5 border border-gray-100 flex flex-col justify-between aspect-[4/3] ${rtl ? 'text-right' : ''}`}>
                <div className={`w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-500 mb-2 ${rtl ? 'mr-auto ml-0' : ''}`}>
                    <GraduationCap size={20} />
                </div>
                <div>
                    <p className="text-3xl font-black text-gray-900 mb-0.5">{stats.totalStudents}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest line-clamp-1">{t('dash_kpi_students')}</p>
                </div>
            </div>

            {/* Classes aujourd'hui */}
            <div className={`bg-white rounded-2xl shadow-sm p-5 border border-gray-100 flex flex-col justify-between aspect-[4/3] ${rtl ? 'text-right' : ''}`}>
                <div className={`w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600 mb-2 ${rtl ? 'mr-auto ml-0' : ''}`}>
                    <Presentation size={20} />
                </div>
                <div>
                    <p className="text-3xl font-black text-gray-900 mb-0.5">{stats.classesToday}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest line-clamp-1">{t('dash_kpi_lessons')}</p>
                </div>
            </div>
        </div>
    )
}

