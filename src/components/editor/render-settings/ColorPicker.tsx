import { cn } from "@/lib/utils";

const presetColors = ["#FFFFFF", "#FBBF24", "#F59E0B", "#22D3EE", "#F472B6", "#EAB308"];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  disabled?: boolean;
}

export const ColorPicker = ({ value, onChange, disabled }: ColorPickerProps) => {
  return (
    <div className="flex items-center gap-3">
      {presetColors.map((color) => (
        <button
          key={color}
          type="button"
          disabled={disabled}
          onClick={() => onChange(color)}
          className={cn(
            "w-6 h-6 rounded-full border border-white/20 transition-all hover:scale-110",
            value.toUpperCase() === color.toUpperCase() && "ring-2 ring-white",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          style={{ backgroundColor: color }}
          aria-label={`Select color ${color}`}
        />
      ))}
    </div>
  );
};