'use client'

import Link from 'next/link'
import { Microscope, Calculator, FlaskConical, Globe, ChevronRight } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface ClassItemProps {
    id: string
    name: string
    studentCount: number
    progress: number
    color: 'blue' | 'orange' | 'green' | 'pink'
    icon: any
}

function ClassRow({ name, studentCount, progress, color, icon: Icon }: ClassItemProps) {
    const colorClasses = {
        blue: {
            bg: 'bg-blue-50',
            text: 'text-blue-500',
            bar: 'bg-blue-500',
            barBg: 'bg-blue-100'
        },
        orange: {
            bg: 'bg-orange-50',
            text: 'text-orange-500',
            bar: 'bg-orange-500',
            barBg: 'bg-orange-100'
        },
        green: {
            bg: 'bg-green-50',
            text: 'text-green-500',
            bar: 'bg-green-500',
            barBg: 'bg-green-100'
        },
        pink: {
            bg: 'bg-pink-50',
            text: 'text-pink-500',
            bar: 'bg-pink-500',
            barBg: 'bg-pink-100'
        }
    }

    const { bg, text, bar, barBg } = colorClasses[color]

    return (
        <div className="flex items-center gap-4 group cursor-pointer hover:bg-gray-50/50 p-2 rounded-2xl transition-all">
            <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center ${text} shrink-0 transition-transform group-hover:scale-110`}>
                <Icon size={24} />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-2">
                    <h4 className="font-black text-gray-900 truncate pr-2">{name}</h4>
                    <span className="text-xs font-bold text-gray-400 shrink-0">{studentCount} élèves</span>
                </div>

                <div className="flex items-center gap-3">
                    <div className={`flex-1 h-2 rounded-full ${barBg} overflow-hidden`}>
                        <div
                            className={`h-full rounded-full ${bar} shadow-[0_0_8px_rgba(0,0,0,0.05)] transition-all duration-1000`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <span className="text-sm font-black text-gray-700 min-w-[32px]">{progress}%</span>
                </div>
            </div>
        </div>
    )
}

interface ClassesListProps {
    classes: any[]
}

export default function ClassesList({ classes }: ClassesListProps) {
    const { t } = useLanguage()

    // Configuration for icons and colors
    const icons = [Microscope, Calculator, FlaskConical, Globe]
    const colors: ('blue' | 'orange' | 'green' | 'pink')[] = ['blue', 'orange', 'green', 'pink']

    return (
        <div className="bg-white rounded-[2.5rem] shadow-sm p-8 border border-gray-100 mt-6 md:mt-8">
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                    {t('nav_classes') || "Mes classes"}
                </h3>
                <Link
                    href="/classes"
                    className="flex items-center gap-1 text-sm font-black text-green-500 hover:text-green-600 transition-colors group"
                >
                    Voir tout
                    <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
            </div>

            <div className="space-y-6">
                {classes.length > 0 ? (
                    classes.map((cls, idx) => {
                        const icon = icons[idx % icons.length]
                        const color = colors[idx % colors.length]
                        // Simple deterministic mock progress
                        const progress = 45 + (idx * 15) % 50

                        return (
                            <ClassRow
                                key={cls.id}
                                id={cls.id}
                                name={cls.class_name}
                                studentCount={cls.students?.[0]?.count || 0}
                                progress={progress}
                                color={color}
                                icon={icon}
                            />
                        )
                    })
                ) : (
                    <div className="text-center py-10 text-gray-400">
                        Aucune classe trouvée
                    </div>
                )}
            </div>
        </div>
    )
}
