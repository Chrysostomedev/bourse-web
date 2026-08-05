"use client";

import { useStats } from "@/hooks/admin/useStats";
import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Users, Globe, GraduationCap, FileText } from "lucide-react";

// Composants
import DonutCard, { type DonutSegment } from "@/components/ui/DonutCard";

export default function RapportsPage() {
  const { overview, isLoading, error, fetchOverview } = useStats();
  const [countryStats, setCountryStats] = useState<Array<{ country: string; count: number }>>([]);
  const [fieldStats, setFieldStats] = useState<Array<{ field: string; count: number }>>([]);

  useEffect(() => {
    fetchOverview();
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Charger les stats par pays et domaine depuis le service
      const countryResponse = await fetch("/stats/by-country");
      if (countryResponse.ok) {
        const countryData = await countryResponse.json();
        setCountryStats(countryData.data || []);
      }

      const fieldResponse = await fetch("/stats/by-field");
      if (fieldResponse.ok) {
        const fieldData = await fieldResponse.json();
        setFieldStats(fieldData.data || []);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des stats:", err);
    }
  };

  const colors = [
    "bg-blue-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-green-500",
    "bg-orange-500",
    "bg-red-500",
  ];

  const countrySegments: DonutSegment[] = countryStats.map((stat, idx) => ({
    label: stat.country,
    value: stat.count,
    color: colors[idx % colors.length],
  }));

  const fieldSegments: DonutSegment[] = fieldStats.map((stat, idx) => ({
    label: stat.field,
    value: stat.count,
    color: colors[idx % colors.length],
  }));

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900">Rapports & Statistiques</h1>
        <p className="text-sm text-slate-500 mt-1">Vue d'ensemble de l'activité et des indicateurs clés</p>
      </div>

      {/* Stats Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Utilisateurs */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium">Utilisateurs Total</p>
              <p className="text-3xl font-black text-blue-900 mt-2">
                {isLoading ? "..." : overview?.total_users || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <Users size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        {/* Total Bourses */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700 font-medium">Bourses Actives</p>
              <p className="text-3xl font-black text-purple-900 mt-2">
                {isLoading ? "..." : overview?.total_bourses || 0}
              </p>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <GraduationCap size={24} className="text-purple-600" />
            </div>
          </div>
        </div>

        {/* Total Pays */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">Pays Participants</p>
              <p className="text-3xl font-black text-green-900 mt-2">
                {isLoading ? "..." : overview?.active_countries || 0}
              </p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-xl">
              <Globe size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        {/* Total Partenaires */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border border-orange-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-700 font-medium">Partenaires</p>
              <p className="text-3xl font-black text-orange-900 mt-2">
                {isLoading ? "..." : overview?.total_partners || 0}
              </p>
            </div>
            <div className="p-3 bg-orange-500/20 rounded-xl">
              <TrendingUp size={24} className="text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution par Pays */}
        {countrySegments.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <DonutCard
              title="Distribution des Utilisateurs par Pays"
              segments={countrySegments}
            />
          </div>
        )}

        {/* Distribution par Domaine */}
        {fieldSegments.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <DonutCard
              title="Distribution par Domaine"
              segments={fieldSegments}
            />
          </div>
        )}
      </div>

      {/* Détails Pays */}
      {countryStats.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50">
            <h3 className="font-black text-slate-900 flex items-center gap-2">
              <Globe size={18} className="text-slate-500" />
              Utilisateurs par Pays
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-black text-slate-600 uppercase">Pays</th>
                  <th className="px-6 py-3 text-right text-xs font-black text-slate-600 uppercase">Utilisateurs</th>
                  <th className="px-6 py-3 text-right text-xs font-black text-slate-600 uppercase">% Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {countryStats.map((stat) => {
                  const total = countryStats.reduce((sum, s) => sum + s.count, 0);
                  const percentage = Math.round((stat.count / total) * 100);
                  return (
                    <tr key={stat.country} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 text-sm font-medium text-slate-700">{stat.country}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right">{stat.count}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                          {percentage}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Détails Domaines */}
      {fieldStats.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50">
            <h3 className="font-black text-slate-900 flex items-center gap-2">
              <BarChart3 size={18} className="text-slate-500" />
              Bourses par Domaine
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-black text-slate-600 uppercase">Domaine</th>
                  <th className="px-6 py-3 text-right text-xs font-black text-slate-600 uppercase">Bourses</th>
                  <th className="px-6 py-3 text-right text-xs font-black text-slate-600 uppercase">% Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {fieldStats.map((stat) => {
                  const total = fieldStats.reduce((sum, s) => sum + s.count, 0);
                  const percentage = Math.round((stat.count / total) * 100);
                  return (
                    <tr key={stat.field} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 text-sm font-medium text-slate-700">{stat.field}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right">{stat.count}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                          {percentage}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
