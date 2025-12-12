"use client";

import { useTheme } from "next-themes";
import * as React from "react";
import { MoonIconCustom } from "@/components/ui/custom-icons/moon-icon";
import { SunIconCustom } from "@/components/ui/custom-icons/sun-icon";
import { Switch } from "@/components/ui/switch";

export function ModeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/60 backdrop-blur px-3 py-1.5 opacity-50 shadow-sm">
        <SunIconCustom className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <Switch disabled checked={false} />
        <MoonIconCustom className="h-4 w-4 text-slate-500 dark:text-slate-300" />
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <div
      className="
        flex items-center gap-3
        rounded-full
        border border-slate-200 dark:border-slate-700
        bg-white/70 dark:bg-slate-900/60
        backdrop-blur
        px-4 py-2
        shadow-sm
        hover:shadow-md
        transition-all
      "
    >
      <label htmlFor="mode-toggle" className="cursor-pointer hover:opacity-80">
        <SunIconCustom className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      </label>

      <Switch
        id="mode-toggle"
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        aria-label="Toggle dark mode"
        className="data-[state=checked]:bg-slate-700 transition-colors duration-500"
      />

      <label htmlFor="mode-toggle" className="cursor-pointer hover:opacity-80">
        <MoonIconCustom className="h-4 w-4 text-slate-500 dark:text-slate-300" />
      </label>
    </div>
  );
}
