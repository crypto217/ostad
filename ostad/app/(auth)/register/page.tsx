'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'

export default function Register() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const router = useRouter()
    const supabase = createClient()

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas')
            return
        }

        setLoading(true)
        setError(null)

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else if (data.session) {
            // Utilisateur connecté automatiquement (confirmation par email désactivée)
            router.push('/onboarding')
            router.refresh()
        } else {
            // L'utilisateur doit confirmer son email
            setError("Inscription réussie ! Veuillez vérifier votre boîte mail pour confirmer votre compte.")
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#F9F9F6] flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-8 border border-gray-100">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Créer un compte</h1>
                    <p className="text-gray-500 mt-2">Rejoignez Ostad dès aujourd'hui</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                            Adresse email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none transition-all"
                            placeholder="professeur@ostad.dz"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                            Mot de passe
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none transition-all"
                            placeholder="••••••••"
                            required
                            disabled={loading}
                            minLength={6}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="confirmPassword">
                            Confirmer le mot de passe
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none transition-all"
                            placeholder="••••••••"
                            required
                            disabled={loading}
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-3xl transition-colors mt-4 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Créer mon compte"}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-500">
                    Déjà un compte ?{' '}
                    <Link href="/login" className="font-medium text-green-500 hover:text-green-600 transition-colors">
                        Se connecter
                    </Link>
                </p>
            </div>
        </div>
    )
}
