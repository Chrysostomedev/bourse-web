/**
 * EXEMPLE COMPLET : Page Gestion des Bourses
 * À adapter et utiliser comme référence pour créer d'autres pages CRUD
 * 
 * Fonctionnalités:
 * - Affichage paginé des bourses
 * - Recherche/filtrage
 * - Créer, éditer, supprimer
 * - Gestion d'erreurs et états de chargement
 */

"use client";

import { useBoursesCrud } from "@/hooks/admin";
import { useEffect, useState, useCallback } from "react";
import type { CreateBourseDTO, UpdateBourseDTO, Bourse } from "@/types";

export default function BoursesPage() {
  const {
    bourses,
    pagination,
    selectedBourse,
    isLoading,
    isSaving,
    error,
    fetchBourses,
    fetchById,
    create,
    update,
    delete: deleteBourse,
    clearSelected,
    clearError,
  } = useBoursesCrud();

  // Local state pour le formulaire et les filtres
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [formData, setFormData] = useState<CreateBourseDTO>({
    title: "",
    country_id: 0,
    amount: 0,
    currency: "USD",
    level: "master",
    status: "publie",
  });

  // Charger les bourses au montage et quand les filtres changent
  useEffect(() => {
    fetchBourses(currentPage, 10, search || undefined, status || undefined);
  }, [currentPage, search, status, fetchBourses]);

  // Handlers
  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setCurrentPage(1);
  }, []);

  const handleStatusChange = useCallback((value: string) => {
    setStatus(value);
    setCurrentPage(1);
  }, []);

  const handleOpenCreate = useCallback(() => {
    clearSelected();
    setFormMode("create");
    setFormData({
      title: "",
      description: "",
      country_id: 0,
      amount: 0,
      currency: "USD",
      level: "master",
      status: "publie",
    });
    setIsFormOpen(true);
  }, [clearSelected]);

  const handleOpenEdit = useCallback(
    (id: number) => {
      setFormMode("edit");
      fetchById(id);
      setIsFormOpen(true);
    },
    [fetchById]
  );

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    clearSelected();
  }, [clearSelected]);

  const handleSave = useCallback(async () => {
    try {
      if (formMode === "create") {
        await create(formData);
        // toast.success("Bourse créée avec succès");
      } else {
        if (!selectedBourse) return;
        await update(selectedBourse.id, formData);
        // toast.success("Bourse mise à jour avec succès");
      }
      handleCloseForm();
      await fetchBourses(currentPage, 10, search || undefined, status || undefined);
    } catch (err) {
      // toast.error(error || "Erreur lors de l'enregistrement");
      console.error(err);
    }
  }, [formMode, formData, selectedBourse, create, update, handleCloseForm, currentPage, search, status, fetchBourses]);

  const handleDelete = useCallback(
    async (id: number, title: string) => {
      if (!confirm(`Supprimer la bourse "${title}" ?`)) return;

      try {
        await deleteBourse(id);
        // toast.success("Bourse supprimée");
        await fetchBourses(currentPage, 10, search || undefined, status || undefined);
      } catch (err) {
        // toast.error(error || "Erreur lors de la suppression");
        console.error(err);
      }
    },
    [currentPage, search, status, deleteBourse, fetchBourses]
  );

  // Effet pour remplir le formulaire quand une bourse est sélectionnée
  useEffect(() => {
    if (selectedBourse && isFormOpen && formMode === "edit") {
      setFormData({
        title: selectedBourse.title,
        description: selectedBourse.description,
        country_id: selectedBourse.country_id,
        amount: selectedBourse.amount || 0,
        currency: selectedBourse.currency || "USD",
        level: selectedBourse.level || "master",
        status: selectedBourse.status || "active",
      });
    }
  }, [selectedBourse, isFormOpen, formMode]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestion des Bourses</h1>
        <button
          onClick={handleOpenCreate}
          disabled={isSaving}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          + Nouvelle Bourse
        </button>
      </div>

      {/* Erreur globale */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex justify-between">
          <span>{error}</span>
          <button onClick={clearError} className="font-bold">×</button>
        </div>
      )}

      {/* Filtres */}
      <div className="bg-gray-50 p-4 rounded mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="px-3 py-2 border rounded flex-1"
        />
        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="px-3 py-2 border rounded"
        >
          <option value="">Tous les statuts</option>
          <option value="active">Actif</option>
          <option value="inactive">Inactif</option>
          <option value="archived">Archivé</option>
        </select>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">Chargement...</div>
        ) : bourses.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Aucune bourse trouvée</div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Titre</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Pays</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Montant</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Niveau</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Statut</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {bourses.map((bourse) => (
                  <tr key={bourse.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">{bourse.title}</td>
                    <td className="px-6 py-4 text-sm">{bourse.country?.name || "-"}</td>
                    <td className="px-6 py-4 text-sm">
                      {bourse.amount} {bourse.currency}
                    </td>
                    <td className="px-6 py-4 text-sm">{bourse.level}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          bourse.status === "active"
                            ? "bg-green-100 text-green-800"
                            : bourse.status === "inactive"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {bourse.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => handleOpenEdit(bourse.id)}
                        disabled={isSaving}
                        className="text-blue-600 hover:text-blue-800 mr-3 disabled:opacity-50"
                      >
                        Éditer
                      </button>
                      <button
                        onClick={() => handleDelete(bourse.id, bourse.title)}
                        disabled={isSaving}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination && pagination.last_page > 1 && (
              <div className="px-6 py-4 border-t flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Page {pagination.current_page} sur {pagination.last_page}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(pagination.last_page, p + 1))}
                    disabled={currentPage === pagination.last_page}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Formulaire */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {formMode === "create" ? "Nouvelle Bourse" : "Éditer la Bourse"}
            </h2>

            {/* Formulaire */}
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Titre"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              />
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded h-20"
              />
              <input
                type="number"
                placeholder="Montant"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border rounded"
              />
              <input
                type="text"
                placeholder="Devise (ex: USD)"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              />
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="bachelor">Licence</option>
                <option value="master">Master</option>
                <option value="phd">Doctorat</option>
              </select>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" | "archived" })}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
                <option value="archived">Archivé</option>
              </select>
            </div>

            {/* Boutons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isSaving ? "Enregistrement..." : "Enregistrer"}
              </button>
              <button
                onClick={handleCloseForm}
                disabled={isSaving}
                className="flex-1 bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 disabled:opacity-50"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
