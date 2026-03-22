'use client'

import { useState } from 'react'
import { createEvaluation } from '@/app/actions'
import { Plus, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AddEvaluationModal({ classId, trimester }: { classId: string, trimester: number }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()

    async function action(data: FormData) {
        setIsSubmitting(true)
        try {
            await createEvaluation({
                class_id: classId,
                evaluation_title: data.get('evaluation_title') as string,
                max_value: Number(data.get('max_value')),
                trimester: Number(data.get('trimester')),
                evaluation_date: data.get('evaluation_date') as string
            })
            setIsOpen(false)
            router.refresh()
        } catch (error) {
            console.error("Failed to create evaluation", error)
            alert("Erreur lors de la création de l'évaluation.")
        } finally {
            setIsSubmitting(false)
        }
    }

    // Default to today
    const today = new Date().toISOString().split('T')[0]

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-3xl hover:bg-green-600 transition-colors font-medium shadow-sm"
            >
                <Plus className="w-5 h-5" />
                Nouvelle Évaluation
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">Nouvelle Évaluation</h2>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form action={action} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Titre de l'évaluation
                                </label>
                                <input
                                    type="text"
                                    name="evaluation_title"
                                    required
                                    placeholder="ex: Devoir n°1"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Note Max
                                    </label>
                                    <input
                                        type="number"
                                        name="max_value"
                                        required
                                        defaultValue={20}
                                        min={1}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Trimestre
                                    </label>
                                    <select
                                        name="trimester"
                                        required
                                        defaultValue={trimester}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 bg-white"
                                    >
                                        <option value={1}>Trimestre 1</option>
                                        <option value={2}>Trimestre 2</option>
                                        <option value={3}>Trimestre 3</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date
                                </label>
                                <input
                                    type="date"
                                    name="evaluation_date"
                                    required
                                    defaultValue={today}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20"
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-3xl transition-colors font-medium"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2 bg-green-500 text-white rounded-3xl hover:bg-green-600 transition-colors font-medium disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Création...' : 'Créer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
