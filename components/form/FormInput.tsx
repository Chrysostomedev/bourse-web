"use client";

/**
 * FormInput — barrel d'exports pour tous les inputs du ReusableForm.
 * Chaque composant est minimal et fonctionnel.
 */

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Eye, EyeOff, Calendar, Upload, X, ChevronDown, Check, Search } from "lucide-react";

// ── Styles communs ── TURQUOISE MARINE
const inputCls = "w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6B2FA0]/20 focus:border-[#6B2FA0] transition-all placeholder:text-slate-400 disabled:opacity-50 disabled:bg-slate-50";

// ── FormField wrapper ──
export function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 uppercase tracking-widest">
                {label}{required && <span className="text-[#F0562E] ml-0.5">*</span>}
            </label>
            {children}
        </div>
    );
}

// ── Input ── CORRIGÉ
export function Input({
    name, type = "text", placeholder, required, disabled,
    value, defaultValue, onChange, icon,
}: {
    name: string; type?: string; placeholder?: string; required?: boolean;
    disabled?: boolean; value?: string; defaultValue?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    icon?: React.ReactNode;
}) {
    const safeValue = value?? defaultValue?? "";
    return (
        <div className="relative">
            {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B2FA0]/60">{icon}</span>}
            <input
                name={name} type={type} placeholder={placeholder}
                required={required} disabled={disabled}
                value={safeValue}
                onChange={onChange}
                className={`${inputCls} ${icon? "pl-10" : ""}`}
            />
        </div>
    );
}

// ── PasswordInput ── CORRIGÉ
export function PasswordInput({ name, placeholder, required, disabled, value, defaultValue, onChange }: {
    name: string; placeholder?: string; required?: boolean; disabled?: boolean;
    value?: string; defaultValue?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
    const [show, setShow] = useState(false);
    const safeValue = value?? defaultValue?? "";
    return (
        <div className="relative">
            <input
                name={name} type={show? "text" : "password"}
                placeholder={placeholder} required={required}
                disabled={disabled} value={safeValue} onChange={onChange}
                className={`${inputCls} pr-11`}
            />
            <button type="button" onClick={() => setShow(v =>!v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
                {show? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
        </div>
    );
}

// ── Select custom turquoise/blanc + search auto ──
export function Select({
    name,
    required,
    disabled,
    value,
    defaultValue,
    onChange,
    icon,
    children,
    placeholder = "Sélectionner..."
}: {
    name: string;
    required?: boolean;
    disabled?: boolean;
    value?: string;
    defaultValue?: string;
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    icon?: React.ReactNode;
    children: React.ReactNode;
    placeholder?: string;
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedValue, setSelectedValue] = useState(value?? defaultValue?? "");
    const [selectedLabel, setSelectedLabel] = useState("");
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => { setSelectedValue(value?? defaultValue?? ""); }, [value, defaultValue]);

    const options = useMemo(() => {
        const opts: { value: string; label: string }[] = [];
        React.Children.forEach(children, (child: any) => {
            if (child?.type === 'option') {
                opts.push({ value: child.props.value?? "", label: child.props.children?? "" });
            }
        });
        return opts;
    }, [children]);

    useEffect(() => {
        const opt = options.find(o => o.value === selectedValue);
        setSelectedLabel(opt?.label?? placeholder);
    }, [selectedValue, options, placeholder]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (wrapperRef.current &&!wrapperRef.current.contains(e.target as Node)) {
                setOpen(false); setSearch("");
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredOptions = options.filter(opt => opt.label.toLowerCase().includes(search.toLowerCase()));

    const handleSelect = (val: string, label: string) => {
        setSelectedValue(val); setSelectedLabel(label); setOpen(false); setSearch("");
        if (onChange) {
            const fakeEvent = { target: { name, value: val } } as React.ChangeEvent<HTMLSelectElement>;
            onChange(fakeEvent);
        }
    };

    const showSearch = options.length > 6;

    return (
        <div ref={wrapperRef} className="relative">
            <input type="hidden" name={name} value={selectedValue} required={required} />
            <button
                type="button"
                onClick={() =>!disabled && setOpen(!open)}
                disabled={disabled}
                className={`${inputCls} ${icon? "pl-10" : ""} pr-10 text-left flex items-center justify-between ${disabled? "cursor-not-allowed" : "cursor-pointer hover:border-[#6B2FA0]"} ${open? "ring-2 ring-[#6B2FA0]/20 border-[#6B2FA0]" : ""}`}
            >
                {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B2FA0]/60 pointer-events-none">{icon}</span>}
                <span className={`truncate ${!selectedValue? "text-slate-400" : "text-slate-800"}`}>{selectedLabel}</span>
                <ChevronDown size={16} className={`absolute right-3 text-slate-400 transition-transform ${open? "rotate-180" : ""}`} />
            </button>
            {open && (
                <div className="absolute z-50 w-full mt-1.5 bg-white rounded-xl border border-slate-200 shadow-lg shadow-slate-200/50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    {showSearch && (
                        <div className="p-2 border-b border-slate-100 bg-slate-50/50">
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..." className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B2FA0]/20 focus:border-[#6B2FA0]" onClick={(e) => e.stopPropagation()} />
                            </div>
                        </div>
                    )}
                    <div className="max-h-60 overflow-y-auto py-1">
                        {filteredOptions.length === 0? <div className="px-3 py-8 text-center text-sm text-slate-400 italic">Aucun résultat</div> : filteredOptions.map((opt) => {
                            const isSelected = opt.value === selectedValue;
                            return (
                                <button key={opt.value} type="button" onClick={() => handleSelect(opt.value, opt.label)} className={`w-full px-3 py-2.5 text-left text-sm font-medium transition-colors flex items-center justify-between gap-2 ${isSelected? "bg-[#6B2FA0] text-white" : "text-slate-700 hover:bg-violet-50 hover:text-[#6B2FA0]"}`}>
                                    <span className="truncate">{opt.label}</span>
                                    {isSelected && <Check size={16} className="shrink-0" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

// ── DateInput ──
export function DateInput({ name, required, disabled, defaultValue, value, disablePastDates, icon }: {
    name: string; required?: boolean; disabled?: boolean;
    defaultValue?: string; value?: string; disablePastDates?: boolean; icon?: React.ReactNode;
}) {
    const min = disablePastDates? new Date().toISOString().split("T")[0] : undefined;
    const safeValue = value?? defaultValue?? "";
    return (
        <div className="relative">
            <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B2FA0]/60 pointer-events-none" />
            <input type="date" name={name} required={required} disabled={disabled} defaultValue={safeValue} min={min} className={`${inputCls} pl-10`} />
        </div>
    );
}

// ── DateTimeInput ──
export function DateTimeInput({ name, required, disabled, defaultValue, value, disablePastDates, icon }: {
    name: string; required?: boolean; disabled?: boolean;
    defaultValue?: string; value?: string; disablePastDates?: boolean; icon?: React.ReactNode;
}) {
    const min = disablePastDates? new Date().toISOString().slice(0, 16) : undefined;
    const safeValue = value?? defaultValue?? "";
    return (
        <div className="relative">
            <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B2FA0]/60 pointer-events-none" />
            <input type="datetime-local" name={name} required={required} disabled={disabled} defaultValue={safeValue} min={min} className={`${inputCls} pl-10`} />
        </div>
    );
}

// ── DateRangeInput ──
export function DateRangeInput({ name, required, disabled, defaultValue, disablePastDates }: {
    name: string; required?: boolean; disabled?: boolean;
    defaultValue?: any; disablePastDates?: boolean;
}) {
    const min = disablePastDates? new Date().toISOString().split("T")[0] : undefined;
    const start = defaultValue?.from?? defaultValue?.start?? "";
    const end = defaultValue?.to?? defaultValue?.end?? "";
    return (
        <div className="flex items-center gap-2">
            <div className="relative flex-1">
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B2FA0]/60 pointer-events-none" />
                <input type="date" name={`${name}_start`} defaultValue={start} min={min} disabled={disabled} required={required} className={`${inputCls} pl-9 text-sm`} />
            </div>
            <span className="text-[#6B2FA0] font-bold shrink-0">→</span>
            <div className="relative flex-1">
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B2FA0]/60 pointer-events-none" />
                <input type="date" name={`${name}_end`} defaultValue={end} min={min} disabled={disabled} className={`${inputCls} pl-9 text-sm`} />
            </div>
        </div>
    );
}

// ── RichTextEditor (textarea contrôlé)
export function RichTextEditor({ name, label, placeholder, defaultValue, value }: {
    name: string; label?: string; placeholder?: string; defaultValue?: string; value?: string;
}) {
    const [content, setContent] = React.useState(value ?? defaultValue ?? "");
    React.useEffect(() => { setContent(value ?? defaultValue ?? ""); }, [defaultValue]);
    return (
        <div className="relative">
            <textarea
                name={name}
                placeholder={placeholder ?? "Cliquez pour saisir..."}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                className={`${inputCls} min-h-[120px] resize-y`}
            />
        </div>
    );
}

// ── ImageUpload ──
export function ImageUpload({ name, maxImages = 3, maxSizeMB = 2, defaultValue, onChange, isLoading }: {
    name: string; maxImages?: number; maxSizeMB?: number;
    defaultValue?: any; onChange?: (data: any) => void; isLoading?: boolean;
}) {
    const [files, setFiles] = useState<string[]>(Array.isArray(defaultValue)? defaultValue : defaultValue? [defaultValue] : []);
    const ref = useRef<HTMLInputElement>(null);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(e.target.files?? []).slice(0, maxImages - files.length);
        const urls = selected.map(f => URL.createObjectURL(f));
        const next = [...files,...urls].slice(0, maxImages);
        setFiles(next); onChange?.(selected);
    };
    return (
        <div className="space-y-2">
            <div onClick={() => ref.current?.click()} className="border-2 border-dashed border-violet-200 rounded-xl py-8 flex flex-col items-center gap-2 cursor-pointer hover:border-[#6B2FA0] transition-colors bg-violet-50/30">
                <Upload size={24} className="text-[#6B2FA0]" />
                <p className="text-sm text-slate-700 font-medium">Choisissez un fichier ou glissez et deposez</p>
                <p className="text-xs text-slate-400">Png, Jpeg ou autres images. {maxSizeMB ?? 50} MB maximum</p>
                <input ref={ref} type="file" accept="image/*" multiple className="hidden" onChange={handleChange} />
            </div>
            {files.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {files.map((url, i) => (
                        <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-violet-200">
                            <img src={url} alt="" className="w-full h-full object-cover" />
                            <button type="button" onClick={() => { const n = files.filter((_, idx) => idx!== i); setFiles(n); onChange?.(n); }} className="absolute top-0.5 right-0.5 w-4 h-4 bg-[#F0562E] rounded-full flex items-center justify-center text-white"><X size={10} /></button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── PdfUpload ──
export function PdfUpload({ name, maxPDFs = 1, maxSizeMB, defaultValue, onChange, accept, placeholder, isLoading }: {
    name: string; maxPDFs?: number; maxSizeMB?: number;
    defaultValue?: any; onChange?: (data: any) => void;
    accept?: string; placeholder?: string; isLoading?: boolean;
}) {
    const [files, setFiles] = useState<File[]>([]);
    const ref = useRef<HTMLInputElement>(null);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(e.target.files?? []).slice(0, maxPDFs);
        setFiles(selected); onChange?.(selected);
    };
    return (
        <div className="space-y-2">
            <div onClick={() => ref.current?.click()} className="border-2 border-dashed border-violet-200 rounded-xl py-6 flex flex-col items-center gap-2 cursor-pointer hover:border-[#6B2FA0] transition-colors bg-violet-50/20">
                <Upload size={20} className="text-[#6B2FA0]" />
                <p className="text-sm text-slate-500 font-medium">{placeholder ?? "Choisissez un fichier"}</p>
                <input ref={ref} type="file" accept={accept ?? ".pdf"} multiple={maxPDFs > 1} className="hidden" onChange={handleChange} />
            </div>
            {files.map((f, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 bg-violet-50 rounded-xl text-sm">
                    <span className="flex-1 truncate font-medium text-slate-700">{f.name}</span>
                    <button type="button" onClick={() => setFiles(prev => prev.filter((_, idx) => idx!== i))} className="text-slate-400 hover:text-[#F0562E]"><X size={13} /></button>
                </div>
            ))}
        </div>
    );
}

// ── PhoneInput ──
export function PhoneInput({ name, required, disabled, defaultValue, value, onChange }: {
    name: string; required?: boolean; disabled?: boolean;
    defaultValue?: string; value?: string; onChange?: (val: string) => void;
}) {
    const safeValue = value?? defaultValue?? "";
    return <input type="tel" name={name} required={required} disabled={disabled} value={safeValue} placeholder="+225 07 00 00" onChange={(e) => onChange?.(e.target.value)} className={inputCls} />;
}

// ── Checkbox (controlled) ──
export function Checkbox({ name, label, required, disabled, defaultChecked, checked, onChange }: {
    name: string; label?: string; required?: boolean; disabled?: boolean;
    defaultChecked?: boolean; checked?: boolean; onChange?: (checked: boolean) => void;
}) {
    const [localChecked, setLocalChecked] = React.useState(checked ?? defaultChecked ?? false);
    React.useEffect(() => { if (checked !== undefined) setLocalChecked(checked); }, [checked]);
    return (
        <label className="flex items-center gap-2.5 cursor-pointer">
            <input
                type="checkbox" name={name} required={required} disabled={disabled}
                checked={localChecked}
                onChange={(e) => { setLocalChecked(e.target.checked); onChange?.(e.target.checked); }}
                className="w-4 h-4 rounded border-slate-300 text-[#6B2FA0] focus:ring-[#6B2FA0]/30 accent-[#6B2FA0]"
            />
            {label && <span className="text-sm font-medium text-slate-700">{label}</span>}
        </label>
    );
}

// ── MultiUserSelect ──
export interface UserOption { id: number | string; name: string; role?: string; color?: string; }

export function MultiUserSelect({ users, selected, onChange, placeholder = "Rechercher un utilisateur..." }: {
    users: UserOption[]; selected: (number | string)[]; onChange: (ids: (number | string)[]) => void; placeholder?: string;
}) {
    const [search, setSearch] = useState("");
    const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()));
    const COLORS = ["bg-[#6B2FA0]","bg-[#F0562E]","bg-violet-600","bg-purple-500","bg-rose-500","bg-indigo-500"];
    const toggle = (id: number | string) => { onChange(selected.includes(id)? selected.filter(s => s!== id) : [...selected, id]); };
    return (
        <div className="space-y-3">
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={placeholder} className={inputCls} />
            <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-50">
                {filtered.length === 0 && <p className="py-4 text-center text-slate-400 text-sm">Aucun utilisateur trouvé</p>}
                {filtered.map((u, i) => {
                    const checked = selected.includes(u.id);
                    const color = u.color ?? COLORS[i % COLORS.length];
                    const initials = u.name.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase();
                    return (
                        <div key={u.id} onClick={() => toggle(u.id)} className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors ${checked? "bg-violet-50" : "hover:bg-slate-50"}`}>
                            <input type="checkbox" checked={checked} onChange={() => toggle(u.id)} className="w-4 h-4 rounded border-slate-300 accent-[#6B2FA0]" />
                            <div className={`w-8 h-8 rounded-full ${color} text-white text-xs font-black flex items-center justify-center shrink-0`}>{initials}</div>
                            <div className="flex-1 min-w-0"><p className="text-sm font-bold text-slate-800 truncate">{u.name}</p>{u.role && <p className="text-xs text-slate-400 font-medium">{u.role}</p>}</div>
                        </div>
                    );
                })}
            </div>
            {selected.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {selected.map(id => {
                        const u = users.find(u => u.id === id);
                        if (!u) return null;
                        return <span key={id} className="flex items-center gap-1 px-2 py-0.5 bg-violet-100 text-[#6B2FA0] rounded-full text-xs font-bold">{u.name}<button type="button" onClick={() => toggle(id)} className="hover:text-[#F0562E] transition">×</button></span>;
                    })}
                </div>
            )}
        </div>
    );
}