"use client";

import { useServicesCrud } from "@/hooks/admin/useServicesCrud";
import { useProductsCrud } from "@/hooks/admin/useProductsCrud";
import { CrudTable, type CrudColumn } from "@/components/data/CrudTable";
import ReusableForm from "@/components/form/ReusableForm";
import { TabSlider } from "@/components/ui/TabSlider";
import { useEffect, useState, useMemo } from "react";
import type { Service } from "@/types";

type TabType = "services" | "products";

export default function ServicesPage() {
  const [activeTab, setActiveTab] = useState<TabType>("services");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Hooks
  const servicesHook = useServicesCrud();
  const productsHook = useProductsCrud();

  // Get state based on active tab
  const isLoading = activeTab === "services" ? servicesHook.isLoading : productsHook.isLoading;
  const error = activeTab === "services" ? servicesHook.error : productsHook.error;
  const items = activeTab === "services" ? servicesHook.services : productsHook.products;

  const dataList = useMemo(() => {
    if (!items) return [];
    if (Array.isArray(items)) return items;
    return (items as any).data ?? [];
  }, [items]);

  useEffect(() => {
    if (activeTab === "services") {
      servicesHook.fetchServices(page, 10, search || undefined);
    } else {
      productsHook.fetchProducts(page, 10, search || undefined);
    }
  }, [page, search, activeTab]);

  const handleDelete = async (item: any) => {
    try {
      if (activeTab === "services") {
        await servicesHook.delete(item.id);
        await servicesHook.fetchServices(page, 10, search || undefined);
      } else {
        await productsHook.delete(item.id);
        await productsHook.fetchProducts(page, 10, search || undefined);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFormSubmit = async (formData: FormData | any) => {
    try {
      // Extraire tous les champs du formulaire
      const payload: any = {};

      // Champs communs
      payload.title = formData instanceof FormData ? formData.get('title') : formData.title;
      payload.description = formData instanceof FormData ? formData.get('description') : formData.description;
      payload.price = parseInt(formData instanceof FormData ? (formData.get('price') || '0') : (formData.price || 0), 10);
      payload.is_active = (formData instanceof FormData ? formData.get('is_active') : formData.is_active) === 'on' || (formData instanceof FormData ? formData.get('is_active') : formData.is_active) === true;

      // Champs spécifiques au tab
      if (activeTab === "services") {
        payload.kind = formData instanceof FormData ? formData.get('kind') : formData.kind;
        if (!payload.kind) payload.kind = "coaching"; // Valeur par défaut
      } else {
        payload.category = formData instanceof FormData ? formData.get('category') : formData.category;
        if (!payload.category) payload.category = "autre"; // Valeur par défaut
      }

      // Log pour déboguer
      console.log("🟢 Payload envoyé:", { tab: activeTab, payload });

      if (activeTab === "services") {
        if (selectedItem) {
          await servicesHook.update(selectedItem.id, payload);
        } else {
          await servicesHook.create(payload);
        }
        await servicesHook.fetchServices(page, 10, search || undefined);
      } else {
        if (selectedItem) {
          await productsHook.update(selectedItem.id, payload);
        } else {
          await productsHook.create(payload);
        }
        await productsHook.fetchProducts(page, 10, search || undefined);
      }
      
      setIsModalOpen(false);
      setSelectedItem(null);
    } catch (err) {
      console.error("❌ Erreur handleFormSubmit:", err);
    }
  };

  const serviceColumns: CrudColumn<Service>[] = [
    { header: "Titre", key: "title" as keyof Service, width: "200px" },
    { header: "Type", key: "kind" as keyof Service },
    { header: "Prix", key: "price", render: (s) => `${(s as any).price ?? 0} FCFA` },
    {
      header: "Statut",
      key: "is_active" as keyof Service,
      render: (s) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
          (s as any).is_active
            ? 'bg-[#e0f7f6] text-[#0e7c7a]'
            : 'bg-slate-100 text-slate-500'
        }`}>
          {(s as any).is_active ? 'Actif' : 'Inactif'}
        </span>
      )
    },
  ];

  const productColumns: CrudColumn<any>[] = [
    { header: "Titre", key: "title", width: "200px" },
    { header: "Catégorie", key: "category" },
    { header: "Prix", key: "price", render: (p) => `${p.price ?? 0} FCFA` },
    {
      header: "Statut",
      key: "is_active",
      render: (p) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
          p.is_active
            ? 'bg-[#e0f7f6] text-[#0e7c7a]'
            : 'bg-slate-100 text-slate-500'
        }`}>
          {p.is_active ? 'Actif' : 'Inactif'}
        </span>
      )
    },
  ];

  const serviceFields: any[] = [
    { name: "title", label: "Titre", type: "text", required: true },
    { name: "kind", label: "Type", type: "select", required: true, options: [
      { label: "Coaching", value: "coaching" },
      { label: "Formation", value: "formation" },
      { label: "Dossier", value: "dossier" },
    ]},
    { name: "description", label: "Description", type: "textarea", required: true, gridSpan: 2 },
    { name: "price", label: "Prix (FCFA)", type: "number", required: true },
    { name: "image", label: "Image", type: "image-upload", maxImages: 1 },
    { name: "is_active", label: "Actif", type: "checkbox" },
  ];

  const productFields: any[] = [
    { name: "title", label: "Titre", type: "text", required: true },
    { name: "category", label: "Catégorie", type: "select", required: true, options: [
      { label: "eBook", value: "ebook" },
      { label: "Guide PDF", value: "guide_pdf" },
      { label: "Modèle de Lettre", value: "modele_lettre" },
      { label: "Autre", value: "autre" },
    ]},
    { name: "description", label: "Description", type: "textarea", required: true, gridSpan: 2 },
    { name: "price", label: "Prix (FCFA)", type: "number", required: true },
    { name: "image", label: "Image", type: "image-upload", maxImages: 1 },
    { name: "is_active", label: "Actif", type: "checkbox" },
  ];

  const columns = activeTab === "services" ? serviceColumns : productColumns;
  const fields = activeTab === "services" ? serviceFields : productFields;
  const title = activeTab === "services" ? "Services" : "Produits";
  const addLabel = activeTab === "services" ? "Nouveau Service" : "Nouveau Produit";

  return (
    <>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">Services & Produits</h1>
          <TabSlider
            tabs={[
              { id: "services", label: "Services", icon: "🛠️" },
              { id: "products", label: "Produits", icon: "📦" },
            ]}
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab as TabType);
              setPage(1);
              setSearch("");
            }}
          />
        </div>

        <CrudTable
          title={title}
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
            setSelectedItem(null);
            setIsModalOpen(true);
          }}
          onEdit={(item) => {
            setSelectedItem(item);
            setIsModalOpen(true);
          }}
          onDelete={handleDelete}
          addLabel={addLabel}
        />
      </div>

      <ReusableForm
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedItem(null);
        }}
        title={selectedItem ? `Éditer le ${activeTab === "services" ? "service" : "produit"}` : `Nouveau ${activeTab === "services" ? "service" : "produit"}`}
        subtitle={selectedItem ? `Modification de ${selectedItem.title}` : `Ajouter un nouveau ${activeTab === "services" ? "service" : "produit"}`}
        fields={fields}
        initialValues={selectedItem ? {
          title: selectedItem.title,
          kind: activeTab === "services" ? (selectedItem.kind ?? "coaching") : undefined,
          category: activeTab === "products" ? (selectedItem.category ?? "autre") : undefined,
          description: selectedItem.description ?? "",
          price: selectedItem.price ?? 0,
          is_active: selectedItem.is_active ?? true,
        } : { 
          is_active: true,
          description: "",
          kind: activeTab === "services" ? "coaching" : undefined,
          category: activeTab === "products" ? "autre" : undefined,
        }}
        onSubmit={handleFormSubmit}
      />
    </>
  );
}
