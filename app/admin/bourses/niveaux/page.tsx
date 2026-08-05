"use client";

import { useState } from "react";
import { Eye, GraduationCap, Trash2, Edit3, Award, BookOpen, Layers } from "lucide-react";

import DataTable from "@/components/ui/DataTable";
import ReusableForm, { FieldConfig } from "@/components/form/ReusableForm";
import Paginate from "@/components/ui/Paginate";
import PageHeader from "@/components/ui/PageHeader";

// ── Types ────────────────────────────────────────────────────────────────────
type NiveauEtude = {
  id: string;
  nom: string; // Ex: Licence, Master
  code: string; // L1, M1, D etc
  diplomes_requis: string;
  parcours_souhaite: string;
  description: string;
  ordre: number; // Pour trier Licence < Master < Doctorat
  created_at: string;
};

// ── MOCK ─────────────────────────────────────────────────────────────────────
const MOCK_NIVEAUX: NiveauEtude[] = [
  {
    id: "1", nom: "Licence / Bachelor", code: "LICENCE",
    diplomes_requis: "Baccalauréat ou équivalent, relevés de notes terminale, moyenne ≥ 12/20",
    parcours_souhaite: "Bonne base académique, pas de redoublement majeur, activités parascolaires appréciées",
    description: "Premier cycle universitaire 3 ans. Accessible post-bac. Ex: Bourse Humber Bachelor.",
    ordre: 1, created_at: "2025-01-10T10:00:00Z"
  },
  {
    id: "2", nom: "Master / Post-graduate", code: "MASTER",
    diplomes_requis: "Licence / Bachelor avec GPA ≥ 75% ou 14/20, Lettres de recommandation",
    parcours_souhaite: "Expérience stage, projet de recherche, leadership associatif",
    description: "Second cycle 2 ans. Spécialisation. Ex: Eiffel Master, Chevening.",
    ordre: 2, created_at: "2025-01-15T10:00:00Z"
  },
  {
    id: "3", nom: "Doctorat / PhD", code: "DOCTORAT",
    diplomes_requis: "Master avec mention Bien, Proposition de recherche, Publications souhaitées",
    parcours_souhaite: "Expérience recherche, publications, alignement avec labo d'accueil",
    description: "Troisième cycle 3-5 ans. Recherche. Ex: Vanier, DAAD Research.",
    ordre: 3, created_at: "2025-02-01T10:00:00Z"
  },
  {
    id: "4", nom: "Diplôme / Certificat post-diplôme", code: "POST_DIPLOME",
    diplomes_requis: "Licence ou expérience pro équivalente, preuve d'admission",
    parcours_souhaite: "Expérience professionnelle 2 ans dans le domaine",
    description: "Formations courtes professionnalisantes. Ex: Humber Post-graduate Certificates.",
    ordre: 1.5, created_at: "2025-02-10T10:00:00Z"
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

export default function NiveauEtudePage() {
  const [niveaux, setNiveaux] = useState<NiveauEtude[]>(MOCK_NIVEAUX);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<Record<string, any> | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // ── Create / Update ────────────────────────────────────────────────────────
  const handleCreateOrUpdate = (formData: Record<string, any>) => {
    if (editingData) {
      setNiveaux(prev => prev.map(n => n.id === editingData.id? {
       ...n,
        nom: formData.nom,
        code: formData.code.toUpperCase(),
        diplomes_requis: formData.diplomes_requis,
        parcours_souhaite: formData.parcours_souhaite,
        description: formData.description,
        ordre: Number(formData.ordre) || 1,
      } : n));
    } else {
      const newNiveau: NiveauEtude = {
        id: Date.now().toString(),
        nom: formData.nom,
        code: formData.code.toUpperCase(),
        diplomes_requis: formData.diplomes_requis,
        parcours_souhaite: formData.parcours_souhaite,
        description: formData.description,
        ordre: Number(formData.ordre) || 1,
        created_at: new Date().toISOString(),
      };
      setNiveaux(prev => [...prev, newNiveau].sort((a,b)=>a.ordre-b.ordre));
    }
    setIsModalOpen(false);
    setEditingData(null);
  };

  const handleEdit = (row: NiveauEtude) => {
    setEditingData(row);
    setIsModalOpen(true);
  };

  const handleDelete = (row: NiveauEtude) => {
    if (confirm(`Supprimer "${row.nom}"?`)) {
      setNiveaux(prev => prev.filter(n => n.id!== row.id));
    }
  };

  const columns = [
    { header: "Niveau", key: "nom", render: (_:any,row:NiveauEtude)=><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-[#6B2FB4]/10 flex items-center justify-center font-black text-[#6B2FB4] text-xs">{row.code.slice(0,3)}</div><div><p className="font-bold text-sm text-slate-900">{row.nom}</p><p className="text- text-slate-500">{row.code}</p></div></div> },
    { header: "Diplômes requis", key: "diplomes_requis", render: (_:any,row:NiveauEtude)=><p className="text-xs text-slate-600 max-w- line-clamp-2">{row.diplomes_requis}</p> },
    { header: "Parcours souhaité", key: "parcours_souhaite", render: (_:any,row:NiveauEtude)=><p className="text-xs text-slate-600 max-w- line-clamp-2">{row.parcours_souhaite}</p> },
    {
      header: "Actions", key: "actions",
      render: (_:any,row:NiveauEtude)=>(
        <div className="flex items-center gap-1">
          <button onClick={()=>handleEdit(row)} className="p-2 rounded-xl hover:bg-violet-50 text-slate-500 hover:text-[#6B2FB4] transition"><Edit3 size={16}/></button>
          <button onClick={()=>handleDelete(row)} className="p-2 rounded-xl hover:bg-red-50 text-slate-500 hover:text-[#E63946] transition"><Trash2 size={16}/></button>
        </div>
      )
    },
  ];

  const niveauFields: FieldConfig[] = [
    { name: "nom", label: "Nom du niveau", type: "text", required: true, placeholder: "Ex: Licence / Bachelor", gridSpan: 2 },
    { name: "code", label: "Code", type: "text", required: true, placeholder: "LICENCE, MASTER, DOCTORAT" },
    { name: "ordre", label: "Ordre (1=Licence, 2=Master, 3=Doctorat)", type: "number", required: true, placeholder: "1" },
    { name: "diplomes_requis", label: "Diplômes requis", type: "textarea", required: true, gridSpan: 2, placeholder: "Baccalauréat, relevés, GPA ≥ 75%..." },
    { name: "parcours_souhaite", label: "Parcours souhaité", type: "textarea", required: true, gridSpan: 2, placeholder: "Expérience, leadership, stages, engagement communautaire..." },
    { name: "description", label: "Description / Note", type: "rich-text", required: false, gridSpan: 2, placeholder: "Infos complémentaires..." },
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-50/50 min-h-screen">
      <main className="p-6 space-y-6">
        <PageHeader title="Niveaux d'études" subtitle="Gère uniquement les niveaux: Licence, Master, Doctorat, Post-diplôme" />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatsCard label="Total niveaux" value={niveaux.length} icon={Layers} />
          <StatsCard label="Niveaux Licence" value={niveaux.filter(n=>n.code.includes("LICENCE")||n.ordre<2).length} icon={BookOpen} />
          <StatsCard label="Master & + " value={niveaux.filter(n=>n.ordre>=2).length} icon={Award} />
        </div>

        <div className="flex justify-end">
          <button onClick={()=>{setEditingData(null); setIsModalOpen(true)}} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6B2FB4] text-white text-sm font-bold hover:bg-[#5a2699] transition shadow-lg shadow-violet-200">
            <GraduationCap size={16} /> Ajouter un niveau
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <DataTable columns={columns as any} data={niveaux.sort((a,b)=>a.ordre-b.ordre)} title="Niveaux d'études" onViewAll={()=>{}} />
          <div className="p-6 border-t border-slate-50 flex justify-end bg-slate-50/30">
            <Paginate currentPage={currentPage} totalPages={1} onPageChange={p=>setCurrentPage(p)} />
          </div>
        </div>

        <ReusableForm
          isOpen={isModalOpen}
          onClose={()=>{setIsModalOpen(false); setEditingData(null)}}
          title={editingData? "Modifier niveau" : "Ajouter un niveau"}
          subtitle="Diplômes requis + Parcours souhaité comme dans le modèle Humber (GPA ≥75%, engagement communautaire...)"
          fields={niveauFields}
          onSubmit={handleCreateOrUpdate}
          initialValues={editingData || {}}
        />
      </main>
    </div>
  );
}