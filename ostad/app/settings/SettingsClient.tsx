'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Loader2, Save, LogOut, CheckCircle2 } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface SettingsClientProps {
    profile: any
}

export default function SettingsClient({ profile }: SettingsClientProps) {
    const { t, language, setLanguage } = useLanguage()
    const rtl = language === 'ar'
    const router = useRouter()
    const supabase = createClient()

    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [formData, setFormData] = useState({
        full_name: profile?.full_name || '',
        subject: profile?.subject || '',
        cycle: profile?.cycle || '',
        gender: profile?.gender || 'M',
        preferred_language: profile?.preferred_language || 'fr'
    })

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setSuccess(false)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: formData.full_name,
                    subject: formData.subject,
                    cycle: formData.cycle,
                    gender: formData.gender,
                    preferred_language: formData.preferred_language,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id)

            if (error) throw error

            // Update app language immediately
            setLanguage(formData.preferred_language as 'fr' | 'ar' | 'en')
            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <div className={`max-w-2xl mx-auto space-y-6 ${rtl ? 'text-right' : ''}`}>
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-100 bg-gray-50/50">
                    <h1 className="text-2xl font-bold text-gray-900">{t('sett_title')}</h1>
                </div>

                <form onSubmit={handleSave} className="p-8 space-y-6">
                    {success && (
                        <div className={`p-4 bg-green-50 text-green-700 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${rtl ? 'flex-row-reverse' : ''}`}>
                            <CheckCircle2 className="w-5 h-5" />
                            <p className="font-medium text-sm">{t('sett_profile_updated')}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">{t('sett_full_name')}</label>
                            <input
                                type="text"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                className={`w-full p-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${rtl ? 'text-right' : ''}`}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">{t('sett_gender')}</label>
                            <select
                                value={formData.gender}
                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                className={`w-full p-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${rtl ? 'text-right' : ''}`}
                            >
                                <option value="M">{t('sett_gender_male')}</option>
                                <option value="F">{t('sett_gender_female')}</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">{t('sett_subject')}</label>
                            <input
                                type="text"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                placeholder={t('sett_subject_placeholder')}
                                className={`w-full p-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${rtl ? 'text-right' : ''}`}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">{t('sett_cycle')}</label>
                            <select
                                value={formData.cycle}
                                onChange={(e) => setFormData({ ...formData, cycle: e.target.value })}
                                className={`w-full p-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${rtl ? 'text-right' : ''}`}
                            >
                                <option value="">{t('sett_select_cycle')}</option>
                                <option value="Primary">{t('sett_cycle_primary')}</option>
                                <option value="C.E.M">{t('sett_cycle_cem')}</option>
                                <option value="Lycee">{t('sett_cycle_lycee')}</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">{t('sett_lang_title')}</label>
                            <div className={`grid grid-cols-3 gap-3 ${rtl ? 'flex-row-reverse' : ''}`}>
                                {[
                                    { id: 'fr', label: 'Français', flag: '🇫🇷' },
                                    { id: 'ar', label: 'العربية', flag: '🇩🇿' },
                                    { id: 'en', label: 'English', flag: '🇺🇸' }
                                ].map((lang) => (
                                    <button
                                        key={lang.id}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, preferred_language: lang.id })}
                                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 group ${formData.preferred_language === lang.id
                                                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                                                : 'border-gray-50 bg-white hover:border-gray-200 text-gray-600'
                                            }`}
                                    >
                                        <span className="text-xl group-hover:scale-125 transition-transform">{lang.flag}</span>
                                        <span className="text-xs font-bold">{lang.label}</span>
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-gray-400 mt-2">{t('sett_lang_info')}</p>
                        </div>
                    </div>

                    <div className={`flex flex-col sm:flex-row gap-4 pt-4 ${rtl ? 'sm:flex-row-reverse' : ''}`}>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex-1 bg-gray-900 hover:bg-black text-white p-4 rounded-2xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 disabled:bg-gray-400 ${rtl ? 'flex-row-reverse' : ''}`}
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            {t('sett_save')}
                        </button>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className={`px-6 py-4 rounded-2xl font-bold text-red-600 hover:bg-red-50 transition-all flex items-center justify-center gap-2 ${rtl ? 'flex-row-reverse' : ''}`}
                        >
                            <LogOut className="w-5 h-5" />
                            {t('sett_logout')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
