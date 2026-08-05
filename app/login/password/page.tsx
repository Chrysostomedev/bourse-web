    "use client";

    import { ArrowLeft } from "lucide-react";
    import Link from "next/link";
    import { useState } from "react";

    import { ForgotPasswordForm } from "@/components/form/auth/forgot-password-form";
    import { OtpVerifyForm }      from "@/components/form/auth/otp-verify-form";
    import { ResetPasswordForm }  from "@/components/form/auth/reset-password-form";
    import { Logo }               from "@/components/ui/logo";
    import { ROUTES }             from "@/lib/routes";

    type Step = "forgot" | "otp" | "reset";

    const STEPS: { step: Step; label: string }[] = [
        { step: "forgot", label: "Email" },
        { step: "otp",    label: "Code" },
        { step: "reset",  label: "Nouveau MDP" },
    ];

    const META: Record<Step, { title: string; description: string }> = {
        forgot: {
            title:       "Mot de passe oublié",
            description: "Entrez votre email. Nous vous enverrons un code de vérification.",
        },
        otp: {
            title:       "Vérification",
            description: "Entrez le code à 6 chiffres reçu par email.",
        },
        reset: {
            title:       "Nouveau mot de passe",
            description: "Choisissez un mot de passe sécurisé pour votre compte.",
        },
    };

    function StepIndicator({ current }: { current: Step }) {
        const idx = STEPS.findIndex((s) => s.step === current);
        return (
            <div className="flex items-center justify-center gap-2">
                {STEPS.map(({ step, label }, i) => (
                    <div key={step} className="flex items-center gap-2">
                        <div className="flex flex-col items-center gap-1">
                            <div
                                className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                                    i < idx
                                        ? "bg-[#7C3894] text-white"
                                        : i === idx
                                        ? "bg-[#7C3894] text-white ring-2 ring-purple-300"
                                        : "bg-gray-200 text-gray-400"
                                }`}
                            >
                                {i < idx ? "✓" : i + 1}
                            </div>
                            <span className="text-[10px] text-gray-500 hidden sm:block">{label}</span>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div
                                className={`h-px w-8 mb-4 transition-colors ${
                                    i < idx ? "bg-[#7C3894]" : "bg-gray-200"
                                }`}
                            />
                        )}
                    </div>
                ))}
            </div>
        );
    }

    export default function PasswordPage() {
        const [step,       setStep]       = useState<Step>("forgot");
        const [email,      setEmail]      = useState("");
        const [resetToken, setResetToken] = useState("");

        const { title, description } = META[step];

        return (
            <div className="min-h-screen w-full flex bg-white overflow-hidden">

                {/* LEFT — branding */}
                <div className="hidden lg:flex lg:w-[52%] relative bg-[#7C3894] flex-col">
                    <svg
                        className="absolute inset-0 w-full h-full opacity-[0.13] pointer-events-none"
                        viewBox="0 0 800 900"
                        fill="none"
                        preserveAspectRatio="xMidYMid slice"
                        aria-hidden="true"
                    >
                        {[90, 180, 270, 360, 450, 540, 630, 720].map((r, i) => (
                            <ellipse key={i} cx="400" cy="520" rx={r * 1.55} ry={r} stroke="white" strokeWidth="1.5" fill="none" />
                        ))}
                    </svg>
                    <div className="relative z-10 flex flex-col justify-center h-full px-12 text-white max-w-md">
                        <h2 className="text-3xl font-bold mb-4 leading-snug">
                            Récupérez l'accès à votre compte Bourse pour tous.
                        </h2>
                        <p className="text-white/75 text-base leading-relaxed">
                            Suivez les étapes simples pour réinitialiser votre mot de passe
                            et reprendre votre activité.
                        </p>
                    </div>
                </div>

                {/* RIGHT — form */}
                <div className="flex flex-1 items-center justify-center px-6 py-12 sm:px-10 lg:px-14 xl:px-20 bg-white">
                    <div className="w-full max-w-[400px] space-y-8">
                        {/* Logo */}
                        <div className="flex justify-center">
                            <Logo width={100} height={100} className="h-24 w-24" />
                        </div>

                        {/* Step indicator */}
                        <StepIndicator current={step} />

                        {/* Header */}
                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                            <p className="text-gray-500 text-sm leading-snug">{description}</p>
                        </div>

                        {/* Forms */}
                        {step === "forgot" && (
                            <ForgotPasswordForm
                                onSuccess={(mail) => { setEmail(mail); setStep("otp"); }}
                            />
                        )}
                        {step === "otp" && (
                            <OtpVerifyForm
                                email={email}
                                password=""
                                onVerified={() => { setStep("reset"); }}
                                onBack={() => setStep("forgot")}
                            />
                        )}
                        {step === "reset" && (
                            <ResetPasswordForm email={email} resetToken={resetToken} />
                        )}

                        {/* Back to login */}
                        <div className="flex justify-center">
                            <Link
                                href="/login"
                                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#f97316] transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Retour à la connexion
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
