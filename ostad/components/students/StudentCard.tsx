'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MoreVertical, Edit2, Trash2 } from 'lucide-react'
import { deleteStudent } from '@/app/actions'
import type { StudentItem } from '@/app/classes/[classId]/students/page'

interface StudentCardProps {
    student: StudentItem
    view: 'mobile' | 'desktop'
}

export default function StudentCard({ student, view }: StudentCardProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        setIsMenuOpen(false)
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cet élève ?")) {
            setIsDeleting(true)
            try {
                await deleteStudent(student.id, student.class_id)
            } catch (err) {
                alert("Erreur lors de la suppression.")
                setIsDeleting(false)
            }
        }
    }

    if (isDeleting) return null

    const initials = `${student.first_name.charAt(0)}${student.last_name.charAt(0)}`.toUpperCase()

    const colors = [
        'bg-blue-100 text-blue-600 border-blue-200',
        'bg-green-100 text-green-600 border-green-200',
        'bg-purple-100 text-purple-600 border-purple-200',
        'bg-yellow-100 text-yellow-600 border-yellow-200',
        'bg-orange-100 text-orange-600 border-orange-200',
        'bg-pink-100 text-pink-600 border-pink-200'
    ]
    // Consistently resolve color index based on first name character string
    const colorIndex = student.first_name.charCodeAt(0) % colors.length
    const avatarColor = colors[colorIndex]

    const ActionsMenu = () => (
        <div className="relative">
            <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-400 hover:text-gray-900 transition-colors p-2 rounded-full hover:bg-gray-50"
            >
                <MoreVertical size={20} />
            </button>
            {isMenuOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)} />
                    <div className="absolute right-0 top-10 w-44 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 z-20 overflow-hidden">
                        <Link
                            href={`/classes/${student.class_id}/students?edit=${student.id}`}
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors w-full text-left"
                        >
                            <Edit2 size={16} className="text-gray-400" /> Modifier
                        </Link>
                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors w-full text-left"
                        >
                            <Trash2 size={16} className="text-red-400" /> Supprimer
                        </button>
                    </div>
                </>
            )}
        </div>
    )

    if (view === 'desktop') {
        return (
            <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border shadow-sm ${avatarColor}`}>
                            {initials}
                        </div>
                        <div>
                            <p className="font-bold text-gray-900">{student.last_name.toUpperCase()} {student.first_name}</p>
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-full text-xs font-bold text-gray-600 tracking-wide">
                        {student.gender === 'Garçon' ? '👦' : '👧'} {student.gender}
                    </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                    {new Date(student.date_of_birth).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-6 py-4 text-right">
                    <ActionsMenu />
                </td>
            </tr>
        )
    }

    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between gap-4 relative hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 min-w-0">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-base border-2 border-white shadow-sm shrink-0 ${avatarColor}`}>
                    {initials}
                </div>
                <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1 line-clamp-1">
                        {student.last_name.toUpperCase()} {student.first_name}
                    </h3>
                    <div className="flex items-center gap-3 text-xs font-medium text-gray-500">
                        <span className="flex items-center gap-1">
                            {student.gender === 'Garçon' ? '👦' : '👧'} {student.gender}
                        </span>
                        <span className="bg-gray-300 w-1 h-1 rounded-full shrink-0" />
                        <span>{new Date(student.date_of_birth).toLocaleDateString('fr-FR')}</span>
                    </div>
                </div>
            </div>

            <div className="shrink-0">
                <ActionsMenu />
            </div>
        </div>
    )
}
