import { env } from "@agentkogei/env/server";
import { Webhook } from "standardwebhooks";
import { z } from "zod";

import {
	type BillingEventProjection,
	recordBillingEvent,
} from "./entitlements";

const timestampSchema = z.string().transform((value) => new Date(value));
const customerStateEventSchema = z.object({
	type: z.literal("customer.state_changed"),
	timestamp: timestampSchema,
	data: z.object({
		id: z.string(),
		external_id: z.string().nullable().optional(),
		active_subscriptions: z.array(
			z.object({
				id: z.string(),
				product_id: z.string(),
				current_period_end: timestampSchema,
				cancel_at_period_end: z.boolean(),
			}),
		),
	}),
});
const refundedEventSchema = z.object({
	type: z.literal("order.refunded"),
	timestamp: timestampSchema,
	data: z.object({
		customer_id: z.string(),
		subscription_id: z.string().nullable().optional(),
		customer: z.object({ external_id: z.string().nullable().optional() }),
	}),
});
const testReversalEventSchema = z.object({
	type: z.literal("agentkogei.payment_reversed"),
	timestamp: timestampSchema,
	data: z.object({
		customer_id: z.string(),
		subscription_id: z.string().nullable().optional(),
		external_customer_id: z.string(),
	}),
});
const polarEventSchema = z.union([
	customerStateEventSchema,
	refundedEventSchema,
	testReversalEventSchema,
]);
type PolarEvent = z.infer<typeof polarEventSchema>;

function projectCustomerState(
	eventId: string,
	payload: z.infer<typeof customerStateEventSchema>,
): BillingEventProjection | null {
	const builderId = payload.data.external_id;
	const premiumProductId = env.POLAR_PREMIUM_ACCESS_PRODUCT_ID;
	if (!builderId || !premiumProductId) return null;

	const activeSubscription = payload.data.active_subscriptions.find(
		(subscription) => subscription.product_id === premiumProductId,
	);

	return {
		eventId,
		builderId,
		status: activeSubscription
			? activeSubscription.cancel_at_period_end
				? "canceling"
				: "active"
			: "expired",
		currentPeriodEnd: activeSubscription?.current_period_end ?? null,
		polarCustomerId: payload.data.id,
		polarSubscriptionId: activeSubscription?.id ?? null,
		sourceEventAt: payload.timestamp,
	};
}

function projectTerminalEvent(
	eventId: string,
	payload: Exclude<PolarEvent, { type: "customer.state_changed" }>,
): BillingEventProjection | null {
	const builderId =
		payload.type === "order.refunded"
			? payload.data.customer.external_id
			: payload.data.external_customer_id;
	if (!builderId) return null;

	return {
		eventId,
		builderId,
		status: payload.type === "order.refunded" ? "refunded" : "reversed",
		currentPeriodEnd: null,
		polarCustomerId: payload.data.customer_id,
		polarSubscriptionId: payload.data.subscription_id ?? null,
		sourceEventAt: payload.timestamp,
	};
}

function projectPayload(
	eventId: string,
	payload: PolarEvent,
): BillingEventProjection | null {
	return payload.type === "customer.state_changed"
		? projectCustomerState(eventId, payload)
		: projectTerminalEvent(eventId, payload);
}

export async function acceptPolarWebhook(request: Request): Promise<Response> {
	if (!env.POLAR_WEBHOOK_SECRET) {
		return new Response("Polar webhooks are not configured", { status: 503 });
	}

	const eventId = request.headers.get("webhook-id");
	if (!eventId) return new Response("Missing webhook ID", { status: 400 });

	const body = await request.text();
	let payload: PolarEvent;
	try {
		const verifier = new Webhook(
			Buffer.from(env.POLAR_WEBHOOK_SECRET, "utf8").toString("base64"),
		);
		const verified = verifier.verify(body, {
			"webhook-id": eventId,
			"webhook-signature": request.headers.get("webhook-signature") ?? "",
			"webhook-timestamp": request.headers.get("webhook-timestamp") ?? "",
		});
		const parsed = polarEventSchema.parse(verified);
		if (
			parsed.type === "agentkogei.payment_reversed" &&
			(env.NODE_ENV === "production" || !env.GITHUB_OAUTH_TEST_BASE_URL)
		) {
			throw new Error("Test-only billing event");
		}
		payload = parsed;
	} catch {
		return new Response("Invalid Polar webhook", { status: 400 });
	}

	const projection = projectPayload(eventId, payload);
	if (projection) await recordBillingEvent(projection);
	return Response.json({ received: true });
}
