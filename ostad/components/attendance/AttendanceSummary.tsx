'use client'

type Attendance = {
    id: string
    student_id: string
    status: 'present' | 'late' | 'absent'
    participation_note: string | null
}

export default function AttendanceSummary({
    totalStudents,
    attendances
}: {
    totalStudents: number
    attendances: Attendance[]
}) {
    const presentCount = attendances.filter(a => a.status === 'present').length
    const lateCount = attendances.filter(a => a.status === 'late').length
    const absentCount = attendances.filter(a => a.status === 'absent').length

    // Calculate total treated students (present + late + absent)
    const treatedCount = presentCount + lateCount + absentCount

    // Percentage based on treated students, or total students if considering "not yet treated" as negative? 
    // Usually % is (present + late) / total
    const presenceRate = totalStudents > 0 ? Math.round(((presentCount + lateCount) / totalStudents) * 100) : 0

    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Résumé de l'appel</h3>
                <span className="text-sm font-medium bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                    {treatedCount}/{totalStudents} traités
                </span>
            </div>

            <div className="grid grid-cols-4 gap-4">
                <div className="bg-green-50 rounded-xl p-4 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-green-600">{presentCount}</span>
                    <span className="text-sm font-medium text-green-800">Présents</span>
                </div>

                <div className="bg-yellow-50 rounded-xl p-4 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-yellow-600">{lateCount}</span>
                    <span className="text-sm font-medium text-yellow-800">Retards</span>
                </div>

                <div className="bg-red-50 rounded-xl p-4 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-red-600">{absentCount}</span>
                    <span className="text-sm font-medium text-red-800">Absents</span>
                </div>

                <div className="bg-[#F9F9F6] border border-gray-100 rounded-xl p-4 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900">{presenceRate}%</span>
                    <span className="text-sm font-medium text-gray-500">Taux</span>
                </div>
            </div>
        </div>
    )
}
