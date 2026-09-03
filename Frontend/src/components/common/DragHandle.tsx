import type { HTMLAttributes } from "react";
import { GripVertical } from "lucide-react";

interface DragHandleProps extends HTMLAttributes<HTMLButtonElement> {
  className?: string;
  label?: string;
}

export const DragHandle = ({
  className = "",
  label = "Drag to reorder",
  ...props
}: DragHandleProps) => {
  return (
    <button
      type="button"
      aria-label={label}
      className={`cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded transition-colors touch-none focus:outline-none focus:ring-1 focus:ring-indigo-500 ${className}`}
      {...props}
    >
      <GripVertical className="w-4 h-4" />
    </button>
  );
};

