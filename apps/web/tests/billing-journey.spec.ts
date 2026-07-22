import { expect, type Page, test } from "@playwright/test";

test.describe.configure({ mode: "serial" });

async function signIn(page: Page, callbackURL = "/dashboard") {
	await page.goto(`/login?callbackURL=${encodeURIComponent(callbackURL)}`);
	await page.getByRole("button", { name: "Continue with GitHub" }).click();
	await expect(page).toHaveURL(callbackURL, { timeout: 20_000 });
}

async function publishPolarState(
	page: Page,
	state: "active" | "canceling" | "expired" | "refunded" | "reversed",
	eventId: string,
) {
	const response = await page.request.post("/api/test/polar/events", {
		data: { eventId, state },
	});
	expect(response.ok()).toBe(true);
}

test.beforeEach(async ({ request }) => {
	const response = await request.delete("/api/test/polar/events");
	expect(response.ok()).toBe(true);
});

test("the Builder account opens Premium Access management", async ({
	page,
}) => {
	await signIn(page, "/catalog");
	await page.getByRole("button", { name: "Octavia Builder" }).click();
	await page.getByRole("menuitem", { name: "Premium Access" }).click();

	await expect(page).toHaveURL("/dashboard");
	await expect(
		page.getByRole("heading", { name: "Premium Access" }),
	).toBeVisible();
});

test("checkout presents and completes the one annual Premium Access offer", async ({
	page,
}) => {
	await signIn(page);

	await expect(
		page.getByRole("heading", { name: "Premium Access" }),
	).toBeVisible();
	await expect(page.getByText("No Premium Access")).toBeVisible();
	await page.getByRole("link", { name: "Review terms to subscribe" }).click();
	await expect(page).toHaveURL("/pricing");
	await expect(
		page.getByText("No voluntary refunds", { exact: true }),
	).toBeVisible();
	await page
		.getByRole("button", { name: "Continue to Polar — $99/year" })
		.click();

	await expect(page).toHaveURL(/\/test\/polar\/checkout/, { timeout: 20_000 });
	await expect(
		page.getByRole("heading", { name: "Premium Access — annual" }),
	).toBeVisible();
	await expect(
		page.getByText("One named Builder · Unlimited Projects"),
	).toBeVisible();
	await page
		.getByRole("button", { name: "Start $99 annual subscription" })
		.click();

	await expect(page).toHaveURL(/\/success\?checkout_id=/);
	await expect(
		page.getByRole("heading", { name: "Premium Access confirmed" }),
	).toBeVisible();
	await page.getByRole("link", { name: "View Builder account" }).click();
	await expect(page.getByText("Active", { exact: true })).toBeVisible();
	await expect(
		page.getByText("Access through December 31, 2030"),
	).toBeVisible();

	await page.getByRole("button", { name: "Manage billing with Polar" }).click();
	await expect(page).toHaveURL(/\/test\/polar\/portal/, { timeout: 20_000 });
	await expect(
		page.getByRole("heading", { name: "Polar billing portal" }),
	).toBeVisible();
});

test("verified idempotent Polar events drive every account access state", async ({
	page,
}) => {
	await signIn(page);

	await publishPolarState(page, "active", "event-active");
	await page.reload();
	await expect(page.getByText("Active", { exact: true })).toBeVisible();

	await publishPolarState(page, "canceling", "event-canceling");
	await publishPolarState(page, "active", "event-canceling");
	await page.reload();
	await expect(page.getByText("Canceling at period end")).toBeVisible();
	await expect(
		page.getByText("Access through December 31, 2030"),
	).toBeVisible();

	await publishPolarState(page, "expired", "event-expired");
	await page.reload();
	await expect(page.getByText("Expired", { exact: true })).toBeVisible();
	await expect(
		page.getByRole("link", { name: "Review terms to renew" }),
	).toBeVisible();

	await publishPolarState(page, "active", "event-renewed");
	await page.reload();
	await expect(page.getByText("Active", { exact: true })).toBeVisible();

	await publishPolarState(page, "refunded", "event-refunded");
	await page.reload();
	await expect(page.getByText("Refunded", { exact: true })).toBeVisible();
	await publishPolarState(page, "expired", "event-after-refund");
	await page.reload();
	await expect(page.getByText("Refunded", { exact: true })).toBeVisible();

	await publishPolarState(page, "reversed", "event-reversed");
	await page.reload();
	await expect(
		page.getByText("Payment reversed", { exact: true }),
	).toBeVisible();
	await publishPolarState(page, "expired", "event-after-reversal");
	await page.reload();
	await expect(
		page.getByText("Payment reversed", { exact: true }),
	).toBeVisible();

	await page.goto("/catalog/foundation");
	await expect(page.getByRole("heading", { name: /Foundation/ })).toBeVisible();
	const openPack = await page.request.get("/contracts/foundation/1.1.0");
	expect(openPack.ok()).toBe(true);
});

test("unverified billing events cannot change Premium Access", async ({
	page,
}) => {
	await signIn(page);

	const response = await page.request.post("/api/billing/polar/webhooks", {
		data: {
			type: "customer.state_changed",
			timestamp: "2030-01-01T00:00:00.000Z",
			data: {},
		},
	});
	expect(response.status()).toBe(400);
	await page.goto("/success?checkout_id=unverified-checkout");
	await expect(
		page.getByRole("heading", { name: "Checkout received" }),
	).toBeVisible();
	await expect(
		page.getByRole("heading", { name: "Premium Access confirmed" }),
	).toHaveCount(0);
	await page.goto("/dashboard");
	await expect(page.getByText("No Premium Access")).toBeVisible();
});

test("checkout rejects a Builder without a GitHub session", async ({
	request,
}) => {
	const response = await request.post("/api/billing/checkout");

	expect(response.status()).toBe(401);
});

test("pre-checkout terms and the production legal gate are disclosed", async ({
	page,
}) => {
	await page.goto("/pricing");

	await expect(page.getByText("No trial", { exact: true })).toBeVisible();
	await expect(
		page.getByText("No voluntary refunds", { exact: true }),
	).toBeVisible();
	await expect(
		page.getByText(/at least one Material Release per quarter/i),
	).toBeVisible();
	await expect(page.getByText(/lasting Project Licenses/i)).toBeVisible();
	await expect(
		page.getByText(
			/production payments remain disabled until professional legal review/i,
		),
	).toBeVisible();
});
