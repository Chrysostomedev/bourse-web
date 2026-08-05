"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Key, Loader2 } from "lucide-react";
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
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

const schema = z
    .object({
        new_password: z
            .string()
            .min(8, "Au moins 8 caractères")
            .regex(PWD_REGEX, "Doit contenir majuscule, minuscule, chiffre et caractère spécial"),
        confirm: z.string().min(1, "Confirmez le mot de passe"),
    })
    .refine((d) => d.new_password === d.confirm, {
        message: "Les mots de passe ne correspondent pas",
        path: ["confirm"],
    });

type Values = z.infer<typeof schema>;

interface Props {
    email:      string;
    resetToken: string;
    /** Callback appelé après la réinitialisation "réussie" (à brancher sur votre API) */
    onSuccess?: () => void;
}

export function ResetPasswordForm({ email, resetToken, onSuccess }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [showNew,   setShowNew]   = useState(false);
    const [showConf,  setShowConf]  = useState(false);

    const form = useForm<Values>({
        resolver: zodResolver(schema),
        defaultValues: { new_password: "", confirm: "" },
    });

    async function onSubmit(data: Values) {
        setIsLoading(true);

        // ---- Simulation front-only (à remplacer par l'appel API réel) ----
        // email et resetToken sont conservés en props pour le futur appel API
        await new Promise((resolve) => setTimeout(resolve, 900));
        setIsLoading(false);

        toast.success("Mot de passe réinitialisé.");
        onSuccess?.();
    }

    const ToggleBtn = ({
        show,
        toggle,
    }: {
        show: boolean;
        toggle: () => void;
    }) => (
        <button
            type="button"
            tabIndex={-1}
            onClick={toggle}
            className="absolute top-1/2 -translate-y-1/2 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
            {show ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
        </button>
    );

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Nouveau mot de passe */}
                <FormField
                    control={form.control}
                    name="new_password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nouveau mot de passe</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Key className="absolute top-1/2 -translate-y-1/2 left-4 h-[18px] w-[18px] text-gray-400 pointer-events-none" />
                                    <Input
                                        type={showNew ? "text" : "password"}
                                        placeholder="Nouveau mot de passe"
                                        className="h-12 pl-11 pr-12 focus:border-[#6D28D9] focus:ring-[#6D28D9]/20"
                                        disabled={isLoading}
                                        {...field}
                                    />
                                    <ToggleBtn show={showNew} toggle={() => setShowNew(!showNew)} />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Confirmation */}
                <FormField
                    control={form.control}
                    name="confirm"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Confirmer le mot de passe</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Key className="absolute top-1/2 -translate-y-1/2 left-4 h-[18px] w-[18px] text-gray-400 pointer-events-none" />
                                    <Input
                                        type={showConf ? "text" : "password"}
                                        placeholder="Confirmer"
                                        className="h-12 pl-11 pr-12 focus:border-[#6D28D9] focus:ring-[#6D28D9]/20"
                                        disabled={isLoading}
                                        {...field}
                                    />
                                    <ToggleBtn show={showConf} toggle={() => setShowConf(!showConf)} />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <p className="text-xs text-gray-500">
                    8 caractères minimum — une majuscule, une minuscule, un chiffre et un
                    caractère spécial (@$!%*?&).
                </p>

                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-semibold"
                >
                    {isLoading
                        ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Réinitialisation...</>
                        : "Réinitialiser le mot de passe"}
                </Button>
            </form>
        </Form>
    );
}