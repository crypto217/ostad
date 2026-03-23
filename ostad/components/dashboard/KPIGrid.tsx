'use client'

import { CheckSquare, Users, Presentation } from 'lucide-react'

/**
 * KPIProps - Strictly typed statistics interface.
 */
interface KPIProps {
    stats: {
        pendingTodos: number
        weeklyAttendance: number | string
        classesToday: number
        totalStudents: number
    }
}

/**
 * KPIGrid Component - A row of high-impact statistic cards.
 * Uses the 'Kinetic Classroom' design: borderless containers, Inter-black typography, and interactive icons.
 */
export default function KPIGrid({ stats }: KPIProps) {
    // Note: useLanguage and t() removed to prevent i18n key display bug.

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Total élèves Card */}
            <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] p-10 flex flex-col items-center justify-center text-center transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:-translate-y-1 group cursor-default border-none">
                <div className="w-16 h-16 rounded-[1.25rem] bg-blue-50 flex items-center justify-center text-blue-500 mb-6 transition-all group-hover:scale-110 group-hover:rotate-3">
                    <Users size={32} strokeWidth={3} />
                </div>
                <p className="text-2xl font-bold text-gray-900 tracking-tighter leading-none mb-3 drop-shadow-sm">
                    {stats.totalStudents}
                </p>
                <p className="text-xs font-medium text-gray-500 tracking-[0.2em] opacity-80">
                    Élèves
                </p>
            </div>

            {/* Moyenne générale Card */}
            <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] p-10 flex flex-col items-center justify-center text-center transition-all hover:shadow-[0_20px_50px_rgba(34,197,94,0.08)] hover:-translate-y-1 group cursor-default border-none">
                <div className="w-16 h-16 rounded-[1.25rem] bg-green-50 flex items-center justify-center text-green-500 mb-6 transition-all group-hover:scale-110 group-hover:-rotate-3">
                    <CheckSquare size={32} strokeWidth={3} />
                </div>
                <p className="text-2xl font-bold text-gray-900 tracking-tighter leading-none mb-3 flex items-baseline drop-shadow-sm">
                    {stats.weeklyAttendance}
                    <span className="text-lg ml-1 text-green-500 opacity-80">%</span>
                </p>
                <p className="text-xs font-medium text-gray-500 tracking-[0.2em] opacity-80">
                    Présence semaine
                </p>
            </div>

            {/* Cours planifiés Card */}
            <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] p-10 flex flex-col items-center justify-center text-center transition-all hover:shadow-[0_20px_50px_rgba(168,85,247,0.08)] hover:-translate-y-1 group cursor-default border-none">
                <div className="w-16 h-16 rounded-[1.25rem] bg-purple-50 flex items-center justify-center text-purple-500 mb-6 transition-all group-hover:scale-110 group-hover:rotate-3">
                    <Presentation size={32} strokeWidth={3} />
                </div>
                <p className="text-2xl font-bold text-gray-900 tracking-tighter leading-none mb-3 drop-shadow-sm">
                    {stats.classesToday}
                </p>
                <p className="text-xs font-medium text-gray-500 tracking-[0.2em] opacity-80">
                    Cours du jour
                </p>
            </div>
        </div>
    )
}
