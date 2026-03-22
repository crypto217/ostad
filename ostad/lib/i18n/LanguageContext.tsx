'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { translations, Language, TranslationKey } from './translations'
import { updateLanguage } from '@/app/actions'

interface LanguageContextType {
    language: Language
    setLanguage: (lang: Language) => void
    t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageContextType>({
    language: 'fr',
    setLanguage: () => { },
    t: (key) => key,
})

export function LanguageProvider({
    children,
    initialLanguage = 'fr'
}: {
    children: ReactNode
    initialLanguage?: Language
}) {
    // Priority: localStorage > initialLanguage (from DB) > default 'fr'
    const [language, setLanguageState] = useState<Language>(initialLanguage)

    useEffect(() => {
        const stored = localStorage.getItem('ostad_language') as Language
        if (stored && ['fr', 'ar', 'en'].includes(stored)) {
            setLanguageState(stored)
        }
    }, [])

    const setLanguage = async (lang: Language) => {
        setLanguageState(lang)
        localStorage.setItem('ostad_language', lang)
        try {
            await updateLanguage(lang)
        } catch (error) {
            console.error('Failed to update language in database:', error)
        }
    }

    const t = (key: TranslationKey): string => {
        return translations[language][key] ||
            translations['fr'][key] ||
            key
    }

    return (
        <LanguageContext.Provider
            value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    )
}

export const useLanguage = () => useContext(LanguageContext)
