"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Key, Loader2, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/hooks/useAuth";

const BRAND_PURPLE = "bg-[#6D28D9] hover:bg-[#5B21B6]";
const BRAND_PURPLE_RING = "focus:border-[#6D28D9] focus:ring-[#6D28D9]/20";

const credentialsSchema = z.object({
  email: z.string().min(1, "Email requis").email("Format email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

const otpSchema = z.object({
  code: z
    .string()
    .min(6, "Le code doit contenir 6 chiffres")
    .max(6, "Le code doit contenir 6 chiffres")
    .regex(/^\d+$/, "Le code ne doit contenir que des chiffres"),
});

type CredentialsValues = z.infer<typeof credentialsSchema>;
type OtpValues = z.infer<typeof otpSchema>;

interface Props {
  forgotPasswordHref?: string;
}

export function LoginForm({ forgotPasswordHref = "/login/password" }: Props) {
  const router = useRouter();
  const { requestOtp, verifyOtp, isLoading, error, clearError } = useAuth();

  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [email, setEmail] = useState("");
  const [showPw, setShowPw] = useState(false);

  const credentialsForm = useForm<CredentialsValues>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: { email: "", password: "" },
  });

  const otpForm = useForm<OtpValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: "" },
  });

  async function onCredentialsSubmit(values: CredentialsValues) {
    clearError();
    try {
      await requestOtp(values.email, values.password);
      setEmail(values.email);
      setStep("otp");
      toast.success("Un code de vérification a été envoyé par email");
    } catch {
      // error géré par le hook
      toast.error(error ?? "Identifiants incorrects");
    }
  }

  async function onOtpSubmit(values: OtpValues) {
    clearError();
    try {
      await verifyOtp(email, values.code);
      toast.success("Connexion réussie");
      router.push("/admin/dashboard");
    } catch {
      toast.error(error ?? "Code invalide ou expiré");
    }
  }

  // ──────────── Étape 2 : OTP ────────────
  if (step === "otp") {
    return (
      <div className="space-y-5">
        <div className="rounded-xl bg-violet-50 border border-violet-100 px-4 py-3">
          <p className="text-sm text-violet-800">
            Un code à 6 chiffres a été envoyé à{" "}
            <span className="font-semibold">{email}</span>
          </p>
        </div>

        <Form {...otpForm}>
          <form
            onSubmit={otpForm.handleSubmit(onOtpSubmit)}
            className="space-y-4"
          >
            <FormField
              control={otpForm.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <ShieldCheck className="absolute top-1/2 -translate-y-1/2 left-4 h-[18px] w-[18px] text-gray-400 pointer-events-none" />
                      <Input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="Code à 6 chiffres"
                        className={`h-12 pl-11 tracking-[0.3em] text-center font-semibold ${BRAND_PURPLE_RING}`}
                        disabled={isLoading}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className={`w-full h-12 rounded-xl text-white font-semibold text-base shadow-sm ${BRAND_PURPLE}`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Vérification...
                </>
              ) : (
                "Valider le code"
              )}
            </Button>

            <button
              type="button"
              onClick={() => {
                setStep("credentials");
                otpForm.reset();
                clearError();
              }}
              className="w-full text-sm text-gray-500 hover:text-[#F4511E] transition-colors py-1"
            >
              ← Retour
            </button>
          </form>
        </Form>
      </div>
    );
  }

  // ──────────── Étape 1 : Email + mot de passe ────────────
  return (
    <div className="space-y-5">
      <Form {...credentialsForm}>
        <form
          onSubmit={credentialsForm.handleSubmit(onCredentialsSubmit)}
          className="space-y-4"
        >
          {/* Email */}
          <FormField
            control={credentialsForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute top-1/2 -translate-y-1/2 left-4 h-[18px] w-[18px] text-gray-400 pointer-events-none" />
                    <Input
                      type="email"
                      placeholder="Email"
                      className={`h-12 pl-11 ${BRAND_PURPLE_RING}`}
                      disabled={isLoading}
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Mot de passe */}
          <FormField
            control={credentialsForm.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <Key className="absolute top-1/2 -translate-y-1/2 left-4 h-[18px] w-[18px] text-gray-400 pointer-events-none" />
                    <Input
                      type={showPw ? "text" : "password"}
                      placeholder="Mot de passe"
                      className={`h-12 pl-11 pr-12 ${BRAND_PURPLE_RING}`}
                      disabled={isLoading}
                      {...field}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      className="absolute top-1/2 -translate-y-1/2 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => setShowPw((v) => !v)}
                    >
                      {showPw ? (
                        <EyeOff className="h-[18px] w-[18px]" />
                      ) : (
                        <Eye className="h-[18px] w-[18px]" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Mot de passe oublié */}
          <div className="flex justify-end">
            <Link
              href={forgotPasswordHref}
              className="text-sm text-gray-500 hover:text-[#F4511E] transition-colors"
            >
              Mot de passe oublié ?
            </Link>
          </div>

          {error && step === "credentials" && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={isLoading}
            className={`w-full h-12 rounded-xl text-white font-semibold text-base shadow-sm ${BRAND_PURPLE}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Envoi du code...
              </>
            ) : (
              "Continuer"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}