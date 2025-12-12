"use client";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";

import { useState } from "react";

import { SunIcon, MoonIcon } from "lucide-react";

import { useTheme } from "next-themes";

export default function ToggleSettingDarkMode() {
  const { setTheme, theme } = useTheme();
  const [isDark, setIsDark] = useState(theme === "dark" ? true : false);

  function handleToggle() {
    setIsDark(!isDark);

    setTheme(isDark ? "light" : "dark");
  }

  return (
    <Item
      onClick={handleToggle}
      variant="outline"
      size="sm"
      className="mb-4 cursor-pointer hover:bg-accent/50"
      asChild
    >
      <div>
        <ItemMedia className="cursor-pointer">
          {isDark ? (
            <MoonIcon className="w-4 h-4" />
          ) : (
            <SunIcon className="w-4 h-4" />
          )}
        </ItemMedia>

        <ItemContent>
          <ItemTitle>Mode Tampilan</ItemTitle>
        </ItemContent>
      </div>
    </Item>
  );
}
