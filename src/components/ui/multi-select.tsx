import { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MultiSelectOption {
    value: string;
    label: string;
}

interface MultiSelectProps {
    options: MultiSelectOption[];
    selected: string[];
    onChange: (selected: string[]) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

export function MultiSelect({
    options,
    selected,
    onChange,
    placeholder = 'Select...',
    disabled = false,
    className,
}: MultiSelectProps) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggle = (value: string) => {
        if (selected.includes(value)) {
            onChange(selected.filter((v) => v !== value));
        } else {
            onChange([...selected, value]);
        }
    };

    const removeTag = (value: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(selected.filter((v) => v !== value));
    };

    const clearAll = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange([]);
    };

    const selectedLabels = selected
        .map((v) => options.find((o) => o.value === v)?.label ?? v)
        .slice(0, 2);
    const extra = selected.length - 2;

    return (
        <div ref={containerRef} className={cn('relative', className)}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen(!open)}
                className={cn(
                    'flex items-center gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none min-w-[150px] h-9 cursor-pointer',
                    'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    open && 'border-ring ring-ring/50 ring-[3px]',
                )}
            >
                <span className="flex-1 text-left truncate">
                    {selected.length === 0 ? (
                        <span className="text-muted-foreground">{placeholder}</span>
                    ) : (
                        <span className="flex items-center gap-1 flex-wrap">
                            {selectedLabels.map((label, i) => (
                                <span
                                    key={selected[i]}
                                    className="inline-flex items-center gap-1 bg-accent text-accent-foreground rounded px-1.5 py-0.5 text-xs font-medium"
                                >
                                    {label}
                                    <X
                                        className="w-3 h-3 cursor-pointer hover:text-destructive"
                                        onClick={(e) => removeTag(selected[i], e)}
                                    />
                                </span>
                            ))}
                            {extra > 0 && (
                                <span className="text-xs text-muted-foreground">+{extra}</span>
                            )}
                        </span>
                    )}
                </span>

                {selected.length > 0 && (
                    <X
                        className="w-4 h-4 text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
                        onClick={clearAll}
                    />
                )}
                <ChevronDown className="w-4 h-4 opacity-50 shrink-0" />
            </button>

            {open && !disabled && (
                <div className="absolute z-50 mt-1 w-full min-w-[180px] rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95">
                    <div className="max-h-[200px] overflow-y-auto p-1">
                        {options.map((option) => {
                            const isSelected = selected.includes(option.value);
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => toggle(option.value)}
                                    className={cn(
                                        'relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pl-2 pr-8 text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground',
                                        isSelected && 'bg-accent/50',
                                    )}
                                >
                                    <span className="flex-1 text-left">{option.label}</span>
                                    {isSelected && (
                                        <Check className="absolute right-2 w-4 h-4" />
                                    )}
                                </button>
                            );
                        })}
                        {options.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-2">
                                No options available
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
