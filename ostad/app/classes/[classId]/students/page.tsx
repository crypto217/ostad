import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Users, BarChart2 } from 'lucide-react'
import Navigation from '@/components/layout/Navigation'
import StudentCard from '@/components/students/StudentCard'
import AddStudentModal from '@/components/students/AddStudentModal'
import EditStudentModal from '@/components/students/EditStudentModal'
import BackButton from '@/components/layout/BackButton'
import { translations, Language } from '@/lib/i18n/translations'

export interface StudentItem {
    id: string
    first_name: string
    last_name: string
    gender: 'Garçon' | 'Fille'
    birth_date: string
    class_id: string
}

async function getProfileLanguage() {
    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll() },
                setAll() { },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return "fr";

    const { data: profile } = await supabase
        .from("profiles")
        .select("preferred_language")
        .eq("id", user.id)
        .single();

    return (profile?.preferred_language as Language) || "fr";
}

export default async function StudentsPage({ params, searchParams }: { params: Promise<{ classId: string }>, searchParams: Promise<{ new?: string, edit?: string }> }) {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    const cookieStore = await cookies()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
            getAll() { return cookieStore.getAll() },
            setAll() { },
        },
    })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const language = await getProfileLanguage()
    const t = (key: string) => {
        const keys = key.split('.')
        let result: any = translations[language]
        for (const k of keys) {
            if (result && result[k]) {
                result = result[k]
            } else {
                return key
            }
        }
        return result || key
    }
    const rtl = language === 'ar'

    // Fetch class details
    const { data: classData } = await supabase
        .from('classes')
        .select('*')
        .eq('id', resolvedParams.classId)
        .eq('teacher_id', user.id)
        .single()

    if (!classData) redirect('/classes')

    // Fetch students
    const { data: studentsData } = await supabase
        .from('students')
        .select('*')
        .eq('class_id', resolvedParams.classId)
        .order('last_name', { ascending: true })

    const students = (studentsData as unknown as StudentItem[]) || []

    const isCreating = resolvedSearchParams.new === '1'
    const studentToEdit = resolvedSearchParams.edit ? students.find(s => s.id === resolvedSearchParams.edit) : null

    return (
        <div className={`min-h-screen bg-[#F9F9F6] pb-24 md:pb-0 font-sans selection:bg-green-100 selection:text-green-900 transition-all ${rtl ? 'md:pr-[220px] xl:pr-[260px] md:pl-0' : 'md:pl-[220px] xl:pl-[260px]'}`}>
            <div className={`container mx-auto px-6 pt-12 md:p-8 lg:p-12 xl:p-12 ${rtl ? 'text-right' : ''}`}>
                <BackButton />
                {/* Header */}
                <div className={`flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 ${rtl ? 'md:flex-row-reverse' : ''}`}>
                    <div className={`flex items-center gap-4 ${rtl ? 'flex-row-reverse' : ''}`}>
                        <Link
                            href="/classes"
                            className="w-11 h-11 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors shadow-sm shrink-0"
                        >
                            <ArrowLeft size={20} className={rtl ? 'rotate-180' : ''} />
                        </Link>
                        <div>
                            <h1 className={`text-2xl md:text-3xl font-bold text-gray-900 flex flex-wrap items-center gap-3 ${rtl ? 'flex-row-reverse' : ''}`}>
                                {classData.class_name}
                                <span className="bg-green-50 text-green-600 text-[11px] font-bold px-3 py-1.5 rounded-full border border-green-100 uppercase tracking-widest shrink-0">
                                    {students.length} {students.length > 1 ? t('students_count_plural') : t('students_count_singular')} {t('students_total_suffix')}
                                </span>
                            </h1>
                        </div>
                    </div>

                    <div className={`flex items-center gap-3 ${rtl ? 'flex-row-reverse' : ''}`}>
                        <Link
                            href={`/classes/${resolvedParams.classId}/grades`}
                            className="flex items-center justify-center gap-2 px-5 py-3 bg-blue-500 text-white font-bold rounded-2xl shadow-sm hover:bg-blue-600 transition-all active:scale-95 text-sm shrink-0"
                        >
                            <BarChart2 size={18} />
                            <span>{t('students_view_grades')}</span>
                        </Link>
                        <Link
                            href={`/classes/${resolvedParams.classId}/students?new=1`}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white font-bold rounded-3xl shadow-sm hover:bg-green-600 transition-all active:scale-95 text-sm shrink-0"
                        >
                            <Plus size={20} className="stroke-[3]" />
                            <span>{t('students_add_button')}</span>
                        </Link>
                    </div>
                </div>

                {/* Content */}
                {students.length === 0 ? (
                    <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 shadow-sm max-w-lg mx-auto mt-12">
                        <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-gray-400">
                            <Users size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{t('students_empty_title')}</h3>
                        <p className="text-sm font-medium text-gray-500 mb-8 leading-relaxed">
                            {t('students_empty_subtitle').replace('{className}', classData.class_name)}
                        </p>
                        <Link
                            href={`/classes/${resolvedParams.classId}/students?new=1`}
                            className="inline-flex items-center justify-center px-6 py-3 bg-green-500 text-white rounded-3xl font-bold hover:bg-green-600 transition-colors shadow-sm text-sm"
                        >
                            {t('students_add_first')}
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <table className={`w-full text-left border-collapse ${rtl ? 'text-right' : ''}`}>
                                <thead>
                                    <tr className={`bg-gray-50/80 border-b border-gray-100 text-[10px] uppercase tracking-widest text-gray-500 font-bold ${rtl ? 'flex-row-reverse' : ''}`}>
                                        <th className={`px-6 py-4 ${rtl ? 'rounded-tr-2xl' : 'rounded-tl-2xl'}`}>{t('students_table_name')}</th>
                                        <th className="px-6 py-4">{t('students_table_gender')}</th>
                                        <th className="px-6 py-4">{t('students_table_dob')}</th>
                                        <th className={`px-6 py-4 ${rtl ? 'text-left rounded-tl-2xl' : 'text-right rounded-tr-2xl'}`}>{t('students_table_actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map(student => (
                                        <StudentCard key={student.id} student={student} view="desktop" />
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile List View */}
                        <div className="md:hidden space-y-4">
                            {students.map(student => (
                                <StudentCard key={student.id} student={student} view="mobile" />
                            ))}
                        </div>
                    </>
                )}
            </div>

            <Navigation />

            {/* Modals triggered by query params */}
            {isCreating && <AddStudentModal classId={resolvedParams.classId} />}
            {studentToEdit && <EditStudentModal student={studentToEdit} />}
        </div>
    )
}
