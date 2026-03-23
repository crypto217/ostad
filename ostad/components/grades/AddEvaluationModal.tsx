'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { createEvaluation } from '@/app/actions'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface AddEvaluationModalProps {
    isOpen: boolean
    onClose: () => void
    classId: string
    trimester: number
    onSuccess: () => void
}

export default function AddEvaluationModal({ isOpen, onClose, classId, trimester, onSuccess }: AddEvaluationModalProps) {
    const { t, language } = useLanguage()
    const rtl = language === 'ar'
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        max_value: 20,
        date: new Date().toISOString().split('T')[0]
    })

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const result = await createEvaluation({
                class_id: classId,
                evaluation_title: formData.title,
                max_value: Number(formData.max_value),
                trimester: Number(trimester),
                evaluation_date: new Date().toISOString()
            })
            onSuccess()
            setFormData({
                title: '',
                max_value: 20,
                date: new Date().toISOString().split('T')[0]
            })
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden">
                <div className={`p-6 border-b border-gray-100 flex items-center justify-between ${rtl ? 'flex-row-reverse' : ''}`}>
                    <h2 className="text-xl font-bold text-gray-900">{t('grades_new_eval')}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={`p-6 space-y-4 ${rtl ? 'text-right' : ''}`}>
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">{t('grades_eval_title')}</label>
                        <input
                            required
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder={t('grades_eval_placeholder')}
                            className={`w-full p-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${rtl ? 'text-right' : ''}`}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">{t('grades_max_value')}</label>
                            <input
                                required
                                type="number"
                                min="1"
                                value={formData.max_value}
                                onChange={(e) => setFormData({ ...formData, max_value: parseInt(e.target.value) })}
                                className={`w-full p-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${rtl ? 'text-right' : ''}`}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">{t('grades_eval_date')}</label>
                            <input
                                required
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className={`w-full p-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${rtl ? 'text-right' : ''}`}
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-4 rounded-2xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${rtl ? 'flex-row-reverse' : ''}`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    {t('grades_creating')}
                                </>
                            ) : t('grades_create')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
