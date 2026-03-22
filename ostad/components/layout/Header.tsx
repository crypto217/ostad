'use client'

import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getCivility, getDateLocale, isRTL } from '@/lib/i18n/civility'

interface HeaderProps {
    profile: {
        full_name: string
        gender?: 'male' | 'female' | null
        preferred_language?: 'fr' | 'ar' | 'en' | null
    }
}

export default function Header({ profile }: HeaderProps) {
    const [dateStr, setDateStr] = useState('')
    const lang = profile.preferred_language || 'fr'
    const rtl = isRTL(lang)

    useEffect(() => {
        const locale = getDateLocale(lang)
        const formatter = new Intl.DateTimeFormat(locale, {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        })

        let formattedDate = formatter.format(new Date())
        // Capitalize the first letter for French
        if (lang === 'fr') {
            formattedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)
        }
        setDateStr(formattedDate)
    }, [lang])

    const firstName = profile.full_name?.split(' ')[0] || ''

    return (
        <header
            className={`flex justify-between items-center mb-8 gap-4 ${rtl ? 'flex-row-reverse' : ''}`}
            dir={rtl ? 'rtl' : 'ltr'}
        >
            <div className={rtl ? 'text-right' : ''}>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    {getCivility(profile.full_name, profile.gender || null, lang)}
                </h1>
                <p className="text-sm font-medium text-gray-500 capitalize">{dateStr}</p>
            </div>

            {/* Mobile Search Icon */}
            <button className="xl:hidden p-3 bg-white rounded-2xl shadow-sm border border-gray-100 text-gray-600 hover:text-green-500 transition-colors">
                <Search size={22} className={rtl ? 'scale-x-[-1]' : ''} />
            </button>

            {/* Desktop Search Bar & Avatar */}
            <div className={`hidden xl:flex items-center gap-6 flex-1 max-w-md ${rtl ? 'mr-auto ml-0' : 'ml-auto'}`}>
                <div className="relative flex-1">
                    <div className={`absolute inset-y-0 ${rtl ? 'right-0 pr-4' : 'left-0 pl-4'} flex items-center pointer-events-none text-gray-400`}>
                        <Search size={20} />
                    </div>
                    <input
                        type="text"
                        placeholder={rtl ? "البحث عن الطلاب، الفصول، الدروس..." : "Rechercher des élèves, classes, cours..."}
                        className={`w-full ${rtl ? 'pr-11 pl-4' : 'pl-11 pr-4'} py-3 bg-white border border-gray-200 rounded-2xl focus:border-green-400 focus:ring-4 focus:ring-green-50 outline-none transition-all text-sm placeholder:text-gray-400 shadow-sm ${rtl ? 'text-right' : ''}`}
                    />
                </div>

                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0 border-2 border-white ring-2 ring-gray-100 cursor-pointer hover:scale-105 transition-transform">
                    {firstName.charAt(0)}
                </div>
            </div>
        </header>
    )
}
