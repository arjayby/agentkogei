import type { Page } from "@playwright/test";

export async function discoverDesignSystemRoutes(page: Page) {
	await page.goto("/design-systems");
	const routes = await page
		.getByRole("region", { name: "Published Design Systems" })
		.getByRole("tab")
		.evaluateAll((tabs) =>
			tabs.flatMap((tab) => {
				const route = tab.getAttribute("data-design-system-route");
				return route ? [route] : [];
			}),
		);
	if (routes.length === 0) {
		throw new Error("The Design Systems collection has no discovered routes");
	}
	return [...new Set(routes)];
}

export async function readPublishedDesignSystem(page: Page, route: string) {
	const identity = route.split("/").at(-1);
	if (!identity) {
		throw new Error(`Invalid Design System route: ${route}`);
	}
	await page.goto(route);
	const name = (
		await page.getByRole("heading", { level: 1 }).textContent()
	)?.trim();
	const releaseLabel = await page
		.getByText(/^Design System Release /)
		.textContent();
	const currentRelease = releaseLabel?.replace("Design System Release ", "");
	const exactReleases = [
		...new Set(
			await page
				.locator(`a[href^="/contracts/${identity}/"]`)
				.evaluateAll((links) =>
					links.flatMap((link) => {
						const release = link.getAttribute("href")?.split("/").at(-1);
						return release ? [release] : [];
					}),
				),
		),
	];
	if (!name || !currentRelease || exactReleases.length === 0) {
		throw new Error(`Incomplete Published Design System page: ${route}`);
	}
	return { identity, name, currentRelease, exactReleases };
}
