import {
	Alert,
	AlertDescription,
	AlertTitle,
} from "@agentkogei/ui/components/alert";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@agentkogei/ui/components/card";

export default async function DeviceAuthorizationResultPage({
	searchParams,
}: {
	searchParams: Promise<{ decision?: string }>;
}) {
	const { decision } = await searchParams;
	const approved = decision === "approved";
	return (
		<main className="mx-auto flex min-h-[calc(100svh-3.5rem)] max-w-[92rem] items-center justify-center px-4 py-12">
			<Card className="w-full max-w-lg">
				<CardHeader>
					<CardTitle>
						<h1>{approved ? "Terminal authorized" : "Authorization denied"}</h1>
					</CardTitle>
					<CardDescription>You can return to your terminal.</CardDescription>
				</CardHeader>
				<CardContent>
					<Alert variant={approved ? "default" : "destructive"}>
						<AlertTitle>{approved ? "Approved" : "Denied"}</AlertTitle>
						<AlertDescription>
							{approved
								? "The terminal may now receive its one-time Pack Credential."
								: "No Pack Credential will be issued for this request."}
						</AlertDescription>
					</Alert>
				</CardContent>
			</Card>
		</main>
	);
}
