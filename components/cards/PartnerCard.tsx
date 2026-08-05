"use client";

import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Users,
  ArrowUpRight,
  MapPin,
  Star,
} from "lucide-react";

export interface PartnerSummary {
  id: number | string;
  name: string;
  initials: string;
  logo_url?: string;
  color: string;
  country: {
    flag: string;
    name: string;
  };
  type: "UNIVERSITE" | "ORGANISME" | "ENTREPRISE" | "ONG";
  bourses_actives: number;
  etudiants_places: number;
  taux_acceptation: number;
  rating: number;
  href?: string;
}

const TYPE_CFG: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  UNIVERSITE: {
    label: "Université",
    bg: "bg-violet-100",
    text: "text-[#6B2FB4]",
  },
  ORGANISME: {
    label: "Organisme",
    bg: "bg-blue-100",
    text: "text-blue-600",
  },
  ENTREPRISE: {
    label: "Entreprise",
    bg: "bg-amber-100",
    text: "text-amber-600",
  },
  ONG: {
    label: "ONG",
    bg: "bg-green-100",
    text: "text-green-600",
  },
};

function ProgressRing({
  pct,
  color,
}: {
  pct: number;
  color: string;
}) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <svg
      width={52}
      height={52}
      viewBox="0 0 52 52"
      className="shrink-0 -rotate-90"
    >
      <circle
        cx="26"
        cy="26"
        r={r}
        fill="none"
        stroke="#f1f5f9"
        strokeWidth="5"
      />

      <circle
        cx="26"
        cy="26"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        style={{
          transition: "stroke-dasharray .4s ease",
        }}
      />
    </svg>
  );
}

export default function PartnerCard({
  partner,
}: {
  partner: PartnerSummary;
}) {
  const router = useRouter();

  const typeCfg = TYPE_CFG[partner.type];

  const ringColor =
    partner.taux_acceptation >= 70
      ? "#10b981"
      : partner.taux_acceptation >= 40
      ? "#6B2FB4"
      : "#E63946";

  const handleClick = () => {
    router.push(
      partner.href ?? `/admin/partenaires/${partner.id}`
    );
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4 cursor-pointer hover:shadow-md hover:border-[#6B2FB4]/30 transition-all group"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-12 h-12 rounded-xl ${partner.color} text-white text-lg font-black flex items-center justify-center shrink-0 overflow-hidden`}
          >
            {partner.logo_url ? (
              <img
                src={partner.logo_url}
                alt={partner.name}
                className="w-full h-full object-cover"
              />
            ) : (
              partner.initials
            )}
          </div>

          <div className="min-w-0">
            <p className="font-black text-slate-900 text-sm leading-tight truncate flex items-center gap-1">
              {partner.name}
              <span className="text-xs">
                {partner.country.flag}
              </span>
            </p>

            <span
              className={`inline-flex items-center px-2 py-0.5 mt-1 rounded-full text-xs font-black ${typeCfg.bg} ${typeCfg.text}`}
            >
              {typeCfg.label}
            </span>
          </div>
        </div>

        <div className="relative shrink-0">
          <ProgressRing
            pct={partner.taux_acceptation}
            color={ringColor}
          />

          <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-slate-700">
            {partner.taux_acceptation}%
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2 bg-violet-50 rounded-xl px-3 py-2.5">
          <GraduationCap
            size={14}
            className="text-[#6B2FB4] shrink-0"
          />

          <div>
            <p className="text-xs text-violet-400 font-medium leading-none">
              Bourses actives
            </p>

            <p className="text-lg font-black text-[#6B2FB4] leading-tight">
              {partner.bourses_actives}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-blue-50 rounded-xl px-3 py-2.5">
          <Users
            size={14}
            className="text-blue-500 shrink-0"
          />

          <div>
            <p className="text-xs text-blue-400 font-medium leading-none">
              Étudiants placés
            </p>

            <p className="text-lg font-black text-blue-700 leading-tight">
              {partner.etudiants_places}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-amber-50 rounded-xl px-3 py-2.5">
          <MapPin
            size={14}
            className="text-amber-500 shrink-0"
          />

          <div>
            <p className="text-xs text-amber-500 font-medium leading-none">
              Pays
            </p>

            <p className="text-lg font-black text-amber-700 leading-tight truncate">
              {partner.country.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-green-50 rounded-xl px-3 py-2.5">
          <Star
            size={14}
            className="text-green-500 fill-green-500 shrink-0"
          />

          <div>
            <p className="text-xs text-green-500 font-medium leading-none">
              Rating
            </p>

            <p className="text-lg font-black text-green-700 leading-tight">
              {partner.rating}/5
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-50">
        <div className="w-full bg-slate-100 rounded-full h-1.5">
          <div
            className="h-1.5 rounded-full transition-all"
            style={{
              width: `${partner.taux_acceptation}%`,
              backgroundColor: ringColor,
            }}
          />
        </div>

        <div className="flex items-center gap-1 ml-3 text-[#6B2FB4] text-sm font-bold whitespace-nowrap group-hover:underline">
          Voir
          <ArrowUpRight size={13} />
        </div>
      </div>
    </div>
  );
}