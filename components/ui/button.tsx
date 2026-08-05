import * as React from "react";

type Variant = "default" | "ghost" | "outline" | "destructive" | "link";
type Size = "default" | "sm" | "lg" | "icon";

const variantClasses: Record<Variant, string> = {
    default: "bg-[#6B2D90] text-white hover:bg-[#5a257a] shadow-sm",
    ghost: "bg-transparent hover:bg-[#faf8ff] text-slate-700",
    outline: "border border-[#ede9f3] bg-white text-[#6B2D90] hover:bg-[#faf8ff]",
    destructive: "bg-[#F25C5C] text-white hover:bg-[#e04848]",
    link: "text-[#6B2D90] underline underline-offset-2 hover:text-[#5a257a] p-0 h-auto",
};

const sizeClasses: Record<Size, string> = {
    default: "h-10 px-4 py-2 text-sm",
    sm: "h-8 px-3 py-1 text-xs",
    lg: "h-12 px-6 py-3 text-base",
    icon: "h-9 w-9",
};

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className = "",
            variant = "default",
            size = "default",
            asChild = false,
            children,
            disabled,
           ...props
        },
        ref
    ) => {
        const base =
            "inline-flex items-center justify-center rounded-xl font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6B2D90]/30 disabled:pointer-events-none disabled:opacity-50";

        const classes = [
            base,
            variantClasses[variant],
            sizeClasses[size],
            className,
        ]
           .filter(Boolean)
           .join(" ");

        if (asChild && React.isValidElement(children)) {
            return React.cloneElement(
                children as React.ReactElement<React.HTMLAttributes<HTMLElement>>,
                { className: classes,...props } as any
            );
        }

        return (
            <button ref={ref} className={classes} disabled={disabled} {...props}>
                {children}
            </button>
        );
    }
);
Button.displayName = "Button";

export { Button };