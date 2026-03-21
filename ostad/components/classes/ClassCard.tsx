'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MoreVertical, Edit2, Trash2, Users } from 'lucide-react'
import { deleteClass } from '@/app/actions'
import type { ClassItem } from '@/app/classes/page'

interface ClassCardProps {
    classItem: ClassItem
}

export default function ClassCard({ classItem }: ClassCardProps) {
    const router = useRouter()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const count = classItem.students?.[0]?.count || 0

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsMenuOpen(false)

        if (window.confirm("Êtes-vous sûr ? Cette action supprimera aussi tous les élèves et données associées.")) {
            setIsDeleting(true) // Optimistic hide
            try {
                await deleteClass(classItem.id)
            } catch (err) {
                alert("Erreur lors de la suppression de la classe.")
                setIsDeleting(false) // Revert on error
            }
        }
    }

    if (isDeleting) return null

    return (
        <div
            onClick={() => router.push(`/classes/${classItem.id}/students`)}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md hover:border-gray-200 transition-all relative flex flex-col h-[180px]"
        >
            {/* Color band */}
            <div className="h-3 w-full shrink-0" style={{ backgroundColor: classItem.color_code }} />

            <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-4">
                    <span className="bg-gray-50 text-gray-600 text-[10px] font-bold px-3 py-1.5 rounded-full border border-gray-100 uppercase tracking-widest">
                        {classItem.cycle}
                    </span>

                    <div className="relative">
                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsMenuOpen(!isMenuOpen) }}
                            className="text-gray-400 hover:text-gray-900 transition-colors p-1 rounded-full hover:bg-gray-50"
                        >
                            <MoreVertical size={20} />
                        </button>

                        {isMenuOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsMenuOpen(false) }}
                                />
                                <div
                                    className="absolute right-0 top-8 w-44 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 z-20 overflow-hidden"
                                    onClick={e => { e.preventDefault(); e.stopPropagation() }}
                                >
                                    <Link
                                        href={`/classes?edit=${classItem.id}`}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 w-full text-left transition-colors"
                                    >
                                        <Edit2 size={16} className="text-gray-400" /> Modifier
                                    </Link>
                                    <button
                                        onClick={handleDelete}
                                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 w-full text-left transition-colors"
                                    >
                                        <Trash2 size={16} className="text-red-400" /> Supprimer
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <h3 className="font-bold text-xl text-gray-900 line-clamp-1 mb-auto" title={classItem.class_name}>
                    {classItem.class_name}
                </h3>

                <div className="mt-4 flex items-center gap-2 text-gray-500 font-medium text-sm">
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 shrink-0">
                        <Users size={16} className="text-gray-400" />
                    </div>
                    <span>{count} {count > 1 ? 'élèves' : 'élève'}</span>
                </div>
            </div>
        </div>
    )
}
