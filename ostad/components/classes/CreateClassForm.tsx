'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface CreateClassFormProps {
    teacherId: string
}

const COLORS = [
    { name: 'Bleu', value: 'bg-blue-400', code: 'blue' },
    { name: 'Vert', value: 'bg-green-400', code: 'green' },
    { name: 'Violet', value: 'bg-purple-400', code: 'purple' },
    { name: 'Jaune', value: 'bg-yellow-400', code: 'yellow' },
    { name: 'Rose', hex: '#FCE7F3', value: 'bg-pink-400', code: 'pink' },
    { name: 'Orange', value: 'bg-orange-400', code: 'orange' },
]

export default function CreateClassForm({ teacherId }: CreateClassFormProps) {
    const { t, language } = useLanguage()
    const [className, setClassName] = useState('')
    const [selectedColor, setSelectedColor] = useState(COLORS[0].code)
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const router = useRouter()
    const supabase = createClient()
    const rtl = language === 'ar'

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!className) return

        setIsLoading(true)
        const { error } = await supabase.from('classes').insert({
            teacher_id: teacherId,
            class_name: className,
            color_code: selectedColor,
        })

        if (error) {
            console.error('Error creating class:', error)
            alert(t('classes_error_create'))
            setIsLoading(false)
        } else {
            setIsSuccess(true)
            setTimeout(() => {
                router.push('/dashboard')
                router.refresh()
            }, 1500)
        }
    }

    if (isSuccess) {
        return (
            <div className={`flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-300 ${rtl ? 'text-right' : 'text-left'}`}>
                <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 size={40} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('classes_form_created')}</h2>
                <p className="text-gray-500">{t('classes_redirecting')}</p>
            </div>
        )
    }

    return (
        <div className={`animate-in fade-in slide-in-from-bottom-4 duration-500 ${rtl ? 'text-right' : 'text-left'}`}>
            <div className={`flex items-center gap-4 mb-8 ${rtl ? 'flex-row-reverse' : ''}`}>
                <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500">
                    <ArrowLeft size={24} className={rtl ? 'rotate-180' : ''} />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">{t('classes_new')}</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-3">
                    <label htmlFor="className" className={`text-sm font-bold text-gray-700 ${rtl ? 'mr-1' : 'ml-1'}`}>
                        {t('classes_form_name')}
                    </label>
                    <input
                        id="className"
                        type="text"
                        value={className}
                        onChange={(e) => setClassName(e.target.value)}
                        placeholder={t('classes_form_name_placeholder')}
                        className={`w-full px-5 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-green-400 outline-none transition-all text-lg font-medium shadow-sm ${rtl ? 'text-right' : 'text-left'}`}
                        required
                    />
                </div>

                <div className="space-y-4">
                    <label className={`text-sm font-bold text-gray-700 ${rtl ? 'mr-1' : 'ml-1'}`}>
                        {t('classes_form_color')}
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                        {COLORS.map((color) => (
                            <button
                                key={color.code}
                                type="button"
                                onClick={() => setSelectedColor(color.code)}
                                className={`h-16 rounded-2xl border-4 transition-all relative overflow-hidden ${color.value} ${selectedColor === color.code ? 'border-gray-900 shadow-md scale-105' : 'border-transparent opacity-80 hover:opacity-100'
                                    }`}
                            >
                                {selectedColor === color.code && (
                                    <div className="absolute inset-0 flex items-center justify-center text-white bg-black/10">
                                        <CheckCircle2 size={24} />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isLoading || !className}
                        className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg shadow-xl shadow-gray-200 hover:bg-black active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100"
                    >
                        {isLoading ? (
                            <div className={`flex items-center justify-center gap-2 ${rtl ? 'flex-row-reverse' : ''}`}>
                                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>{t('classes_form_creating')}</span>
                            </div>
                        ) : (
                            t('classes_form_create')
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
