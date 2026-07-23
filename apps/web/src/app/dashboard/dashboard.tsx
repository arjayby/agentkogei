import { Badge } from "@agentkogei/ui/components/badge";
import { Button, buttonVariants } from "@agentkogei/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@agentkogei/ui/components/card";
import Link from "next/link";

type AccountAccess = {
	status: "active" | "canceling" | "expired" | "refunded" | "reversed";
	currentPeriodEnd: string | null;
};

type PackCredentialMetadata = {
	id: string;
	name: string;
	secretSuffix: string;
	createdAt: string;
	lastUsedAt: string | null;
	revokedAt: string | null;
};

const statusCopy = {
	active: {
		label: "Active",
		description:
			"Installation, reinstallation, retrieval, and access to new Pack Releases are available.",
	},
	canceling: {
		label: "Canceling at period end",
		description:
			"Renewal is canceled. Premium Access remains active for the paid term.",
	},
	expired: {
		label: "Expired",
		description:
			"Premium Design Pack retrieval and Installation have ended. Existing eligible Project Licenses remain usable.",
	},
	refunded: {
		label: "Refunded",
		description:
			"Premium Access and Project Licenses from the refunded period have ended.",
	},
	reversed: {
		label: "Payment reversed",
		description:
			"Premium Access and Project Licenses from the reversed payment period have ended.",
	},
} as const;

function formatPeriodEnd(periodEnd: string) {
	return new Intl.DateTimeFormat("en-US", {
		dateStyle: "long",
		timeZone: "UTC",
	}).format(new Date(periodEnd));
}

function formatCredentialTime(timestamp: string) {
	return new Intl.DateTimeFormat("en-US", {
		dateStyle: "medium",
		timeStyle: "short",
		timeZone: "UTC",
	}).format(new Date(timestamp));
}

export default function Dashboard({
	premiumAccess,
	packCredentials,
}: {
	premiumAccess: AccountAccess | null;
	packCredentials: PackCredentialMetadata[];
}) {
	const copy = premiumAccess ? statusCopy[premiumAccess.status] : null;
	const canManageBilling =
		premiumAccess?.status === "active" || premiumAccess?.status === "canceling";
	const checkoutLabel = premiumAccess
		? "Review terms to renew"
		: "Review terms to subscribe";

	return (
		<div className="flex flex-col gap-6">
			<Card>
				<CardHeader>
					<div className="flex flex-wrap items-center justify-between gap-3">
						<CardTitle>
							<h2>Premium Access</h2>
						</CardTitle>
						<Badge variant={premiumAccess ? "secondary" : "outline"}>
							{copy?.label ?? "No Premium Access"}
						</Badge>
					</div>
					<CardDescription>
						One named Builder · Every Premium Design Pack · Unlimited Projects
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-3">
					<p>
						{copy?.description ??
							"Subscribe to use every Premium Design Pack in the Official Catalog."}
					</p>
					{premiumAccess?.currentPeriodEnd ? (
						<p className="font-medium">
							Access through {formatPeriodEnd(premiumAccess.currentPeriodEnd)}
						</p>
					) : null}
					<p className="text-muted-foreground text-sm">
						Open Design Packs and their source remain available regardless of
						billing state.
					</p>
				</CardContent>
				<CardFooter>
					{canManageBilling ? (
						<form action="/api/billing/portal" method="post">
							<Button type="submit">Manage billing with Polar</Button>
						</form>
					) : (
						<Link href="/premium" className={buttonVariants()}>
							{checkoutLabel}
						</Link>
					)}
				</CardFooter>
			</Card>
			<Card>
				<CardHeader>
					<CardTitle>
						<h2>Pack Credentials</h2>
					</CardTitle>
					<CardDescription>
						Authorized terminals can retrieve Premium Design Packs only. Secret
						values are never shown here.
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-3">
					{packCredentials.length === 0 ? (
						<p className="text-muted-foreground">
							No terminals are authorized. Run agentkogei login to connect one.
						</p>
					) : (
						packCredentials.map((credential) => (
							<article
								key={credential.id}
								aria-label={`Pack Credential ${credential.name}`}
								className="flex flex-wrap items-center justify-between gap-3 border p-3"
							>
								<div className="flex flex-col gap-1">
									<div className="flex flex-wrap items-center gap-2">
										<p className="font-medium">{credential.name}</p>
										<Badge
											variant={credential.revokedAt ? "outline" : "secondary"}
										>
											{credential.revokedAt ? "Revoked" : "Authorized"}
										</Badge>
									</div>
									<p className="font-mono text-muted-foreground">
										Ends in {credential.secretSuffix}
									</p>
									<p className="text-muted-foreground">
										Authorized {formatCredentialTime(credential.createdAt)}
									</p>
									<p className="text-muted-foreground">
										{credential.lastUsedAt
											? `Last used ${formatCredentialTime(credential.lastUsedAt)}`
											: "Not used yet"}
									</p>
								</div>
								{credential.revokedAt ? null : (
									<form
										action={`/api/pack-credentials/${credential.id}/revoke`}
										method="post"
									>
										<Button type="submit" variant="destructive" size="sm">
											Revoke
										</Button>
									</form>
								)}
							</article>
						))
					)}
				</CardContent>
				<CardFooter>
					<p className="text-muted-foreground">
						Local logout removes only that terminal&apos;s saved secret; it does
						not revoke other credentials.
					</p>
				</CardFooter>
			</Card>
		</div>
	);
}
