"use client";

import { Loader2, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth"; // adapte le chemin si besoin

const OTP_LEN      = 6;
const RESEND_DELAY = 60;

interface Props {
    email:      string;
    /** Nécessaire pour renvoyer un code : /admin/login attend email + password */
    password:   string;
    onVerified: () => void;
    onBack:     () => void;
}

export function OtpVerifyForm({ email, password, onVerified, onBack }: Props) {
    const { verifyOtp, requestOtp, isLoading, error, clearError } = useAuth();

    const [digits,      setDigits]      = useState<string[]>(Array(OTP_LEN).fill(""));
    const [isResending, setIsResending] = useState(false);
    const [cooldown,    setCooldown]    = useState(RESEND_DELAY);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null);

    // Countdown
    useEffect(() => {
        if (cooldown <= 0) return;
        timerRef.current = setInterval(() => {
            setCooldown((p) => {
                if (p <= 1) { clearInterval(timerRef.current!); return 0; }
                return p - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current!);
    }, [cooldown]);

    function handleChange(i: number, val: string) {
        if (!/^\d*$/.test(val)) return;
        const next = [...digits];
        next[i] = val.slice(-1);
        setDigits(next);
        clearError();
        if (val && i < OTP_LEN - 1) inputRefs.current[i + 1]?.focus();
    }

    function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Backspace" && !digits[i] && i > 0) {
            inputRefs.current[i - 1]?.focus();
        }
    }

    function handlePaste(e: React.ClipboardEvent) {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LEN);
        const next   = Array(OTP_LEN).fill("");
        pasted.split("").forEach((d, i) => (next[i] = d));
        setDigits(next);
        inputRefs.current[Math.min(pasted.length, OTP_LEN - 1)]?.focus();
    }

    async function handleVerify() {
        const otp = digits.join("");
        if (otp.length < OTP_LEN) return;

        try {
            // verifyOtp() met déjà à jour user + cookies + status côté
            // useAuth en cas de succès — on n'a plus qu'à prévenir le
            // parent pour qu'il redirige (ex: router.replace("/admin")).
            await verifyOtp(email, otp);
            toast.success("Connexion réussie.");
            onVerified();
        } catch {
            // L'erreur est déjà posée dans `error` par useAuth — pas
            // besoin de la dupliquer ici, juste vider les champs pour
            // que l'utilisateur retape un nouveau code.
            setDigits(Array(OTP_LEN).fill(""));
            inputRefs.current[0]?.focus();
        }
    }

    async function handleResend() {
        if (cooldown > 0 || isResending) return;
        setIsResending(true);

        try {
            await requestOtp(email, password);
            setDigits(Array(OTP_LEN).fill(""));
            setCooldown(RESEND_DELAY);
            toast.success("Nouveau code envoyé.");
        } catch {
            // Message déjà posé dans `error` par useAuth.
        } finally {
            setIsResending(false);
        }
    }

    return (
        <div className="space-y-6">
            <p className="text-center text-sm text-gray-600">
                Code à {OTP_LEN} chiffres envoyé à{" "}
                <span className="font-medium text-gray-900">{email}</span>
            </p>

            {/* OTP inputs */}
            <div className="flex justify-center gap-2.5" onPaste={handlePaste}>
                {Array.from({ length: OTP_LEN }).map((_, i) => (
                    <input
                        key={i}
                        ref={(el) => { inputRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digits[i]}
                        onChange={(e) => handleChange(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        disabled={isLoading}
                        className="h-12 w-12 rounded-xl border border-gray-300 bg-white text-center text-xl font-bold text-gray-900 outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/20 disabled:opacity-50"
                    />
                ))}
            </div>

            {error && (
                <p className="text-center text-xs font-medium text-red-500">{error}</p>
            )}

            <Button
                type="button"
                disabled={isLoading || digits.join("").length < OTP_LEN}
                onClick={handleVerify}
                className="w-full h-12 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-semibold"
            >
                {isLoading
                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Vérification...</>
                    : "Vérifier le code"}
            </Button>

            <div className="flex flex-col items-center gap-2 text-sm">
                <button
                    type="button"
                    onClick={handleResend}
                    disabled={cooldown > 0 || isResending}
                    className="flex items-center gap-1.5 text-[#6D28D9] hover:text-[#5B21B6] disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                >
                    <RefreshCw className="h-4 w-4" />
                    {cooldown > 0 ? `Renvoyer (${cooldown}s)` : "Renvoyer le code"}
                </button>
                <button
                    type="button"
                    onClick={onBack}
                    className="text-gray-500 hover:text-[#F4511E] underline underline-offset-2 transition-colors"
                >
                    Modifier l'adresse email
                </button>
            </div>
        </div>
    );
}