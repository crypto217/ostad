'use client'

import { useState } from 'react'
import { Plus, Circle } from 'lucide-react'
import { createTodo, toggleTodo } from '@/app/actions'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface Todo {
    id: string
    task: string
    is_completed: boolean
}

interface TodoBlockProps {
    initialTodos: Todo[]
}

export default function TodoBlock({ initialTodos }: TodoBlockProps) {
    const { t } = useLanguage()
    const [todos, setTodos] = useState<Todo[]>(initialTodos)
    const [newTask, setNewTask] = useState('')
    const [isAdding, setIsAdding] = useState(false)

    const handleToggleTodo = async (id: string, currentStatus: boolean) => {
        // Optimistic UI updates
        const newStatus = !currentStatus
        setTodos(todos.map(t => t.id === id ? { ...t, is_completed: newStatus } : t))

        // DB Update via Server Action
        const response = await toggleTodo(id, newStatus)

        if (response?.error) {
            // Revert on error
            setTodos(todos.map(t => t.id === id ? { ...t, is_completed: currentStatus } : t))
            console.error('Error updating todo:', response.error)
            alert(t('common_error'))
        }
    }

    const addTodo = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newTask.trim() || isAdding) return

        setIsAdding(true)

        const tempId = crypto.randomUUID()
        const newTodoItem = { id: tempId, task: newTask, is_completed: false }

        // Optimistic UI
        setTodos([newTodoItem, ...todos].slice(0, 3)) // Keep max 3 shown
        const currentTaskText = newTask
        setNewTask('')

        // DB Insert via Server Action
        const response = await createTodo(currentTaskText)

        if (response?.error) {
            console.error('Error adding todo:', response.error)
            setTodos(todos.filter(t => t.id !== tempId)) // Revert
            setNewTask(currentTaskText) // Restore input
            alert(t('common_error'))
        } else if (response?.data) {
            // Replace temp ID with real ID
            setTodos(current => current.map(t => t.id === tempId ? { ...t, id: response.data.id } : t))
        }

        setIsAdding(false)
    }

    // Filter out completed tasks and limit to 3 for the dashboard view
    const activeTodos = todos.filter(t => !t.is_completed).slice(0, 3)

    return (
        <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-100 mb-8">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 tracking-tight">{t('dash_todo_title')}</h3>
                <button className="text-sm font-bold text-green-500 hover:text-green-600 transition-colors">{t('dash_todo_see_all')}</button>
            </div>

            <form onSubmit={addTodo} className="flex gap-3 mb-6">
                <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder={t('dash_todo_placeholder')}
                    className="flex-1 bg-gray-50 border border-transparent focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10 rounded-2xl px-5 h-12 text-base font-medium transition-all outline-none"
                />
                <button
                    type="submit"
                    disabled={isAdding || !newTask.trim()}
                    className="bg-green-500 hover:bg-green-600 text-white w-12 h-12 flex items-center justify-center rounded-2xl transition-all disabled:opacity-50 disabled:hover:bg-green-500 shadow-sm shrink-0"
                >
                    <Plus size={24} strokeWidth={2.5} />
                </button>
            </form>

            <div className="space-y-3">
                {activeTodos.length === 0 ? (
                    <div className="text-center bg-gray-50 rounded-2xl py-8 border border-gray-100 border-dashed">
                        <p className="text-gray-400 text-sm font-medium">{t('dash_todo_empty')}</p>
                    </div>
                ) : (
                    activeTodos.map(todo => (
                        <div
                            key={todo.id}
                            onClick={() => handleToggleTodo(todo.id, todo.is_completed)}
                            className="flex items-center gap-4 py-4 px-5 rounded-xl bg-gray-50/50 hover:bg-gray-100 cursor-pointer transition-all group border border-gray-100/50"
                        >
                            <button className="text-gray-300 group-hover:text-green-500 transition-colors shrink-0">
                                <Circle size={24} strokeWidth={2.5} />
                            </button>
                            <span className="text-gray-700 font-medium text-base select-none truncate leading-relaxed">{todo.task}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
