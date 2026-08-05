"use client";

import { usePathname } from "next/navigation";
import { useState, createContext, useContext, useCallback } from "react";
import {
  LayoutDashboard, GraduationCap, ListChecks, Globe, Building2, Newspaper,
  Handshake, Package, Search, BarChart3, Settings, LogOut,
  ChevronLeft, ChevronRight, AlertTriangle, X, Users, FileText,
  Award, MapPin,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// ── Types locaux ─────────────────────────────────────────────────────────────
type SubMenuItem = {
  label: string;
  href: string;
  isDev?: boolean;
};

type NavItem = {
  label: string;
  icon: React.ElementType;
  href: string;
  submenu?: SubMenuItem[];
  isDev?: boolean;
};

// ── Context sidebar ──────────────────────────────────────────────────────────
interface SidebarContextType {
  collapsed: boolean;
  toggleCollapsed: () => void;
  mobileOpen: boolean;
  toggleMobileOpen: () => void;
  setMobileOpen: (v: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType>({
  collapsed: false, toggleCollapsed: () => {}, mobileOpen: false,
  toggleMobileOpen: () => {}, setMobileOpen: () => {},
});

export function useSidebar() {
  return useContext(SidebarContext);
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleCollapsed = useCallback(() => setCollapsed((v) =>!v), []);
  const toggleMobileOpen = useCallback(() => setMobileOpen((v) =>!v), []);

  return (
    <SidebarContext.Provider value={{ collapsed, toggleCollapsed, mobileOpen, toggleMobileOpen, setMobileOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}

// ── Nav ADMIN & REDACTEUR ────────────────────────────────────────────────────
const ADMIN_NAV_ITEMS: NavItem[] = [
  { label: "Tableau de bord", icon: LayoutDashboard, href: "/admin/dashboard" },
  {
    label: "Bourses", icon: GraduationCap, href: "/admin/bourses",
    submenu: [
      { label: "Toutes les bourses", href: "/admin/bourses" },
      { label: "Types de bourse", href: "/admin/bourses/types" },
      { label: "Niveaux réquis", href: "/admin/bourses/niveaux" },
      { label: "Filières", href: "/admin/bourses/filieres" },
    ],
  },
  { label: "Pays ", icon: Globe, href: "/admin/pays" },
  { label: "Publications", icon: Newspaper, href: "/admin/publications" },
  { label: "Partenaires", icon: Handshake, href: "/admin/partenaires" },
  { label: "Services & Produits", icon: Package, href: "/admin/services" },
  { 
    label: "Statistiques ", icon: BarChart3, href: "/admin/stats",
    submenu: [
      { label: "Recherche avancée", href: "/admin/recherche" },
      { label: "Stats par pays", href: "/admin/stats/pays" },
      { label: "Stats par filière", href: "/admin/stats/filieres" },
    ],
  },
  { label: "Utilisateurs", icon: Users, href: "/admin/users" },
];

// ── Nav REDACTEUR seul ───────────────────────────────────────────────────────
const REDACTEUR_NAV_ITEMS: NavItem[] = [
  { label: "Tableau de bord", icon: LayoutDashboard, href: "/redacteur/dashboard" },
  { label: "Bourses", icon: GraduationCap, href: "/redacteur/bourses" },
  { label: "Publications", icon: Newspaper, href: "/redacteur/actualites" },
  { label: "Recherche", icon: Search, href: "/redacteur/recherche" },
];

const BOTTOM_ITEMS = [
  { label: "Paramètres", icon: Settings, href: "/parametres" },
];

// ── SubMenu composant inline ─────────────────────────────────────────────────
function SubMenu({ 
  label, 
  href, 
  icon, 
  items, 
  collapsed 
}: { 
  label: string; 
  href: string; 
  icon: React.ReactNode; 
  items: SubMenuItem[]; 
  collapsed: boolean;
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const isActive = pathname === href || pathname.startsWith(href + "/");

  if (collapsed) {
    return (
      <Link
        href={href}
        className={`flex items-center justify-center px-3 py-2.5 rounded-xl transition-all text-sm font-semibold
          ${isActive? "bg-[#6B2FB4] text-white shadow-md" : "text-slate-600 hover:bg-slate-100"}`}
        title={label}
      >
        {icon}
      </Link>
    );
  }

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-semibold
          ${isActive? "bg-[#6B2FB4] text-white shadow-md" : "text-slate-600 hover:bg-slate-100"}`}
      >
        {icon}
        <span className="flex-1 text-left">{label}</span>
        <ChevronRight size={16} className={`transition-transform ${isOpen? "rotate-90" : ""}`} />
      </button>
      {isOpen && (
        <div className="ml-6 mt-1 space-y-1 border-l-2 border-[#6B2FB4]/20 pl-3">
          {items.map((item) => {
            const itemActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-2 rounded-lg text-sm transition-all
                  ${itemActive? "bg-[#6B2FB4]/10 text-[#6B2FB4] font-bold" : "text-slate-600 hover:bg-slate-50"}`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Logout modal ─────────────────────────────────────────────────────────────
function LogoutModal({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white w-[90%] max-w-lg rounded-[2.5rem] p-10 shadow-2xl flex flex-col items-center text-center space-y-8">
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center">
          <AlertTriangle className="text-[#E63946]" size={38} strokeWidth={2.5} />
        </div>
        <div className="space-y-3">
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Déconnexion de votre compte</h2>
          <p className="text-gray-500 text-lg leading-relaxed font-medium px-4">
            Souhaitez-vous vous déconnecter? Vous pourrez vous reconnecter facilement à tout moment.
          </p>
        </div>
        <div className="flex gap-4 w-full pt-4">
          <button onClick={onCancel} className="flex-1 py-3 px-6 rounded-2xl bg-[#6B2FB4] text-white font-bold hover:opacity-90 transition-all">
            Rester connecté
          </button>
          <button onClick={onConfirm} className="flex-1 py-3 px-6 rounded-2xl bg-[#E63946] text-white font-bold hover:bg-red-700 transition-all shadow-xl shadow-red-200">
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Sidebar ─────────────────────────────────────────────────────────────
export default function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggleCollapsed, mobileOpen, setMobileOpen } = useSidebar();
  const [showLogout, setShowLogout] = useState(false);
  
  // Mock du role - change en "REDACTEUR" pour tester
  const [role] = useState<"ADMIN" | "REDACTEUR">("ADMIN");

  const navItems = role === "REDACTEUR"? REDACTEUR_NAV_ITEMS : ADMIN_NAV_ITEMS;

  const handleLogout = () => {
    alert("Déconnexion simulée - Redirection vers /login en prod");
    setShowLogout(false);
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const getItemClasses = (active: boolean) => {
    return active
    ? "bg-[#6B2FB4] text-white shadow-md"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900";
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100">
        {!collapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#6B2FB4] to-[#E63946] flex items-center justify-center shrink-0">
              <GraduationCap className="text-white" size={20} />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-slate-900 text-sm tracking-tight truncate">Bourse Pour Tous</span>
              <span className="text- font-bold text-[#6B2FB4] uppercase tracking-widest">{role}</span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6B2FB4] to-[#E63946] flex items-center justify-center">
              <GraduationCap className="text-white" size={18} />
            </div>
          </div>
        )}
        <button onClick={toggleCollapsed} className="hidden md:flex p-1.5 hover:bg-slate-100 rounded-lg transition text-slate-400 hover:text-slate-700 shrink-0">
          {collapsed? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
        <button onClick={() => setMobileOpen(false)} className="md:hidden p-1.5 hover:bg-slate-100 rounded-lg transition text-slate-400 shrink-0">
          <X size={15} />
        </button>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          if (item.submenu && item.submenu.length > 0) {
            return (
              <div key={item.href} onClick={() => setMobileOpen(false)}>
                <SubMenu
                  label={item.label}
                  href={item.href}
                  icon={<Icon size={18} className="shrink-0" />}
                  items={item.submenu}
                  collapsed={collapsed}
                />
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-semibold
                ${getItemClasses(active)}
                ${collapsed? "justify-center" : ""}`}
              title={collapsed? item.label : undefined}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="px-2 py-3 border-t border-slate-100 space-y-0.5">
        {BOTTOM_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-semibold
                ${getItemClasses(active)}
                ${collapsed? "justify-center" : ""}`}
              title={collapsed? item.label : undefined}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}

        <button
          onClick={() => setShowLogout(true)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-semibold text-slate-600 hover:bg-red-50 hover:text-[#E63946] ${collapsed? "justify-center" : ""}`}
          title={collapsed? "Se déconnecter" : undefined}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Se déconnecter</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className={`hidden md:flex flex-col fixed left-0 top-0 h-full bg-white border-r border-slate-200 z-40 transition-all duration-300 ${collapsed? "w-16" : "w-64"}`}>
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden" onClick={() => setMobileOpen(false)} />
          <aside className="fixed left-0 top-0 h-full w-72 bg-white border-r border-slate-200 z-50 md:hidden flex flex-col">
            <SidebarContent />
          </aside>
        </>
      )}

      {showLogout && <LogoutModal onCancel={() => setShowLogout(false)} onConfirm={handleLogout} />}
    </>
  );
}