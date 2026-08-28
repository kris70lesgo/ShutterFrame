"use client";

import { useState, type ReactNode } from "react";

interface SettingsRowProps {
  label: string;
  description?: string;
  children?: ReactNode;
  isToggle?: boolean;
  toggleValue?: boolean;
  onToggleChange?: (value: boolean) => void;
  hideDivider?: boolean;
}

export function SettingsRow({
  label,
  description,
  children,
  isToggle,
  toggleValue = false,
  onToggleChange,
  hideDivider = false,
}: SettingsRowProps) {
  const [enabled, setEnabled] = useState(toggleValue);

  const handleToggle = () => {
    const next = !enabled;
    setEnabled(next);
    onToggleChange?.(next);
  };

  return (
    <div
      className={`px-[18px] py-[14px] flex items-center justify-between gap-4 ${
        !hideDivider ? "border-b border-white/5" : ""
      }`}
    >
      <div className="min-w-0 flex-1 pr-2">
        <p className="text-[14px] font-medium text-[#F2F2F2]">{label}</p>
        {description && (
          <p className="text-[13px] text-[#A6A6A6] mt-0.5 leading-snug">{description}</p>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {children}
        {isToggle && (
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={handleToggle}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              enabled ? "bg-[#236a7c]" : "bg-[#333]"
            }`}
          >
            <span
              className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                enabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        )}
      </div>
    </div>
  );
}
