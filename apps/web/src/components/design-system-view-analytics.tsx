"use client";

import { track } from "@vercel/analytics";
import { useEffect } from "react";

/** Records one view using only the validated Published Design System identity. */
export function DesignSystemViewAnalytics({
	designSystem,
}: {
	designSystem: string;
}) {
	useEffect(() => {
		track("Design System Viewed", { designSystem });
	}, [designSystem]);

	return null;
}
