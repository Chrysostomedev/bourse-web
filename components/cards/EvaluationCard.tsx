"use client";
import { Star, ChevronRight, type LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface Evaluation {
  id: number;
  name: string;
  role: string;
  color: string;
  note: number;
  projets: number;
  taches_terminees: number;
  on_time: number;
  badge: string;
}

interface Props {
  ev: Evaluation;
  onClick?: () => void;
}

const BADGE_CFG: Record<string, { label: string; bg: string; text: string }> = {
  excellent: { label: "Excellent", bg: "bg-muted-50", text: "text-orange-800" },
  bon: { label: "Bon", bg: "bg-orange-50", text: "text-orange-600" },
  moyen: { label: "Moyen", bg: "bg-orange-50", text: "text-orange-300" },
  ameliorer: { label: "À améliorer", bg: "bg-slate-50", text: "text-orange-400" },
};

function Stars({ note }: { note: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={13}
          className={i <= note? "text-orange-400 fill-orange-400" : "text-slate-200 fill-slate-200"}
          strokeWidth={2.5}
        />
      ))}
    </div>
  );
}

function Avatar({ name, color }: { name: string; color: string }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className={`w-10 h-10 rounded-xl ${color} text-white text- font-black flex items-center justify-center shrink-0 shadow-lg shadow-black/5`}>
      {initials}
    </div>
  );
}
export default function EvaluationCard({ ev }: Props) {
  const router = useRouter();

  const badge = BADGE_CFG[ev.badge];
  return (
    <div
    onClick={() => router.push(`/admin/evaluation/${ev.id}`)}
      className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar name={ev.name} color={ev.color} />
          <div>
            <p className="text- font-black text-slate-900 leading-tight group-hover:text-[#f97316] transition">{ev.name}</p>
            <p className="text- text-slate-400 font-medium">{ev.role}</p>
          </div>
        </div>
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text- font-black ${badge.bg} ${badge.text}`}>
          {badge.label}
        </span>
      </div>

      {/* Note étoiles */}
      <div className="flex items-center justify-between">
        <Stars note={ev.note} />
        <span className="text- font-black text-slate-700">{ev.note}.0 / 5</span>
      </div>

      {/* Stats mini */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-2.5 text-center border border-slate-100">
          <p className="text- font-black text-slate-900">{ev.projets}</p>
          <p className="text- text-slate-400 font-bold tracking-wide mt-0.5">Projets</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/30 rounded-xl p-2.5 text-center border border-emerald-100">
          <p className="text- font-black text-emerald-700">{ev.taches_terminees}</p>
          <p className="text- text-emerald-500 font-bold tracking-wide mt-0.5">Terminées</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100/30 rounded-xl p-2.5 text-center border border-orange-100">
          <p className="text- font-black text-orange-700">{ev.on_time}%</p>
          <p className="text- text-orange-500 font-bold tracking-wide mt-0.5">À temps</p>
        </div>
      </div>

      {/* Bar progression on-time */}
      <div>
        <div className="flex justify-between text-slate-400 mb-1">
          <span>À l'heure</span>
          <span className="text-slate-600">{ev.on_time}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-1.5 rounded-full transition-all duration-500 bg-gradient-to-r from-orange-400 to-orange-500"
            style={{ width: `${ev.on_time}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-end text- font-bold text-[#f97316] group-hover:gap-1.5 gap-1 transition-all">
        Voir détails <ChevronRight size={13} strokeWidth={3} />
      </div>
    </div>
  );
}