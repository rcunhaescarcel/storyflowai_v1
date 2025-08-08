import { cn } from "@/lib/utils";

const presetColors = ["#FFFFFF", "#FFFF00", "#FFD700", "#00FFFF", "#FF00FF"];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  disabled?: boolean;
}

export const ColorPicker = ({ value, onChange, disabled }: ColorPickerProps) => {
  return (
    <div className="flex items-center gap-2">
      {presetColors.map((color) => (
        <button
          key={color}
          type="button"
          disabled={disabled}
          onClick={() => onChange(color)}
          className={cn(
            "w-6 h-6 rounded-full border-2 transition-all",
            value.toUpperCase() === color.toUpperCase()
              ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
              : "hover:scale-110",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          style={{ backgroundColor: color }}
          aria-label={`Select color ${color}`}
        />
      ))}
      <div className={cn("relative w-8 h-8 rounded-full overflow-hidden border-2", disabled && "opacity-50")}>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="absolute -top-1 -left-1 w-10 h-10 cursor-pointer"
          aria-label="Custom color picker"
        />
      </div>
    </div>
  );
};