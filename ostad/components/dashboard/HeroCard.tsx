'use client'

import { useState, useEffect } from 'react'
import { Play } from 'lucide-react'

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
    const [timeRemaining, setTimeRemaining] = useState<string>('')

    useEffect(() => {
        if (!nextCourse) return

        const calculateTime = () => {
            const now = new Date()
            const startTime = new Date(nextCourse.start_time)
            const endTime = new Date(nextCourse.end_time)

            if (now >= startTime && now <= endTime) {
                setTimeRemaining('EN COURS')
                return
            }

            if (now > endTime) {
                setTimeRemaining('TERMINÉ')
                return
            }

            const diff = startTime.getTime() - now.getTime()
            const hours = Math.floor(diff / (1000 * 60 * 60))
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((diff % (1000 * 60)) / 1000)

            if (hours > 0) {
                setTimeRemaining(`Dans ${hours}h ${minutes}min`)
            } else {
                // Show seconds if less than an hour for dynamic feel
                setTimeRemaining(`Dans ${minutes}m ${seconds}s`)
            }
        }

        calculateTime()
        // Update every second to feel dynamic and alive
        const interval = setInterval(calculateTime, 1000)
        return () => clearInterval(interval)
    }, [nextCourse])

    if (!nextCourse) {
        return (
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 mb-8 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-blue-500">
                    <span className="text-2xl">😊</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Aucun cours prévu aujourd'hui</h2>
                <p className="text-gray-500 font-medium text-sm">Profitez bien de votre temps libre !</p>
            </div>
        )
    }

    const formatTime = (isoString: string) => {
        return new Date(isoString).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    }

    // Fallback to blue if color_code is invalid
    const tagColorClass = colorMap[nextCourse.color_code] || colorMap.blue

    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 mb-8 relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${tagColorClass}`}>
                    {nextCourse.class_name}
                </span>
                <span className="text-xs font-bold text-gray-600 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full">
                    {timeRemaining}
                </span>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">{nextCourse.lesson_title}</h2>
            <p className="text-gray-500 font-medium mb-8 text-sm flex items-center gap-2">
                <span>{formatTime(nextCourse.start_time)}</span>
                <span className="text-gray-300">→</span>
                <span>{formatTime(nextCourse.end_time)}</span>
            </p>

            <button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-3xl transition-colors flex items-center justify-center gap-2 shadow-sm text-sm">
                <Play fill="currentColor" size={18} />
                Démarrer le Mode Classe
            </button>
        </div>
    )
}
