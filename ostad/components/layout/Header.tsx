'use client'

import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'

interface HeaderProps {
    profile: {
        full_name: string
        gender?: 'male' | 'female' | null
        preferred_language?: 'fr' | 'ar' | null
    }
}

export default function Header({ profile }: HeaderProps) {
    const [dateStr, setDateStr] = useState('')

    useEffect(() => {
        // Determine the locale based on user preference, default to French
        const locale = profile.preferred_language === 'ar' ? 'ar-DZ' : 'fr-FR'
        const formatter = new Intl.DateTimeFormat(locale, {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })

        // Capitalize the first letter for French dates
        let formattedDate = formatter.format(new Date())
        if (locale === 'fr-FR') {
            formattedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)
        }
        setDateStr(formattedDate)
    }, [profile.preferred_language])

    // Get just the first name for a friendlier greeting
    const firstName = profile.full_name?.split(' ')[0] || 'Prof'

    const getGreeting = () => {
        if (profile.preferred_language === 'ar') {
            return `مرحباً أستاذة/أستاذ ${firstName}`
        }

        if (profile.gender === 'female') {
            return `Bonjour Mme ${firstName}`
        } else {
            return `Bonjour M. ${firstName}`
        }
    }

    return (
        <header className="flex justify-between items-center mb-8 gap-4">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">{getGreeting()}</h1>
                <p className="text-sm font-medium text-gray-500 capitalize">{dateStr}</p>
            </div>

            {/* Mobile Search Icon */}
            <button className="xl:hidden p-3 bg-white rounded-2xl shadow-sm border border-gray-100 text-gray-600 hover:text-green-500 transition-colors">
                <Search size={22} />
            </button>

            {/* Desktop Search Bar & Avatar */}
            <div className="hidden xl:flex items-center gap-6 flex-1 max-w-md ml-auto">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                        <Search size={20} />
                    </div>
                    <input
                        type="text"
                        placeholder="Rechercher des élèves, classes, cours..."
                        className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:border-green-400 focus:ring-4 focus:ring-green-50 outline-none transition-all text-sm placeholder:text-gray-400 shadow-sm"
                    />
                </div>

                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0 border-2 border-white ring-2 ring-gray-100 cursor-pointer hover:scale-105 transition-transform">
                    {firstName.charAt(0)}
                </div>
            </div>
        </header>
    )
}
