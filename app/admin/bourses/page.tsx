"use client";

import { useBoursesCrud } from "@/hooks/admin/useBoursesCrud";
import { boursesService } from "@/services/admin/bourses.service";
import ReusableForm, { type FieldConfig } from "@/components/form/ReusableForm";
import DataTable from "@/components/ui/DataTable";
import PageHeader from "@/components/ui/PageHeader";
import Paginate from "@/components/ui/Paginate";
import SideDetailsPanel from "@/components/modals/SideDetailsPanel";
import { useCallback, useEffect, useState } from "react";
import type { Bourse, StudyLevel, FieldOfStudy, ScholarshipType, Pays } from "@/types";
import {
  Eye,
  GraduationCap,
  Globe,
  Award,
  CheckCircle,
  Archive,
  FileText,
  DollarSign,
  Search,
  Plus,
  Trash2,
} from "lucide-react";

// ── Stats Card ────────────────────────────────────────────────────────────────
function StatsCard({ label, value, icon: Icon, color }: { label: string; value: any; icon: any; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
      <div className="flex justify-between">
        <div>
          <p className="text-xs font-black uppercase text-slate-500">{label}</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

// ── Status Badge ──────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  brouillon: { label: "Brouillon", bg: "bg-slate-50", text: "text-slate-600 border-slate-200" },
  publie: { label: "Publié", bg: "bg-green-50", text: "text-green-700 border-green-200" },
  archive: { label: "Archivé", bg: "bg-amber-50", text: "text-amber-700 border-amber-200" },
};

const FUNDING_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  partielle: { label: "⚡ Partielle", bg: "bg-amber-50", text: "text-amber-700 border-amber-200" },
  totale: { label: "✅ Totale", bg: "bg-green-50", text: "text-green-700 border-green-200" },
};

export default function BoursesPage() {
  const {
    bourses,
    pagination,
    isLoading,
    isSaving,
    error,
    fetchBourses,
    create,
    update,
    delete: deleteBourse,
  } = useBoursesCrud();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBourse, setSelectedBourse] = useState<Bourse | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [detailsItem, setDetailsItem] = useState<any>(null);

  // ── Données de référence pour le formulaire ─────────────────────────────
  const [studyLevels, setStudyLevels] = useState<StudyLevel[]>([]);
  const [fieldsOfStudy, setFieldsOfStudy] = useState<FieldOfStudy[]>([]);
  const [scholarshipTypes, setScholarshipTypes] = useState<ScholarshipType[]>([]);
  const [countries, setCountries] = useState<Pays[]>([]);

  // Intakes dynamiques dans le formulaire
  const [intakes, setIntakes] = useState<{ intake_label: string; period_start: string; period_end: string; period_label_text: string }[]>([
    { intake_label: "", period_start: "", period_end: "", period_label_text: "" },
  ]);

  // ── Chargement initial ──────────────────────────────────────────────────
  useEffect(() => {
    fetchBourses(page, 10, search || undefined, statusFilter || undefined);
  }, [page, search, statusFilter, fetchBourses]);

  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        const [sl, fos, st, c] = await Promise.all([
          boursesService.getStudyLevels(),
          boursesService.getFieldsOfStudy(),
          boursesService.getScholarshipTypes(),
          boursesService.getCountries(),
        ]);
        setStudyLevels(Array.isArray(sl) ? sl : (sl as any)?.data ?? []);
        setFieldsOfStudy(Array.isArray(fos) ? fos : (fos as any)?.data ?? []);
        setScholarshipTypes(Array.isArray(st) ? st : (st as any)?.data ?? []);
        setCountries(Array.isArray(c) ? c : (c as any)?.data ?? []);
      } catch (err) {
        console.warn("[BoursesPage] Erreur chargement données de référence:", err);
      }
    };
    loadReferenceData();
  }, []);

  // ── Ouvrir les détails ──────────────────────────────────────────────────
  const handleOpenDetails = (item: Bourse) => {
    const statusConf = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.brouillon;
    const fundingConf = FUNDING_CONFIG[item.funding_type] ?? FUNDING_CONFIG.partielle;
    setDetailsItem({
      title: `${item.country?.flag_emoji ?? "🌍"} ${item.title}`,
      reference: `${statusConf.label} — ${fundingConf.label}`,
      fields: [
        { label: "Organisme", value: item.organism_name },
        { label: "Pays", value: item.country ? `${item.country.flag_emoji ?? ""} ${item.country.name}` : "-" },
        { label: "Financement", value: fundingConf.label },
        { label: "Statut", value: statusConf.label },
        { label: "Niveaux d'études", value: item.study_levels?.map((s) => s.name).join(", ") || "-" },
        { label: "Filières", value: item.fields_of_study?.map((f) => f.name).join(", ") || "-" },
        { label: "Lien officiel", value: item.official_link || "-" },
      ],
      description: `
        <div class="space-y-4">
          <div class="p-3 rounded-xl bg-blue-50 border border-blue-100"><p class="text-xs font-black text-blue-700 uppercase">Objectif</p><p class="text-sm mt-1">${item.objective || "-"}</p></div>
          <div class="p-3 rounded-xl bg-green-50 border border-green-100"><p class="text-xs font-black text-green-700 uppercase">Avantages</p><p class="text-sm mt-1">${item.advantages || "-"}</p></div>
          <div class="p-3 rounded-xl bg-amber-50 border border-amber-100"><p class="text-xs font-black text-amber-700 uppercase">Conditions</p><p class="text-sm mt-1">${item.conditions || "-"}</p></div>
          ${item.additional_info?.length ? `<div class="p-3 rounded-xl bg-orange-50 border border-orange-100"><p class="text-xs font-black text-orange-700 uppercase">Infos complémentaires</p><ul class="text-sm mt-1 list-disc pl-4">${item.additional_info.map((info) => `<li>${info}</li>`).join("")}</ul></div>` : ""}
          ${item.intakes?.length ? `<div class="p-3 rounded-xl bg-violet-50 border border-violet-100"><p class="text-xs font-black text-[#6B2FB4] uppercase">Périodes de candidature</p><ul class="text-sm mt-1 space-y-1">${item.intakes.map((i) => `<li><strong>${i.intake_label}</strong>${i.period_label_text ? ` — ${i.period_label_text}` : ""}${i.period_start ? ` (${i.period_start} → ${i.period_end ?? "?"})` : ""}</li>`).join("")}</ul></div>` : ""}
        </div>
      `,
      rawData: item,
    });
    setIsDetailsOpen(true);
  };

  // ── Supprimer ───────────────────────────────────────────────────────────
  const handleDelete = async (item: Bourse) => {
    if (confirm(`Supprimer "${item.title}" ?`)) {
      try {
        await deleteBourse(item.id);
        await fetchBourses(page, 10, search || undefined, statusFilter || undefined);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // ── Soumettre le formulaire ─────────────────────────────────────────────
  const handleFormSubmit = async (formData: any) => {
    try {
      const payload: any = {
        title: formData.title,
        organism_name: formData.organism_name,
        country_id: formData.country_id ? Number(formData.country_id) : undefined,
        scholarship_type_id: formData.scholarship_type_id ? Number(formData.scholarship_type_id) : undefined,
        funding_type: formData.funding_type || "partielle",
        objective: formData.objective,
        conditions: formData.conditions,
        advantages: formData.advantages,
        additional_info: formData.additional_info
          ? formData.additional_info.split("\n").map((s: string) => s.trim()).filter(Boolean)
          : [],
        official_link: formData.official_link || undefined,
        status: formData.status || "brouillon",
        is_featured: formData.is_featured === "true" || formData.is_featured === true,
        study_level_ids: formData.study_level_ids
          ? (Array.isArray(formData.study_level_ids)
              ? formData.study_level_ids
              : formData.study_level_ids.split(",")
            ).map(Number)
          : [],
        field_of_study_ids: formData.field_of_study_ids
          ? (Array.isArray(formData.field_of_study_ids)
              ? formData.field_of_study_ids
              : formData.field_of_study_ids.split(",")
            ).map(Number)
          : [],
        intakes: intakes.filter((i) => i.intake_label.trim() !== ""),
      };

      // Fichiers
      if (formData.organism_logo instanceof File) payload.organism_logo = formData.organism_logo;
      if (formData.cover_image instanceof File) payload.cover_image = formData.cover_image;

      if (selectedBourse) {
        await update(selectedBourse.id, payload);
      } else {
        await create(payload);
      }

      setIsModalOpen(false);
      setSelectedBourse(null);
      setIntakes([{ intake_label: "", period_start: "", period_end: "", period_label_text: "" }]);
      await fetchBourses(page, 10, search || undefined, statusFilter || undefined);
    } catch (err) {
      console.error(err);
    }
  };

  // ── Ouvrir l'édition ────────────────────────────────────────────────────
  const handleEdit = () => {
    if (!detailsItem?.rawData) return;
    const raw = detailsItem.rawData as Bourse;
    setSelectedBourse(raw);
    setIntakes(
      raw.intakes?.map((i) => ({
        intake_label: i.intake_label,
        period_start: i.period_start ?? "",
        period_end: i.period_end ?? "",
        period_label_text: i.period_label_text ?? "",
      })) ?? [{ intake_label: "", period_start: "", period_end: "", period_label_text: "" }]
    );
    setIsModalOpen(true);
    setIsDetailsOpen(false);
  };

  // ── Table columns ───────────────────────────────────────────────────────
  const columns = [
    {
      header: "Bourse",
      key: "title",
      render: (_: any, row: Bourse) => (
        <div>
          <p className="font-bold text-sm text-slate-900">
            {row.country?.flag_emoji ?? "🌍"} {row.title}
          </p>
          <p className="text-xs text-slate-500">{row.organism_name}</p>
        </div>
      ),
    },
    {
      header: "Financement",
      key: "funding_type",
      render: (_: any, row: Bourse) => {
        const conf = FUNDING_CONFIG[row.funding_type] ?? FUNDING_CONFIG.partielle;
        return (
          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-black border ${conf.bg} ${conf.text}`}>
            {conf.label}
          </span>
        );
      },
    },
    {
      header: "Pays",
      key: "country",
      render: (_: any, row: Bourse) => (
        <span className="text-sm font-semibold">
          {row.country ? `${row.country.flag_emoji ?? ""} ${row.country.name}` : "-"}
        </span>
      ),
    },
    {
      header: "Statut",
      key: "status",
      render: (_: any, row: Bourse) => {
        const conf = STATUS_CONFIG[row.status] ?? STATUS_CONFIG.brouillon;
        return (
          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-black border ${conf.bg} ${conf.text}`}>
            {conf.label}
          </span>
        );
      },
    },
    {
      header: "Actions",
      key: "actions",
      render: (_: any, row: Bourse) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleOpenDetails(row)}
            className="p-2 rounded-xl hover:bg-[#6B2FB4]/10 text-slate-700 hover:text-[#6B2FB4] transition"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="p-2 rounded-xl hover:bg-red-50 text-slate-500 hover:text-[#E63946] transition"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  // ── Champs du formulaire ────────────────────────────────────────────────
  const formFields: FieldConfig[] = [
    { name: "title", label: "Titre de la bourse", type: "text", required: true, placeholder: "Ex: Bourse Humber International Entrance", gridSpan: 2 },
    { name: "organism_name", label: "Organisme", type: "text", required: true, placeholder: "Humber College, Campus France..." },
    {
      name: "country_id",
      label: "Pays",
      type: "select",
      options: countries.map((c) => ({ label: c.name, value: c.id })),
    },
    {
      name: "scholarship_type_id",
      label: "Type de bourse",
      type: "select",
      options: scholarshipTypes.map((t) => ({ label: t.name, value: t.id })),
    },
    {
      name: "funding_type",
      label: "Type de financement",
      type: "select",
      required: true,
      options: [
        { label: "⚡ Partiellement financée", value: "partielle" },
        { label: "✅ Entièrement financée", value: "totale" },
      ],
    },
    { name: "objective", label: "Objectif", type: "rich-text", required: true, gridSpan: 2, placeholder: "Diversifier le campus en attirant des étudiants..." },
    { name: "conditions", label: "Conditions principales", type: "rich-text", required: true, gridSpan: 2, placeholder: "Être admis, GPA ≥ 75%..." },
    { name: "advantages", label: "Avantages", type: "rich-text", required: true, gridSpan: 2, placeholder: "Réductions scolarité, logement..." },
    { name: "additional_info", label: "Infos complémentaires (une par ligne)", type: "textarea", gridSpan: 2, placeholder: "Renouvellement possible\nTOEFL requis\nConseil: preuves financières" },
    {
      name: "study_level_ids",
      label: "Niveaux d'études (multi-sélection)",
      type: "select",
      required: true,
      options: studyLevels.map((s) => ({ label: s.name, value: s.id })),
    },
    {
      name: "field_of_study_ids",
      label: "Filières (multi-sélection)",
      type: "select",
      required: true,
      options: fieldsOfStudy.map((f) => ({ label: f.name, value: f.id })),
    },
    { name: "official_link", label: "Lien officiel", type: "text", placeholder: "https://...", gridSpan: 2 },
    { name: "organism_logo", label: "Logo organisme", type: "image-upload", maxImages: 1 },
    { name: "cover_image", label: "Image de couverture", type: "image-upload", maxImages: 1 },
    {
      name: "status",
      label: "Statut",
      type: "select",
      required: true,
      options: [
        { label: "Brouillon", value: "brouillon" },
        { label: "Publié", value: "publie" },
        { label: "Archivé", value: "archive" },
      ],
    },
    {
      name: "is_featured",
      label: "Mettre en vedette",
      type: "checkbox",
    },
  ];

  // ── Valeurs initiales en mode édition ───────────────────────────────────
  const initialValues = selectedBourse
    ? {
        title: selectedBourse.title,
        organism_name: selectedBourse.organism_name,
        country_id: selectedBourse.country_id,
        scholarship_type_id: selectedBourse.scholarship_type_id,
        funding_type: selectedBourse.funding_type,
        objective: selectedBourse.objective,
        conditions: selectedBourse.conditions,
        advantages: selectedBourse.advantages,
        additional_info: selectedBourse.additional_info?.join("\n") ?? "",
        official_link: selectedBourse.official_link ?? "",
        study_level_ids: selectedBourse.study_levels?.map((s) => s.id).join(",") ?? "",
        field_of_study_ids: selectedBourse.fields_of_study?.map((f) => f.id).join(",") ?? "",
        status: selectedBourse.status,
        is_featured: selectedBourse.is_featured,
      }
    : { funding_type: "partielle", status: "brouillon" };

  return (
    <div className="flex-1 flex flex-col bg-slate-50/50 min-h-screen">
      <main className="p-6 space-y-6">
        <PageHeader
          title="Gestion des Bourses"
          subtitle="Crée, modifie et publie les bourses — partiellement ou entièrement financées"
        />

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            label="Total bourses"
            value={pagination?.total ?? bourses.length}
            icon={GraduationCap}
            color="bg-violet-100 text-[#6B2FB4]"
          />
          <StatsCard
            label="Publiées"
            value={bourses.filter((b) => b.status === "publie").length}
            icon={CheckCircle}
            color="bg-green-100 text-green-700"
          />
          <StatsCard
            label="Totalement financées"
            value={bourses.filter((b) => b.funding_type === "totale").length}
            icon={Award}
            color="bg-blue-100 text-blue-700"
          />
          <StatsCard
            label="Pays couverts"
            value={new Set(bourses.map((b) => b.country_id).filter(Boolean)).size}
            icon={Globe}
            color="bg-amber-100 text-amber-700"
          />
        </div>

        {/* Filtres + Actions */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Recherche */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-[#6B2FB4]/20 focus:border-[#6B2FB4] outline-none transition w-64"
              />
            </div>

            {/* Filtre par statut */}
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold focus:ring-2 focus:ring-[#6B2FB4]/20 focus:border-[#6B2FB4] outline-none transition"
            >
              <option value="">Tous les statuts</option>
              <option value="brouillon">Brouillons</option>
              <option value="publie">Publiées</option>
              <option value="archive">Archivées</option>
            </select>
          </div>

          <button
            onClick={() => {
              setSelectedBourse(null);
              setIntakes([{ intake_label: "", period_start: "", period_end: "", period_label_text: "" }]);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6B2FB4] text-white text-sm font-bold hover:bg-[#5a2699] transition shadow-lg shadow-violet-200"
          >
            <Plus size={16} /> Nouvelle Bourse
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <DataTable
            columns={columns as any}
            data={bourses}
            title="Bourses"
            onViewAll={() => {}}
          />
          {pagination && pagination.last_page > 1 && (
            <div className="p-6 border-t border-slate-50 flex justify-end bg-slate-50/30">
              <Paginate
                currentPage={pagination.current_page}
                totalPages={pagination.last_page}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          )}
        </div>

        {/* Formulaire */}
        <ReusableForm
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedBourse(null);
            setIntakes([{ intake_label: "", period_start: "", period_end: "", period_label_text: "" }]);
          }}
          title={selectedBourse ? "Modifier la bourse" : "Nouvelle bourse"}
          subtitle="Remplis tous les champs — Objectif, Conditions, Avantages, Périodes de candidature..."
          fields={formFields}
          onSubmit={handleFormSubmit}
          initialValues={initialValues}
          isSubmitting={isSaving}
          error={error}
        >
          {/* Section Intakes dynamique (insérée via children) */}
          <div className="mb-6">
            <label className="text-xs font-bold text-slate-700 mb-2 block">
              Périodes de candidature <span className="text-[#E63946]">*</span>
            </label>
            <div className="space-y-3">
              {intakes.map((intake, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <input
                    type="text"
                    placeholder="Label (ex: Rentrée Sept 2026)"
                    value={intake.intake_label}
                    onChange={(e) => {
                      const copy = [...intakes];
                      copy[i].intake_label = e.target.value;
                      setIntakes(copy);
                    }}
                    className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-[#6B2FB4]/20 outline-none"
                  />
                  <input
                    type="date"
                    value={intake.period_start}
                    onChange={(e) => {
                      const copy = [...intakes];
                      copy[i].period_start = e.target.value;
                      setIntakes(copy);
                    }}
                    className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-[#6B2FB4]/20 outline-none"
                  />
                  <input
                    type="date"
                    value={intake.period_end}
                    onChange={(e) => {
                      const copy = [...intakes];
                      copy[i].period_end = e.target.value;
                      setIntakes(copy);
                    }}
                    className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-[#6B2FB4]/20 outline-none"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Texte libre (opt.)"
                      value={intake.period_label_text}
                      onChange={(e) => {
                        const copy = [...intakes];
                        copy[i].period_label_text = e.target.value;
                        setIntakes(copy);
                      }}
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-[#6B2FB4]/20 outline-none"
                    />
                    {intakes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setIntakes(intakes.filter((_, j) => j !== i))}
                        className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-[#E63946] transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  setIntakes([...intakes, { intake_label: "", period_start: "", period_end: "", period_label_text: "" }])
                }
                className="flex items-center gap-2 text-sm font-semibold text-[#6B2FB4] hover:text-[#5a2699] transition"
              >
                <Plus size={14} /> Ajouter une période
              </button>
            </div>
          </div>
        </ReusableForm>

        {/* Side Details Panel */}
        <SideDetailsPanel
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          title={detailsItem?.title || ""}
          reference={detailsItem?.reference}
          fields={detailsItem?.fields || []}
          descriptionContent={detailsItem?.description}
          onEdit={handleEdit}
        />
      </main>
    </div>
  );
}
