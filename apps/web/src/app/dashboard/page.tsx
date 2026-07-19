import { auth } from "@agentkogei/auth";
import { getPremiumAccess } from "@agentkogei/auth/lib/entitlements";
import { listPackCredentials } from "@agentkogei/auth/lib/pack-credentials";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import Dashboard from "./dashboard";

export default async function DashboardPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		redirect("/login?callbackURL=%2Fdashboard");
	}

	const [premiumAccess, packCredentials] = await Promise.all([
		getPremiumAccess(session.user.id),
		listPackCredentials(session.user.id),
	]);

	return (
		<main className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
			<header className="mb-8 flex flex-col gap-2">
				<p className="font-mono text-muted-foreground text-xs uppercase tracking-[0.2em]">
					Builder account
				</p>
				<h1 className="font-medium text-4xl tracking-tight">
					Welcome, {session.user.name}
				</h1>
			</header>
			<Dashboard
				premiumAccess={
					premiumAccess
						? {
								status: premiumAccess.status,
								currentPeriodEnd:
									premiumAccess.currentPeriodEnd?.toISOString() ?? null,
							}
						: null
				}
				packCredentials={packCredentials.map((credential) => ({
					id: credential.id,
					name: credential.name,
					secretSuffix: credential.secretSuffix,
					createdAt: credential.createdAt.toISOString(),
					lastUsedAt: credential.lastUsedAt?.toISOString() ?? null,
					revokedAt: credential.revokedAt?.toISOString() ?? null,
				}))}
			/>
		</main>
	);
}
