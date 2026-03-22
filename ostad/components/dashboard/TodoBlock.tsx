'use client'

import { useState } from 'react'
import { Plus, CheckCircle2, Circle } from 'lucide-react'
import { createTodo, toggleTodo } from '@/app/actions'


/**
 * Todo Interface - Strictly typed to avoid 'any'.
 */
export interface Todo {
    id: string
    task: string
    is_completed: boolean
}

interface TodoBlockProps {
    initialTodos: Todo[]
}

type TabType = 'all' | 'to_correct' | 'general'

/**
 * TodoBlock Component - 'Kinetic Classroom' task management.
 * Adheres to the Stitch no-border rule and uses high-impact Inter-black typography.
 */
export default function TodoBlock({ initialTodos }: TodoBlockProps) {
    const [todos, setTodos] = useState<Todo[]>(initialTodos)
    const [newTask, setNewTask] = useState('')
    const [isAdding, setIsAdding] = useState(false)
    const [activeTab, setActiveTab] = useState<TabType>('all')

    const totalTasks = todos.length
    const completedTasks = todos.filter(t => t.is_completed).length
    const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

    const handleToggleTodo = async (id: string, currentStatus: boolean) => {
        const newStatus = !currentStatus
        // Optimistic UI updates
        setTodos(prev => prev.map(t => t.id === id ? { ...t, is_completed: newStatus } : t))

        // DB Update via Server Action
        const response = await toggleTodo(id, newStatus)

        if (response?.error) {
            // Revert on error
            setTodos(prev => prev.map(t => t.id === id ? { ...t, is_completed: currentStatus } : t))
            console.error('Error updating todo:', response.error)
        }
    }

    const addTodo = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newTask.trim() || isAdding) return

        setIsAdding(true)
        const tempId = crypto.randomUUID()
        const newTodoItem: Todo = { id: tempId, task: newTask, is_completed: false }

        // Optimistic UI
        setTodos(prev => [newTodoItem, ...prev])
        const currentTaskText = newTask
        setNewTask('')

        // DB Insert via Server Action
        const response = await createTodo(currentTaskText)

        if (response?.error) {
            console.error('Error adding todo:', response.error)
            setTodos(prev => prev.filter(t => t.id !== tempId)) // Revert
            setNewTask(currentTaskText) // Restore input
        } else if (response?.data) {
            // Replace temp ID with real ID from database
            const realId = (response.data as { id: string }).id
            setTodos(current => current.map(t => t.id === tempId ? { ...t, id: realId } : t))
        }

        setIsAdding(false)
    }

    const filteredTodos = todos.filter(todo => {
        const isToCorrect = todo.task.toLowerCase().includes('corriger') || todo.task.toLowerCase().includes('correction')
        if (activeTab === 'to_correct') return isToCorrect
        if (activeTab === 'general') return !isToCorrect
        return true
    })



    return (
        <div className="bg-white rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 md:p-10 flex flex-col h-full min-h-[600px] transition-all relative overflow-hidden w-full">
            {/* Header with Kinetic Summary */}
            <div className="flex justify-between items-start mb-8 z-10">
                <div className="flex flex-col">
                    <h3 className="text-base font-bold text-gray-900 tracking-tight leading-none">
                        Mes tâches
                    </h3>
                    <div className="flex items-center gap-2 mt-3 bg-gray-50 w-fit px-3 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs text-gray-400 font-normal tracking-widest">
                            {completedTasks}/{totalTasks} terminées
                        </span>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => document.getElementById('todo-input')?.focus()}
                    className="bg-[#FB923C] hover:bg-orange-500 text-white w-14 h-14 flex items-center justify-center rounded-2xl transition-all shadow-[0_8px_20px_-4px_rgba(251,146,60,0.5)] active:scale-90 hover:rotate-90 duration-300"
                >
                    <Plus size={32} strokeWidth={4} />
                </button>
            </div>

            {/* Sub-Header Progress Bar (Stitch Style) */}
            <div className="mb-10 z-10">
                <div className="h-4 bg-gray-50 rounded-2xl w-full overflow-hidden shadow-inner p-1">
                    <div
                        className="h-full bg-gradient-to-r from-[#22C55E] to-[#4ADE80] rounded-xl transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(34,197,94,0.3)]"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
            </div>

            {/* Dynamic Filter Tabs */}
            <div className="flex gap-2 flex-wrap mt-3 z-10 mb-10">
                {[
                    { id: 'all', label: 'Tout', emoji: '📋' },
                    { id: 'to_correct', label: 'À corriger', emoji: '📝' },
                    { id: 'general', label: 'Général', emoji: '📁' }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as TabType)}
                        className={`px-6 py-3.5 rounded-2xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2.5 ${activeTab === tab.id
                            ? 'bg-gray-900 text-white shadow-xl scale-105'
                            : 'bg-gray-50 text-gray-400 border-none hover:bg-gray-100'
                            }`}
                    >
                        <span className="text-lg opacity-90">{tab.emoji}</span> {tab.label}
                    </button>
                ))}
            </div>

            {/* Task List (Borderless Stacking) */}
            <div className="flex-1 space-y-4 overflow-y-auto pr-2 -mr-2 custom-scrollbar min-h-0 z-10">
                {filteredTodos.length === 0 ? (
                    <div className="text-center bg-gray-50/50 rounded-[2.5rem] py-20 border-none">
                        <div className="text-5xl mb-4 opacity-40">✨</div>
                        <p className="text-gray-300 text-lg font-black tracking-widest">Aucune tâche en attente !</p>
                    </div>
                ) : (
                    filteredTodos.map(todo => {
                        const isToCorrect = todo.task.toLowerCase().includes('corriger') || todo.task.toLowerCase().includes('correction')
                        return (
                            <div
                                key={todo.id}
                                onClick={() => handleToggleTodo(todo.id, todo.is_completed)}
                                className="flex items-center gap-6 py-6 px-7 rounded-[2rem] bg-gray-50/50 hover:bg-white hover:shadow-[0_12px_30px_rgba(0,0,0,0.04)] cursor-pointer transition-all active:scale-[0.98] group relative border-none"
                            >
                                <div className="shrink-0">
                                    {todo.is_completed ? (
                                        <div className="w-8 h-8 rounded-full bg-[#22C55E] flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110">
                                            <CheckCircle2 size={20} strokeWidth={3.5} />
                                        </div>
                                    ) : (
                                        <div className="w-8 h-8 rounded-full border-[3px] border-gray-200 flex items-center justify-center bg-white transition-all group-hover:border-[#22C55E] group-hover:bg-green-50 shadow-sm" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
                                    <span className={`text-sm font-normal truncate leading-tight transition-all duration-300 ${todo.is_completed ? 'line-through text-gray-200 opacity-60' : 'text-gray-700'
                                        }`}>
                                        {todo.task}
                                    </span>
                                    {isToCorrect && (
                                        <span className="shrink-0 bg-pink-50 text-pink-500 rounded-xl px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] shadow-sm">
                                            Correction
                                        </span>
                                    )}
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {/* Precision Input (Kinetic Foundation) */}
            <form onSubmit={addTodo} className="mt-8 z-10">
                <div className="relative group">
                    <input
                        id="todo-input"
                        type="text"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        placeholder="Nouvelle tâche..."
                        className="w-full bg-gray-50 border-none focus:bg-white focus:shadow-[0_20px_40px_rgba(34,197,94,0.08)] focus:ring-4 focus:ring-green-500/5 rounded-[2rem] px-8 py-6 text-lg font-black transition-all outline-none text-gray-800 placeholder:text-gray-300"
                        disabled={isAdding}
                        autoComplete="off"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl group-focus-within:animate-bounce transition-all opacity-40 group-focus-within:opacity-100">
                        ✍️
                    </div>
                </div>
            </form>

            {/* Custom Styles Preserved and Enhanced */}
            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 20px; }
                .rtl { direction: rtl; }
            `}</style>
        </div>
    )
}
