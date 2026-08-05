"use client";

import { LogOut, Loader2 } from "lucide-react";

interface LogoutModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export default function LogoutModal({
  isOpen,
  isLoading = false,
  onConfirm,
  onCancel,
}: LogoutModalProps) {
  if (!isOpen) return null;

  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative z-[10000] bg-white rounded-2xl shadow-2xl p-8 max-w-sm mx-4 pointer-events-auto animate-in fade-in zoom-in duration-200">
        {/* Icon */}
        <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-4">
          <LogOut size={24} className="text-orange-600" />
        </div>

        {/* Title */}
        <h2 className="text-lg font-black text-slate-900 mb-2">
          Déconnexion
        </h2>

        {/* Message */}
        <p className="text-sm text-slate-600 mb-6">
          Êtes-vous sûr de vouloir vous déconnecter? Vous devrez vous reconnecter pour accéder à votre compte.
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 font-semibold text-sm text-white transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Déconnexion...
              </>
            ) : (
              "Déconnecter"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
