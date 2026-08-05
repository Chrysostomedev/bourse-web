"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import LogoutModal from "@/components/modals/LogoutModal";
import {
  BarChart3,
  BookOpen,
  Globe,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  FileText,
  Handshake,
  GraduationCap,
  ChevronRight,
  Bell,
} from "lucide-react";

const MENU_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: BarChart3, roles: ["admin", "redacteur"] },
  { 
    label: "Bourses", 
    icon: BookOpen, 
    href: "/admin/bourses",
    roles: ["admin", "redacteur"],
    submenu: [
      { label: "Toutes les bourses", href: "/admin/bourses" },
      { label: "Niveaux", href: "/admin/bourses/niveaux" },
      { label: "Filières", href: "/admin/bourses/filieres" },
    ]
  },
  { label: "Pays", href: "/admin/pays", icon: Globe, roles: ["admin"] },
  { label: "Partenaires", href: "/admin/partenaires", icon: Handshake, roles: ["admin"] },
  { label: "Publications", href: "/admin/publications", icon: FileText, roles: ["admin", "redacteur"] },
  { label: "Utilisateurs", href: "/admin/users", icon: Users, roles: ["admin"] },
  { label: "Services et produits", href: "/admin/services", icon: Settings, roles: ["admin"] },
  // { label: "Rapports", href: "/admin/rapports", icon: BarChart3, roles: ["admin", "redacteur"] },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

// Normalise le rôle, que le backend renvoie une string ("admin")
// ou un objet relationnel ({ id, name, created_at, updated_at })
const roleValue = user?.role as unknown;
const userRole = (
  typeof roleValue === "string"
    ? roleValue
    : (roleValue as { name?: string })?.name
) as "admin" | "redacteur" | "user" || "user";  const visibleMenuItems = MENU_ITEMS.filter((item) => item.roles.includes(userRole));

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      logout();
      router.push("/login");
    } finally {
      setLogoutLoading(false);
      setLogoutModalOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-white border-r border-slate-200 transition-all duration-300 fixed h-screen overflow-y-auto z-40 flex flex-col shadow-sm`}
      >
        {/* Logo Header */}
        <div className="p-4 border-b border-slate-100">
          <Link href="/admin" className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#6B2FB4] to-[#E63946] flex items-center justify-center font-bold shrink-0 overflow-hidden">
              {sidebarOpen ? (
                <Image
                  src="/img/logo.jpeg"
                  alt="Logo"
                  width={40}
                  height={40}
                  className="rounded-lg object-cover"
                />
              ) : (
                <GraduationCap className="text-white" size={20} />
              )}
            </div>
            {sidebarOpen && (
              <div className="flex flex-col min-w-0">
                <span className="font-black text-slate-900 text-xs tracking-tight truncate">Bourse Pour Tous</span>
                <span className="text-xs font-bold text-[#6B2FB4] uppercase tracking-widest">{userRole}</span>
              </div>
            )}
          </Link>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            const isOpen = openSubmenu === item.href;

            if (hasSubmenu && !sidebarOpen) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-center px-3 py-2.5 rounded-xl transition-all text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  title={item.label}
                >
                  <Icon size={18} className="shrink-0" />
                </Link>
              );
            }

            if (hasSubmenu) {
              return (
                <div key={item.href}>
                  <button
                    onClick={() => setOpenSubmenu(isOpen ? null : item.href)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  >
                    <Icon size={18} className="shrink-0" />
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    <ChevronRight size={16} className={`transition-transform shrink-0 ${isOpen ? "rotate-90" : ""}`} />
                  </button>
                  {isOpen && (
                    <div className="ml-6 mt-1 space-y-1 border-l-2 border-[#6B2FB4]/20 pl-3">
                      {item.submenu?.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className="block px-3 py-2 rounded-lg text-sm transition-all text-slate-600 hover:bg-slate-50 hover:text-[#6B2FB4]"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                title={sidebarOpen ? "" : item.label}
              >
                <Icon size={18} className="shrink-0" />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User & Logout */}
        <div className="p-3 border-t border-slate-100 space-y-2">
          <div className="px-3 py-2 text-xs">
            {sidebarOpen ? (
              <>
                <p className="font-semibold text-slate-900 truncate">{user?.name}</p>
                <p className="text-slate-500 truncate">{user?.email}</p>
                <p className="text-[#6B2FB4] font-bold uppercase tracking-wider text-xs">
                  {userRole}
                </p>
              </>
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#6B2FB4] to-[#E63946] flex items-center justify-center text-white font-bold text-sm mx-auto">
                {user?.name?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <button
            onClick={() => setLogoutModalOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-semibold text-slate-600 hover:bg-red-50 hover:text-[#E63946]"
            title={sidebarOpen ? "" : "Déconnexion"}
          >
            <LogOut size={18} className="shrink-0" />
            {sidebarOpen && "Déconnexion"}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`${sidebarOpen ? "ml-64" : "ml-20"} flex-1 flex flex-col transition-all duration-300`}>
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg transition"
            >
              {sidebarOpen ? <X size={20} className="text-slate-600" /> : <Menu size={20} className="text-slate-600" />}
            </button>
          </div>

          <div className="flex items-center gap-6">
            {/* Notifications */}
            <button className="relative p-2 hover:bg-slate-100 rounded-lg transition">
              <Bell size={20} className="text-slate-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#E63946] rounded-full"></span>
            </button>

            {/* User */}
            <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-600">{user?.name}</p>
                <p className="text-xs text-slate-500">{userRole}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6B2FB4] to-[#E63946] flex items-center justify-center text-white font-bold text-sm">
                {user?.name?.[0]?.toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>

      {/* Logout Modal */}
      <LogoutModal
        isOpen={logoutModalOpen}
        isLoading={logoutLoading}
        onConfirm={handleLogout}
        onCancel={() => setLogoutModalOpen(false)}
      />
    </div>
  );
}
