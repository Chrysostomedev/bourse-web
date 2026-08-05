"use client";

import { Search, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import ConfirmModal from "@/components/modals/ConfirmModal";

export interface CrudColumn<T> {
    header: string;
    key: keyof T | "actions";
    render?: (item: T) => React.ReactNode;
    width?: string;
}

interface Props<T extends { id: number | string }> {
    title: string;
    columns: CrudColumn<T>[];
    data: T[];
    loading: boolean;
    error?: string | null;
    search: string;
    onSearch: (v: string) => void;
    onAdd: () => void;
    onEdit: (item: T) => void;
    onDelete: (item: T) => void;
    addLabel?: string;
    pagination?: {
        currentPage: number;
        lastPage: number;
        onPage: (p: number) => void;
    };
    readOnly?: boolean;
}

export function CrudTable<T extends { id: number | string }>({
    title, columns, data, loading, error,
    search, onSearch, onAdd, onEdit, onDelete,
    addLabel = "Ajouter", pagination, readOnly = false,
}: Props<T>) {
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<T | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteClick = (item: T) => {
        setItemToDelete(item);
        setDeleteConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        setIsDeleting(true);
        try {
            await onDelete(itemToDelete);
            setDeleteConfirmOpen(false);
            setItemToDelete(null);
        } finally {
            setIsDeleting(false);
        }
    };

    // FIX crash + sécurise
    const safeData = data?? [];
    const safeColumns = columns?? [];

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                        value={search}
                        onChange={e => onSearch(e.target.value)}
                        placeholder="Rechercher…"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#ede9f3] bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#6B2D90] focus:ring-2 focus:ring-[#6B2D90]/20 transition"
                    />
                </div>
                {!readOnly && (
                    <button
                        onClick={onAdd}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#6B2D90] text-white rounded-xl font-semibold text-sm hover:bg-[#5a257a] transition shadow-sm whitespace-nowrap"
                    >
                        <Plus size={15} strokeWidth={2.5} />
                        {addLabel}
                    </button>
                )}
            </div>

            {/* Error */}
            {error && (
                <p className="text-sm text-[#F25C5C] bg-[#fef1f1] border border-[#fde2e2] rounded-xl px-4 py-3">
                    {error}
                </p>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl border border-[#ede9f3] shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-50">
                    <h3 className="font-black text-slate-800 text-">{title}</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-[#faf8ff]">
                                {safeColumns.map((col) => (
                                    <th
                                        key={String(col.key)}
                                        style={{ width: col.width }}
                                        className="px-4 py-3 text-left text- font-black text-slate-500 uppercase tracking-wider whitespace-nowrap"
                                    >
                                        {col.header}
                                    </th>
                                ))}
                                <th className="px-4 py-3 text-right text- font-black text-slate-500 uppercase tracking-wider w-24">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading? (
                                <tr>
                                    <td colSpan={safeColumns.length + 1} className="py-12 text-center">
                                        <div className="flex items-center justify-center">
                                            <Loader2 className="animate-spin text-[#6B2D90]" size={24} />
                                        </div>
                                    </td>
                                </tr>
                            ) : safeData.length === 0? (
                                <tr>
                                    <td colSpan={safeColumns.length + 1} className="py-10 text-center text-slate-400 text-sm italic">
                                        Aucun élément trouvé
                                    </td>
                                </tr>
                            ) : (
                                safeData.map((item) => (
                                    <tr key={item.id} className="hover:bg-[#faf8ff] transition-colors">
                                        {safeColumns.map((col) => (
                                            <td key={String(col.key)} className="px-4 py-3.5 text-sm text-slate-700">
                                                {col.render
                                                   ? col.render(item)
                                                    : col.key!== "actions"
                                                   ? String((item as any)[col.key]?? "—")
                                                    : null}
                                            </td>
                                        ))}
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center justify-end gap-1">
                                                {!readOnly && (
                                                    <button
                                                        onClick={() => onEdit(item)}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#6B2D90] hover:bg-[#f1e9f9] transition"
                                                        title="Modifier"
                                                    >
                                                        <Pencil size={14} />
                                                    </button>
                                                )}
                                                {!readOnly && (
                                                    <button
                                                        onClick={() => handleDeleteClick(item)}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#F25C5C] hover:bg-[#fef1f1] transition"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.lastPage > 1 && (
                    <div className="flex justify-end items-center gap-1.5 px-5 py-3 border-t border-slate-50 bg-[#faf8ff]">
                        <button
                            onClick={() => pagination.onPage(Math.max(1, pagination.currentPage - 1))}
                            disabled={pagination.currentPage === 1}
                            className="w-8 h-8 rounded-lg border border-[#ede9f3] text-slate-500 flex items-center justify-center hover:bg-white disabled:opacity-40 text-sm transition"
                        >‹</button>
                        {Array.from({ length: Math.min(pagination.lastPage, 7) }, (_, i) => i + 1).map(n => (
                            <button
                                key={n}
                                onClick={() => pagination.onPage(n)}
                                className={`w-8 h-8 rounded-lg text- font-bold transition ${
                                    pagination.currentPage === n
                                       ? "bg-[#6B2D90] text-white shadow-sm"
                                        : "border border-[#ede9f3] text-slate-600 hover:bg-white"
                                }`}
                            >{n}</button>
                        ))}
                        <button
                            onClick={() => pagination.onPage(Math.min(pagination.lastPage, pagination.currentPage + 1))}
                            disabled={pagination.currentPage === pagination.lastPage}
                            className="w-8 h-8 rounded-lg bg-[#6B2D90] text-white flex items-center justify-center hover:bg-[#5a257a] disabled:opacity-40 text-sm transition"
                        >›</button>
                    </div>
                )}
            </div>

            {/* Confirm Delete Modal */}
            <ConfirmModal
                isOpen={deleteConfirmOpen}
                title="Confirmer la suppression"
                message={`Êtes-vous sûr de vouloir supprimer cet élément? Cette action est irréversible.`}
                confirmLabel="Supprimer"
                cancelLabel="Annuler"
                isDangerous
                isLoading={isDeleting}
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeleteConfirmOpen(false)}
            />
        </div>
    );
}
