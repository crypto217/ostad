'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClass } from '@/app/actions'
import { X } from 'lucide-react'

const COLORS = [
    { name: 'Bleu', hex: '#DBEAFE' },
    { name: 'Vert', hex: '#D1FAE5' },
    { name: 'Violet', hex: '#EDE9FE' },
    { name: 'Jaune', hex: '#FEF3C7' },
    { name: 'Rose', hex: '#FCE7F3' },
    { name: 'Orange', hex: '#FFEDD5' },
    { name: 'Menthe', hex: '#F0FDF4' },
    { name: 'Ciel', hex: '#EFF6FF' },
]

export default function CreateClassModal() {
    const router = useRouter()
    const [name, setName] = useState('')
    const [cycle, setCycle] = useState('cem')
    const [color, setColor] = useState(COLORS[0].hex)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleClose = () => router.push('/classes')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return

        setIsSubmitting(true)
        try {
            const result = await createClass({ class_name: name.trim(), cycle, color_code: color })
            if (result && 'error' in result) {
                alert('Erreur: ' + result.error + ' Code: ' + result.code)
            } else {
                handleClose()
            }
        } catch (error: any) {
            alert('Erreur lors de la création de la classe : ' + error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Blur */}
            <div
                className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm transition-opacity"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0">
                    <h2 className="text-xl font-bold text-gray-900">Nouvelle Classe</h2>
                    <button
                        onClick={handleClose}
                        className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <form id="createClassForm" onSubmit={handleSubmit} className="space-y-6">
                        {/* Name Input */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Nom de la classe <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="ex: 3ème AM-B"
                                required
                                autoFocus
                                className="w-full bg-white border border-gray-200 rounded-xl focus:border-green-400 focus:ring-4 focus:ring-green-50 outline-none p-3 transition-all text-gray-900 font-medium placeholder:font-normal placeholder:text-gray-400"
                            />
                        </div>

                        {/* Cycle Select */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Cycle</label>
                            <div className="relative">
                                <select
                                    value={cycle}
                                    onChange={(e) => setCycle(e.target.value)}
                                    className="w-full bg-white border border-gray-200 rounded-xl focus:border-green-400 focus:ring-4 focus:ring-green-50 outline-none p-3 transition-all text-gray-900 font-medium appearance-none"
                                >
                                    <option value="primaire">Primaire</option>
                                    <option value="cem">CEM (Collège)</option>
                                    <option value="lycee">Lycée</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Colors Palette */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-3">Couleur de la classe</label>
                            <div className="grid grid-cols-4 gap-3">
                                {COLORS.map((c) => (
                                    <button
                                        key={c.hex}
                                        type="button"
                                        onClick={() => setColor(c.hex)}
                                        className={`w-full aspect-square rounded-2xl transition-all border-2 ${color === c.hex
                                            ? 'border-gray-900 scale-105 shadow-sm'
                                            : 'border-transparent hover:scale-105 hover:shadow-sm'
                                            }`}
                                        style={{ backgroundColor: c.hex }}
                                        title={c.name}
                                    />
                                ))}
                            </div>
                        </div>
                    </form>
                </div>

                <div className="px-6 py-5 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3 sticky bottom-0">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="px-5 py-2.5 rounded-3xl font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors text-sm"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        form="createClassForm"
                        disabled={isSubmitting || !name.trim()}
                        className="px-6 py-2.5 rounded-3xl font-bold text-white bg-green-500 hover:bg-green-600 transition-colors disabled:opacity-50 text-sm shadow-sm"
                    >
                        {isSubmitting ? 'Création...' : 'Créer'}
                    </button>
                </div>
            </div>
        </div>
    )
}
