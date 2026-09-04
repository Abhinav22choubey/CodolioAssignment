import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { useUIStore } from "../../store/uiStore";

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const { isDarkMode } = useUIStore();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
      <Toaster
        position="top-right"
        theme={isDarkMode ? "dark" : "light"}
        richColors
        closeButton
      />
      {children}
    </div>
  );
};
