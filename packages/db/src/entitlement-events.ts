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
