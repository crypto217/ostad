'use client'

import { useState, useEffect } from 'react'
import { Play } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface NextCourse {
    id: string
    lesson_title: string
    start_time: string // ISO string
    end_time: string // ISO string
    class_name: string
    color_code: 'blue' | 'green' | 'purple' | 'yellow'
}

interface HeroCardProps {
    nextCourse: NextCourse | null
}

const colorMap = {
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    purple: 'bg-purple-100 text-purple-700',
    yellow: 'bg-yellow-100 text-yellow-800',
}

export default function HeroCard({ nextCourse }: HeroCardProps) {
    const { t, language } = useLanguage()
    const [timeRemaining, setTimeRemaining] = useState<string>('')

    useEffect(() => {
        if (!nextCourse) return

        const calculateTime = () => {
            const now = new Date()
            const startTime = new Date(nextCourse.start_time)
            const endTime = new Date(nextCourse.end_time)

            if (now >= startTime && now <= endTime) {
                setTimeRemaining(t('dash_in_progress'))
                return
            }

            if (now > endTime) {
                setTimeRemaining(t('common_success'))
                return
            }

            const diff = startTime.getTime() - now.getTime()
            const hours = Math.floor(diff / (1000 * 60 * 60))
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((diff % (1000 * 60)) / 1000)

            const prefix = t('dash_countdown')
            if (hours > 0) {
                setTimeRemaining(`${prefix} ${hours}h ${minutes}min`)
            } else {
                setTimeRemaining(`${prefix} ${minutes}m ${seconds}s`)
            }
        }

        calculateTime()
        const interval = setInterval(calculateTime, 1000)
        return () => clearInterval(interval)
    }, [nextCourse, t])

    if (!nextCourse) {
        return (
            <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100 mb-8 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 text-blue-500">
                    <span className="text-3xl">😊</span>
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-3">{t('dash_no_course')}</h2>
                <p className="text-gray-500 font-medium text-base leading-relaxed">{t('dash_enjoy')}</p>
            </div>
        )
    }

    const formatTime = (isoString: string) => {
        const locale = language === 'ar' ? 'ar-DZ' : (language === 'fr' ? 'fr-FR' : 'en-US')
        return new Date(isoString).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
    }

    const tagColorClass = colorMap[nextCourse.color_code] || colorMap.blue

    return (
        <div className="bg-white rounded-3xl shadow-md p-8 border border-gray-100 mb-8 relative overflow-hidden">
            <div className={`flex justify-between items-center mb-6 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                        {t('dash_next_class_label') || "PROCHAIN COURS"}
                    </span>
                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold w-fit ${tagColorClass}`}>
                        {nextCourse.class_name}
                    </span>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className="text-4xl font-black text-gray-900">
                        {timeRemaining.match(/\d+/g)?.slice(0, 2).join(':') || timeRemaining}
                    </span>
                    <span className="text-sm font-semibold text-gray-500 tracking-wide">
                        {timeRemaining}
                    </span>
                </div>
            </div>

            <h2 className={`text-3xl font-black text-gray-900 mb-2 ${language === 'ar' ? 'text-right' : ''}`}>{nextCourse.lesson_title}</h2>
            <p className={`text-gray-500 font-medium mb-8 text-base flex items-center gap-2 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                <span>{formatTime(nextCourse.start_time)}</span>
                <span className="text-gray-300">→</span>
                <span>{formatTime(nextCourse.end_time)}</span>
            </p>

            <button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold h-14 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-sm text-lg px-8">
                <Play fill="currentColor" size={20} className={language === 'ar' ? 'rotate-180' : ''} />
                {t('dash_start_class')}
            </button>
        </div>
    )
}
