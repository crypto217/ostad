'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, Users, GraduationCap, Settings, ClipboardList, BarChart2, LayoutDashboard } from 'lucide-react'


/**
 * Navigation Component - The 'Kinetic Sidebar' for the Ostad SaaS.
 * Follows the Stitch design system: zero 1px borders, high-impact Inter-black (900) typography,
 * and satisfying interactive states.
 */
export default function Navigation() {
    const pathname = usePathname()

    const navItems = [
        { name: "Dashboard", href: '/dashboard', icon: LayoutDashboard },
        { name: "Planning", href: '/planning', icon: Calendar },
        { name: "Classes", href: '/classes', icon: Users },
        { name: "Élèves", href: '/eleves', icon: GraduationCap },
        { name: "Paramètres", href: '/settings', icon: Settings },
    ]

    const quickLinks = [
        { name: "Journal d'appel", href: '/sessions', icon: ClipboardList },
        { name: "Notes", href: '/classes', icon: BarChart2 },
    ]

    return (
        <>
            {/* Mobile Bottom Navigation - Kinetic Micro-UI */}
            <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-xl border-none pb-safe z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] rounded-t-[2.5rem]">
                <div className="flex justify-between items-center max-w-xl mx-auto px-8 pt-4 pb-4">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        const Icon = item.icon
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center gap-2 transition-all duration-300 ${isActive ? 'text-green-500 scale-110' : 'text-gray-300 hover:text-gray-500'}`}
                            >
                                <Icon size={24} strokeWidth={isActive ? 3 : 2.5} />
                                <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-0 scale-50'}`}>
                                    {isActive ? '•' : ''}
                                </span>
                            </Link>
                        )
                    })}
                </div>
            </nav>

            {/* Tablet & Desktop Sidebar - Kinetic Foundation */}
            <aside className="hidden md:flex flex-col fixed top-4 bottom-4 left-4 w-[240px] xl:w-[280px] bg-white rounded-[3rem] z-50 py-12 px-8 shadow-[0_10px_40px_rgba(0,0,0,0.03)] transition-all duration-500">
                {/* Premium Logo Identity */}
                <div className="mb-14 flex items-center gap-4 px-2 select-none group cursor-pointer">
                    <div className="w-12 h-12 bg-[#22C55E] rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-[0_8px_20px_-4px_rgba(34,197,94,0.5)] transition-transform group-hover:rotate-12 duration-300">
                        O
                    </div>
                    <span className="text-lg font-bold tracking-tighter text-gray-900 drop-shadow-sm">Ostad</span>
                </div>

                {/* Main Navigation Stack (Borderless) */}
                <div className="flex flex-col gap-3 flex-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        const Icon = item.icon
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-5 px-6 py-4.5 rounded-[1.5rem] transition-all duration-400 group relative ${isActive
                                    ? 'bg-green-50 text-[#22C55E] shadow-[0_12px_24px_-8px_rgba(34,197,94,0.15)]'
                                    : 'text-gray-300 hover:bg-gray-50 hover:text-gray-600'
                                    }`}
                            >
                                <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:translate-x-1'}`}>
                                    <Icon size={24} strokeWidth={isActive ? 3.5 : 2.5} />
                                </div>
                                <span className={`text-sm ${isActive ? 'font-semibold' : 'font-medium'} tracking-tight leading-none ${isActive ? 'opacity-100' : 'opacity-80'}`}>
                                    {item.name}
                                </span>
                                {isActive && (
                                    <div className="absolute right-4 w-1.5 h-6 bg-[#22C55E] rounded-full shadow-[0_0_12px_rgba(34,197,94,0.5)]" />
                                )}
                            </Link>
                        )
                    })}
                </div>

                {/* Kinetic Shortcuts Section */}
                <div className="mt-8 pt-10 border-none relative">
                    <div className="absolute top-0 left-6 right-6 h-[1px] bg-gray-50" />
                    <p className="text-xs font-medium uppercase tracking-[0.3em] text-gray-200 px-6 mb-6">
                        Accès rapide
                    </p>
                    <div className="flex flex-col gap-3">
                        {quickLinks.map((link) => {
                            const Icon = link.icon
                            const isActive = pathname.startsWith(link.href) && link.href !== '/classes'
                                ? true
                                : pathname === link.href
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`flex items-center gap-5 px-6 py-4 rounded-2xl transition-all duration-300 group ${isActive
                                        ? 'bg-gray-900 text-white shadow-xl'
                                        : 'text-gray-300 hover:bg-gray-50 hover:text-gray-600'
                                        }`}
                                >
                                    <Icon size={20} strokeWidth={isActive ? 3 : 2.5} className={isActive ? 'text-green-400' : ''} />
                                    <span className="text-sm font-medium tracking-tight leading-none uppercase">{link.name}</span>
                                </Link>
                            )
                        })}
                    </div>
                </div>

                {/* Support Badge (Premium Detail) */}
                <div className="mt-auto pt-8">
                    <div className="bg-gray-50 rounded-[2rem] p-5 text-center group cursor-pointer hover:bg-green-50 transition-colors duration-300">
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1 group-hover:text-green-500 transition-colors">v1.2.0</p>
                        <p className="text-xs font-black text-gray-900 uppercase tracking-tighter">Ostad Pro</p>
                    </div>
                </div>
            </aside>
        </>
    )
}
