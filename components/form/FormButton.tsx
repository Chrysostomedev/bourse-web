"use client";

import { Loader2 } from "lucide-react";

interface FormButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?:   "primary" | "secondary" | "danger";
    isLoading?: boolean;
    children:   React.ReactNode;
}

export default function FormButton({
    variant   = "primary",
    isLoading = false,
    children,
    className = "",
    disabled,
    ...props
}: FormButtonProps) {
    const base = "flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        // Principal - Violet Bourse
        primary:   "bg-[#6B2D90] text-white hover:bg-[#5e277e] active:bg-[#52226e] shadow-[0_4px_14px_rgba(107,45,144,0.25)] hover:shadow-[0_6px_20px_rgba(107,45,144,0.3)] focus-visible:ring-[#6B2D90]",
        
        // Secondaire - Blanc soft lilas
        secondary: "bg-white text-[#3a3652] border border-[#ede9f3] hover:bg-[#faf8ff] hover:border-[#dccdf0] hover:text-[#6B2D90] focus-visible:ring-[#6B2D90]",
        
        // Danger - Corail Pour Tous (pas un rouge agressif)
        danger:    "bg-[#F25C5C] text-white hover:bg-[#e94d4d] active:bg-[#d93d3d] shadow-[0_4px_14px_rgba(242,92,92,0.25)] focus-visible:ring-[#F25C5C]",
    };

    return (
        <button
            {...props}
            disabled={disabled || isLoading}
            className={`${base} ${variants[variant]} ${className}`}
        >
            {isLoading && <Loader2 size={16} className="animate-spin shrink-0" />}
            {children}
        </button>
    );
}