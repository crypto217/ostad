'use client'

import { useState, useEffect } from 'react'
import { Users, Clock, Play } from 'lucide-react'

/**
 * Interface for the next course data structure.
 * Standardizes the shape of course information passed from the parent.
 */
export interface NextCourse {
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

/**
 * HeroCard Component - The primary dashboard highlight following the 'Kinetic Classroom' design system.
 * Features a high-impact green background, Inter-black (900) typography, and a glassmorphic countdown.
 */
export default function HeroCard({ nextCourse }: HeroCardProps) {
    const [timeLeft, setTimeLeft] = useState<{ value: string; label: string }>({
        value: '00:00',
        label: 'minutes'
    })

    // Countdown logic preserved from original implementation
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
        const locale = 'fr-FR'
        const formatOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' }
        const startTime = new Date(start).toLocaleTimeString(locale, formatOptions)
        const endTime = new Date(end).toLocaleTimeString(locale, formatOptions)
        return `${startTime} – ${endTime}`
    }

    if (!nextCourse) {
        return (
            <div className="bg-[#22C55E] rounded-[3rem] p-10 min-h-[260px] shadow-xl flex flex-col items-center justify-center text-center relative overflow-hidden transition-all duration-500 hover:scale-[1.01]">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-10 -mb-10 blur-3xl" />

                <div className="bg-white/20 text-white rounded-full px-6 py-2 text-xs font-semibold inline-flex items-center gap-2 mb-8 relative z-10 backdrop-blur-md uppercase tracking-widest">
                    <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                    {"Pas de cours aujourd'hui"}
                </div>

                <h2 className="text-2xl font-bold text-white mb-8 relative z-10 tracking-tighter leading-none max-w-2xl px-4">
                    {"Profitez de votre journée ! 🌟"}
                </h2>

                <div className="text-8xl animate-bounce relative z-10 drop-shadow-xl">
                    <span role="img" aria-label="smiling face">😊</span>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full group/hero">
            {/* Main Interactive Green Card */}
            <div className="bg-[#22C55E] rounded-[3rem] p-8 md:p-12 shadow-[0_20px_50px_-12px_rgba(34,197,94,0.35)] min-h-[280px] relative overflow-hidden flex flex-col md:flex-row gap-10 items-center transition-all duration-500 hover:scale-[1.01]">
                {/* Background Textures (Kinetic Overlays) */}
                <div className="absolute -top-16 -right-16 w-80 h-80 bg-white/10 rounded-full blur-[80px]" />
                <div className="absolute top-1/2 -left-40 w-96 h-96 bg-white/5 rounded-full blur-[100px]" />

                {/* Left Column: Essential Course Information */}
                <div className="flex-1 w-full z-10 text-left">
                    <div className="bg-white/20 text-white rounded-xl px-5 py-2.5 text-xs font-semibold inline-flex items-center gap-2 w-fit backdrop-blur-md uppercase tracking-[0.15em]">
                        <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse shadow-[0_0_12px_rgba(255,255,255,0.9)]" />
                        {"Prochain cours"}
                    </div>

                    <h2 className="text-2xl font-bold text-white mt-8 mb-6 leading-[1.05] tracking-tighter drop-shadow-sm">
                        {nextCourse.lesson_title}
                    </h2>

                    <div className="flex flex-wrap items-center gap-8 text-white font-normal text-sm">
                        <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-2xl backdrop-blur-sm border border-transparent hover:bg-white/15 transition-colors">
                            <Users size={22} className="text-white shrink-0" strokeWidth={3} />
                            <span className="opacity-95">{nextCourse.class_name}</span>
                        </div>
                        <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-2xl backdrop-blur-sm border border-transparent hover:bg-white/15 transition-colors">
                            <Clock size={22} className="text-white shrink-0" strokeWidth={3} />
                            <span className="opacity-95 tabular-nums">{formatTimeRange(nextCourse.start_time, nextCourse.end_time)}</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: High-Precision Countdown Box (Glassmorphic) */}
                <div className="shrink-0 z-10 w-full md:w-auto">
                    <div className="bg-white/20 backdrop-blur-2xl rounded-[2.5rem] p-10 text-center min-w-[240px] shadow-[inset_0_2px_20px_rgba(255,255,255,0.1),0_25px_50px_-12px_rgba(0,0,0,0.15)] transition-transform hover:scale-105 duration-300">
                        <p className="text-xs font-medium uppercase tracking-[0.3em] text-white/90 mb-4 opacity-75">
                            {"COMMENCE DANS"}
                        </p>
                        <div className="text-4xl font-bold text-white tracking-tighter tabular-nums leading-none drop-shadow-md">
                            {timeLeft.value}
                        </div>
                        <p className="text-xs text-white font-medium mt-4 uppercase tracking-[0.2em] opacity-90">
                            {timeLeft.label}
                        </p>
                    </div>
                </div>
            </div>

            {/* Kinetic Secondary CTA (Rocket Launch Mode) */}
            <button className="w-full bg-[#22C55E] hover:bg-[#1ea34d] text-white font-black py-6 rounded-[2.5rem] text-xl md:text-2xl mt-8 shadow-[0_20px_40px_-10px_rgba(34,197,94,0.45)] transition-all duration-300 active:scale-[0.96] flex items-center justify-center gap-5 group/btn border-none outline-none">
                <Play size={28} fill="currentColor" stroke="none" className="group-hover:scale-110 transition-transform" />
                <span className="tracking-tight">{"Démarrer le Mode Classe"}</span>
                <span className="text-3xl group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-500">🚀</span>
            </button>
        </div>
    )
}
