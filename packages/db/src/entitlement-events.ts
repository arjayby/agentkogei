import { desc, eq } from "drizzle-orm";

import { createDb } from "./index";
import { premiumEntitlementEvent } from "./schema/auth";

export type StoredPremiumEntitlementEvent =
	typeof premiumEntitlementEvent.$inferSelect;
export type NewPremiumEntitlementEvent =
	typeof premiumEntitlementEvent.$inferInsert;

export async function recordPremiumEntitlementEvent(
	event: NewPremiumEntitlementEvent,
) {
	await createDb()
		.insert(premiumEntitlementEvent)
		.values(event)
		.onConflictDoNothing();
}

export async function listPremiumEntitlementEvents(builderId: string) {
	return createDb()
		.select()
		.from(premiumEntitlementEvent)
		.where(eq(premiumEntitlementEvent.builderId, builderId))
		.orderBy(desc(premiumEntitlementEvent.occurredAt));
}
