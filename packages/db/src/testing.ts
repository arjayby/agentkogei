import { eq } from "drizzle-orm";

import { createDb } from "./index";
import {
	billingEvent,
	deviceAuthorizationRequest,
	packCredential,
	premiumAccess,
	premiumEntitlementEvent,
	projectLicense,
} from "./schema/auth";

export async function resetBlackBoxProductState() {
	const database = createDb();
	await database.delete(premiumEntitlementEvent);
	await database.delete(projectLicense);
	await database.delete(packCredential);
	await database.delete(deviceAuthorizationRequest);
	await database.delete(premiumAccess);
	await database.delete(billingEvent);
}

export async function listBlackBoxPremiumEntitlementEvents() {
	return createDb().select().from(premiumEntitlementEvent);
}

export async function setBlackBoxPackCredentialScope(
	secretHash: string,
	scope: string,
) {
	const [credential] = await createDb()
		.update(packCredential)
		.set({ scope })
		.where(eq(packCredential.secretHash, secretHash))
		.returning({ id: packCredential.id });
	return Boolean(credential);
}
