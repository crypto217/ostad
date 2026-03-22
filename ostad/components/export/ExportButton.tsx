'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { exportGradesToExcel } from '@/lib/export/sheetjs-utils'

interface ExportButtonProps {
    classId: string
    trimester: number
}

export default function ExportButton({ classId, trimester }: ExportButtonProps) {
    const [loading, setLoading] = useState(false)

    const handleExport = async () => {
        try {
            setLoading(true)

            const response = await fetch(`/api/export/grades?classId=${classId}&trimester=${trimester}`)

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Export failed')
            }

            const data = await response.json()

            // Verification size check (simulated based on JSON string length)
            const jsonSize = new Blob([JSON.stringify(data)]).size
            if (jsonSize > 10 * 1024 * 1024) { // 10MB
                alert("Les données sont trop volumineuses pour l'export direct (>10MB).")
                setLoading(false)
                return
            }

            exportGradesToExcel(data)

        } catch (error: any) {
            console.error('Export error:', error)
            alert(`Erreur lors de l'export: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleExport}
            disabled={loading}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-70 text-white rounded-2xl px-4 py-2 font-medium flex items-center gap-2 transition-all shadow-sm active:scale-95"
        >
            {loading ? (
                <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Génération...</span>
                </>
            ) : (
                <>
                    <Download size={18} />
                    <span>Exporter Excel</span>
                </>
            )}
        </button>
    )
}
