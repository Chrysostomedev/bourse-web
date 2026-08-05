"use client";

import { X } from "lucide-react";

interface DetailField {
  label: string;
  value: string | number | React.ReactNode;
}

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  reference?: string;
  fields?: DetailField[];
  descriptionContent?: string;
  onEdit?: () => void;
  customAction?: () => void;
  customActionLabel?: string;
  children?: React.ReactNode;
}

export default function SidePanel({
  isOpen,
  onClose,
  title,
  reference,
  fields = [],
  descriptionContent,
  onEdit,
  customAction,
  customActionLabel,
  children,
}: SidePanelProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-50 w-full max-w-md bg-white shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold">{title}</h2>
            {reference && <p className="text-sm text-slate-500">{reference}</p>}
          </div>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {fields.map((field, i) => (
            <div key={i}>
              <p className="text-sm text-slate-500 font-medium">{field.label}</p>
              <p className="text-slate-700">{field.value}</p>
            </div>
          ))}
          {descriptionContent && (
            <div>
              <p className="text-sm text-slate-500 font-medium">Description</p>
              <p className="text-slate-700">{descriptionContent}</p>
            </div>
          )}
          {children}
        </div>
        {(onEdit || customAction) && (
          <div className="border-t p-6 flex gap-3">
            {onEdit && (
              <button
                onClick={onEdit}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Éditer
              </button>
            )}
            {customAction && (
              <button
                onClick={customAction}
                className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
              >
                {customActionLabel || "Action"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
