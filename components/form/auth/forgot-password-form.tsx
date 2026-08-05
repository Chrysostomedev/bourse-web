"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail } from "lucide-react";
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

const BRAND_PURPLE = "bg-[#6D28D9] hover:bg-[#5B21B6]";

const schema = z.object({
    email: z.string().min(1, "Email requis").email("Format email invalide"),
});

type Values = z.infer<typeof schema>;

interface Props {
    onSuccess: (email: string) => void;
}

export function ForgotPasswordForm({ onSuccess }: Props) {
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<Values>({
        resolver: zodResolver(schema),
        defaultValues: { email: "" },
    });

    async function onSubmit(data: Values) {
        setIsLoading(true);

        // ---- Simulation front-only (à remplacer par l'appel API réel) ----
        await new Promise((resolve) => setTimeout(resolve, 900));
        setIsLoading(false);

        toast.success("Code OTP envoyé à votre adresse email.");
        onSuccess(data.email);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <div className="relative">
                                    <Mail className="absolute top-1/2 -translate-y-1/2 left-4 h-[18px] w-[18px] text-gray-400 pointer-events-none" />
                                    <Input
                                        type="email"
                                        placeholder="Votre adresse email"
                                        className="h-12 pl-11 focus:border-[#6D28D9] focus:ring-[#6D28D9]/20"
                                        disabled={isLoading}
                                        {...field}
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full h-12 rounded-xl text-white font-semibold ${BRAND_PURPLE}`}
                >
                    {isLoading
                        ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Envoi...</>
                        : "Envoyer le code"}
                </Button>
            </form>
        </Form>
    );
}