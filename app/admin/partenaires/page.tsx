"use client";

import { usePartenairersCrud } from "@/hooks/admin/usePartenairersCrud";
import { CrudTable, type CrudColumn } from "@/components/data/CrudTable";
import ReusableForm from "@/components/form/ReusableForm";
import { useEffect, useState, useMemo } from "react";
import type { Partenaire } from "@/types";

export default function PartenairesPage() {
  const { partenaires, isLoading, error, fetchPartenaires, create, update, delete: deletePartenaire } = usePartenairersCrud();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPartenaire, setSelectedPartenaire] = useState<Partenaire | null>(null);

  // FIX: normalise toujours en tableau, même si le hook renvoie undefined ou {data:[]}
  const dataList = useMemo(() => {
    if (!partenaires) return [];
    if (Array.isArray(partenaires)) return partenaires;
    return (partenaires as any).data?? [];
  }, [partenaires]);

  useEffect(() => {
    fetchPartenaires(page, 10, search || undefined);
  }, [page, search, fetchPartenaires]);

  const handleDelete = async (item: Partenaire) => {
    if (confirm(`Supprimer "${item.name}"?`)) {
      try {
        await deletePartenaire(item.id);
        await fetchPartenaires(page, 10, search || undefined);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleFormSubmit = async (formData: FormData | any) => {
    try {
      // Extraire tous les champs du formulaire
      const payload: any = {
        name: formData instanceof FormData ? formData.get('name') : formData.name,
        website: formData instanceof FormData ? formData.get('website') : formData.website,
        description: formData instanceof FormData ? formData.get('description') : formData.description,
        is_featured: (formData instanceof FormData ? formData.get('is_featured') : formData.is_featured) === 'on' || (formData instanceof FormData ? formData.get('is_featured') : formData.is_featured) === true,
      };

      // Utiliser les valeurs sélectionnées pour combler les trous
      if (!payload.name && selectedPartenaire) payload.name = selectedPartenaire.name;
      if (!payload.website && selectedPartenaire) payload.website = selectedPartenaire.website;
      if (!payload.description && selectedPartenaire) payload.description = selectedPartenaire.description;

      // Logguer pour déboguer
      console.log("🟢 Payload partenaire envoyé:", payload);

      if (selectedPartenaire) {
        await update(selectedPartenaire.id, payload);
      } else {
        await create(payload);
      }
      setIsModalOpen(false);
      setSelectedPartenaire(null);
      await fetchPartenaires(page, 10, search || undefined);
    } catch (err) {
      console.error("❌ Erreur handleFormSubmit:", err);
    }
  };

  const columns: CrudColumn<Partenaire>[] = [
    { header: "Nom", key: "name", width: "flex-1" },
    { header: "Site Web", key: "website", render: (p) => (p as any).website || "-" },
    {
      header: "À la une",
      key: "is_featured" as keyof Partenaire, // Cast to avoid TS error if not in type
      render: (p) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
          (p as any).is_featured
            ? 'bg-[#e0f7f6] text-[#0e7c7a]'
            : 'bg-slate-100 text-slate-500'
        }`}>
          {(p as any).is_featured ? 'Oui' : 'Non'}
        </span>
      )
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <CrudTable
        title="Partenaires"
        columns={columns}
        data={dataList}
        loading={isLoading}
        error={error}
        search={search}
        onSearch={(v) => {
          setSearch(v);
          setPage(1);
        }}
        onAdd={() => {
          setSelectedPartenaire(null);
          setIsModalOpen(true);
        }}
        onEdit={(item) => {
          setSelectedPartenaire(item);
          setIsModalOpen(true);
        }}
        onDelete={handleDelete}
        addLabel="Nouveau Partenaire"
      />

      <ReusableForm
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPartenaire(null);
        }}
        title={selectedPartenaire? "Éditer le partenaire" : "Nouveau partenaire"}
        subtitle={selectedPartenaire? `Modification de ${selectedPartenaire.name}` : "Ajouter un nouveau partenaire"}
        fields={[
          { name: "name", label: "Nom", type: "text", required: true },
          { name: "logo", label: "Logo", type: "image-upload", maxImages: 1 },
          { name: "website", label: "Site Web", type: "text" },
          { name: "description", label: "Description", type: "textarea", gridSpan: 2 },
          { name: "is_featured", label: "Mettre à la une", type: "checkbox" },
        ]}
        initialValues={selectedPartenaire? {
          name: selectedPartenaire.name,
          website: (selectedPartenaire as any).website?? "",
          description: (selectedPartenaire as any).description?? "",
          is_featured: (selectedPartenaire as any).is_featured?? false,
        } : {}}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}