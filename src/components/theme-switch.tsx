"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { FaMoon, FaSun } from "react-icons/fa";

const ThemeSwitch = () => {
	const { resolvedTheme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const isDark = resolvedTheme === "dark";

	return (
		<button
			type="button"
			aria-label="Toggle dark mode"
			onClick={() => setTheme(isDark ? "light" : "dark")}
			className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
		>
			{mounted && isDark ? (
				<FaMoon className="size-4" />
			) : (
				<FaSun className="size-4" />
			)}
		</button>
	);
};

export { ThemeSwitch };
