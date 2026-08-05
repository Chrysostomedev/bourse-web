"use client";

import { useStats } from "@/hooks/admin/useStats";
import { useEffect, useMemo } from "react";
import { Award, Globe, Star, FileText, GraduationCap } from "lucide-react";
import DonutCard, { type DonutSegment } from "@/components/cards/DonutCard";

export default function AdminDashboardPage() {
  const { overview, isLoading, error, fetchOverview } = useStats();

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const data = useMemo(() => {
    if (!overview) return null;
    // ton API renvoie directement {stats, partners, featured, recentPosts}
    // ou {data:{...}} selon ton hook, on gère les 2 cas
    const root: any = (overview as any).data?? overview;
    return {
      activeBoursesCount: root?.stats?.activeBoursesCount?? 0,
      partners: root?.partners?? [],
      featured: root?.featured?? [],
      recentPosts: root?.recentPosts?? [],
      pub: root?.pub?? null,
    };
  }, [overview]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-4 animate-pulse">
        <div className="h-20 bg-slate-100 rounded-2xl" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-slate-100 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-[#F25C5C] px-4 py-3 rounded-xl">
          Erreur: {error}
        </div>
      </div>
    );
  }

  const boursesActives = data?.activeBoursesCount?? 0;
  const partenairesCount = data?.partners.length?? 0;
  const vedettesCount = data?.featured.length?? 0;
  const articlesCount = data?.recentPosts.length?? 0;
  const partenairesFeatured = data?.partners.filter((p: any) => p.is_featured).length?? 0;

  const totalContent = boursesActives + partenairesCount + vedettesCount + articlesCount || 1;

  const donutSegments: DonutSegment[] = [
    { label: "Bourses actives", done: boursesActives, total: totalContent, color: "#6B2D90" },
    { label: "Partenaires", done: partenairesCount, total: totalContent, color: "#F25C5C" },
    { label: "À la une", done: vedettesCount, total: totalContent, color: "#7c3aed" },
    { label: "Articles", done: articlesCount, total: totalContent, color: "#e8ddf3" },
  ];

  return (
    <div className="p-6 space-y-6 bg-[#faf8ff] min-h-screen">
     
      {/* 4 Cards comme sur ton screenshot mais aux bonnes couleurs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-[#ede9f3] p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text- font-black tracking-widest text-[#6B2D90] uppercase">Bourses actives</p>
              <p className="text-3xl font-black text-slate-900 mt-2">{boursesActives}</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#f1e9f9] flex items-center justify-center">
              <Award size={18} className="text-[#6B2D90]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#ede9f3] p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text- font-black tracking-widest text-[#6B2D90] uppercase">Partenaires</p>
              <p className="text-3xl font-black text-slate-900 mt-2">{partenairesCount}</p>
              <p className="text- text-slate-400 mt-1">{partenairesFeatured} mis en avant</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#f1e9f9] flex items-center justify-center">
              <Globe size={18} className="text-[#6B2D90]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#ede9f3] p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text- font-black tracking-widest text-[#6B2D90] uppercase">Bourses vedettes</p>
              <p className="text-3xl font-black text-slate-900 mt-2">{vedettesCount}</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#f1e9f9] flex items-center justify-center">
              <Star size={18} className="text-[#6B2D90]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#ede9f3] p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text- font-black tracking-widest text-[#6B2D90] uppercase">Articles récents</p>
              <p className="text-3xl font-black text-slate-900 mt-2">{articlesCount}</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#f1e9f9] flex items-center justify-center">
              <FileText size={18} className="text-[#6B2D90]" />
            </div>
          </div>
        </div>
      </div>

      {/* Répartition + Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#ede9f3] p-6 shadow-sm">
          <h3 className="font-black text- text-slate-900">Répartition du contenu</h3>
          <p className="text- text-slate-400 mb-6">Vue d'ensemble plateforme</p>

          <div className="space-y-5">
            {[
              { label: "Bourses actives", value: boursesActives },
              { label: "Partenaires", value: partenairesCount },
              { label: "À la une", value: vedettesCount },
              { label: "Articles", value: articlesCount },
            ].map((row) => (
              <div key={row.label}>
                <div className="flex justify-between text- mb-1.5">
                  <span className="font-semibold text-slate-700">{row.label}</span>
                  <span className="font-black text-slate-900">{row.value}</span>
                </div>
                <div className="w-full h-2 bg-[#faf8ff] rounded-full overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-[#6B2D90] transition-all"
                    style={{ width: `${(row.value / totalContent) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <DonutCard
          title="Distribution"
          subtitle="Tâches par type de contenu"
          segments={donutSegments}
          viewAllHref="/admin/bourses"
        />
      </div>

      {/* Listes réelles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-[#ede9f3] p-6 shadow-sm">
          <h3 className="font-black text-slate-900 mb-4">Partenaires récents</h3>
          <div className="space-y-3">
            {data?.partners.slice(0, 5).map((p: any) => (
              <div key={p.id} className="flex items-center justify-between">
                <div>
                  <p className="text- font-bold text-slate-800">{p.name}</p>
                  <p className="text- text-slate-400 truncate max-w-">{p.description}</p>
                </div>
                {p.is_featured && <span className="text- px-2 py-1 rounded-full bg-[#f1e9f9] text-[#6B2D90] font-black">VED</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#ede9f3] p-6 shadow-sm">
          <h3 className="font-black text-slate-900 mb-4">Articles récents</h3>
          <div className="space-y-3">
            {data?.recentPosts.slice(0, 5).map((post: any) => (
              <div key={post.id}>
                <p className="text- font-bold text-slate-800 line-clamp-1">{post.title}</p>
                <p className="text- text-slate-400 line-clamp-1">{post.excerpt}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}