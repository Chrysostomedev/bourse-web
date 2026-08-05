import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#6B2FB4] to-[#E63946]">
      <div className="text-center text-white">
        <h1 className="text-6xl font-black mb-4">404</h1>
        <p className="text-2xl font-bold mb-8">Page non trouvée</p>
        <Link href="/admin" className="bg-white text-[#6B2FB4] px-8 py-3 rounded-lg font-bold hover:bg-slate-100 transition">
          Retour au dashboard
        </Link>
      </div>
    </div>
  );
}
