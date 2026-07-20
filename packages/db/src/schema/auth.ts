import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
} from "drizzle-orm/pg-core";

export const premiumAccessStateValues = [
	"active",
	"canceling",
	"expired",
	"refunded",
	"reversed",
] as const;
export const premiumAccessStatus = pgEnum(
	"premium_access_status",
	premiumAccessStateValues,
);

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text("image"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const session = pgTable(
	"session",
	{
		id: text("id").primaryKey(),
		expiresAt: timestamp("expires_at").notNull(),
		token: text("token").notNull().unique(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
		ipAddress: text("ip_address"),
		userAgent: text("user_agent"),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
	},
	(table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
	"account",
	{
		id: text("id").primaryKey(),
		accountId: text("account_id").notNull(),
		providerId: text("provider_id").notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		accessToken: text("access_token"),
		refreshToken: text("refresh_token"),
		idToken: text("id_token"),
		accessTokenExpiresAt: timestamp("access_token_expires_at"),
		refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
		scope: text("scope"),
		password: text("password"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
	"verification",
	{
		id: text("id").primaryKey(),
		identifier: text("identifier").notNull(),
		value: text("value").notNull(),
		expiresAt: timestamp("expires_at").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const billingEvent = pgTable("billing_event", {
	id: text("id").primaryKey(),
	occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
	processedAt: timestamp("processed_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
});

export const premiumAccess = pgTable("premium_access", {
	builderId: text("builder_id")
		.primaryKey()
		.references(() => user.id, { onDelete: "cascade" }),
	status: premiumAccessStatus("status").notNull(),
	currentPeriodStart: timestamp("current_period_start", { withTimezone: true }),
	currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
	polarCustomerId: text("polar_customer_id"),
	polarSubscriptionId: text("polar_subscription_id"),
	sourceEventAt: timestamp("source_event_at", { withTimezone: true }).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
});

export const deviceAuthorizationRequest = pgTable(
	"device_authorization_request",
	{
		id: text("id").primaryKey(),
		deviceCodeHash: text("device_code_hash").notNull(),
		userCodeHash: text("user_code_hash").notNull(),
		credentialName: text("credential_name").notNull(),
		status: text("status").default("pending").notNull(),
		builderId: text("builder_id").references(() => user.id, {
			onDelete: "cascade",
		}),
		expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
		lastPolledAt: timestamp("last_polled_at", { withTimezone: true }),
		pollingInterval: integer("polling_interval").default(1).notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		resolvedAt: timestamp("resolved_at", { withTimezone: true }),
	},
	(table) => [
		uniqueIndex("device_authorization_device_code_idx").on(
			table.deviceCodeHash,
		),
		uniqueIndex("device_authorization_user_code_idx").on(table.userCodeHash),
	],
);

export const packCredential = pgTable(
	"pack_credential",
	{
		id: text("id").primaryKey(),
		builderId: text("builder_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		secretHash: text("secret_hash").notNull(),
		secretSuffix: text("secret_suffix").notNull(),
		scope: text("scope").default("premium:retrieve").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
		revokedAt: timestamp("revoked_at", { withTimezone: true }),
	},
	(table) => [
		uniqueIndex("pack_credential_secret_hash_idx").on(table.secretHash),
		index("pack_credential_builder_idx").on(table.builderId),
	],
);

export const projectLicense = pgTable(
	"project_license",
	{
		id: text("id").primaryKey(),
		builderId: text("builder_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		packId: text("pack_id").notNull(),
		packRelease: text("pack_release").notNull(),
		polarSubscriptionId: text("polar_subscription_id"),
		premiumAccessPeriodStart: timestamp("premium_access_period_start", {
			withTimezone: true,
		}),
		premiumAccessPeriodEnd: timestamp("premium_access_period_end", {
			withTimezone: true,
		}),
		terminatedAt: timestamp("terminated_at", { withTimezone: true }),
		terminationReason: text("termination_reason"),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [index("project_license_builder_idx").on(table.builderId)],
);

export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
	accounts: many(account),
	packCredentials: many(packCredential),
	projectLicenses: many(projectLicense),
}));

export const projectLicenseRelations = relations(projectLicense, ({ one }) => ({
	builder: one(user, {
		fields: [projectLicense.builderId],
		references: [user.id],
	}),
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id],
	}),
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id],
	}),
}));

export const packCredentialRelations = relations(packCredential, ({ one }) => ({
	builder: one(user, {
		fields: [packCredential.builderId],
		references: [user.id],
	}),
}));
