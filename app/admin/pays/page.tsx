"use client";

import { usePaysCrud } from "@/hooks/admin/usePaysCrud";
import { CrudTable, type CrudColumn } from "@/components/data/CrudTable";
import ReusableForm from "@/components/form/ReusableForm";
import { useEffect, useState } from "react";
import type { Pays } from "@/types";

export default function PaysPage() {
  const { pays, isLoading, error, fetchPays, create, update, delete: deletePays } = usePaysCrud();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPays, setSelectedPays] = useState<Pays | null>(null);

  useEffect(() => {
    fetchPays(page, 10, search || undefined);
  }, [page, search, fetchPays]);

  const handleDelete = async (item: Pays) => {
    if (confirm(`Supprimer "${item.name}" ?`)) {
      try {
        await deletePays(item.id);
        await fetchPays(page, 10, search || undefined);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      if (selectedPays) {
        await update(selectedPays.id, formData);
      } else {
        await create(formData);
      }
      setIsModalOpen(false);
      setSelectedPays(null);
      await fetchPays(page, 10, search || undefined);
    } catch (err) {
      console.error(err);
    }
  };

  const columns: CrudColumn<Pays>[] = [
    {
      header: "Nom",
      key: "name",
      render: (p) => (
        <span className="font-semibold text-slate-800">
          {(p as any).flag_emoji ?? "🌍"} {(p as any).name}
        </span>
      ),
      width: "flex-1",
    },
    { header: "Code ISO2", key: "code_iso2" as keyof Pays, width: "150px" },
  ];

  return (
    <div className="p-6 space-y-6">
      <CrudTable
        title="Pays"
        columns={columns}
        data={pays}
        loading={isLoading}
        error={error}
        search={search}
        onSearch={setSearch}
        onAdd={() => {
          setSelectedPays(null);
          setIsModalOpen(true);
        }}
        onEdit={(item) => {
          setSelectedPays(item);
          setIsModalOpen(true);
        }}
        onDelete={handleDelete}
        addLabel="Nouveau Pays"
      />

      <ReusableForm
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPays(null);
        }}
        title={selectedPays ? "Éditer le pays" : "Nouveau pays"}
        subtitle={selectedPays ? `Modification de ${selectedPays.name}` : "Ajouter un nouveau pays"}
        fields={[
          { name: "name", label: "Nom", type: "text", required: true },
          { name: "code_iso2", label: "Code ISO2", type: "text", required: true },
          { name: "flag_emoji", label: "Emoji Drapeau", type: "text" },
        ]}
        initialValues={selectedPays ? {
          name: selectedPays.name,
          code_iso2: selectedPays.code_iso2 ?? "",
          flag_emoji: selectedPays.flag_emoji ?? "",
        } : {}}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}
