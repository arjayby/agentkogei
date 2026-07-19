import { auth } from "@agentkogei/auth";
import { inspectDeviceAuthorization } from "@agentkogei/auth/lib/pack-credentials";
import {
	Alert,
	AlertDescription,
	AlertTitle,
} from "@agentkogei/ui/components/alert";
import { Button } from "@agentkogei/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@agentkogei/ui/components/card";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DeviceAuthorizationPage({
	searchParams,
}: {
	searchParams: Promise<{ user_code?: string; error?: string }>;
}) {
	const { user_code: userCode } = await searchParams;
	const callbackURL = `/device${userCode ? `?user_code=${encodeURIComponent(userCode)}` : ""}`;
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user) {
		redirect(`/login?callbackURL=${encodeURIComponent(callbackURL)}`);
	}
	const inspection = userCode
		? await inspectDeviceAuthorization(userCode, session.user.id)
		: null;

	return (
		<main className="mx-auto flex min-h-[calc(100svh-3.5rem)] max-w-[92rem] items-center justify-center px-4 py-12">
			<Card className="w-full max-w-lg">
				<CardHeader>
					<CardTitle>
						<h1>Authorize this terminal</h1>
					</CardTitle>
					<CardDescription>
						Review exactly what this Pack Credential can do before deciding.
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					{inspection?.ok ? (
						<>
							<div className="flex flex-col gap-1">
								<p className="font-medium">
									{inspection.request.credentialName}
								</p>
								<p className="font-mono text-muted-foreground">{userCode}</p>
							</div>
							<Alert>
								<AlertTitle>Premium Design Pack retrieval only</AlertTitle>
								<AlertDescription>
									This credential cannot sign in to your account, manage
									billing, or change other credentials.
								</AlertDescription>
							</Alert>
						</>
					) : (
						<Alert variant="destructive">
							<AlertTitle>Request unavailable</AlertTitle>
							<AlertDescription>
								The terminal request is invalid, expired, already used, or was
								claimed by another Builder.
							</AlertDescription>
						</Alert>
					)}
				</CardContent>
				{inspection?.ok ? (
					<CardFooter>
						<form
							action="/api/device/decision"
							method="post"
							className="flex w-full flex-wrap gap-2"
						>
							<input type="hidden" name="user_code" value={userCode} />
							<Button type="submit" name="decision" value="approved">
								Approve terminal
							</Button>
							<Button
								type="submit"
								name="decision"
								value="denied"
								variant="outline"
							>
								Deny
							</Button>
						</form>
					</CardFooter>
				) : null}
			</Card>
		</main>
	);
}
