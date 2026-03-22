'use client'

import { useState } from 'react'
import { Plus, X, Loader2 } from 'lucide-react'
import { createWeeklySlot, createCourseSession } from '@/app/actions'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface AddSlotModalProps {
    isOpen: boolean
    onClose: () => void
    classes: any[]
}

export default function AddSlotModal({ isOpen, onClose, classes }: AddSlotModalProps) {
    const { t, language } = useLanguage()
    const rtl = language === 'ar'
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        class_id: '',
        day_of_week: 0,
        start_time: '08:00',
        end_time: '09:00'
    })
    const [createSession, setCreateSession] = useState(false)

    if (!isOpen) return null

    const DAYS = [
        { id: 0, name: t('plan_day_sun') },
        { id: 1, name: t('plan_day_mon') },
        { id: 2, name: t('plan_day_tue') },
        { id: 3, name: t('plan_day_wed') },
        { id: 4, name: t('plan_day_thu') },
        { id: 5, name: t('plan_day_fri') },
        { id: 6, name: t('plan_day_sat') },
    ]

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.class_id) {
            alert(t('plan_form_select_class'))
            return
        }

        if (formData.end_time <= formData.start_time) {
            alert(t('plan_form_time_error'))
            return
        }

        setLoading(true)
        try {
            // 1. Create Template Slot
            const { slotId } = await createWeeklySlot(formData)

            // 2. Optionally create the session for the current week's matching day
            if (createSession) {
                // Calculate the date of that day in the current week
                const today = new Date()
                const todayDayOfWeek = today.getDay()
                const sunday = new Date(today)
                sunday.setDate(today.getDate() - todayDayOfWeek)

                const targetDate = new Date(sunday)
                targetDate.setDate(sunday.getDate() + formData.day_of_week)

                // Set the exact time
                const [hours, minutes] = formData.start_time.split(':')
                targetDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)

                // Adjust to local ISO string equivalent format
                // YYYY-MM-DDTHH:mm:00
                const scheduled_time = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}T${formData.start_time}:00`

                await createCourseSession({
                    class_id: formData.class_id,
                    scheduled_time,
                    status: 'planned',
                    weekly_schedule_id: slotId
                })
            }

            alert(t('plan_success_add'))
            onClose()
            // Reset state
            setFormData({ class_id: '', day_of_week: 0, start_time: '08:00', end_time: '09:00' })
            setCreateSession(false)
        } catch (error: any) {
            alert(error.message || t('common_error'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className={`bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100 ${rtl ? 'text-right' : ''}`}>
                <div className={`p-6 border-b border-gray-100 flex justify-between items-center bg-[#F9F9F6]/50 ${rtl ? 'flex-row-reverse' : ''}`}>
                    <h2 className="text-xl font-bold text-gray-900">{t('plan_modal_add_title')}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">{t('plan_form_class')}</label>
                        <select
                            value={formData.class_id}
                            onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                            className={`w-full border-2 border-gray-100 rounded-xl p-3 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all appearance-none cursor-pointer bg-white ${rtl ? 'text-right' : ''}`}
                        >
                            <option value="">{language === 'ar' ? 'اختر قسماً...' : language === 'en' ? 'Select a class...' : 'Sélectionner une classe...'}</option>
                            {classes.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.class_name} ({c.cycle})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">{t('plan_form_day')}</label>
                        <select
                            value={formData.day_of_week}
                            onChange={(e) => setFormData({ ...formData, day_of_week: parseInt(e.target.value) })}
                            className={`w-full border-2 border-gray-100 rounded-xl p-3 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all appearance-none cursor-pointer bg-white ${rtl ? 'text-right' : ''}`}
                        >
                            {DAYS.map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">{t('plan_form_start')}</label>
                            <input
                                type="time"
                                value={formData.start_time}
                                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all bg-white font-medium text-center"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">{t('plan_form_end')}</label>
                            <input
                                type="time"
                                value={formData.end_time}
                                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                                className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all bg-white font-medium text-center"
                                required
                            />
                        </div>
                    </div>

                    <div className={`flex items-center gap-3 p-4 bg-[#F9F9F6] border-2 border-gray-100 rounded-2xl cursor-pointer ${rtl ? 'flex-row-reverse' : ''}`} onClick={() => setCreateSession(!createSession)}>
                        <input
                            type="checkbox"
                            checked={createSession}
                            onChange={(e) => setCreateSession(e.target.checked)}
                            className="w-5 h-5 text-green-500 rounded focus:ring-green-500 focus:ring-offset-2 border-gray-300 pointer-events-none"
                        />
                        <span className="text-sm font-bold text-gray-700 select-none">
                            {t('plan_form_create_session')}
                        </span>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-sm ${rtl ? 'flex-row-reverse' : ''}`}
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <><Plus size={20} /> {t('common_add')}</>}
                    </button>
                </form>
            </div>
        </div>
    )
}
