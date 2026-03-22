import { useLanguage } from '@/lib/i18n/LanguageContext'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'

export default function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage()
    const [isPending, setIsPending] = useState(false)
    const [tempLang, setTempLang] = useState<string | null>(null)

    const handleLanguageChange = async (lang: 'fr' | 'ar' | 'en') => {
        if (lang === language) return

        setIsPending(true)
        setTempLang(lang)
        try {
            await setLanguage(lang)
        } catch (error) {
            console.error('Failed to change language:', error)
        } finally {
            setIsPending(false)
            setTempLang(null)
        }
    }

    const languages = [
        { code: 'fr', label: 'FR', flag: '🇫🇷' },
        { code: 'ar', label: 'AR', flag: '🇩🇿' },
        { code: 'en', label: 'EN', flag: '🇬🇧' },
    ] as const

    return (
        <div className="bg-gray-100 rounded-xl p-1 flex gap-1 items-center">
            {languages.map((lang) => {
                const isActive = (tempLang || language) === lang.code
                return (
                    <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        disabled={isPending}
                        className={`
                            flex items-center gap-1.5 px-3 py-1 rounded-xl text-sm transition-all duration-200
                            ${isActive
                                ? 'bg-green-500 text-white font-bold shadow-sm'
                                : 'bg-white text-gray-500 hover:bg-gray-50 font-medium border border-transparent'
                            }
                            ${isPending && tempLang === lang.code ? 'opacity-85 scale-95' : ''}
                            disabled:cursor-not-allowed
                        `}
                    >
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                        {isPending && tempLang === lang.code && (
                            <Loader2 className="w-3 h-3 animate-spin ml-0.5" />
                        )}
                    </button>
                )
            })}
        </div>
    )
}
