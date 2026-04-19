import { TABLE_COLOR_OPTIONS } from "../../types";
import {
  labelClass,
  panelClass,
  TABLE_COLOR_CLASS_MAP,
} from "./styles";

interface TableColorSectionProps {
  currentTableColor: string;
  onTableColorChange?: (val: string) => void;
}

export function TableColorSection({
  currentTableColor,
  onTableColorChange,
}: TableColorSectionProps) {
  return (
    <section className={panelClass}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className={labelClass}>Table Color</p>
          <p className="mt-2 text-sm leading-6 text-[#5e5d59]">
            Pick a swatch or enter a custom hex value.
          </p>
        </div>
        <span className="rounded-full border border-[#e8e6dc] bg-[#f5f4ed] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#5e5d59]">
          {currentTableColor}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-6 gap-2">
        {TABLE_COLOR_OPTIONS.map((color) => {
          const isSelected =
            currentTableColor.toLowerCase() === color.toLowerCase();

          return (
            <button
              key={color}
              type="button"
              onClick={() => onTableColorChange?.(color)}
              className={`h-8 w-8 rounded-full border-2 transition-all duration-200 ${
                isSelected
                  ? "scale-110 border-[#1F1F1E] shadow-[0_0_0_2px_rgba(201,100,66,0.18)]"
                  : "border-transparent hover:scale-105"
              } ${TABLE_COLOR_CLASS_MAP[color] || "bg-gray-500"}`}
              title={color}
              aria-label={`Set table color to ${color}`}
            />
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <input
          type="color"
          value={currentTableColor}
          onChange={(e) => onTableColorChange?.(e.target.value)}
          className="h-11 w-12 rounded-xl border border-[#e8e6dc] bg-transparent p-1"
          title="Custom table color"
          aria-label="Custom table color"
        />
        <div className="flex-1 rounded-2xl border border-[#e8e6dc] bg-[#faf9f5] px-3 py-2.5 text-sm text-[#5e5d59]">
          Custom hex: <span className="font-mono">{currentTableColor.toUpperCase()}</span>
        </div>
      </div>
    </section>
  );
}