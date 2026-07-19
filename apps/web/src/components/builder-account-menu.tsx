"use client";

import { Button, buttonVariants } from "@agentkogei/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@agentkogei/ui/components/dropdown-menu";
import { Skeleton } from "@agentkogei/ui/components/skeleton";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";

export default function BuilderAccountMenu() {
	const router = useRouter();
	const { data: session, isPending } = authClient.useSession();

	if (isPending) {
		return <Skeleton className="h-8 w-24" />;
	}

	if (!session) {
		return (
			<Link href="/login" className={buttonVariants({ variant: "outline" })}>
				Sign in
			</Link>
		);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger render={<Button variant="outline" />}>
				{session.user.name}
			</DropdownMenuTrigger>
			<DropdownMenuContent className="bg-card">
				<DropdownMenuGroup>
					<DropdownMenuLabel>Builder account</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuLabel>{session.user.email}</DropdownMenuLabel>
					<DropdownMenuItem
						variant="destructive"
						onClick={async () => {
							await authClient.signOut({
								fetchOptions: {
									onSuccess: () => {
										router.push("/");
										router.refresh();
									},
								},
							});
						}}
					>
						Sign out
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
