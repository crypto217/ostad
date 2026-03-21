import { Search, Bell, Calendar } from "lucide-react";
import { useState } from "react";

const DashboardHeader = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const today = new Date();
  const formatted = today.toLocaleDateString("fr-DZ", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="flex items-center justify-between gap-4 px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-3xl">📚</span>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            Ostad
          </h1>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-2 bg-card rounded-2xl shadow-playful px-4 py-2.5 flex-1 max-w-md mx-6 border border-border/50">
        <Search className="w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Rechercher un cours, un élève..."
          className="bg-transparent outline-none w-full text-sm font-semibold placeholder:text-muted-foreground/60"
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-card rounded-2xl shadow-playful px-4 py-2.5 border border-border/50">
          <Calendar className="w-4 h-4 text-ostad-blue" />
          <span className="text-sm font-bold capitalize text-foreground/80">{formatted}</span>
        </div>
        <button className="relative bg-card rounded-2xl shadow-playful p-2.5 border border-border/50 transition-all active:shadow-playful-pressed active:translate-y-[2px]">
          <Bell className="w-5 h-5 text-foreground/70" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-ostad-pink rounded-full border-2 border-card" />
        </button>
        <div className="w-10 h-10 rounded-2xl bg-ostad-green shadow-playful flex items-center justify-center text-primary-foreground font-black text-sm border-2 border-primary/20">
          أ
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
