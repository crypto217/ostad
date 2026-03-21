import { useState } from "react";
import { Check, Plus, FileText, BookCheck, X } from "lucide-react";

interface Task {
  id: number;
  text: string;
  done: boolean;
  category: "correction" | "general";
}

const initialTasks: Task[] = [
  { id: 1, text: "Corriger les devoirs de 4AM — Physique", done: false, category: "correction" },
  { id: 2, text: "Préparer l'examen de maths (2AM)", done: false, category: "general" },
  { id: 3, text: "Corriger les compositions — 1AS", done: false, category: "correction" },
  { id: 4, text: "Remplir le cahier de texte", done: true, category: "general" },
  { id: 5, text: "Réunion parents d'élèves 16h", done: false, category: "general" },
];

type Filter = "all" | "correction" | "general";

const TodoList = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [filter, setFilter] = useState<Filter>("all");
  const [newTask, setNewTask] = useState("");
  const [adding, setAdding] = useState(false);

  const toggle = (id: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks((prev) => [
      ...prev,
      { id: Date.now(), text: newTask.trim(), done: false, category: "general" },
    ]);
    setNewTask("");
    setAdding(false);
  };

  const filtered = tasks.filter((t) =>
    filter === "all" ? true : t.category === filter
  );

  const doneCount = tasks.filter((t) => t.done).length;

  const filters: { key: Filter; label: string; icon: React.ReactNode }[] = [
    { key: "all", label: "Tout", icon: <FileText className="w-3.5 h-3.5" /> },
    { key: "correction", label: "À corriger", icon: <BookCheck className="w-3.5 h-3.5" /> },
    { key: "general", label: "Général", icon: <FileText className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="bg-card rounded-3xl shadow-playful border border-border/50 p-5 animate-slide-up" style={{ animationDelay: "100ms" }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-black text-foreground">Mes tâches</h3>
          <p className="text-xs font-semibold text-muted-foreground">
            {doneCount}/{tasks.length} terminées
          </p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="bg-ostad-yellow rounded-xl p-2 shadow-playful text-secondary-foreground transition-all active:shadow-playful-pressed active:translate-y-[2px]"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2.5 bg-muted rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-ostad-green rounded-full transition-all duration-500"
          style={{ width: `${tasks.length ? (doneCount / tasks.length) * 100 : 0}%` }}
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-[0.97] ${
              filter === f.key
                ? "bg-foreground text-background shadow-playful"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {f.icon}
            {f.label}
          </button>
        ))}
      </div>

      {/* Add task inline */}
      {adding && (
        <div className="flex items-center gap-2 mb-3 animate-bounce-in">
          <input
            autoFocus
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            placeholder="Nouvelle tâche..."
            className="flex-1 bg-muted rounded-xl px-3 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-ring"
          />
          <button onClick={addTask} className="bg-ostad-green text-primary-foreground rounded-xl p-2 active:scale-95">
            <Check className="w-4 h-4" />
          </button>
          <button onClick={() => { setAdding(false); setNewTask(""); }} className="bg-muted text-muted-foreground rounded-xl p-2 active:scale-95">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tasks */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {filtered.map((task) => (
          <button
            key={task.id}
            onClick={() => toggle(task.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all active:scale-[0.98] ${
              task.done ? "bg-muted/50" : "bg-muted/80 hover:bg-muted"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                task.done
                  ? "bg-ostad-green border-ostad-green"
                  : "border-border"
              }`}
            >
              {task.done && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
            </div>
            <span
              className={`text-sm font-semibold flex-1 ${
                task.done ? "line-through text-muted-foreground" : "text-foreground"
              }`}
            >
              {task.text}
            </span>
            {task.category === "correction" && (
              <span className="bg-ostad-pink/15 text-ostad-pink text-[10px] font-bold px-2 py-0.5 rounded-lg">
                Correction
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TodoList;
