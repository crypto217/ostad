'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { updateProfile } from '@/app/actions'
import { LogOut, Save, Loader2 } from 'lucide-react'

export default function SettingsClient({ initialProfile }: { initialProfile: any }) {
    const router = useRouter()
    const supabase = createClient()

    const [loading, setLoading] = useState(false)
    const [logoutLoading, setLogoutLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const [formData, setFormData] = useState({
        full_name: initialProfile.full_name || '',
        subject: initialProfile.subject || '',
        cycle: initialProfile.cycle || '',
        preferred_language: initialProfile.preferred_language || 'fr',
        gender: initialProfile.gender || ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccess(false)

        try {
            await updateProfile(formData)
            setSuccess(true)
        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue.')
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        setLogoutLoading(true)
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">

                {error && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="p-3 bg-green-50 text-green-600 rounded-xl text-sm border border-green-100">
                        Profil mis à jour avec succès !
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                    <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none transition-all"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Matière enseignée</label>
                    <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none transition-all"
                        placeholder="Ex: Mathématiques, Physique..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cycle</label>
                    <select
                        value={formData.cycle}
                        onChange={(e) => setFormData({ ...formData, cycle: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none transition-all"
                        required
                    >
                        <option value="" disabled>Sélectionner un cycle</option>
                        <option value="primaire">Primaire</option>
                        <option value="cem">CEM</option>
                        <option value="lycee">Lycée</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Langue préférée</label>
                    <select
                        value={formData.preferred_language}
                        onChange={(e) => setFormData({ ...formData, preferred_language: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none transition-all"
                    >
                        <option value="fr">Français (FR)</option>
                        <option value="ar">Arabe (AR)</option>
                        <option value="en">Anglais (EN)</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Genre</label>
                    <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="gender"
                                value="male"
                                checked={formData.gender === 'male'}
                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                className="w-5 h-5 text-green-500 focus:ring-green-400 accent-green-500"
                            />
                            <span className="text-gray-700 font-medium">Homme</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="gender"
                                value="female"
                                checked={formData.gender === 'female'}
                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                className="w-5 h-5 text-green-500 focus:ring-green-400 accent-green-500"
                            />
                            <span className="text-gray-700 font-medium">Femme</span>
                        </label>
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center mt-8">
                    <button
                        type="button"
                        onClick={handleLogout}
                        disabled={logoutLoading}
                        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-3xl font-bold transition-all shadow-sm w-full sm:w-auto justify-center disabled:opacity-70"
                    >
                        {logoutLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogOut size={20} />}
                        Se déconnecter
                    </button>

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-3xl font-bold transition-all shadow-sm w-full sm:w-auto justify-center disabled:opacity-70"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={20} />}
                        Sauvegarder
                    </button>
                </div>
            </form>
        </div>
    )
}
