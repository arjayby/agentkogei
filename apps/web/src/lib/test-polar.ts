import { createHmac } from "node:crypto";
import { acceptPolarWebhook } from "@agentkogei/auth/lib/billing-webhooks";
import { env } from "@agentkogei/env/server";

type TestPremiumAccessState =
	| "active"
	| "canceling"
	| "expired"
	| "refunded"
	| "reversed";

export function isTestPolarEnabled() {
	return (
		env.NODE_ENV !== "production" && Boolean(env.GITHUB_OAUTH_TEST_BASE_URL)
	);
}

function customerStatePayload(
	builderId: string,
	state: TestPremiumAccessState,
	timestamp: string,
) {
	const hasActiveSubscription = state === "active" || state === "canceling";
	const currentPeriodEnd = "2030-12-31T23:59:59.000Z";

	return {
		type: "customer.state_changed",
		timestamp,
		data: {
			id: "polar-customer-builder-1",
			created_at: "2030-01-01T00:00:00.000Z",
			modified_at: timestamp,
			metadata: {},
			external_id: builderId,
			email: "octavia@example.com",
			email_verified: true,
			type: "individual",
			name: "Octavia Builder",
			billing_address: null,
			tax_id: null,
			organization_id: "polar-organization-agentkogei",
			deleted_at: null,
			active_subscriptions: hasActiveSubscription
				? [
						{
							id: "polar-subscription-premium-access",
							created_at: "2030-01-01T00:00:00.000Z",
							modified_at: timestamp,
							metadata: {},
							status: "active",
							amount: 9900,
							currency: "usd",
							recurring_interval: "year",
							current_period_start: "2030-01-01T00:00:00.000Z",
							current_period_end: currentPeriodEnd,
							trial_start: null,
							trial_end: null,
							cancel_at_period_end: state === "canceling",
							canceled_at:
								state === "canceling" ? "2030-06-01T00:00:00.000Z" : null,
							started_at: "2030-01-01T00:00:00.000Z",
							ends_at: state === "canceling" ? currentPeriodEnd : null,
							product_id: "polar-premium-access",
							discount_id: null,
							meters: [],
						},
					]
				: [],
			granted_benefits: [],
			active_meters: [],
			avatar_url: "https://example.com/octavia.png",
		},
	};
}

function terminalPayload(
	builderId: string,
	state: "refunded" | "reversed",
	timestamp: string,
) {
	if (state === "refunded") {
		return {
			type: "order.refunded",
			timestamp,
			data: {
				customer_id: "polar-customer-builder-1",
				subscription_id: "polar-subscription-premium-access",
				customer: { external_id: builderId },
			},
		};
	}

	return {
		type: "agentkogei.payment_reversed",
		timestamp,
		data: {
			customer_id: "polar-customer-builder-1",
			subscription_id: "polar-subscription-premium-access",
			external_customer_id: builderId,
		},
	};
}

export async function deliverTestPolarState({
	builderId,
	eventId,
	state,
}: {
	builderId: string;
	eventId: string;
	state: TestPremiumAccessState;
}) {
	if (!isTestPolarEnabled() || !env.POLAR_WEBHOOK_SECRET) {
		return new Response(null, { status: 404 });
	}

	const webhookTimestamp = Math.floor(Date.now() / 1000).toString();
	const timestamp = new Date().toISOString();
	const payload =
		state === "refunded" || state === "reversed"
			? terminalPayload(builderId, state, timestamp)
			: customerStatePayload(builderId, state, timestamp);
	const body = JSON.stringify(payload);
	const signature = createHmac("sha256", env.POLAR_WEBHOOK_SECRET)
		.update(`${eventId}.${webhookTimestamp}.${body}`)
		.digest("base64");

	return acceptPolarWebhook(
		new Request(new URL("/api/billing/polar/webhooks", env.BETTER_AUTH_URL), {
			method: "POST",
			headers: {
				"content-type": "application/json",
				"webhook-id": eventId,
				"webhook-signature": `v1,${signature}`,
				"webhook-timestamp": webhookTimestamp,
			},
			body,
		}),
	);
}
