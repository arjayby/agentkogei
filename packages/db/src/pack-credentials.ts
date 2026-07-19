import { and, desc, eq, inArray, isNull } from "drizzle-orm";

import { createDb } from "./index";
import { deviceAuthorizationRequest, packCredential } from "./schema/auth";

export type StoredDeviceAuthorization =
	typeof deviceAuthorizationRequest.$inferSelect;
export type NewDeviceAuthorization =
	typeof deviceAuthorizationRequest.$inferInsert;
export type StoredPackCredential = typeof packCredential.$inferSelect;
export type NewPackCredential = typeof packCredential.$inferInsert;

export async function insertDeviceAuthorization(
	request: NewDeviceAuthorization,
) {
	await createDb().insert(deviceAuthorizationRequest).values(request);
}

export async function findDeviceAuthorizationByDeviceCode(
	deviceCodeHash: string,
) {
	const [record] = await createDb()
		.select()
		.from(deviceAuthorizationRequest)
		.where(eq(deviceAuthorizationRequest.deviceCodeHash, deviceCodeHash))
		.limit(1);
	return record ?? null;
}

export async function findDeviceAuthorizationByUserCode(userCodeHash: string) {
	const [record] = await createDb()
		.select()
		.from(deviceAuthorizationRequest)
		.where(eq(deviceAuthorizationRequest.userCodeHash, userCodeHash))
		.limit(1);
	return record ?? null;
}

export async function claimDeviceAuthorization(id: string, builderId: string) {
	const [claimed] = await createDb()
		.update(deviceAuthorizationRequest)
		.set({ builderId })
		.where(
			and(
				eq(deviceAuthorizationRequest.id, id),
				isNull(deviceAuthorizationRequest.builderId),
			),
		)
		.returning();
	if (claimed) return claimed;
	const [existing] = await createDb()
		.select()
		.from(deviceAuthorizationRequest)
		.where(eq(deviceAuthorizationRequest.id, id))
		.limit(1);
	return existing ?? null;
}

export async function resolveDeviceAuthorization(
	id: string,
	builderId: string,
	status: "approved" | "denied",
) {
	const [record] = await createDb()
		.update(deviceAuthorizationRequest)
		.set({ status, resolvedAt: new Date() })
		.where(
			and(
				eq(deviceAuthorizationRequest.id, id),
				eq(deviceAuthorizationRequest.builderId, builderId),
				eq(deviceAuthorizationRequest.status, "pending"),
			),
		)
		.returning();
	return record ?? null;
}

export async function expireDeviceAuthorization(id: string) {
	await createDb()
		.update(deviceAuthorizationRequest)
		.set({ status: "expired", resolvedAt: new Date() })
		.where(
			and(
				eq(deviceAuthorizationRequest.id, id),
				inArray(deviceAuthorizationRequest.status, ["pending", "approved"]),
			),
		);
}

export async function consumeDeviceAuthorization(
	id: string,
	credential: NewPackCredential,
) {
	return createDb().transaction(async (transaction) => {
		const [consumed] = await transaction
			.update(deviceAuthorizationRequest)
			.set({ status: "consumed" })
			.where(
				and(
					eq(deviceAuthorizationRequest.id, id),
					eq(deviceAuthorizationRequest.status, "approved"),
				),
			)
			.returning({ id: deviceAuthorizationRequest.id });
		if (!consumed) return false;
		await transaction.insert(packCredential).values(credential);
		return true;
	});
}

export async function listBuilderPackCredentials(builderId: string) {
	return createDb()
		.select()
		.from(packCredential)
		.where(eq(packCredential.builderId, builderId))
		.orderBy(desc(packCredential.createdAt));
}

export async function revokeBuilderPackCredential(
	id: string,
	builderId: string,
) {
	const [record] = await createDb()
		.update(packCredential)
		.set({ revokedAt: new Date() })
		.where(
			and(
				eq(packCredential.id, id),
				eq(packCredential.builderId, builderId),
				isNull(packCredential.revokedAt),
			),
		)
		.returning();
	return record ?? null;
}

export async function authorizePackCredential(secretHash: string) {
	const database = createDb();
	const [record] = await database
		.update(packCredential)
		.set({ lastUsedAt: new Date() })
		.where(
			and(
				eq(packCredential.secretHash, secretHash),
				isNull(packCredential.revokedAt),
				eq(packCredential.scope, "premium:retrieve"),
			),
		)
		.returning();
	return record ?? null;
}
