'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, Users, GraduationCap, Settings, ClipboardList, BarChart2 } from 'lucide-react'

export default function Navigation() {
    const pathname = usePathname()

    const navItems = [
        { name: 'Dashboard', href: '/dashboard', icon: Home },
        { name: 'Planning', href: '/planning', icon: Calendar },
        { name: 'Classes', href: '/classes', icon: Users },
        { name: 'Élèves', href: '/eleves', icon: GraduationCap },
        { name: 'Paramètres', href: '/settings', icon: Settings },
    ]

    const quickLinks = [
        { name: 'Journal d\'appel', href: '/sessions', icon: ClipboardList },
        { name: 'Notes', href: '/classes', icon: BarChart2 },
    ]

    return (
        <>
            {/* Mobile Bottom Navigation (< 768px) */}
            <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 pb-safe z-50">
                <div className="flex justify-between items-center max-w-xl mx-auto px-6 pt-3 pb-3">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        const Icon = item.icon
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center gap-1.5 min-w-[64px] transition-colors ${isActive ? 'text-green-500' : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                                <span className={`text-[10px] font-medium tracking-wide ${isActive ? 'font-bold' : ''}`}>
                                    {item.name}
                                </span>
                            </Link>
                        )
                    })}
                </div>
            </nav>

            {/* Tablet & Desktop Sidebar (>= 768px) */}
            <aside className="hidden md:flex flex-col fixed top-0 left-0 h-screen w-[220px] xl:w-[260px] bg-white border-r border-gray-100 z-50 py-8 px-6">
                <div className="mb-12 flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                        O
                    </div>
                    <span className="text-2xl font-black tracking-tight text-gray-900">Ostad</span>
                </div>

                <div className="flex flex-col gap-3 flex-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        const Icon = item.icon
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all ${isActive
                                    ? 'bg-green-50 text-green-600 font-bold'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium'
                                    }`}
                            >
                                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                                <span className="text-base tracking-wide">
                                    {item.name}
                                </span>
                            </Link>
                        )
                    })}
                </div>

                {/* Quick Access Section */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-2 mb-2">
                        Accès rapide
                    </p>
                    <div className="flex flex-col gap-1">
                        {quickLinks.map((link) => {
                            const Icon = link.icon
                            const isActive = pathname.startsWith(link.href) && link.href !== '/classes'
                                ? true
                                : pathname === link.href
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-xs font-medium ${isActive
                                            ? 'bg-gray-100 text-gray-700'
                                            : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                                        }`}
                                >
                                    <Icon size={15} strokeWidth={2} />
                                    <span>{link.name}</span>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </aside>
        </>
    )
}
