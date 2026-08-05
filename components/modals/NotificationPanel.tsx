"use client";

import { useEffect, useRef, useState } from "react";
import {
  X, Bell, ArrowLeft,
  FolderKanban, CheckSquare, ListTodo, CalendarDays,
  Users, Settings, GitMerge,
} from "lucide-react";

// ── Types statiques ───────────────────────────────────────────────────────────

export type PanelNotifSource =
  | "project"
  | "task"
  | "subtask"
  | "event"
  | "member"
  | "status"
  | "système"
  | "system"
  | "post"
  | "scholarship"
  | "comment";

export interface Notification {
  id: string;
  title: string;
  summary: string;
  body: string;
  source: PanelNotifSource;
  read: boolean;
  created_at: string;
  entityLabel?: string;
  href?: string;
}

// ── Données statiques de démonstration ────────────────────────────────────────

const DUMMY_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    title: "Nouveau projet attribué",
    summary: "Vous avez été ajouté au projet Refonte plateforme web.",
    body: "Le projet de refonte globale a démarré. Veuillez consulter la feuille de route et valider les jalons de la première phase.",
    source: "project",
    read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    entityLabel: "Projet Web UI",
    href: "#",
  },
  {
    id: "2",
    title: "Tâche en retard",
    summary: "La tâche 'Maquettage Mobile' a dépassé sa date limite.",
    body: "La date d'échéance initiale était fixée à hier. Pensez à ajuster le planning ou finaliser la tâche.",
    source: "task",
    read: false,
    created_at: new Date(Date.now() - 1000 * 3600 * 2).toISOString(),
    entityLabel: "Maquettage UI",
  },
  {
    id: "3",
    title: "Nouveau membre",
    summary: "Sarah Martin a rejoint votre équipe.",
    body: "Sarah occupe désormais le rôle de Lead Designer. Souhaitez-lui la bienvenue !",
    source: "member",
    read: true,
    created_at: new Date(Date.now() - 1000 * 3600 * 24).toISOString(),
    entityLabel: "Équipe Design",
  },
  {
    id: "4",
    title: "Mise à jour système",
    summary: "Maintenance planifiée ce soir à 23h00.",
    body: "Une interruption de service d'environ 15 minutes est à prévoir pour le déploiement de la version 2.4.0.",
    source: "system",
    read: true,
    created_at: new Date(Date.now() - 1000 * 3600 * 48).toISOString(),
  },
];

// ── Dictionnaire statique de traductions ─────────────────────────────────────

const TRANSLATIONS = {
  title: "Notifications",
  noNotifications: "Aucune notification",
  noNotificationsDesc: "Vous êtes à jour ! Aucune nouvelle alerte pour le moment.",
  unreads: "Non lues",
};

// ── Helpers temps relatif ─────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "À l'instant";
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
  if (diff < 86400 * 7) return `il y a ${Math.floor(diff / 86400)} j`;
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

// ── Config par source — palette orange/blanc ──────────────────────────────────

const SOURCE_CONFIG: Record<PanelNotifSource, {
  label: string; Icon: React.ElementType;
  iconBg: string; iconColor: string; dotColor: string; badgeBorder: string;
}> = {
  project: { label: "Projet", Icon: FolderKanban, iconBg: "bg-orange-100", iconColor: "text-orange-600", dotColor: "#ea580c", badgeBorder: "border-orange-200" },
  task: { label: "Tâche", Icon: CheckSquare, iconBg: "bg-orange-50", iconColor: "text-orange-500", dotColor: "#f97316", badgeBorder: "border-orange-100" },
  subtask: { label: "Sous-tâche", Icon: ListTodo, iconBg: "bg-amber-50", iconColor: "text-amber-600", dotColor: "#d97706", badgeBorder: "border-amber-100" },
  event: { label: "Événement", Icon: CalendarDays, iconBg: "bg-orange-100", iconColor: "text-orange-700", dotColor: "#c2410c", badgeBorder: "border-orange-200" },
  member: { label: "Membre", Icon: Users, iconBg: "bg-orange-50", iconColor: "text-orange-500", dotColor: "#f97316", badgeBorder: "border-orange-100" },
  status: { label: "Statut", Icon: GitMerge, iconBg: "bg-amber-100", iconColor: "text-amber-700", dotColor: "#b45309", badgeBorder: "border-amber-200" },
  système: { label: "Système", Icon: Settings, iconBg: "bg-orange-50", iconColor: "text-orange-400", dotColor: "#fb923c", badgeBorder: "border-orange-100" },
  system: { label: "Système", Icon: Settings, iconBg: "bg-orange-50", iconColor: "text-orange-400", dotColor: "#fb923c", badgeBorder: "border-orange-100" },
  post: { label: "Post", Icon: CheckSquare, iconBg: "bg-orange-50", iconColor: "text-orange-500", dotColor: "#f97316", badgeBorder: "border-orange-100" },
  scholarship: { label: "Bourse", Icon: CalendarDays, iconBg: "bg-orange-100", iconColor: "text-orange-700", dotColor: "#c2410c", badgeBorder: "border-orange-200" },
  comment: { label: "Commentaire", Icon: ListTodo, iconBg: "bg-amber-50", iconColor: "text-amber-600", dotColor: "#d97706", badgeBorder: "border-amber-100" },
};

function getCfg(source: PanelNotifSource) {
  return SOURCE_CONFIG[source] ?? SOURCE_CONFIG["système"];
}

// ── Composants d'interface légers ─────────────────────────────────────────────

function SourceIcon({ source, size = 16 }: { source: PanelNotifSource; size?: number }) {
  const { Icon, iconBg, iconColor } = getCfg(source);
  return (
    <div className={`w-10 h-10 rounded-2xl ${iconBg} flex items-center justify-center shrink-0`}>
      <Icon size={size} className={iconColor} />
    </div>
  );
}

function SourceBadge({ source }: { source: PanelNotifSource }) {
  const cfg = getCfg(source);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${cfg.iconBg} ${cfg.iconColor} border ${cfg.badgeBorder}`}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.dotColor }} />
      {cfg.label}
    </span>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  initialNotif?: Notification | null;
  notifications?: Notification[];
}

// ── Panel principal ───────────────────────────────────────────────────────────

export default function NotificationPanel({
  isOpen,
  onClose,
  initialNotif,
  notifications = DUMMY_NOTIFICATIONS,
}: NotificationPanelProps) {
  const [activeNotif, setActiveNotif] = useState<Notification | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (isOpen && initialNotif) {
      setActiveNotif(initialNotif);
      setDetailOpen(true);
    }
    if (!isOpen) {
      setDetailOpen(false);
      setActiveNotif(null);
    }
  }, [isOpen, initialNotif]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setDetailOpen(false);
        setActiveNotif(null);
        onClose();
      }
    };
    if (isOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleOpenDetail = (notif: Notification) => {
    setActiveNotif(notif);
    setDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setTimeout(() => setActiveNotif(null), 300);
  };

  const unread = notifications.filter((n) => !n.read);
  const read = notifications.filter((n) => n.read);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-orange-950/10 backdrop-blur-[2px] z-[9990]" />

      <div ref={panelRef} className="fixed right-0 top-0 h-full z-[9995] flex w-full md:w-auto">
        {/* ══ PANNEAU LISTE ═════════════════════════════════════════════ */}
        <div
          className="w-full md:w-[420px] h-full bg-white flex flex-col"
          style={{
            boxShadow: "-8px 0 40px rgba(249,115,22,0.12), -2px 0 8px rgba(0,0,0,0.06)",
            transform: isOpen ? "translateX(0)" : "translateX(100%)",
            transition: "transform 0.35s cubic-bezier(0.32,0,0,1)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-orange-100 shrink-0 bg-gradient-to-r from-orange-500 to-orange-400">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-2xl flex items-center justify-center">
                <Bell size={17} className="text-white" />
              </div>
              <div>
                <h2 className="text-base font-black text-white leading-none">
                  {TRANSLATIONS.title}
                </h2>
                <p className="text-[11px] text-orange-100 font-medium mt-0.5">
                  {unreadCount > 0
                    ? `${unreadCount} non lu${unreadCount > 1 ? "s" : ""}`
                    : "À jour"}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition text-white"
            >
              <X size={18} />
            </button>
          </div>

          {/* Corps liste */}
          <div className="flex-1 overflow-y-auto bg-white">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 py-20 px-8 text-center">
                <div className="w-16 h-16 bg-orange-50 rounded-3xl flex items-center justify-center">
                  <Bell size={28} className="text-orange-200" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{TRANSLATIONS.noNotifications}</p>
                  <p className="text-xs text-gray-400 mt-1">{TRANSLATIONS.noNotificationsDesc}</p>
                </div>
              </div>
            ) : (
              <>
                {unread.length > 0 && (
                  <div>
                    <div className="px-6 pt-4 pb-2 flex items-center gap-2">
                      <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">
                        {TRANSLATIONS.unreads}
                      </span>
                      <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-orange-500 text-white text-[10px] font-black px-1">
                        {unread.length}
                      </span>
                    </div>
                    {unread.map((notif) => (
                      <NotifRow
                        key={notif.id}
                        notif={notif}
                        isActive={activeNotif?.id === notif.id}
                        onClick={() => handleOpenDetail(notif)}
                      />
                    ))}
                  </div>
                )}

                {read.length > 0 && (
                  <div>
                    <div className="px-6 pt-5 pb-2">
                      <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                        Lues · {read.length}
                      </span>
                    </div>
                    {read.map((notif) => (
                      <NotifRow
                        key={notif.id}
                        notif={notif}
                        isActive={activeNotif?.id === notif.id}
                        onClick={() => handleOpenDetail(notif)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-6 py-4 border-t border-orange-50 shrink-0 bg-white">
              <p className="text-[11px] text-center text-gray-300 font-medium">
                {notifications.length} notification{notifications.length > 1 ? "s" : ""} au total
              </p>
            </div>
          )}
        </div>

        {/* ══ PANNEAU DÉTAIL ════════════════════════════════════════════ */}
        <div
          className="absolute right-0 top-0 h-full w-[420px] bg-white flex flex-col"
          style={{
            boxShadow: "-8px 0 40px rgba(249,115,22,0.15)",
            transform: detailOpen ? "translateX(0)" : "translateX(100%)",
            transition: "transform 0.3s cubic-bezier(0.32,0,0,1)",
            borderRadius: "20px 0 0 20px",
            borderLeft: "1px solid #ffedd5",
          }}
        >
          {activeNotif && (
            <NotifDetail notif={activeNotif} onBack={handleCloseDetail} />
          )}
        </div>
      </div>
    </>
  );
}

// ── Ligne de notification ─────────────────────────────────────────────────────

function NotifRow({
  notif,
  isActive,
  onClick,
}: {
  notif: Notification;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`group flex items-start gap-3.5 px-5 py-4 cursor-pointer border-b border-orange-50 last:border-0 transition-colors ${
        isActive
          ? "bg-orange-50"
          : notif.read
          ? "hover:bg-orange-50/40 bg-white"
          : "hover:bg-orange-50/60 bg-orange-50/20"
      }`}
    >
      <div className="relative shrink-0 mt-0.5">
        <SourceIcon source={notif.source} />
        {!notif.read && (
          <span
            className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white"
            style={{ backgroundColor: getCfg(notif.source).dotColor }}
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={`text-sm leading-tight ${
              notif.read ? "font-medium text-gray-500" : "font-bold text-gray-900"
            }`}
          >
            {notif.title}
          </p>
          <span className="text-[10px] text-gray-300 font-medium shrink-0 mt-0.5">
            {timeAgo(notif.created_at)}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1 leading-snug line-clamp-2">{(notif as any).summary}</p>
        <div className="flex items-center gap-2 mt-2">
          <SourceBadge source={notif.source} />
          {notif.entityLabel && (
            <span className="text-[10px] text-gray-400 font-medium truncate max-w-[110px]">
              {notif.entityLabel}
            </span>
          )}
        </div>
      </div>

      {!notif.read && (
        <div className="shrink-0 mt-2">
          <span className="w-2 h-2 rounded-full bg-orange-500 block" />
        </div>
      )}
    </div>
  );
}

// ── Panneau détail ────────────────────────────────────────────────────────────

function NotifDetail({
  notif,
  onBack,
}: {
  notif: Notification;
  onBack: () => void;
}) {
  const cfg = getCfg(notif.source);
  const dateObj = new Date(notif.created_at);

  return (
    <>
      <div className="shrink-0 bg-gradient-to-r from-orange-500 to-orange-400">
        <div className="flex items-center px-6 pt-5 pb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/80 hover:text-white transition text-sm font-bold"
          >
            <ArrowLeft size={16} /> Retour
          </button>
        </div>

        <div className="flex items-center gap-4 px-6 pb-6">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
            <cfg.Icon size={22} className="text-white" />
          </div>
          <div>
            <SourceBadge source={notif.source} />
            <p className="text-[11px] text-orange-100 font-medium mt-1.5">
              {timeAgo(notif.created_at)} ·{" "}
              {dateObj.toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}{" "}
              à{" "}
              {dateObj.toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 bg-white">
        <div>
          <h2 className="text-xl font-black text-gray-900 leading-tight">{notif.title}</h2>
          {notif.entityLabel && (
            <div className="flex items-center gap-2 mt-2.5">
              <span className="text-xs text-gray-400 font-medium">Concerne :</span>
              <span className="text-xs font-bold text-orange-700 bg-orange-50 border border-orange-100 px-2.5 py-1 rounded-lg">
                {notif.entityLabel}
              </span>
            </div>
          )}
        </div>

        <div className="bg-orange-50 rounded-2xl border border-orange-100 p-5">
          <p className="text-sm text-gray-700 leading-relaxed font-medium">{notif.body}</p>
        </div>

        <div className="rounded-2xl border border-orange-100 overflow-hidden">
          {[
            { label: "Type", value: cfg.label },
            { label: "Statut", value: notif.read ? "Lu" : "Non lu" },
            {
              label: "Reçu le",
              value: dateObj.toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              }),
            },
            {
              label: "À",
              value: dateObj.toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
          ].map((row, i, arr) => (
            <div
              key={row.label}
              className={`flex items-center justify-between px-4 py-3 ${
                i < arr.length - 1 ? "border-b border-orange-50" : ""
              } ${i % 2 === 0 ? "bg-white" : "bg-orange-50/40"}`}
            >
              <p className="text-xs text-gray-400 font-medium">{row.label}</p>
              <p className="text-sm font-bold text-gray-800">{row.value}</p>
            </div>
          ))}
        </div>

        {notif.href && (
          <a
            href={notif.href}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold transition shadow-md shadow-orange-200"
          >
            Voir {cfg.label}
          </a>
        )}
      </div>
    </>
  );
}
