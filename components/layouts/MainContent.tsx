// components/layouts/MainContent.tsx
"use client";

import { useSidebar } from "@/components/layouts/sidebar";

export default function MainContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <div
      className={`flex flex-col min-h-screen transition-all duration-300 ${
        collapsed ? "md:ml-16" : "md:ml-64"
      }`}
    >
      {children}
    </div>
  );
}