"use client";

import { useState, useEffect } from "react";
import { Bell, LogOut, Menu, AlertTriangle, GraduationCap } from "lucide-react";
import Link from "next/link";

// ── Données mock statiques ───────────────────────────────────────────────────
const MOCK_USER = {
  first_name: "Aïcha",
  last_name: "Diallo", 
  role: "ADMIN",
  profile_picture_url: null as string | null,
};

const MOCK_NOTIFICATIONS = [
  { id: 1, title: "Nouvelle bourse disponible", summary: "La bourse Eiffel 2026 vient d'ouvrir", read: false },
  { id: 2, title: "Deadline proche", summary: "Chevening se termine dans 3 jours", read: false },
  { id: 3, title: "Candidature acceptée", summary: "Votre dossier Fulbright est validé", read: true },
];

// ── Notification banner (in-app) ──────────────────────────────────────────────
function InAppBanner({
  title,
  body,
  onClose,
}: {
  title: string;
  body: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 8000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-[9999] w- bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-top-4 duration-300">
      <div className="h-1 w-full bg-[#6B2FB4]" />
      <div className="flex items-start gap-3 px-4 py-3">
        <div className="w-9 h-9 rounded-xl bg-[#6B2FB4] flex items-center justify-center shrink-0 mt-0.5">
          <Bell size={16} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-slate-900 leading-tight truncate">{title}</p>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-snug">{body}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-100 rounded-lg transition text-slate-400 hover:text-slate-700"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// ── Role badge ────────────────────────────────────────────────────────────────
function RoleBadge({ role }: { role: string }) {
  const r = role.toUpperCase();
  if (r === "ADMIN")
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text- font-black uppercase tracking-widest bg-violet-100 text-[#6B2FB4] border border-violet-200">
        Admin
      </span>
    );
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text- font-black uppercase tracking-widest bg-slate-100 text-slate-600 border border-slate-200">
      {role}
    </span>
  );
}

// ── Notification Panel statique ───────────────────────────────────────────────
function NotificationPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;
  
  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]" onClick={onClose} />
      <div className="fixed top-20 right-4 w- bg-white rounded-2xl shadow-2xl border border-slate-200 z-[9999] max-h- overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-[#6B2FB4]/5">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-900">Notifications</h3>
            <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg">✕</button>
          </div>
        </div>
        <div className="overflow-y-auto max-h-">
          {MOCK_NOTIFICATIONS.map((notif) => (
            <div key={notif.id} className={`p-4 border-b border-slate-50 hover:bg-slate-50/50 ${!notif.read? 'bg-violet-50/30' : ''}`}>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[#6B2FB4] mt-2 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">{notif.title}</p>
                  <p className="text-xs text-slate-500 mt-1">{notif.summary}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
export default function Navbar() {
  const [firstName] = useState(MOCK_USER.first_name);
  const [lastName] = useState(MOCK_USER.last_name);
  const [role] = useState(MOCK_USER.role);
  const [showLogout, setShowLogout] = useState(false);
  const [profilePic] = useState<string | null>(MOCK_USER.profile_picture_url);
  const [notifPanelOpen, setNotifPanelOpen] = useState(false);
  const [banner, setBanner] = useState<{ title: string; body: string } | null>(null);

  const unreadCount = MOCK_NOTIFICATIONS.filter(n =>!n.read).length;

  // ── Logout simulé ──────────────────────────────────────────────────────────
  const handleLogout = () => {
    alert("Déconnexion simulée - Tu seras redirigé vers /login en prod");
    setShowLogout(false);
  };

  const getInitials = () =>
    firstName || lastName
     ? `${firstName?.[0]?? ""}${lastName?.[0]?? ""}`.toUpperCase()
      : "?";

  const fullName = [firstName, lastName].filter(Boolean).join(" ") || "Utilisateur";

  const profileHref = "/profil";

  // Simule une nouvelle notif au clic pour tester le banner
  const triggerTestNotif = () => {
    setBanner({ 
      title: "Nouvelle bourse Eiffel", 
      body: "Les candidatures 2026 sont maintenant ouvertes jusqu'au 15 janvier" 
    });
  };

  return (
    <>
      {banner && (
        <InAppBanner
          title={banner.title}
          body={banner.body}
          onClose={() => setBanner(null)}
        />
      )}

      <NotificationPanel
        isOpen={notifPanelOpen}
        onClose={() => setNotifPanelOpen(false)}
      />

      <header className="fixed top-0 left-0 w-full md:left-64 md:w-[calc(100%-16rem)] flex items-center justify-between px-4 py-3 bg-white shadow-sm border-b border-gray-200 z-30 transition-all duration-300">
        {/* Gauche — burger + avatar + nom */}
        <div className="flex items-center gap-3">
          <button
            className="md:hidden p-2 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-gray-900 transition-colors"
            aria-label="Ouvrir le menu"
          >
            <Menu size={22} />
          </button>

          <Link
            href={profileHref}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6B2FB4] to-[#E63946] text-white font-black flex items-center justify-center text-sm shrink-0 overflow-hidden hover:opacity-90 transition-opacity"
            title="Mon profil"
          >
            {profilePic? (
              <img src={profilePic} alt="Profil" className="object-cover w-full h-full" />
            ) : (
              getInitials()
            )}
          </Link>

          <div className="hidden md:flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <p className="text-gray-900 font-bold text-sm leading-tight">
                Bienvenue, {fullName}
              </p>
              <RoleBadge role={role} />
            </div>
            <p className="text-gray-500 text-xs font-medium flex items-center gap-1">
              <GraduationCap size={12} className="text-[#6B2FB4]" />
              Bourse Pour Tous
            </p>
          </div>
        </div>

        {/* Droite — cloche + logout */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setNotifPanelOpen(true)}
            onDoubleClick={triggerTestNotif}
            className="relative flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-full hover:bg-violet-50 transition-all"
            aria-label="Notifications"
            title="Notifications - Double-clic pour tester"
          >
            <div className="relative">
              <Bell
                size={20}
                className={unreadCount > 0? "text-[#6B2FB4]" : "text-slate-400"}
                strokeWidth={unreadCount > 0? 2.5 : 2}
              />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w- h- bg-[#E63946] text-white text- font-black rounded-full flex items-center justify-center px-1 animate-pulse">
                  {unreadCount > 99? "99+" : unreadCount}
                </span>
              )}
            </div>
            <span className="hidden md:inline text-sm font-semibold text-slate-700">
              Notifications
            </span>
          </button>

          <button
            onClick={() => setShowLogout(true)}
            className="p-2 rounded-full hover:bg-red-50 hover:text-[#E63946] transition text-slate-500"
            title="Se déconnecter"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Logout modal */}
      {showLogout && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowLogout(false)}
          />
          <div className="relative bg-white w-[90%] max-w-lg rounded-[2.5rem] p-10 shadow-2xl flex flex-col items-center text-center space-y-8 animate-in zoom-in-95">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center">
              <AlertTriangle className="text-[#E63946]" size={38} strokeWidth={2.5} />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                Déconnexion de votre compte
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed font-medium px-4">
                Souhaitez-vous vous déconnecter? Vous pourrez vous reconnecter facilement à tout moment.
              </p>
            </div>
            <div className="flex gap-4 w-full pt-4">
              <button
                onClick={() => setShowLogout(false)}
                className="flex-1 py-3 px-6 rounded-2xl bg-[#6B2FB4] text-white font-bold hover:opacity-90 transition-all"
              >
                Rester connecté
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-3 px-6 rounded-2xl bg-[#E63946] text-white font-bold hover:bg-red-700 transition-all shadow-xl shadow-red-200"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}