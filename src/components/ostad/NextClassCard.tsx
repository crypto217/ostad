import { Clock, BookOpen, Users } from "lucide-react";
import { useEffect, useState } from "react";

const NextClassCard = () => {
  const [countdown, setCountdown] = useState(15 * 60); // 15 mins in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const mins = Math.floor(countdown / 60);
  const secs = countdown % 60;

  return (
    <div className="animate-bounce-in">
      <div className="bg-ostad-green rounded-3xl p-6 md:p-8 shadow-playful-lg relative overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-primary-foreground/10" />
        <div className="absolute bottom-4 right-16 w-12 h-12 rounded-2xl bg-primary-foreground/10 rotate-12" />
        <div className="absolute -bottom-2 -left-2 w-16 h-16 rounded-full bg-primary-foreground/5" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 bg-primary-foreground/20 rounded-xl px-3 py-1.5 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-primary-foreground animate-pulse-soft" />
              <span className="text-sm font-bold text-primary-foreground">Prochain cours</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-primary-foreground mb-2 leading-tight">
              Mathématiques — Algèbre
            </h2>

            <div className="flex flex-wrap items-center gap-4 text-primary-foreground/80">
              <span className="flex items-center gap-1.5 font-semibold text-sm">
                <Users className="w-4 h-4" />
                3ème AM — Groupe A
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-sm">
                <Clock className="w-4 h-4" />
                10:00 – 11:00
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-sm">
                <BookOpen className="w-4 h-4" />
                Salle 204
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center bg-primary-foreground/20 backdrop-blur-sm rounded-2xl px-6 py-4 min-w-[160px]">
            <span className="text-xs font-bold text-primary-foreground/70 uppercase tracking-wider mb-1">
              Commence dans
            </span>
            <div className="text-4xl md:text-5xl font-black text-primary-foreground tabular-nums tracking-tight">
              {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
            </div>
            <span className="text-xs font-bold text-primary-foreground/70 mt-1">minutes</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NextClassCard;
