import { Users, TrendingUp, BookOpen, ArrowRight } from "lucide-react";

interface ClassInfo {
  name: string;
  students: number;
  progress: number;
  color: string;
  emoji: string;
}

const classes: ClassInfo[] = [
  { name: "1ère AM", students: 38, progress: 72, color: "bg-ostad-blue", emoji: "🔬" },
  { name: "2ème AM", students: 35, progress: 58, color: "bg-ostad-yellow", emoji: "📐" },
  { name: "3ème AM", students: 40, progress: 45, color: "bg-ostad-green", emoji: "📊" },
  { name: "4ème AM", students: 36, progress: 31, color: "bg-ostad-pink", emoji: "🧪" },
];

const stats = [
  { label: "Total élèves", value: "149", icon: <Users className="w-5 h-5" />, color: "bg-ostad-blue/15 text-ostad-blue" },
  { label: "Moyenne générale", value: "13.4", icon: <TrendingUp className="w-5 h-5" />, color: "bg-ostad-green/15 text-ostad-green" },
  { label: "Cours planifiés", value: "24", icon: <BookOpen className="w-5 h-5" />, color: "bg-ostad-purple/15 text-ostad-purple" },
];

const ClassOverview = () => {
  return (
    <div className="space-y-5 animate-slide-up" style={{ animationDelay: "200ms" }}>
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-card rounded-2xl shadow-playful border border-border/50 p-4 text-center">
            <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mx-auto mb-2`}>
              {s.icon}
            </div>
            <div className="text-xl font-black text-foreground">{s.value}</div>
            <div className="text-[11px] font-bold text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Classes */}
      <div className="bg-card rounded-3xl shadow-playful border border-border/50 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black text-foreground">Mes classes</h3>
          <button className="text-xs font-bold text-ostad-blue flex items-center gap-1 hover:underline">
            Voir tout <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {classes.map((c) => (
            <button
              key={c.name}
              className="w-full flex items-center gap-3 p-3 rounded-2xl bg-muted/60 hover:bg-muted transition-all active:scale-[0.98] text-left"
            >
              <span className="text-2xl">{c.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-foreground">{c.name}</span>
                  <span className="text-xs font-bold text-muted-foreground">{c.progress}%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${c.color} rounded-full transition-all duration-700`}
                    style={{ width: `${c.progress}%` }}
                  />
                </div>
                <span className="text-[11px] font-semibold text-muted-foreground mt-1 block">
                  {c.students} élèves • Programme scolaire
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClassOverview;
