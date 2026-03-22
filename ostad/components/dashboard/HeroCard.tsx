'use client'

import { useState, useEffect } from 'react'
import { Users, Clock } from 'lucide-react'
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

export default function HeroCard({ nextCourse }: HeroCardProps) {
    const { language } = useLanguage() // t is not used for now as we hardcode French
    const [timeLeft, setTimeLeft] = useState<{ value: string; label: string }>({
        value: '00:00',
        label: 'minutes'
    })

    useEffect(() => {
        if (!nextCourse) return

        const calculateTime = () => {
            const now = new Date()
            const startTime = new Date(nextCourse.start_time)
            const endTime = new Date(nextCourse.end_time)

            if (now >= startTime && now <= endTime) {
                setTimeLeft({ value: 'LIVE', label: 'EN COURS' })
                return
            }

            if (now > endTime) {
                setTimeLeft({ value: 'DONE', label: 'Terminé' })
                return
            }

            const diff = startTime.getTime() - now.getTime()
            const hours = Math.floor(diff / (1000 * 60 * 60))
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((diff % (1000 * 60)) / 1000)

            if (hours > 0) {
                setTimeLeft({
                    value: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
                    label: hours === 1 ? 'heure' : 'heures'
                })
            } else {
                setTimeLeft({
                    value: `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
                    label: minutes === 1 ? 'minute' : 'minutes'
                })
            }
        }

        calculateTime()
        const interval = setInterval(calculateTime, 1000)
        return () => clearInterval(interval)
    }, [nextCourse])

    const formatTimeRange = (start: string, end: string) => {
        const locale = language === 'ar' ? 'ar-DZ' : (language === 'fr' ? 'fr-FR' : 'en-US')
        const formatOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' }
        const startTime = new Date(start).toLocaleTimeString(locale, formatOptions)
        const endTime = new Date(end).toLocaleTimeString(locale, formatOptions)
        return `${startTime} – ${endTime}`
    }

    if (!nextCourse) {
        return (
            <div className="bg-green-500 rounded-3xl p-8 min-h-[180px] shadow-lg flex flex-col items-center justify-center text-center relative overflow-hidden transition-all duration-500">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
                <div className="bg-green-400/30 text-white rounded-full px-4 py-1.5 text-sm font-bold inline-flex items-center gap-2 mb-4 relative z-10">
                    <span className="w-2 h-2 rounded-full bg-green-200 animate-pulse" />
                    {"Pas de cours aujourd'hui"}
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white mb-2 relative z-10">
                    {"Profitez de votre journée ! 🌟"}
                </h2>
                <div className="text-6xl mt-4 relative z-10">😊</div>
            </div>
        )
    }

    return (
        <div className={`w-full ${language === 'ar' ? 'rtl' : ''}`}>
            {/* Main Green Card */}
            <div className={`bg-[#22C55E] rounded-3xl p-8 shadow-xl min-h-[180px] relative overflow-hidden flex flex-col md:flex-row gap-8 items-center transition-all duration-500`}>
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24" />

                {/* Left Column: Course Info */}
                <div className={`flex-1 w-full z-10 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                    <div className="bg-green-400/30 text-white rounded-full px-4 py-1.5 text-sm font-bold inline-flex items-center gap-2 w-fit">
                        <span className="w-2 h-2 rounded-full bg-green-200 animate-pulse shadow-[0_0_8px_rgba(187,247,208,0.8)]" />
                        {"Prochain cours"}
                    </div>

                    <h2 className="text-3xl md:text-4xl font-black text-white mt-4 leading-tight">
                        {nextCourse.lesson_title}
                    </h2>

                    <div className={`flex flex-wrap items-center gap-6 mt-4 text-green-100 text-sm font-medium ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                        <div className="flex items-center gap-2">
                            <Users size={18} className="text-green-200" />
                            <span>{nextCourse.class_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock size={18} className="text-green-200" />
                            <span>{formatTimeRange(nextCourse.start_time, nextCourse.end_time)}</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Countdown Box */}
                <div className="shrink-0 z-10 w-full md:w-auto">
                    <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 text-center min-w-[170px] border border-white/20 shadow-inner">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-green-100 mb-2">
                            {"COMMENCE DANS"}
                        </p>
                        <div className="text-6xl font-black text-white tracking-tighter tabular-nums leading-none">
                            {timeLeft.value}
                        </div>
                        <p className="text-sm text-green-200 font-medium mt-2">
                            {timeLeft.label}
                        </p>
                    </div>
                </div>
            </div>

            {/* CTA Button Below Card */}
            <button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-5 rounded-2xl text-xl mt-4 shadow-lg hover:shadow-green-500/20 transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-3 border border-green-400/20">
                <span className="text-2xl animate-bounce">🚀</span>
                {"Démarrer le Mode Classe"}
            </button>
        </div>
    )
}
