import { expect, test } from "@playwright/test";

test("a Builder signs in with GitHub and returns to the intended experience", async ({
	page,
}) => {
	await page.goto("/login?callbackURL=/catalog/command");

	await expect(
		page.getByRole("heading", { name: "Builder sign in" }),
	).toBeVisible();
	await expect(page.getByLabel("Email")).toHaveCount(0);
	await expect(page.getByLabel("Password")).toHaveCount(0);
	await page.getByRole("button", { name: "Continue with GitHub" }).click();

	await expect(page).toHaveURL("/catalog/command", { timeout: 20_000 });
	await page.getByRole("button", { name: "Octavia Builder" }).click();
	await expect(page.getByText("octavia@example.com")).toBeVisible();
	await page.getByRole("menuitem", { name: "Sign out" }).click();
	await expect(page).toHaveURL("/");
});

test("email and password account endpoints are disabled", async ({
	request,
}) => {
	const registration = await request.post("/api/auth/sign-up/email", {
		data: {
			name: "Starter account",
			email: "starter@example.com",
			password: "not-a-real-password",
		},
	});
	const signIn = await request.post("/api/auth/sign-in/email", {
		data: {
			email: "starter@example.com",
			password: "not-a-real-password",
		},
	});

	expect(registration.status()).toBe(400);
	expect(await registration.json()).toMatchObject({
		code: "EMAIL_PASSWORD_SIGN_UP_DISABLED",
	});
	expect(signIn.status()).toBe(400);
	expect(await signIn.json()).toMatchObject({
		code: "EMAIL_PASSWORD_DISABLED",
	});
});

test("a canceled or failed GitHub flow is recoverable and non-sensitive", async ({
	page,
}) => {
	await page.goto(
		"/login?error=access_denied&error_description=private-provider-detail&callbackURL=/catalog/command",
	);

	await expect(
		page.getByRole("alert").filter({ hasText: "GitHub" }),
	).toContainText(
		"GitHub sign-in was canceled or could not be completed. Please try again.",
	);
	await expect(page.getByText("private-provider-detail")).toHaveCount(0);
	await expect(
		page.getByRole("button", { name: "Continue with GitHub" }),
	).toBeEnabled();
	await page.getByRole("button", { name: "Continue with GitHub" }).click();
	await expect(page).toHaveURL("/catalog/command", { timeout: 20_000 });
});

test("an account-only experience preserves its destination through sign-in", async ({
	page,
}) => {
	await page.goto("/dashboard");

	await expect(page).toHaveURL("/login?callbackURL=%2Fdashboard");
	await expect(
		page.getByRole("button", { name: "Continue with GitHub" }),
	).toBeVisible();
});

test("checkout success requires a Builder session", async ({ page }) => {
	await page.goto("/success?checkout_id=checkout-sensitive-123");

	await expect(page).toHaveURL(
		"/login?callbackURL=%2Fsuccess%3Fcheckout_id%3Dcheckout-sensitive-123",
	);
	await expect(page.getByText("checkout-sensitive-123")).toHaveCount(0);
});
