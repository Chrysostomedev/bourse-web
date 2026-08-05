"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ExternalLink, ToggleRight } from "lucide-react";
import type { Partenaire } from "@/types";

interface PartnerDetailsModalProps {
  isOpen: boolean;
  partner: Partenaire | null;
  onClose: () => void;
  onToggleActive: (id: number, isActive: boolean) => Promise<void>;
  isLoading?: boolean;
}

export function PartnerDetailsModal({
  isOpen,
  partner,
  onClose,
  onToggleActive,
  isLoading = false,
}: PartnerDetailsModalProps) {
  const [isToggling, setIsToggling] = useState(false);

  if (!isOpen || !partner) return null;

  const handleToggleActive = async () => {
    setIsToggling(true);
    try {
      await onToggleActive(partner.id, !(partner as any).is_active);
    } finally {
      setIsToggling(false);
    }
  };

  const isActive = (partner as any).is_active ?? true;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Détails du Partenaire</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded transition"
          >
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Logo */}
          {(partner as any).logo_url && (
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
                <Image
                  src={(partner as any).logo_url}
                  alt={partner.name}
                  width={96}
                  height={96}
                  className="object-cover"
                />
              </div>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Nom
            </label>
            <p className="text-lg font-bold text-slate-900 mt-1">{partner.name}</p>
          </div>

          {/* Website */}
          {(partner as any).website && (
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Site Web
              </label>
              <a
                href={(partner as any).website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline mt-1 flex items-center gap-2"
              >
                {(partner as any).website}
                <ExternalLink size={14} />
              </a>
            </div>
          )}

          {/* Description */}
          {(partner as any).description && (
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Description
              </label>
              <p className="text-slate-700 mt-2 text-sm leading-relaxed">
                {(partner as any).description}
              </p>
            </div>
          )}

          {/* Featured Status */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              À la une
            </label>
            <p className="text-slate-900 mt-1 font-medium">
              {(partner as any).is_featured ? "✓ Oui" : "Non"}
            </p>
          </div>

          {/* Active Status */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">Statut</p>
                <p className="text-sm text-slate-600 mt-1">
                  {isActive ? "Partenaire actif" : "Partenaire désactivé"}
                </p>
              </div>
              <button
                onClick={handleToggleActive}
                disabled={isToggling || isLoading}
                className={`p-2 rounded-lg transition ${
                  isActive
                    ? "bg-green-100 text-green-600 hover:bg-green-200"
                    : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <ToggleRight size={20} />
              </button>
            </div>
          </div>

          {/* Created Date */}
          <div className="text-xs text-slate-500">
            <span>
              Créé le{" "}
              {new Date((partner as any).created_at ?? new Date()).toLocaleDateString(
                "fr-FR"
              )}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
