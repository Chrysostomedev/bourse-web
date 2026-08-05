"use client";

import React, { useEffect, useState } from "react";
import { CrudTable, type CrudColumn } from "@/components/data/CrudTable";

interface Comment {
  id: number;
  content: string;
  user?: { name: string };
  created_at: string;
}

export default function CommentairesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Note: Placeholder - implement real API call when available
    setIsLoading(false);
  }, [page, search]);

  const handleDelete = async (comment: Comment) => {
    if (confirm(`Supprimer ce commentaire?`)) {
      // Implement delete when API is available
    }
  };

  const columns: CrudColumn<Comment>[] = [
    { header: "Auteur", key: "user" as any, width: "150px", render: (c) => (c as any).user?.name ?? "—" },
    { header: "Contenu", key: "content", render: (c) => (c as any).content?.substring(0, 50) + "..." },
    { header: "Date", key: "created_at" as any, render: (c) => new Date((c as any).created_at).toLocaleDateString('fr-FR') },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Commentaires</h1>
      <CrudTable
        title="Commentaires"
        columns={columns}
        data={comments ?? []}
        loading={isLoading}
        error={error}
        search={search}
        onSearch={(v) => {
          setSearch(v);
          setPage(1);
        }}
        onAdd={() => {}}
        onEdit={() => {}}
        onDelete={handleDelete}
        readOnly={true}
      />
    </div>
  );
}
