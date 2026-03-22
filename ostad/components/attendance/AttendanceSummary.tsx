'use client'

import { Users, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface AttendanceSummaryProps {
    totalStudents: number
    attendances: any[]
}

export default function AttendanceSummary({ totalStudents, attendances }: AttendanceSummaryProps) {
    const { t, language } = useLanguage()
    const rtl = language === 'ar'

    const presentCount = attendances.filter(a => a.status === 'present').length
    const lateCount = attendances.filter(a => a.status === 'late').length
    const absentCount = attendances.filter(a => a.status === 'absent').length
    const treatedCount = attendances.length

    const presenceRate = totalStudents > 0
        ? Math.round(((presentCount + lateCount) / totalStudents) * 100)
        : 0

    return (
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${rtl ? 'rtl' : ''}`}>
            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                <div className={`flex items-center gap-3 mb-1 ${rtl ? 'flex-row-reverse text-right' : ''}`}>
                    <div className="p-2 bg-blue-50 rounded-xl">
                        <Users className="w-4 h-4 text-blue-500" />
                    </div>
                    <p className="text-sm font-medium text-gray-500">{t('att_summary')}</p>
                </div>
                <p className={`text-2xl font-bold text-gray-900 ${rtl ? 'text-right' : ''}`}>
                    {treatedCount}/{totalStudents} <span className="text-xs font-normal text-gray-400">{t('att_treated')}</span>
                </p>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                <div className={`flex items-center gap-3 mb-1 ${rtl ? 'flex-row-reverse text-right' : ''}`}>
                    <div className="p-2 bg-green-50 rounded-xl">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                    </div>
                    <p className="text-sm font-medium text-gray-500">{t('att_present')}</p>
                </div>
                <p className={`text-2xl font-bold text-gray-900 ${rtl ? 'text-right' : ''}`}>{presentCount}</p>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                <div className={`flex items-center gap-3 mb-1 ${rtl ? 'flex-row-reverse text-right' : ''}`}>
                    <div className="p-2 bg-amber-50 rounded-xl">
                        <Clock className="w-4 h-4 text-amber-500" />
                    </div>
                    <p className="text-sm font-medium text-gray-500">{t('att_late')}</p>
                </div>
                <p className={`text-2xl font-bold text-gray-900 ${rtl ? 'text-right' : ''}`}>{lateCount}</p>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                <div className={`flex items-center gap-3 mb-1 ${rtl ? 'flex-row-reverse text-right' : ''}`}>
                    <div className="p-2 bg-red-50 rounded-xl">
                        <CheckCircle2 className="w-4 h-4 text-red-500" />
                    </div>
                    <p className="text-sm font-medium text-gray-500">{t('att_rate')}</p>
                </div>
                <p className={`text-2xl font-bold text-gray-900 ${rtl ? 'text-right' : ''}`}>{presenceRate}%</p>
            </div>
        </div>
    )
}
