"use client";

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
import { Loader2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";

export default function SignInForm({
	callbackURL,
	hasOAuthError,
}: {
	callbackURL: string;
	hasOAuthError: boolean;
}) {
	const [isPending, setIsPending] = useState(false);

	async function signInWithGitHub() {
		setIsPending(true);
		const errorCallbackURL = `/login?error=oauth_failed&callbackURL=${encodeURIComponent(callbackURL)}`;
		const result = await authClient.signIn.social({
			provider: "github",
			callbackURL,
			errorCallbackURL,
		});
		if (result.error) {
			setIsPending(false);
			toast.error("GitHub sign-in could not be started. Please try again.");
		}
	}

	return (
		<Card className="w-full max-w-md">
			<CardHeader>
				<CardTitle>
					<h1>Builder sign in</h1>
				</CardTitle>
				<CardDescription>
					Use your GitHub identity for Premium Access and account-only
					experiences.
				</CardDescription>
			</CardHeader>
			<CardContent>
				{hasOAuthError ? (
					<Alert variant="destructive" className="mb-4">
						<AlertTitle>Sign-in not completed</AlertTitle>
						<AlertDescription>
							GitHub sign-in was canceled or could not be completed. Please try
							again.
						</AlertDescription>
					</Alert>
				) : null}
				<Button
					className="w-full"
					disabled={isPending}
					onClick={signInWithGitHub}
				>
					{isPending ? (
						<Loader2Icon data-icon="inline-start" className="animate-spin" />
					) : null}
					Continue with GitHub
				</Button>
			</CardContent>
			<CardFooter>
				<p className="text-muted-foreground">
					Open Design Packs remain available without an account.
				</p>
			</CardFooter>
		</Card>
	);
}
