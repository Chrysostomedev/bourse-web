"use client";
import { Edit2, Trash2, MessageCircle, Users, Clock, type LucideIcon } from "lucide-react";
import { getStatusColorClass, getPriorityColorClass } from "@/app/admin/lib/designSystem";

interface CommunicationThread {
  id: number;
  title: string;
  category: string;
  priority: string;
  status: string;
  created_by: string;
  created_date: string;
  messages_count: number;
  participants: string[];
  last_message: string;
  last_updated: string;
  description?: string;
}

interface Props {
  comm: CommunicationThread;
  onEdit: (c: CommunicationThread) => void;
  onDelete: (id: number) => void;
}

const CATEGORY_CONFIG: Record<string, { icon: LucideIcon; accent: string }> = {
  strategy: { icon: MessageCircle, accent: "from-blue-500 to-blue-600" },
  campaign: { icon: Megaphone, accent: "from-orange-500 to-orange-600" },
  newsletter: { icon: Mail, accent: "from-purple-500 to-purple-600" },
  crisis: { icon: AlertCircle, accent: "from-red-500 to-red-600" },
  partnership: { icon: Users, accent: "from-emerald-500 to-emerald-600" },
};

import { Megaphone, Mail, AlertCircle } from "lucide-react";

export default function CommunicationCard({ comm, onEdit, onDelete }: Props) {
  const config = CATEGORY_CONFIG[comm.category]?? CATEGORY_CONFIG.strategy;
  const Icon = config.icon;

  const priorityLabel = {
    critical: "Critique",
    high: "Haute",
    medium: "Moyenne",
    low: "Basse",
  }[comm.priority]?? comm.priority;

  const statusLabel = {
    active: "Actif",
    pending: "Attente",
    resolved: "Résolu",
  }[comm.status]?? comm.status;

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex flex-col">
      {/* Gradient accent bar */}
      <div className={`h-1 w-full bg-gradient-to-r ${config.accent}`} />

      <div className="p-5 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${config.accent} flex items-center justify-center shrink-0 shadow-lg shadow-black/5`}>
              <Icon size={20} className="text-white" strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900 text-[14px] leading-tight line-clamp-2 group-hover:text-[#f97316] transition">
                {comm.title}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                par {comm.created_by}
              </p>
            </div>
          </div>

          {/* Actions hover */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(comm); }}
              className="p-2 text-slate-400 hover:text-[#f97316] hover:bg-orange-50 rounded-lg transition"
              title="Éditer"
            >
              <Edit2 size={15} strokeWidth={2.5} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(comm.id); }}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
              title="Supprimer"
            >
              <Trash2 size={15} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className={`${getPriorityColorClass(comm.priority)}!text-[10px]!font-black!px-2.5!py-1`}>
            {priorityLabel}
          </span>
          <span className={`${getStatusColorClass(comm.status)}!text-[10px]!font-black!px-2.5!py-1`}>
            {statusLabel}
          </span>
        </div>

        {/* Message Preview */}
        <div className="relative p-3.5 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl border border-slate-100 mb-4 flex-1">
          <div className="absolute top-2 left-2 w-1 h-1 rounded-full bg-slate-300" />
          <p className="text-[12px] text-slate-700 leading-relaxed line-clamp-3 pl-3">
            {comm.last_message}
          </p>
        </div>

        {/* Footer Stats */}
        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <MessageCircle size={13} className="text-slate-400" />
              <p className="text-[13px] font-black text-slate-900">{comm.messages_count}</p>
            </div>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Msgs</p>
          </div>
          <div className="text-center border-x border-slate-100">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Users size={13} className="text-slate-400" />
              <p className="text-[13px] font-black text-slate-900">{comm.participants.length}</p>
            </div>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Pers.</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock size={13} className="text-slate-400" />
              <p className="text-[13px] font-black text-slate-900">{new Date(comm.last_updated).getDate()}</p>
            </div>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Jour</p>
          </div>
        </div>
      </div>
    </div>
  );
}
