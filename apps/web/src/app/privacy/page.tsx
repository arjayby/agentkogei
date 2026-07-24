import type { Metadata, Route } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Privacy | AgentKogei",
	description:
		"What AgentKogei collects, how it is used and shared, your rights, and everything the CLI never sends.",
};

const effectiveDate = "July 24, 2026";

type PrivacySection = {
	id: string;
	heading: string;
	paragraphs?: string[];
	list?: string[];
};

const sections: PrivacySection[] = [
	{
		id: "overview",
		heading: "1. Overview",
		paragraphs: [
			"This Privacy Policy explains what personal information AgentKogei (“we”, “us”) collects, how we use and share it, how long we keep it, and the rights you have. It applies to the AgentKogei website, Official Catalog, account dashboard, and CLI. AgentKogei is built for data minimization: using it should reveal as little about you and your work as possible.",
		],
	},
	{
		id: "controller",
		heading: "2. Who we are",
		paragraphs: [
			"AgentKogei is the controller of the personal data described here. For any privacy request or question, you can reach us through the AgentKogei project repository.",
		],
	},
	{
		id: "collect",
		heading: "3. Information we collect",
		paragraphs: [
			"We collect only what we need to run the catalog, deliver premium content, and secure the Service:",
		],
		list: [
			"Open catalog and CLI use: browsing the catalog and installing Open Design Packs requires no account and is not tied to an identity. This usage is anonymous.",
			"Authentication: when you sign in for premium features, we receive your GitHub account identity (such as your email and profile) through Better Auth to establish that one named Builder holds Premium Access.",
			"Purchases: when you subscribe, our payment provider processes your payment and returns billing status, subscription period, and related metadata. We never receive or store your full card details.",
			"Premium delivery: when an authorized CLI retrieves a Premium Design Contract, we record the Builder, the Pack Release, and the action for entitlement and audit — never a Project identifier.",
			"Diagnostics: optional, opt-in only. The CLI discloses the exact destination and fields before you consent, and diagnostics never include Project data.",
		],
	},
	{
		id: "bases",
		heading: "4. Legal bases for processing (GDPR)",
		paragraphs: [
			"Where the GDPR applies, we rely on: performance of our contract with you (delivering Premium Access and Design Contracts); our legitimate interests (securing the Service and preventing abuse); your consent (optional analytics or diagnostics); and compliance with legal obligations (such as tax and accounting).",
		],
	},
	{
		id: "payments",
		heading: "5. Payment processing",
		paragraphs: [
			"Polar is our Merchant of Record and the billing source of truth. Checkout, payment details, invoices, taxes, and refunds are handled by Polar under its own terms and to PCI DSS standards. AgentKogei never sees or stores your card or payment credentials; we retain only whether your Premium Access is active and when the paid period ends.",
		],
	},
	{
		id: "use",
		heading: "6. How we use your data",
		paragraphs: ["We use the information we collect to:"],
		list: [
			"Provide Premium Access and deliver Design Contracts to your authorized CLI;",
			"Maintain your account, Pack Credentials, and entitlement state;",
			"Process billing and subscription changes through Polar;",
			"Secure the Service, prevent fraud and abuse, and enforce our Terms;",
			"Meet legal, tax, and accounting obligations.",
		],
	},
	{
		id: "sharing",
		heading: "7. Sub-processors and data sharing",
		paragraphs: [
			"We share data only with the service providers that operate AgentKogei, each under its own data-protection terms. We do not sell your personal data.",
		],
		list: [
			"GitHub — authentication and sign-in;",
			"Polar — payments, subscriptions, and Merchant-of-Record billing;",
			"Neon — database hosting for account, credential, and entitlement records;",
			"Vercel — application hosting and delivery.",
		],
	},
	{
		id: "transfers",
		heading: "8. International data transfers",
		paragraphs: [
			"Our providers may process personal data in countries other than yours. Where required, such transfers are protected by appropriate safeguards, such as the EU Standard Contractual Clauses or equivalent mechanisms.",
		],
	},
	{
		id: "retention",
		heading: "9. Data retention",
		paragraphs: ["We keep personal data only as long as we need it:"],
		list: [
			"Billing and entitlement records: for the periods required by Polar and by applicable tax and accounting law;",
			"Account, credential, and Installation-event records: until you delete your account or revoke them;",
			"Anonymous or aggregated statistics: may be retained indefinitely because they no longer identify you.",
		],
	},
	{
		id: "cookies",
		heading: "10. Cookies",
		paragraphs: [
			"We use only the cookies needed to keep you signed in and to operate the site. AgentKogei does not use advertising cookies or cross-site tracking. Any optional analytics are off unless you consent.",
		],
	},
	{
		id: "rights",
		heading: "11. Your rights",
		paragraphs: [
			"Subject to your local law, you may exercise the following rights by contacting us through the project repository. We respond within 30 days.",
		],
		list: [
			"Access a copy of the personal data we hold about you;",
			"Correct inaccurate data;",
			"Delete your data;",
			"Object to or restrict certain processing;",
			"Withdraw consent you previously gave;",
			"Receive your data in a portable format.",
		],
	},
	{
		id: "children",
		heading: "12. Children's privacy",
		paragraphs: [
			"The Service is not intended for anyone under 16. We do not knowingly collect personal data from children, and we will delete any such data we discover.",
		],
	},
	{
		id: "security",
		heading: "13. Security",
		paragraphs: [
			"We apply industry-standard safeguards to protect your data, including scoped, revocable Pack Credentials and encrypted transport. No method of transmission or storage over the internet is perfectly secure, so we cannot guarantee absolute security.",
		],
	},
	{
		id: "cli",
		heading: "14. What the CLI never sends",
		paragraphs: [
			"Installing design guidance must not expose your work. The AgentKogei CLI never transmits any of the following, and a premium retrieval carries only your Builder identity, the Pack Release, and the action type:",
		],
		list: [
			"Project names, paths, or directory structure;",
			"Git remotes;",
			"File contents;",
			"Agent prompts;",
			"Generated interfaces or code;",
			"Dependency lists.",
		],
	},
	{
		id: "changes",
		heading: "15. Changes to this policy",
		paragraphs: [
			"We may update this Privacy Policy as the product evolves. Material changes will be reflected by the effective date above. Continued use of the Service after an update takes effect constitutes acceptance of the revised policy.",
		],
	},
	{
		id: "contact",
		heading: "16. Contact",
		paragraphs: [
			"For any privacy question or request, reach us through the AgentKogei project repository.",
		],
	},
];

export default function PrivacyPage() {
	return (
		<main>
			<header className="border-b px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
				<div className="mx-auto max-w-3xl">
					<p className="mb-5 font-mono text-muted-foreground text-xs uppercase tracking-[0.24em]">
						Privacy
					</p>
					<h1 className="text-balance font-medium text-5xl tracking-[-0.05em] sm:text-6xl">
						Only what it takes to deliver access.
					</h1>
					<p className="mt-6 max-w-2xl text-lg text-muted-foreground leading-8">
						How AgentKogei collects, uses, shares, and protects your data — and
						everything the CLI is built never to send.
					</p>
					<p className="mt-4 font-mono text-muted-foreground text-xs uppercase tracking-[0.16em]">
						Effective: {effectiveDate}
					</p>
				</div>
			</header>

			<div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 lg:px-12 lg:py-20">
				<article className="flex flex-col gap-12">
					{sections.map((section) => (
						<section
							key={section.id}
							id={section.id}
							className="scroll-mt-24"
							aria-labelledby={`${section.id}-heading`}
						>
							<h2
								id={`${section.id}-heading`}
								className="mb-4 font-medium text-2xl tracking-tight"
							>
								{section.heading}
							</h2>
							{section.paragraphs ? (
								<div className="flex flex-col gap-4 text-base text-muted-foreground leading-8">
									{section.paragraphs.map((paragraph) => (
										<p key={paragraph}>{paragraph}</p>
									))}
								</div>
							) : null}
							{section.list ? (
								<ul className="mt-4 flex flex-col gap-3 text-base text-muted-foreground leading-7">
									{section.list.map((item) => (
										<li key={item} className="flex gap-3">
											<span aria-hidden="true" className="select-none">
												—
											</span>
											<span>{item}</span>
										</li>
									))}
								</ul>
							) : null}
						</section>
					))}
				</article>

				<p className="mt-12 border-t pt-6 text-muted-foreground text-sm leading-7">
					See also the{" "}
					<Link
						href={"/terms" as Route}
						className="underline underline-offset-4 hover:text-foreground"
					>
						Terms of Use
					</Link>
					.
				</p>
			</div>
		</main>
	);
}
