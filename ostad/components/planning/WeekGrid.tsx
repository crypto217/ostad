'use client'

import { useState } from 'react'
import SessionDetailModal from './SessionDetailModal'
import AddSlotModal from './AddSlotModal'

const DAYS = [
    { id: 0, name: 'Dimanche' },
    { id: 1, name: 'Lundi' },
    { id: 2, name: 'Mardi' },
    { id: 3, name: 'Mercredi' },
    { id: 4, name: 'Jeudi' },
    { id: 5, name: 'Vendredi' },
    { id: 6, name: 'Samedi' },
]

export default function WeekGrid({ weeklySchedules, courseSessions, classes, weekStart }: any) {
    const [viewMode, setViewMode] = useState<'this_week' | 'template'>('this_week')
    const [selectedSlot, setSelectedSlot] = useState<any>(null)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)

    // Highlight current day
    const today = new Date()
    const currentDayId = today.getDay()

    // Sort schedules chronologically
    const sortedSchedules = [...weeklySchedules].sort((a, b) => a.start_time.localeCompare(b.start_time))

    const handleSlotClick = (schedule: any, session: any, date: Date) => {
        setSelectedSlot({ schedule, session, date })
        setIsDetailModalOpen(true)
    }

    return (
        <div className="space-y-8">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Planning</h1>
                    <p className="text-gray-500 mt-1">Gérez votre emploi du temps et vos séances.</p>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto">
                    {/* View Switcher */}
                    <div className="flex bg-white rounded-2xl shadow-sm p-1 border border-gray-100 w-full sm:w-auto">
                        <button
                            onClick={() => setViewMode('this_week')}
                            className={`flex-1 sm:px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${viewMode === 'this_week' ? 'bg-[#F9F9F6] text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Cette semaine
                        </button>
                        <button
                            onClick={() => setViewMode('template')}
                            className={`flex-1 sm:px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${viewMode === 'template' ? 'bg-[#F9F9F6] text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Grille type
                        </button>
                    </div>

                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="hidden sm:flex bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 px-6 rounded-2xl items-center gap-2 transition-transform active:scale-95 shadow-sm whitespace-nowrap"
                    >
                        <span>+ Ajouter un créneau</span>
                    </button>
                </div>
            </div>

            {/* Desktop Grid View (7 columns) */}
            <div className="hidden lg:grid grid-cols-7 gap-4">
                {DAYS.map(day => {
                    const isToday = day.id === currentDayId && viewMode === 'this_week'
                    const columnDate = new Date(weekStart)
                    columnDate.setDate(columnDate.getDate() + day.id)
                    const daySchedules = sortedSchedules.filter(s => s.day_of_week === day.id)

                    return (
                        <div key={day.id} className={`flex flex-col gap-3 rounded-3xl ${isToday ? 'border-2 border-green-500 bg-green-50 p-2 -m-2' : ''}`}>
                            <div className="text-center mb-2 px-1">
                                <h3 className={`font-bold text-sm ${isToday ? 'text-green-600' : 'text-gray-800'}`}>{day.name}</h3>
                                {viewMode === 'this_week' && (
                                    <p className={`text-xs mt-1 font-medium ${isToday ? 'text-green-500' : 'text-gray-400'}`}>
                                        {columnDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                    </p>
                                )}
                            </div>

                            {daySchedules.length === 0 ? (
                                <div className="text-center text-xs font-medium text-gray-400 py-6 bg-white border-2 border-dashed border-gray-200 rounded-2xl">Libre</div>
                            ) : (
                                daySchedules.map(schedule => {
                                    // Match session logic: Same class, same day, same starting hour/minute or matched by weekly_schedule_id
                                    const session = courseSessions.find((cs: any) =>
                                        cs.weekly_schedule_id === schedule.id ||
                                        (cs.class_id === schedule.class_id &&
                                            new Date(cs.scheduled_time).getDay() === day.id &&
                                            cs.scheduled_time.includes(schedule.start_time.substring(0, 5)))
                                    )

                                    const color = schedule.class?.color_code || '#cbd5e1'
                                    const title = viewMode === 'this_week' && session?.lesson_title ? session.lesson_title : schedule.class?.class_name

                                    return (
                                        <div
                                            key={schedule.id}
                                            onClick={() => handleSlotClick(schedule, session, columnDate)}
                                            style={{ backgroundColor: `${color}08`, borderColor: `${color}30` }}
                                            className="rounded-2xl p-3 border cursor-pointer hover:shadow-md transition-all relative group"
                                        >
                                            <div className="absolute top-3 right-3">
                                                {viewMode === 'this_week' && session && (
                                                    <span className={`w-2.5 h-2.5 rounded-full block border-2 border-white shadow-sm ${session.status === 'planned' ? 'bg-yellow-400' : session.status === 'in_progress' ? 'bg-green-500' : session.status === 'done' ? 'bg-blue-500' : 'bg-red-500'}`}></span>
                                                )}
                                            </div>

                                            <div className="flex flex-col h-full justify-between gap-2">
                                                <div>
                                                    <span className="text-[10px] font-bold text-gray-500 block mb-1">
                                                        {schedule.start_time.substring(0, 5)} - {schedule.end_time.substring(0, 5)}
                                                    </span>
                                                    <h4 className="text-sm font-bold text-gray-900 leading-tight line-clamp-2">{title}</h4>
                                                </div>

                                                {viewMode === 'this_week' && session?.lesson_title && (
                                                    <span className="inline-block self-start text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: color, color: '#fff' }}>
                                                        {schedule.class?.class_name}
                                                    </span>
                                                )}
                                                {viewMode === 'template' && (
                                                    <span className="inline-block self-start text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: color, color: '#fff' }}>
                                                        Template
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

            {/* Mobile List View */}
            <div className="lg:hidden space-y-6">
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-sm"
                >
                    + Ajouter un créneau
                </button>

                {DAYS.map(day => {
                    const daySchedules = sortedSchedules.filter(s => s.day_of_week === day.id)
                    if (daySchedules.length === 0) return null // Hide empty days on mobile

                    const columnDate = new Date(weekStart)
                    columnDate.setDate(columnDate.getDate() + day.id)
                    const isToday = day.id === currentDayId && viewMode === 'this_week'

                    return (
                        <div key={day.id} className={`bg-white rounded-3xl p-5 shadow-sm border ${isToday ? 'border-green-200 ring-4 ring-green-50' : 'border-gray-100'}`}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                                    {day.name}
                                    {isToday && <span className="text-[10px] font-bold bg-green-100 text-green-600 px-2 py-0.5 rounded-full uppercase tracking-wider">Aujourd'hui</span>}
                                </h3>
                                {viewMode === 'this_week' && <span className="text-sm font-medium text-gray-400">{columnDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' })}</span>}
                            </div>

                            <div className="space-y-3">
                                {daySchedules.map(schedule => {
                                    const session = courseSessions.find((cs: any) =>
                                        cs.weekly_schedule_id === schedule.id ||
                                        (cs.class_id === schedule.class_id &&
                                            new Date(cs.scheduled_time).getDay() === day.id &&
                                            cs.scheduled_time.includes(schedule.start_time.substring(0, 5)))
                                    )

                                    const color = schedule.class?.color_code || '#cbd5e1'
                                    const title = viewMode === 'this_week' && session?.lesson_title ? session.lesson_title : schedule.class?.class_name

                                    return (
                                        <div
                                            key={schedule.id}
                                            onClick={() => handleSlotClick(schedule, session, columnDate)}
                                            style={{ backgroundColor: `${color}10`, borderLeftColor: color }}
                                            className="rounded-2xl p-4 border-l-4 cursor-pointer active:scale-[0.98] transition-all"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <span className="text-xs font-bold text-gray-500 block mb-1">
                                                        {schedule.start_time.substring(0, 5)} - {schedule.end_time.substring(0, 5)}
                                                    </span>
                                                    <h4 className="text-base font-bold text-gray-900">{title}</h4>
                                                    {viewMode === 'this_week' && session?.lesson_title && (
                                                        <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: color, color: '#fff' }}>
                                                            {schedule.class?.class_name}
                                                        </span>
                                                    )}
                                                </div>
                                                {viewMode === 'this_week' && session && (
                                                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg border ${session.status === 'planned' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : session.status === 'in_progress' ? 'bg-green-50 border-green-200 text-green-700' : session.status === 'done' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                                                        {session.status}
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
            </div>

            {/* Modals */}
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
