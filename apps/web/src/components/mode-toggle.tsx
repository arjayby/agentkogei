"use client";

import { Button } from "@agentkogei/ui/components/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ModeToggle() {
	const { theme, setTheme, resolvedTheme } = useTheme();

	function cycleTheme() {
		if (theme === "light") {
			setTheme("dark");
			return;
		}
		if (theme === "dark") {
			setTheme("light");
			return;
		}
		// No explicit choice yet — default is system; pick the opposite of what's showing.
		setTheme(resolvedTheme === "dark" ? "light" : "dark");
	}

	return (
		<Button
			variant="outline"
			size="icon"
			className="relative"
			onClick={cycleTheme}
		>
			<Sun className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
			<Moon className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
			<span className="sr-only">Toggle theme</span>
		</Button>
	);
}
