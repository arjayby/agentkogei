import { eq, sql } from "drizzle-orm";

import { createDb } from "./index";
import { premiumAccess } from "./schema/auth";

export type StoredPremiumAccess = typeof premiumAccess.$inferSelect;

export async function findPremiumAccess(builderId: string) {
	const [record] = await createDb()
		.select()
		.from(premiumAccess)
		.where(eq(premiumAccess.builderId, builderId))
		.limit(1);
	return record ?? null;
}

export async function applyBillingProjection(
	projection: Omit<StoredPremiumAccess, "updatedAt"> & {
		eventId: string;
		affectedPeriodStart: Date | null;
	},
) {
	const result = await createDb().execute<{
		result: "applied" | "duplicate" | "stale";
	}>(sql`
		WITH inserted_event AS (
			INSERT INTO billing_event (id, occurred_at)
			VALUES (${projection.eventId}, ${projection.sourceEventAt})
			ON CONFLICT (id) DO NOTHING
			RETURNING id
		), updated_entitlement AS (
			INSERT INTO premium_access (
				builder_id,
				status,
				current_period_start,
				current_period_end,
				polar_customer_id,
				polar_subscription_id,
				source_event_at,
				updated_at
			)
			SELECT
				${projection.builderId},
				${projection.status}::premium_access_status,
				${projection.currentPeriodStart},
				${projection.currentPeriodEnd},
				${projection.polarCustomerId},
				${projection.polarSubscriptionId},
				${projection.sourceEventAt},
				NOW()
			FROM inserted_event
			ON CONFLICT (builder_id) DO UPDATE SET
				status = EXCLUDED.status,
				current_period_start = EXCLUDED.current_period_start,
				current_period_end = EXCLUDED.current_period_end,
				polar_customer_id = EXCLUDED.polar_customer_id,
				polar_subscription_id = EXCLUDED.polar_subscription_id,
				source_event_at = EXCLUDED.source_event_at,
				updated_at = NOW()
			WHERE premium_access.source_event_at <= EXCLUDED.source_event_at
				AND NOT (
					premium_access.status IN ('refunded', 'reversed')
					AND EXCLUDED.status = 'expired'
				)
				AND NOT (
					EXCLUDED.status IN ('refunded', 'reversed')
					AND (
						premium_access.polar_subscription_id IS DISTINCT FROM ${projection.polarSubscriptionId}
						OR premium_access.current_period_start IS DISTINCT FROM ${projection.affectedPeriodStart}
					)
				)
			RETURNING builder_id
		), terminated_licenses AS (
			UPDATE project_license SET
				terminated_at = ${projection.sourceEventAt},
				termination_reason = ${projection.status}
			WHERE builder_id = ${projection.builderId}
				AND ${projection.status} IN ('refunded', 'reversed')
				AND polar_subscription_id = ${projection.polarSubscriptionId}
				AND premium_access_period_start = ${projection.affectedPeriodStart}
				AND terminated_at IS NULL
				AND EXISTS (SELECT 1 FROM inserted_event)
			RETURNING id
		)
		SELECT CASE
			WHEN NOT EXISTS (SELECT 1 FROM inserted_event) THEN 'duplicate'
			WHEN EXISTS (SELECT 1 FROM updated_entitlement) THEN 'applied'
			WHEN ${projection.status} IN ('refunded', 'reversed') THEN 'applied'
			ELSE 'stale'
		END AS result
	`);

	return result.rows[0]?.result ?? "stale";
}
