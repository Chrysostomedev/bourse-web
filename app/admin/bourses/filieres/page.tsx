"use client";

import { useState } from "react";
import { GraduationCap, Trash2, Edit3, Layers, BookOpen, Cpu, Heart, Scale, Beaker } from "lucide-react";

import DataTable from "@/components/ui/DataTable";
import ReusableForm, { FieldConfig } from "@/components/form/ReusableForm";
import Paginate from "@/components/ui/Paginate";
import PageHeader from "@/components/ui/PageHeader";

// ── Types ────────────────────────────────────────────────────────────────────
type Filiere = {
  id: string;
  nom: string; // Ex: Informatique, Santé
  code: string; // INFO, SANTE
  description: string;
  domaines_apparentes: string; // Ex: IA, Cybersécurité
  icon_key: string; // Pour l'UI
  bourses_count: number; // mock
  created_at: string;
};

// ── MOCK - Basé sur "Domaines couverts" de ton image Humber ─────────────────
const MOCK_FILIERES: Filiere[] = [
  {
    id: "1", nom: "Informatique & Tech", code: "INFO", icon_key: "tech",
    description: "Tous les programmes IT: Développement, IA, Data, Cybersécurité. Très demandé au Canada.",
    domaines_apparentes: "IA, Data Science, Cybersécurité, Génie logiciel, Réseaux",
    bourses_count: 56, created_at: "2025-01-10T10:00:00Z"
  },
  {
    id: "2", nom: "Santé & Médecine", code: "SANTE", icon_key: "health",
    description: "Médecine, Infirmier, Pharmacie, Santé publique. Bourses compétitives mais nombreuses.",
    domaines_apparentes: "Médecine, Infirmier, Biologie médicale, Santé publique, Nutrition",
    bourses_count: 42, created_at: "2025-01-12T10:00:00Z"
  },
  {
    id: "3", nom: "Ingénierie", code: "INGE", icon_key: "eng",
    description: "Génie civil, mécanique, électrique, industriel. Forte demande Allemagne/Canada.",
    domaines_apparentes: "Civil, Mécanique, Électrique, Industriel, Environnement",
    bourses_count: 38, created_at: "2025-01-15T10:00:00Z"
  },
  {
    id: "4", nom: "Business & Management", code: "BUSINESS", icon_key: "business",
    description: "MBA, Finance, Marketing, Entrepreneuriat. Chevening, Fulbright adorent.",
    domaines_apparentes: "MBA, Finance, Marketing, RH, Commerce international",
    bourses_count: 61, created_at: "2025-01-20T10:00:00Z"
  },
  {
    id: "5", nom: "Droit & Sciences Politiques", code: "DROIT", icon_key: "law",
    description: "Droit international, relations internationales, gouvernance.",
    domaines_apparentes: "Droit, Sciences Po, Relations internationales, Diplomatie",
    bourses_count: 19, created_at: "2025-02-01T10:00:00Z"
  },
  {
    id: "6", nom: "Tous les programmes", code: "TOUS", icon_key: "all",
    description: "Comme Humber: Tous les programmes offerts par l'établissement. Filère ouverte.",
    domaines_apparentes: "Ouvert à tous les domaines",
    bourses_count: 124, created_at: "2025-02-10T10:00:00Z"
  },
];

// ── StatsCard ────────────────────────────────────────────────────────────────
function StatsCard({ label, value, icon: Icon }: { label: string; value: any; icon: any }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
      <div className="flex justify-between">
        <div><p className="text- font-black uppercase text-slate-500">{label}</p><p className="text-2xl font-black text-slate-900 mt-1">{value}</p></div>
        <div className="w-10 h-10 rounded-xl bg-[#6B2FB4]/10 flex items-center justify-center"><Icon size={18} className="text-[#6B2FB4]" /></div>
      </div>
    </div>
  );
}

const ICON_MAP: Record<string, any> = {
  tech: Cpu,
  health: Heart,
  eng: Beaker,
  business: BookOpen,
  law: Scale,
  all: Layers,
};

export default function FilieresPage() {
  const [filieres, setFilieres] = useState<Filiere[]>(MOCK_FILIERES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<Record<string, any> | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const handleCreateOrUpdate = (formData: Record<string, any>) => {
    if (editingData) {
      setFilieres(prev => prev.map(f => f.id === editingData.id? {
      ...f,
        nom: formData.nom,
        code: formData.code.toUpperCase(),
        description: formData.description,
        domaines_apparentes: formData.domaines_apparentes,
        icon_key: formData.icon_key,
      } : f));
    } else {
      const newFiliere: Filiere = {
        id: Date.now().toString(),
        nom: formData.nom,
        code: formData.code.toUpperCase(),
        description: formData.description,
        domaines_apparentes: formData.domaines_apparentes,
        icon_key: formData.icon_key,
        bourses_count: 0,
        created_at: new Date().toISOString(),
      };
      setFilieres(prev => [newFiliere,...prev]);
    }
    setIsModalOpen(false);
    setEditingData(null);
  };

  const handleEdit = (row: Filiere) => {
    setEditingData(row);
    setIsModalOpen(true);
  };

  const handleDelete = (row: Filiere) => {
    if (confirm(`Supprimer la filière "${row.nom}"?`)) {
      setFilieres(prev => prev.filter(f => f.id!== row.id));
    }
  };

  const columns = [
    {
      header: "Filière", key: "nom",
      render: (_:any,row:Filiere)=>{
        const Icon = ICON_MAP[row.icon_key] || Layers;
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#6B2FB4]/10 flex items-center justify-center"><Icon size={16} className="text-[#6B2FB4]" /></div>
            <div><p className="font-bold text-sm text-slate-900">{row.nom}</p><p className="text- text-slate-500">{row.code}</p></div>
          </div>
        )
      }
    },
    { header: "Domaines apparentés", key: "domaines_apparentes", render: (_:any,row:Filiere)=><p className="text-xs text-slate-600 max-w- line-clamp-2">{row.domaines_apparentes}</p> },
    { header: "Description", key: "description", render: (_:any,row:Filiere)=><p className="text-xs text-slate-600 max-w- line-clamp-2">{row.description}</p> },
    { header: "Bourses", key: "bourses_count", render: (_:any,row:Filiere)=><span className="inline-flex px-2.5 py-1 rounded-full bg-violet-50 text-[#6B2FB4] text-xs font-black border border-violet-200">{row.bourses_count}</span> },
    {
      header: "Actions", key: "actions",
      render: (_:any,row:Filiere)=>(
        <div className="flex items-center gap-1">
          <button onClick={()=>handleEdit(row)} className="p-2 rounded-xl hover:bg-violet-50 text-slate-500 hover:text-[#6B2FB4] transition"><Edit3 size={16}/></button>
          <button onClick={()=>handleDelete(row)} className="p-2 rounded-xl hover:bg-red-50 text-slate-500 hover:text-[#E63946] transition"><Trash2 size={16}/></button>
        </div>
      )
    },
  ];

  const filiereFields: FieldConfig[] = [
    { name: "nom", label: "Nom de la filière", type: "text", required: true, placeholder: "Ex: Informatique & Tech", gridSpan: 2 },
    { name: "code", label: "Code", type: "text", required: true, placeholder: "INFO, SANTE, INGE..." },
    { name: "icon_key", label: "Icône", type: "select", required: true, options: [
      { label: "💻 Tech / Informatique", value: "tech" },
      { label: "❤️ Santé / Médecine", value: "health" },
      { label: "🔬 Ingénierie / Sciences", value: "eng" },
      { label: "📚 Business / Management", value: "business" },
      { label: "⚖️ Droit / Sciences Po", value: "law" },
      { label: "📦 Tous programmes (comme Humber)", value: "all" },
    ]},
    { name: "domaines_apparentes", label: "Domaines apparentés (séparés par virgule)", type: "textarea", required: true, gridSpan: 2, placeholder: "IA, Data Science, Cybersécurité, Génie logiciel..." },
    { name: "description", label: "Description", type: "rich-text", required: true, gridSpan: 2, placeholder: "Tous les programmes offerts par... Très demandé au Canada..." },
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-50/50 min-h-screen">
      <main className="p-6 space-y-6">
        <PageHeader title="Filières / Domaines" subtitle="Domaines couverts par les bourses - Ex: 'Tous les programmes offerts par Humber College' dans ton image" />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatsCard label="Total filières" value={filieres.length} icon={Layers} />
          <StatsCard label="Filière la plus demandée" value="Business" icon={BookOpen} />
          <StatsCard label="Filière ouverte (Tous)" value={filieres.filter(f=>f.code==="TOUS").length} icon={GraduationCap} />
        </div>

        <div className="flex justify-end">
          <button onClick={()=>{setEditingData(null); setIsModalOpen(true)}} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6B2FB4] text-white text-sm font-bold hover:bg-[#5a2699] transition shadow-lg shadow-violet-200">
            <Layers size={16} /> Ajouter une filière
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <DataTable columns={columns as any} data={filieres} title="Filières" onViewAll={()=>{}} />
          <div className="p-6 border-t border-slate-50 flex justify-end bg-slate-50/30">
            <Paginate currentPage={currentPage} totalPages={1} onPageChange={p=>setCurrentPage(p)} />
          </div>
        </div>

        <ReusableForm
          isOpen={isModalOpen}
          onClose={()=>{setIsModalOpen(false); setEditingData(null)}}
          title={editingData? "Modifier filière" : "Ajouter une filière"}
          subtitle="Correspond au champ 'Domaines couverts' de ta fiche Humber"
          fields={filiereFields}
          onSubmit={handleCreateOrUpdate}
          initialValues={editingData || {}}
        />
      </main>
    </div>
  );
}