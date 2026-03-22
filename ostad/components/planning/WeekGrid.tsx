'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import SessionDetailModal from './SessionDetailModal'
import AddSlotModal from './AddSlotModal'

const DAYS = [
    { id: 0, short: 'Dim', name: 'Dimanche' },
    { id: 1, short: 'Lun', name: 'Lundi' },
    { id: 2, short: 'Mar', name: 'Mardi' },
    { id: 3, short: 'Mer', name: 'Mercredi' },
    { id: 4, short: 'Jeu', name: 'Jeudi' },
    { id: 5, short: 'Ven', name: 'Vendredi' },
    { id: 6, short: 'Sam', name: 'Samedi' },
]

const STATUS_ICONS: Record<string, string> = {
    planned: '🟡',
    in_progress: '🟢',
    done: '✅',
    cancelled: '❌',
}

const STATUS_LABELS: Record<string, string> = {
    planned: 'Planifié',
    in_progress: 'En cours',
    done: 'Terminé',
    cancelled: 'Annulé',
}

function hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
        ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
        : '34, 197, 94'
}

export default function WeekGrid({ weeklySchedules, courseSessions, classes, weekStart }: any) {
    const [viewMode, setViewMode] = useState<'this_week' | 'template'>('this_week')
    const [selectedSlot, setSelectedSlot] = useState<any>(null)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)

    const today = new Date()
    const currentDayId = today.getDay()

    const sortedSchedules = [...weeklySchedules].sort((a, b) => a.start_time.localeCompare(b.start_time))

    const handleSlotClick = (schedule: any, session: any, date: Date) => {
        setSelectedSlot({ schedule, session, date })
        setIsDetailModalOpen(true)
    }

    // Build week date range label
    const weekStartDate = new Date(weekStart)
    const weekEndDate = new Date(weekStart)
    weekEndDate.setDate(weekEndDate.getDate() + 6)
    const weekRangeLabel = `${weekStartDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} — ${weekEndDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`

    return (
        <div className="space-y-6">

            {/* ── Header ─────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Planning</h1>
                    {viewMode === 'this_week' && (
                        <p className="text-sm font-medium text-gray-400 mt-1">Semaine du {weekRangeLabel}</p>
                    )}
                    {viewMode === 'template' && (
                        <p className="text-sm font-medium text-gray-400 mt-1">Grille d'emploi du temps type</p>
                    )}
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* View Switcher */}
                    <div className="flex bg-white rounded-2xl p-1 border border-gray-100 shadow-sm flex-1 sm:flex-none">
                        <button
                            onClick={() => setViewMode('this_week')}
                            className={`flex-1 sm:px-5 py-2 text-sm font-bold rounded-xl transition-all ${viewMode === 'this_week'
                                ? 'bg-green-500 text-white shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Cette semaine
                        </button>
                        <button
                            onClick={() => setViewMode('template')}
                            className={`flex-1 sm:px-5 py-2 text-sm font-bold rounded-xl transition-all ${viewMode === 'template'
                                ? 'bg-green-500 text-white shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Grille type
                        </button>
                    </div>

                    {/* Add Button — desktop */}
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="hidden sm:flex items-center gap-2 bg-green-500 hover:bg-green-600 active:scale-95 text-white font-bold py-2.5 px-5 rounded-2xl transition-all shadow-sm whitespace-nowrap"
                    >
                        <Plus size={18} className="stroke-[3]" />
                        Ajouter un créneau
                    </button>
                </div>
            </div>

            {/* ── Desktop Grid (7 columns) ────────────────────── */}
            <div className="hidden lg:grid grid-cols-7 gap-3">
                {DAYS.map(day => {
                    const isToday = day.id === currentDayId && viewMode === 'this_week'
                    const columnDate = new Date(weekStart)
                    columnDate.setDate(columnDate.getDate() + day.id)
                    const daySchedules = sortedSchedules.filter(s => s.day_of_week === day.id)

                    return (
                        <div key={day.id} className="flex flex-col gap-2">

                            {/* Day header */}
                            <div className="text-center py-2">
                                <p className={`text-xs font-bold uppercase tracking-widest mb-1.5 ${isToday ? 'text-green-500' : 'text-gray-400'}`}>
                                    {day.short}
                                </p>
                                {viewMode === 'this_week' ? (
                                    <span className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-lg font-bold transition-all ${isToday
                                        ? 'bg-green-500 text-white shadow-md'
                                        : 'text-gray-800 hover:bg-gray-100'
                                        }`}>
                                        {columnDate.getDate()}
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold text-gray-400">
                                        {day.name.substring(0, 3)}
                                    </span>
                                )}
                            </div>

                            {/* Slots */}
                            {daySchedules.length === 0 ? (
                                <div
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="min-h-[80px] flex items-center justify-center bg-white border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-green-300 hover:bg-green-50 transition-all group"
                                >
                                    <span className="text-xs font-medium text-gray-300 group-hover:text-green-400 transition-colors">Libre</span>
                                </div>
                            ) : (
                                daySchedules.map(schedule => {
                                    const session = courseSessions.find((cs: any) =>
                                        cs.weekly_schedule_id === schedule.id ||
                                        (cs.class_id === schedule.class_id &&
                                            new Date(cs.scheduled_time).getDay() === day.id &&
                                            cs.scheduled_time.includes(schedule.start_time.substring(0, 5)))
                                    )

                                    const color = schedule.class?.color_code || '#22c55e'
                                    const rgb = hexToRgb(color)
                                    const title = viewMode === 'this_week' && session?.lesson_title
                                        ? session.lesson_title
                                        : schedule.class?.class_name

                                    return (
                                        <div
                                            key={schedule.id}
                                            className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all overflow-hidden"
                                        >
                                            {/* Top color band */}
                                            <div className="h-1.5 w-full" style={{ backgroundColor: color }} />

                                            {/* Delete Button (Hover Only) */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (confirm("Supprimer ce créneau de la grille ? Cela n'affectera pas les séances déjà planifiées.")) {
                                                        import('@/app/actions').then(m => m.deleteWeeklySlot(schedule.id));
                                                    }
                                                }}
                                                className="absolute top-2 right-2 w-5 h-5 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-200"
                                                title="Supprimer"
                                            >
                                                ✕
                                            </button>

                                            <div onClick={() => handleSlotClick(schedule, session, columnDate)} className="p-3 flex flex-col gap-1.5">
                                                {/* Class badge */}
                                                <span
                                                    className="self-start text-[10px] font-bold px-2 py-0.5 rounded-full"
                                                    style={{
                                                        backgroundColor: `rgba(${rgb}, 0.12)`,
                                                        color: color,
                                                    }}
                                                >
                                                    {schedule.class?.class_name}
                                                </span>

                                                {/* Time */}
                                                <span className="text-[10px] font-medium text-gray-400">
                                                    {schedule.start_time.substring(0, 5)} – {schedule.end_time.substring(0, 5)}
                                                </span>

                                                {/* Title */}
                                                <h4 className="text-sm font-bold text-gray-800 leading-tight line-clamp-2">{title}</h4>

                                                {/* Status */}
                                                {viewMode === 'this_week' && session && (
                                                    <span className="text-[10px] font-medium text-gray-500 mt-0.5">
                                                        {STATUS_ICONS[session.status] || '🟡'} {STATUS_LABELS[session.status] || session.status}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    )
                })}
            </div>

            {/* ── Mobile List View ─────────────────────────────── */}
            <div className="lg:hidden space-y-4">
                {/* Add Button — mobile */}
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 active:scale-95 text-white font-bold py-3.5 px-6 rounded-2xl transition-all shadow-sm"
                >
                    <Plus size={18} className="stroke-[3]" />
                    Ajouter un créneau
                </button>

                {DAYS.map(day => {
                    const daySchedules = sortedSchedules.filter(s => s.day_of_week === day.id)
                    if (daySchedules.length === 0) return null

                    const columnDate = new Date(weekStart)
                    columnDate.setDate(columnDate.getDate() + day.id)
                    const isToday = day.id === currentDayId && viewMode === 'this_week'

                    return (
                        <div
                            key={day.id}
                            className={`bg-white rounded-2xl shadow-sm border overflow-hidden ${isToday ? 'border-green-200 ring-2 ring-green-100' : 'border-gray-100'}`}
                        >
                            {/* Section header */}
                            <div className={`px-5 py-3 flex items-center justify-between border-b ${isToday ? 'bg-green-50 border-green-100' : 'bg-gray-50/60 border-gray-100'}`}>
                                <div className="flex items-center gap-2">
                                    <h3 className={`font-bold text-base ${isToday ? 'text-green-700' : 'text-gray-800'}`}>
                                        {day.name}
                                    </h3>
                                    {isToday && (
                                        <span className="text-[10px] font-bold bg-green-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                                            Aujourd'hui
                                        </span>
                                    )}
                                </div>
                                {viewMode === 'this_week' && (
                                    <span className="text-sm font-medium text-gray-400">
                                        {columnDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                                    </span>
                                )}
                            </div>

                            {/* Slot list */}
                            <div className="divide-y divide-gray-50">
                                {daySchedules.map(schedule => {
                                    const session = courseSessions.find((cs: any) =>
                                        cs.weekly_schedule_id === schedule.id ||
                                        (cs.class_id === schedule.class_id &&
                                            new Date(cs.scheduled_time).getDay() === day.id &&
                                            cs.scheduled_time.includes(schedule.start_time.substring(0, 5)))
                                    )

                                    const color = schedule.class?.color_code || '#22c55e'
                                    const rgb = hexToRgb(color)
                                    const title = viewMode === 'this_week' && session?.lesson_title
                                        ? session.lesson_title
                                        : schedule.class?.class_name

                                    return (
                                        <div
                                            key={schedule.id}
                                            className="group relative flex items-stretch gap-0 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors"
                                        >
                                            {/* Left color strip */}
                                            <div className="w-1 shrink-0" style={{ backgroundColor: color }} />

                                            {/* Delete Button (Hover Only) */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (confirm("Supprimer ce créneau de la grille ? Cela n'affectera pas les séances déjà planifiées.")) {
                                                        import('@/app/actions').then(m => m.deleteWeeklySlot(schedule.id));
                                                    }
                                                }}
                                                className="absolute top-2 right-2 w-5 h-5 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-200"
                                                title="Supprimer"
                                            >
                                                ✕
                                            </button>

                                            <div onClick={() => handleSlotClick(schedule, session, columnDate)} className="flex items-center justify-between flex-1 px-4 py-3.5 gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <span
                                                        className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-1"
                                                        style={{
                                                            backgroundColor: `rgba(${rgb}, 0.12)`,
                                                            color: color,
                                                        }}
                                                    >
                                                        {schedule.class?.class_name}
                                                    </span>
                                                    <p className="font-bold text-gray-800 text-sm leading-tight truncate">{title}</p>
                                                    <p className="text-xs text-gray-400 font-medium mt-0.5">
                                                        {schedule.start_time.substring(0, 5)} – {schedule.end_time.substring(0, 5)}
                                                    </p>
                                                </div>

                                                {viewMode === 'this_week' && session && (
                                                    <span className="text-lg shrink-0">
                                                        {STATUS_ICONS[session.status] || '🟡'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}

                {/* Empty state */}
                {sortedSchedules.length === 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
                        <p className="text-4xl mb-3">📅</p>
                        <h3 className="font-bold text-gray-800 text-lg mb-1">Aucun créneau</h3>
                        <p className="text-sm text-gray-400">Commencez par ajouter un créneau à votre planning.</p>
                    </div>
                )}
            </div>

            {/* ── Modals ─────────────────────────────────────── */}
            <AddSlotModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                classes={classes}
            />

            {selectedSlot && (
                <SessionDetailModal
                    isOpen={isDetailModalOpen}
                    onClose={() => setIsDetailModalOpen(false)}
                    schedule={selectedSlot.schedule}
                    session={selectedSlot.session}
                    date={selectedSlot.date}
                    viewMode={viewMode}
                />
            )}
        </div>
    )
}
