"use client";

import { usePublicationsCrud } from "@/hooks/admin/usePublicationsCrud";
import { CrudTable, type CrudColumn } from "@/components/data/CrudTable";
import ReusableForm from "@/components/form/ReusableForm";
import { useEffect, useState } from "react";
import type { Publication } from "@/types";

export default function PublicationsPage() {
  const { publications, isLoading, error, fetchPublications, create, update, delete: deletePublication } = usePublicationsCrud();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null);

  useEffect(() => {
    fetchPublications(page, 10, undefined, search || undefined);
  }, [page, search, fetchPublications]);

  const handleDelete = async (item: Publication) => {
    try {
      await deletePublication(item.id);
      await fetchPublications(page, 10, undefined, search || undefined);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFormSubmit = async (formData: FormData | any) => {
    try {
      // Convertir FormData en objet si nécessaire
      const payload: any = {};
      
      if (formData instanceof FormData) {
        // Si c'est FormData, extraire les champs
        for (const [key, value] of formData.entries()) {
          payload[key] = value;
        }
      } else {
        // Sinon c'est un objet normal
        payload.title = formData.title || "";
        payload.content = formData.content || "";
        payload.status = formData.status || "brouillon";
        payload.excerpt = formData.excerpt || "";
      }

      // Assure que les champs requis sont présents
      if (!payload.title || !payload.content) {
        console.error("Champs manquants:", { title: payload.title, content: payload.content });
        return;
      }

      if (selectedPublication) {
        await update(selectedPublication.id, payload);
      } else {
        await create(payload);
      }
      setIsModalOpen(false);
      setSelectedPublication(null);
      await fetchPublications(page, 10, undefined, search || undefined);
    } catch (err) {
      console.error(err);
    }
  };

  const STATUS_MAP: Record<string, { label: string; cls: string }> = {
    publie: { label: "Publié",   cls: "bg-green-100 text-green-700" },
    brouillon:     { label: "Brouillon", cls: "bg-slate-100 text-slate-600" },
    archive:  { label: "Archivé",  cls: "bg-amber-100 text-amber-700" },
  };

  const columns: CrudColumn<Publication>[] = [
    { header: "Titre", key: "title", width: "flex-1" },
    { header: "Auteur", key: "author", render: (p) => (p as any).author?.name || "-" },
    {
      header: "Date",
      key: "created_at",
      render: (p) =>
        (p as any).created_at
          ? new Date((p as any).created_at).toLocaleDateString("fr-FR")
          : "-",
    },
    {
      header: "Statut",
      key: "status",
      render: (p) => {
        const c = STATUS_MAP[p.status ?? "brouillon"] ?? STATUS_MAP.brouillon;
        return (
          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${c.cls}`}>
            {c.label}
          </span>
        );
      },
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <CrudTable
        title="Publications"
        columns={columns}
        data={publications}
        loading={isLoading}
        error={error}
        search={search}
        onSearch={setSearch}
        onAdd={() => { setSelectedPublication(null); setIsModalOpen(true); }}
        onEdit={(item) => { setSelectedPublication(item); setIsModalOpen(true); }}
        onDelete={handleDelete}
        addLabel="Nouvelle Publication"
      />

      <ReusableForm
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedPublication(null); }}
        title={selectedPublication ? "Éditer la publication" : "Nouvelle publication"}
        subtitle={
          selectedPublication
            ? `Modification de ${selectedPublication.title}`
            : "Créer une nouvelle publication"
        }
        fields={[
          { name: "title",   label: "Titre",   type: "text",      required: true, gridSpan: 2 },
          { name: "content", label: "Contenu", type: "rich-text", required: true, gridSpan: 2,
            placeholder: "Rédigez le contenu de votre publication ici..." },
          { name: "excerpt", label: "Extrait (optionnel)", type: "textarea", gridSpan: 2 },
          {
            name: "status", label: "Statut", type: "select",
            options: [
              { label: "Brouillon", value: "brouillon" },
              { label: "Publié",    value: "publie" },
              { label: "Archivé",   value: "archive" },
            ],
          },
          { name: "cover_image", label: "Image de couverture", type: "image-upload", maxImages: 1 },
          { name: "video_url", label: "Vidéo (URL ou upload)", type: "text", placeholder: "https://..." },
        ]}
        initialValues={
          selectedPublication
            ? {
                title:   selectedPublication.title,
                content: (selectedPublication as any).content ?? "",
                excerpt: (selectedPublication as any).excerpt ?? "",
                status:  selectedPublication.status ?? "brouillon",
              }
            : { status: "brouillon" }
        }
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}
