import { blackBoxTestBoundaryEnabled, env } from "@agentkogei/env/server";
import { Webhook } from "standardwebhooks";
import { z } from "zod";

import {
	type BillingEventProjection,
	recordBillingEvent,
} from "./entitlements";
import { polarClient } from "./payments";

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
				current_period_start: timestampSchema,
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
		id: z.string(),
		customer_id: z.string(),
		product_id: z.string().nullable(),
		subscription_id: z.string().nullable().optional(),
		metadata: z.record(z.string(), z.unknown()).default({}),
		subscription: z
			.object({
				current_period_start: timestampSchema,
				current_period_end: timestampSchema,
			})
			.nullable(),
		customer: z.object({ external_id: z.string().nullable().optional() }),
	}),
});
const polarEventSchema = z.union([
	customerStateEventSchema,
	refundedEventSchema,
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
		currentPeriodStart: activeSubscription?.current_period_start ?? null,
		currentPeriodEnd: activeSubscription?.current_period_end ?? null,
		polarCustomerId: payload.data.id,
		polarSubscriptionId: activeSubscription?.id ?? null,
		sourceEventAt: payload.timestamp,
		affectedPeriodStart: activeSubscription?.current_period_start ?? null,
	};
}

async function paymentWasReversed(
	payload: z.infer<typeof refundedEventSchema>,
) {
	if (blackBoxTestBoundaryEnabled) {
		return payload.data.metadata.agentkogei_payment_reversal === true;
	}
	const refunds = await polarClient.refunds.list({
		orderId: payload.data.id,
		succeeded: true,
		limit: 100,
	});
	for await (const page of refunds) {
		if (page.result.items.some((refund) => refund.dispute !== null))
			return true;
	}
	return false;
}

async function projectTerminalEvent(
	eventId: string,
	payload: z.infer<typeof refundedEventSchema>,
): Promise<BillingEventProjection | null> {
	const builderId = payload.data.customer.external_id;
	if (
		!builderId ||
		!env.POLAR_PREMIUM_ACCESS_PRODUCT_ID ||
		payload.data.product_id !== env.POLAR_PREMIUM_ACCESS_PRODUCT_ID ||
		!payload.data.subscription
	) {
		return null;
	}
	const isPaymentReversal = await paymentWasReversed(payload);

	return {
		eventId,
		builderId,
		status: isPaymentReversal ? "reversed" : "refunded",
		currentPeriodStart: payload.data.subscription.current_period_start,
		currentPeriodEnd: payload.data.subscription.current_period_end,
		polarCustomerId: payload.data.customer_id,
		polarSubscriptionId: payload.data.subscription_id ?? null,
		sourceEventAt: payload.timestamp,
		affectedPeriodStart: payload.data.subscription.current_period_start,
	};
}

async function projectPayload(
	eventId: string,
	payload: PolarEvent,
): Promise<BillingEventProjection | null> {
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
		payload = parsed;
	} catch {
		return new Response("Invalid Polar webhook", { status: 400 });
	}

	const projection = await projectPayload(eventId, payload);
	if (projection) await recordBillingEvent(projection);
	return Response.json({ received: true });
}
