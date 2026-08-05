"use client";
import { Edit2, Trash2, MapPin, Users, Calendar, PhoneCall, Mountain, Globe, Wrench, type LucideIcon } from "lucide-react";
import { getStatusColorClass } from "@/app/admin/lib/designSystem";
import { useRouter } from "next/navigation";

interface Representation {
  id: number;
  event_name: string;
  location: string;
  country: string;
  event_type: string;
  date_start: string;
  date_end: string;
  doctors_assigned: string[];
  status: string;
  notes?: string;
}

interface Props {
  rep: Representation;
  onEdit: (r: Representation) => void;
  onDelete: (id: number) => void;
}

const EVENT_TYPE_CONFIG: Record<string, { icon: LucideIcon; accent: string }> = {
  conference: { icon: PhoneCall, accent: "from-orange-500 to-orange-600" },
  panel: { icon: Users, accent: "from-orange-400 to-orange-500" },
  summit: { icon: Mountain, accent: "from-orange-600 to-orange-700" },
  forum: { icon: Globe, accent: "from-orange-500 to-orange-600" },
  workshop: { icon: Wrench, accent: "from-orange-400 to-orange-500" },
};

export default function RepresentationCard({ rep, onEdit, onDelete }: Props) {
  const router = useRouter();

  const config = EVENT_TYPE_CONFIG[rep.event_type] ?? EVENT_TYPE_CONFIG.conference;
  const Icon = config.icon;
  const duration = Math.floor((new Date(rep.date_end).getTime() - new Date(rep.date_start).getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const statusLabel = { confirmed: "Confirmé", pending: "En attente", cancelled: "Annulé" }[rep.status]?? rep.status;

  return (
<div
  onClick={() => router.push(`/admin/representation/${rep.id}`)}
  className="group relative cursor-pointer bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
>      {/* Gradient accent bar */}
      <div className={`h-1 w-full bg-gradient-to-r ${config.accent}`} />

      <div className="p-5 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${config.accent} flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20`}>
              <Icon size={20} className="text-white" strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900 text-[14px] leading-tight line-clamp-2 group-hover:text-[#f97316] transition">
                {rep.event_name}
              </h3>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1 font-medium">
                <MapPin size={12} className="shrink-0" />
                <span className="truncate">{rep.location}</span>
              </div>
            </div>
          </div>

          {/* Actions hover */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(rep); }}
              className="p-2 text-slate-400 hover:text-[#f97316] hover:bg-orange-50 rounded-lg transition"
              title="Éditer"
            >
              <Edit2 size={15} strokeWidth={2.5} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(rep.id); }}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
              title="Supprimer"
            >
              <Trash2 size={15} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className={`${getStatusColorClass(rep.status)}!text-[10px]!font-black!px-2.5!py-1`}>
            {statusLabel}
          </span>
          <span className="text-[10px] font-black text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
            {duration} j{duration > 1? "s" : ""}
          </span>
        </div>

        {/* Dates */}
        <div className="flex items-center gap-2 text-[12px] text-slate-600 mb-4 pb-4 border-b border-slate-100">
          <Calendar size={14} className="text-slate-400 shrink-0" />
          <span className="font-medium">
            {new Date(rep.date_start).toLocaleDateString("fr-FR", { day: 'numeric', month: 'short' })} → {new Date(rep.date_end).toLocaleDateString("fr-FR", { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>

        {/* Doctors Assigned */}
        <div className="mb-4 flex-1">
          <div className="flex items-center gap-2 mb-2.5">
            <Users size={14} className="text-[#f97316]" />
            <p className="text-[11px] font-black text-slate-900 uppercase tracking-wide">
              Docteurs ({rep.doctors_assigned.length})
            </p>
          </div>
          {rep.doctors_assigned.length > 0? (
            <div className="space-y-1.5">
              {rep.doctors_assigned.slice(0, 2).map((doctor: string, i: number) => (
                <div key={i} className="text-[11px] bg-gradient-to-r from-slate-50 to-orange-50/30 rounded-lg px-2.5 py-1.5 text-slate-700 border border-slate-100 font-medium">
                  {doctor}
                </div>
              ))}
              {rep.doctors_assigned.length > 2 && (
                <p className="text-[10px] text-slate-500 font-bold pl-2.5">+{rep.doctors_assigned.length - 2} autres</p>
              )}
            </div>
          ) : (
            <p className="text-[11px] text-slate-400 italic">Aucun docteur assigné</p>
          )}
        </div>

        {/* Notes */}
        {rep.notes && (
          <div className="pt-3 border-t border-slate-100">
            <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">{rep.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
