'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { getCivility } from '@/lib/i18n/civility'

export default function Onboarding() {
    const [fullName, setFullName] = useState('')
    const [gender, setGender] = useState<'male' | 'female' | ''>('')
    const [language, setLanguage] = useState<'fr' | 'ar' | 'en' | ''>('')
    const [cycle, setCycle] = useState<'primaire' | 'cem' | 'lycee' | ''>('')
    const [subject, setSubject] = useState('')
    const [classesCount, setClassesCount] = useState<number | ''>('')

    const [loading, setLoading] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const router = useRouter()
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            setError("Vous devez être connecté pour créer un profil.")
            setLoading(false)
            return
        }

        const { error: insertError } = await supabase.from('profiles').insert([
            {
                id: user.id,
                full_name: fullName,
                gender: gender || null,
                preferred_language: language || null,
                cycle: cycle || null,
                subject: subject || null,
                expected_classes_count: classesCount ? Number(classesCount) : null,
            }
        ])

        if (insertError) {
            setError(insertError.message)
            setLoading(false)
        } else {
            setShowSuccess(true)
            setTimeout(() => {
                router.push('/dashboard')
                router.refresh()
            }, 2500)
        }
    }

    if (showSuccess) {
        return (
            <div className="min-h-screen bg-[#F9F9F6] flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-3xl shadow-sm p-12 text-center border border-gray-100 flex flex-col items-center gap-6">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500 mb-2">
                        <CheckCircle2 size={48} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-3">
                            {getCivility(fullName, gender || null, (language as any) || 'fr')} !
                        </h1>
                        <p className="text-gray-500 text-lg">Ostad est prêt. Redirection vers votre tableau de bord...</p>
                    </div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mt-4">
                        <div className="bg-green-500 h-full animate-[loading_2.5s_ease-in-out]" style={{ width: '100%' }}></div>
                    </div>
                </div>
                <style jsx>{`
                    @keyframes loading {
                        from { width: 0% }
                        to { width: 100% }
                    }
                `}</style>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F9F9F6] flex items-center justify-center p-4 font-sans py-12">
            <div className="w-full max-w-xl bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-8 border border-gray-100">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Bienvenue sur Ostad ! 🎉</h1>
                    <p className="text-gray-500 mt-2">Parlons un peu plus de vous pour configurer votre espace.</p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6 text-gray-700">

                    {/* Nom Complet */}
                    <div>
                        <label className="block text-sm font-medium mb-1" htmlFor="fullName">
                            Nom complet <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="fullName"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none transition-all"
                            placeholder="Pr. Yassine Ali"
                            required
                            disabled={loading}
                        />
                    </div>

                    {/* Genre */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Genre</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="gender"
                                    value="male"
                                    checked={gender === 'male'}
                                    onChange={() => setGender('male')}
                                    className="accent-green-500 w-4 h-4"
                                    disabled={loading}
                                />
                                Homme
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="gender"
                                    value="female"
                                    checked={gender === 'female'}
                                    onChange={() => setGender('female')}
                                    className="accent-green-500 w-4 h-4"
                                    disabled={loading}
                                />
                                Femme
                            </label>
                        </div>
                    </div>

                    {/* Langue */}
                    <div>
                        <label className="block text-sm font-medium mb-1" htmlFor="language">
                            Langue préférée
                        </label>
                        <select
                            id="language"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value as any)}
                            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none transition-all bg-white"
                            disabled={loading}
                        >
                            <option value="" disabled>Sélectionner une langue...</option>
                            <option value="fr">Français</option>
                            <option value="ar">العربية (Arabe)</option>
                            <option value="en">English (Anglais)</option>
                        </select>
                    </div>

                    {/* Cycle */}
                    <div>
                        <label className="block text-sm font-medium mb-1" htmlFor="cycle">
                            Cycle enseigné
                        </label>
                        <select
                            id="cycle"
                            value={cycle}
                            onChange={(e) => setCycle(e.target.value as any)}
                            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none transition-all bg-white"
                            disabled={loading}
                        >
                            <option value="" disabled>Sélectionner un cycle...</option>
                            <option value="primaire">Primaire</option>
                            <option value="cem">CEM</option>
                            <option value="lycee">Lycée</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Matière */}
                        <div>
                            <label className="block text-sm font-medium mb-1" htmlFor="subject">
                                Matière enseignée <span className="text-gray-400 font-normal">(Optionnel)</span>
                            </label>
                            <input
                                id="subject"
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none transition-all"
                                placeholder="Mathématiques, Physique..."
                                disabled={loading}
                            />
                        </div>

                        {/* Nombre de classes estimé */}
                        <div>
                            <label className="block text-sm font-medium mb-1" htmlFor="classesCount">
                                Nombre de classes <span className="text-gray-400 font-normal">(Optionnel)</span>
                            </label>
                            <input
                                id="classesCount"
                                type="number"
                                min="1"
                                max="50"
                                value={classesCount}
                                onChange={(e) => setClassesCount(e.target.value ? Number(e.target.value) : '')}
                                className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none transition-all"
                                placeholder="Ex. 4"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !fullName}
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-4 rounded-3xl transition-colors mt-8 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                    >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Commencer →"}
                    </button>
                </form>

            </div>
        </div>
    )
}
