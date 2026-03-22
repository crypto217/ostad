'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { X, Loader2, Play, Ban, Trash2, CalendarPlus, Upload, File as FileIcon, Plus, ClipboardList } from 'lucide-react'
import { createCourseSession, updateSessionStatus, updateSessionDetails, deleteWeeklySlot } from '@/app/actions'
import { createClient } from '@/lib/supabase'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface SessionDetailModalProps {
    isOpen: boolean
    onClose: () => void
    schedule: any
    session: any
    date: Date
    viewMode: 'this_week' | 'template'
}

export default function SessionDetailModal({ isOpen, onClose, schedule, session, date, viewMode }: SessionDetailModalProps) {
    const { t, language } = useLanguage()
    const rtl = language === 'ar'
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [details, setDetails] = useState({
        lesson_title: session?.lesson_title || '',
        trimester: session?.trimester || 1,
        lesson_notes: session?.lesson_notes || ''
    })

    if (!isOpen || !schedule) return null

    const handleCreateSession = async () => {
        setLoading(true)
        try {
            const scheduled_time = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${schedule.start_time}:00`
            await createCourseSession({
                class_id: schedule.class_id,
                scheduled_time,
                status: 'planned',
                weekly_schedule_id: schedule.id
            })
            alert(t('plan_success_add'))
            onClose()
        } catch (e: any) {
            alert(e.message || t('common_error'))
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateStatus = async (status: string) => {
        if (!session) return
        setLoading(true)
        try {
            await updateSessionStatus(session.id, status)
            alert(t('plan_error_update').replace('Erreur', 'Succès')) // Reusing but ideally have a success key
            onClose()
        } catch (e: any) {
            alert(e.message || t('common_error'))
        } finally {
            setLoading(false)
        }
    }

    const handleSaveDetails = async () => {
        if (!session) return
        setLoading(true)
        try {
            await updateSessionDetails(session.id, details)
            alert(t('plan_success_add')) // Generic success
            onClose()
        } catch (e: any) {
            alert(e.message || t('common_error'))
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteTemplate = async () => {
        if (!confirm(t('plan_confirm_delete'))) return
        setIsDeleting(true)
        try {
            await deleteWeeklySlot(schedule.id)
            alert(t('plan_error_delete').replace('Erreur', 'Succès'))
            onClose()
        } catch (e: any) {
            alert(e.message || t('common_error'))
        } finally {
            setIsDeleting(false)
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !session) return

        // Validate size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            alert(t('plan_upload_info'))
            return
        }

        // Validate type
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        if (!allowedTypes.includes(file.type)) {
            alert(t('plan_upload_info'))
            return
        }

        setIsUploading(true)
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) throw new Error("Non autorisé")

            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}.${fileExt}`
            const filePath = `${user.id}/${session.class_id}/${session.id}/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('course_materials')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('course_materials')
                .getPublicUrl(filePath)

            await updateSessionDetails(session.id, { attachment_url: publicUrl })
            alert(t('plan_success_add'))
            onClose()

        } catch (error: any) {
            console.error("Upload Error:", error)
            alert(error.message || t('common_error'))
        } finally {
            setIsUploading(false)
        }
    }

    const locale = language === 'ar' ? 'ar-DZ' : language === 'en' ? 'en-US' : 'fr-FR'
    const displayDate = date.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })
    const color = schedule.class?.color_code || '#cbd5e1'

    const STATUS_LABELS: Record<string, string> = {
        planned: t('plan_status_scheduled'),
        in_progress: t('dash_in_progress'),
        done: t('plan_status_completed'),
        cancelled: t('plan_status_cancelled'),
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className={`bg-white rounded-[2rem] shadow-xl w-full max-w-xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh] ${rtl ? 'text-right' : ''}`}>

                {/* Header (Dynamic Color) */}
                <div style={{ backgroundColor: `${color}15`, borderBottomColor: `${color}30` }} className={`p-6 border-b flex justify-between items-start ${rtl ? 'flex-row-reverse' : ''}`}>
                    <div>
                        <div className={`flex items-center gap-2 mb-2 ${rtl ? 'flex-row-reverse' : ''}`}>
                            <span className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm" style={{ backgroundColor: color }}>
                                {schedule.class?.class_name}
                            </span>
                            {session && (
                                <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg border bg-white shadow-sm ${session.status === 'planned' ? 'text-yellow-600 border-yellow-200' : session.status === 'in_progress' ? 'text-green-600 border-green-200' : session.status === 'done' ? 'text-blue-600 border-blue-200' : 'text-red-600 border-red-200'}`}>
                                    {STATUS_LABELS[session.status] || session.status}
                                </span>
                            )}
                        </div>
                        <h2 className={`text-2xl font-black text-gray-900 leading-tight ${rtl ? 'text-right' : ''}`}>
                            {schedule.start_time.substring(0, 5)} - {schedule.end_time.substring(0, 5)}
                        </h2>
                        <p className="text-gray-600 font-medium text-sm mt-1 capitalize">{displayDate}</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white/50 hover:bg-white rounded-full transition-colors shadow-sm">
                        <X size={20} className="text-gray-600" />
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">

                    {viewMode === 'template' ? (
                        <div className="text-center py-8">
                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-6">
                                <h3 className="font-bold text-gray-900 mb-2">{t('plan_modal_detail_title')}</h3>
                                <p className="text-sm text-gray-500">
                                    {language === 'ar' ? 'قم بتعديل هذا الموعد لتغيير الجدول الزمني النموذجي لهذا القسم. ستتأثر الأسابيع القادمة.' : language === 'en' ? 'Modify this slot to change the typical schedule for this class. Future weeks will be affected.' : "Modifiez ce créneau pour changer l'emploi du temps type de cette classe. Les futures semaines seront impactées."}
                                </p>
                            </div>
                            <button
                                onClick={handleDeleteTemplate}
                                disabled={isDeleting}
                                className={`w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-6 rounded-2xl inline-flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-red-200 ${rtl ? 'flex-row-reverse' : ''}`}
                            >
                                {isDeleting ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
                                {t('plan_error_delete').replace('Erreur', 'Supprimer')}
                            </button>
                        </div>
                    ) : !session ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                                <CalendarPlus size={28} className="text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('plan_empty_title')}</h3>
                            <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
                                {language === 'ar' ? 'هذا موعد من جدولك الزمني النموذجي. هل تريد الجدولة الفعلية لهذه الحصة لليوم؟' : language === 'en' ? 'This is a slot from your typical grid. Do you want to actually schedule the session for today?' : "C'est un créneau de votre grille type. Voulez-vous créer concrètement la séance d'aujourd'hui ?"}
                            </p>
                            <button
                                onClick={handleCreateSession}
                                disabled={loading}
                                className={`bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 px-8 rounded-2xl inline-flex items-center gap-2 transition-all active:scale-95 shadow-sm ${rtl ? 'flex-row-reverse' : ''}`}
                            >
                                {loading ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} strokeWidth={2.5} />}
                                {t('plan_add_slot')}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">{t('plan_lesson_title')}</label>
                                <input
                                    type="text"
                                    value={details.lesson_title}
                                    onChange={e => setDetails({ ...details, lesson_title: e.target.value })}
                                    placeholder={language === 'ar' ? 'العنوان...' : 'Ex: Les équations...'}
                                    className={`w-full border-2 border-gray-100 rounded-xl p-3 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all ${rtl ? 'text-right' : ''}`}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">{t('plan_trimester')}</label>
                                <select
                                    value={details.trimester}
                                    onChange={e => setDetails({ ...details, trimester: parseInt(e.target.value) })}
                                    className={`w-full border-2 border-gray-100 rounded-xl p-3 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all bg-white ${rtl ? 'text-right' : ''}`}
                                >
                                    <option value={1}>{t('plan_trimester')} 1</option>
                                    <option value={2}>{t('plan_trimester')} 2</option>
                                    <option value={3}>{t('plan_trimester')} 3</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">{t('plan_notes')}</label>
                                <textarea
                                    value={details.lesson_notes}
                                    onChange={e => setDetails({ ...details, lesson_notes: e.target.value })}
                                    rows={3}
                                    placeholder="..."
                                    className={`w-full border-2 border-gray-100 rounded-xl p-3 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all resize-none ${rtl ? 'text-right' : ''}`}
                                />
                            </div>

                            {/* File Upload Section */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">{t('plan_attachment')}</label>
                                {session.attachment_url ? (
                                    <div className={`flex items-center justify-between p-3 bg-[#F9F9F6] border-2 border-gray-100 rounded-xl ${rtl ? 'flex-row-reverse' : ''}`}>
                                        <div className={`flex items-center gap-3 ${rtl ? 'flex-row-reverse' : ''}`}>
                                            <div className="bg-white p-2 border border-gray-100 rounded-lg shadow-sm">
                                                <FileIcon size={20} className="text-gray-500" />
                                            </div>
                                            <a href={session.attachment_url} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-green-600 hover:underline line-clamp-1">
                                                {language === 'ar' ? 'عرض المستند المرفق' : language === 'en' ? 'View attachment' : 'Voir le document joint'}
                                            </a>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:bg-[#F9F9F6] transition-colors group"
                                    >
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept=".pdf,.jpg,.jpeg,.png,.docx"
                                            onChange={handleFileUpload}
                                        />
                                        <div className="w-12 h-12 bg-white border border-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:shadow group-hover:-translate-y-1 transition-all">
                                            {isUploading ? <Loader2 size={20} className="text-green-500 animate-spin" /> : <Upload size={20} className="text-gray-400 group-hover:text-green-500 transition-colors" />}
                                        </div>
                                        <p className="text-sm font-bold text-gray-700">{t('plan_upload_click')}</p>
                                        <p className="text-xs text-gray-400 mt-1">{t('plan_upload_info')}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions (Only for active sessions in this_week) */}
                {viewMode === 'this_week' && session && (
                    <div className="p-6 border-t border-gray-100 bg-[#F9F9F6]/50">
                        <div className="flex flex-col gap-3">
                            {/* Attendance shortcut */}
                            <button
                                onClick={() => { onClose(); router.push(`/sessions/${session.id}/attendance`) }}
                                className={`w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-2xl transition-colors shadow-sm flex items-center justify-center gap-2 ${rtl ? 'flex-row-reverse' : ''}`}
                            >
                                <ClipboardList size={18} />
                                {t('plan_btn_attendance')} {rtl ? '←' : '→'}
                            </button>

                            <button
                                onClick={handleSaveDetails}
                                disabled={loading}
                                className={`w-full bg-gray-900 hover:bg-black text-white font-bold py-3.5 rounded-2xl transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 ${rtl ? 'flex-row-reverse' : ''}`}
                            >
                                {loading && <Loader2 size={18} className="animate-spin" />}
                                {t('plan_btn_save')}
                            </button>

                            <div className={`flex gap-3 ${rtl ? 'flex-row-reverse' : ''}`}>
                                {session.status === 'planned' && (
                                    <button
                                        onClick={() => handleUpdateStatus('in_progress')}
                                        disabled={loading}
                                        className={`flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3.5 rounded-2xl transition-colors shadow-sm flex justify-center items-center gap-2 ${rtl ? 'flex-row-reverse' : ''}`}
                                    >
                                        <Play size={18} fill="currentColor" />
                                        {t('plan_btn_start')}
                                    </button>
                                )}

                                {session.status !== 'cancelled' && session.status !== 'done' && (
                                    <button
                                        onClick={() => handleUpdateStatus('cancelled')}
                                        disabled={loading}
                                        className={`flex-1 bg-white hover:bg-red-50 text-red-500 border border-gray-200 hover:border-red-200 font-bold py-3.5 rounded-2xl transition-all shadow-sm flex justify-center items-center gap-2 ${rtl ? 'flex-row-reverse' : ''}`}
                                    >
                                        <Ban size={18} />
                                        {t('plan_status_cancelled')}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
