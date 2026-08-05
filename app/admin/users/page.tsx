"use client";

import { useUsersCrud } from "@/hooks/admin/useUsersCrud";
import { CrudTable, type CrudColumn } from "@/components/data/CrudTable";
import ReusableForm from "@/components/form/ReusableForm";
import { useEffect, useState } from "react";
import type { User } from "@/types";

export default function UsersPage() {
  const { users, isLoading, error, fetchUsers, create, update, delete: deleteUser } = useUsersCrud();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers(page, 10, { search: search || undefined });
  }, [page, search, fetchUsers]);

  const handleDelete = async (item: User) => {
    if (confirm(`Supprimer "${item.email}" ?`)) {
      try {
        await deleteUser(item.id);
        await fetchUsers(page, 10, { search: search || undefined });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      if (selectedUser) {
        await update(selectedUser.id, formData);
      } else {
        await create(formData);
      }
      setIsModalOpen(false);
      setSelectedUser(null);
      await fetchUsers(page, 10, { search: search || undefined });
    } catch (err) {
      console.error(err);
    }
  };

  const columns: CrudColumn<User>[] = [
    { header: "Nom", key: "name", width: "flex-1" },
    { header: "Email", key: "email" },
    { header: "Rôle", key: "role" },
    // { header: "Statut", key: "status" },
  ];

  return (
    <div className="p-6 space-y-6">
      <CrudTable
        title="Utilisateurs"
        columns={columns}
        data={users}
        loading={isLoading}
        error={error}
        search={search}
        onSearch={setSearch}
        onAdd={() => {
          setSelectedUser(null);
          setIsModalOpen(true);
        }}
        onEdit={(item) => {
          setSelectedUser(item);
          setIsModalOpen(true);
        }}
        onDelete={handleDelete}
        addLabel="Nouvel Utilisateur"
      />

      <ReusableForm
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
        }}
        title={selectedUser ? "Éditer l'utilisateur" : "Nouvel utilisateur"}
        subtitle={selectedUser ? `Modification de ${selectedUser.name}` : "Ajouter un nouvel utilisateur"}
        fields={[
          { name: "name", label: "Nom Complet", type: "text", required: true },
          { name: "email", label: "Email", type: "email", required: true },
          { name: "phone", label: "Téléphone", type: "tel" },
          { name: "role", label: "Rôle", type: "select", required: true, options: [
            { label: "Admin", value: "admin" },
            { label: "Rédacteur", value: "redacteur" },
            { label: "Utilisateur", value: "user" },
          ]},
          { name: "status", label: "Statut", type: "select", options: [
            { label: "Actif", value: "active" },
            { label: "Inactif", value: "inactive" },
            { label: "Suspendu", value: "suspended" },
          ]},
          !selectedUser && { name: "password", label: "Mot de passe", type: "password", required: true },
        ].filter(Boolean) as any[]}
        initialValues={selectedUser ? {
          name: selectedUser.name,
          email: selectedUser.email,
          phone: (selectedUser as any).phone,
          role: selectedUser.role,
          status: selectedUser.status,
        } : {}}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}
