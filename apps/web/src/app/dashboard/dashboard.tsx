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

export default function Dashboard({
	premiumAccess,
}: {
	premiumAccess: AccountAccess | null;
}) {
	const copy = premiumAccess ? statusCopy[premiumAccess.status] : null;
	const canManageBilling =
		premiumAccess?.status === "active" || premiumAccess?.status === "canceling";
	const checkoutLabel = premiumAccess
		? "Review terms to renew"
		: "Review terms to subscribe";

	return (
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
					<Link href="/pricing" className={buttonVariants()}>
						{checkoutLabel}
					</Link>
				)}
			</CardFooter>
		</Card>
	);
}
