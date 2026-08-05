"use client";

import { LoginForm } from "@/components/form/auth/login-form";
import { Logo } from "@/components/ui/logo";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex bg-white">

      {/* ================= LEFT PANEL ================= */}

      <section className="relative hidden lg:flex w-[55%] overflow-hidden bg-gradient-to-br from-[#7C3894] via-[#7A2CE2] to-[#5B21B6]">

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/5" />

        {/* SVG */}
        <svg
          className="absolute inset-0 h-full w-full opacity-20"
          viewBox="0 0 1200 900"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
        >
          {[180, 300, 420, 540, 660].map((r, i) => (
            <ellipse
              key={i}
              cx="450"
              cy="450"
              rx={r * 1.5}
              ry={r}
              stroke="white"
              strokeWidth="2"
            />
          ))}

          {[80, 150, 230].map((r, i) => (
            <ellipse
              key={`b${i}`}
              cx="0"
              cy="900"
              rx={r * 1.4}
              ry={r}
              stroke="white"
              strokeWidth="1.5"
            />
          ))}

          {[70, 120, 180].map((r, i) => (
            <ellipse
              key={`t${i}`}
              cx="1180"
              cy="0"
              rx={r * 1.3}
              ry={r}
              stroke="white"
              strokeWidth="1.5"
            />
          ))}
        </svg>

        {/* Décorations */}

        <div className="absolute left-10 bottom-10 h-16 w-16 rounded-full border border-white/30 bg-white/10" />

        <div className="absolute top-12 right-16 h-8 w-8 rounded-full bg-[#F97316]/50 border border-white/30" />

        <div className="absolute top-24 right-44 h-4 w-4 rounded-full bg-white/30" />

        {/* Contenu */}

        <div className="relative z-10 flex h-full flex-col justify-center px-20">

          <div className="mb-10 flex h-28 w-28 items-center justify-center rounded-[32px] bg-white shadow-2xl">
            <Logo
              width={70}
              height={70}
              className="h-16 w-16"
            />
          </div>

          <h1 className="max-w-lg text-5xl font-extrabold leading-tight text-white">
            Bienvenue sur Bourse Pour Tous
          </h1>

          <p className="mt-8 max-w-lg text-xl leading-9 text-white/90">
            Suivez vos formations, vos activités et votre progression, où que vous soyez.
          </p>

        </div>

      </section>

      {/* ================= RIGHT PANEL ================= */}

      <section className="flex flex-1 items-center justify-center bg-white px-8">

        <div className="w-full max-w-md">

          <div className="mb-10 flex justify-center lg:hidden">
            <Logo
              width={80}
              height={80}
            />
          </div>

          <h2 className="text-5xl font-extrabold text-slate-900">
            Connexion
          </h2>

          <p className="mt-4 text-lg leading-8 text-slate-500">
            Entrez vos informations pour accéder à votre espace.
          </p>

          <div className="mt-10">
            <LoginForm />
          </div>

        </div>

      </section>

    </main>
  );
}