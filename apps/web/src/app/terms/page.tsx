import type { Metadata, Route } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Terms | AgentKogei",
	description:
		"The terms that govern use of AgentKogei's website, Official Catalog, CLI, and Design Contracts.",
};

const lastUpdated = "July 24, 2026";

type TermsSection = {
	id: string;
	heading: string;
	paragraphs?: string[];
	list?: string[];
};

const sections: TermsSection[] = [
	{
		id: "overview",
		heading: "1. Overview",
		paragraphs: [
			"These Terms of Use govern your access to and use of AgentKogei — the website, the Official Catalog, the AgentKogei CLI, and any Design Contract it delivers (together, the “Service”), operated by AgentKogei (“we”, “us”). By accessing or using the Service, you agree to these Terms and to the Privacy Policy. If you do not agree, do not use the Service.",
		],
	},
	{
		id: "service",
		heading: "2. Description of the Service",
		paragraphs: [
			"AgentKogei is a first-party catalog of versioned Design Packs. Each Pack Release is delivered as a single DESIGN.md Design Contract — self-contained Markdown that gives AI coding agents durable interface direction for a software Project. Open Design Packs are complete and free to use without an account. Premium Design Packs are delivered only to an authorized CLI while an active Premium Access subscription is in effect. The AgentKogei CLI installs one Design Contract, and one marked AGENTS.md reference, into your Project; it never executes pack-supplied code.",
		],
	},
	{
		id: "eligibility",
		heading: "3. Eligibility",
		paragraphs: [
			"You must be at least 16 years old and able to form a binding contract to use the Service. If you use the Service on behalf of an organization, you represent that you are authorized to bind that organization to these Terms, and “you” refers to that organization.",
		],
	},
	{
		id: "accounts",
		heading: "4. Accounts and authentication",
		paragraphs: [
			"Browsing the catalog and installing Open Design Packs requires no account. Premium features require signing in with GitHub through Better Auth. You are responsible for activity that occurs under your account and for keeping your authentication and Pack Credentials secure.",
		],
	},
	{
		id: "checkout",
		heading: "5. Acceptance at checkout",
		paragraphs: [
			"Premium Access is purchased through Polar, our Merchant of Record. Completing checkout constitutes your acceptance of these Terms and the Privacy Policy and your agreement to the price and billing terms shown at that time.",
		],
	},
	{
		id: "open-packs",
		heading: "6. Open Design Packs",
		paragraphs: [
			"Open Design Packs are free to browse, install, and use in your Projects — including commercial and public ones — with no account and no attribution requirement. They are provided “as is”, without warranty of any kind. The installed DESIGN.md is bare design direction; it carries no license, attribution, or provenance text, and the freedom to use it is granted by these Terms.",
		],
	},
	{
		id: "premium",
		heading: "7. Premium Access",
		paragraphs: [
			"Premium Access is an annual subscription that unlocks the complete Premium Design Pack catalog. It includes:",
		],
		list: [
			"Every Premium Design Pack in the Official Catalog, at USD $99 per year;",
			"One named Builder, with installation across unlimited Projects while access is active;",
			"At least one Material Release per quarter;",
			"No free trial — the complete Open Design Packs demonstrate the full workflow.",
		],
	},
	{
		id: "installed-use",
		heading: "8. Installed use and expiry",
		paragraphs: [
			"A Premium Design Pack you retrieve and install while Premium Access is active is a file you keep. It continues to work in that Project after your access ends — offline, with no runtime checks and no DRM — and may be used by all collaborators on that Project, including when the Project is a genuine public end product.",
			"When Premium Access expires, retrieval, new installation, reinstallation, and access to new Pack Releases stop. Public Pack Previews remain visible.",
		],
	},
	{
		id: "acceptable-use",
		heading: "9. Acceptable use and redistribution",
		paragraphs: ["When using the Service, you agree not to:"],
		list: [
			"Resell, sublicense, rent, or republish a Premium Design Pack, its preview, or its Design Contract as a standalone or competing product;",
			"Extract a Premium Design Pack from one Project to reuse it in another Project, or otherwise redistribute premium content;",
			"Share, publish, or transfer your Pack Credentials, or use another Builder's credentials;",
			"Reproduce, mirror, or scrape the Official Catalog, or bypass authentication, entitlement checks, or rate limits;",
			"Impersonate a brand or person, or infringe the intellectual property, contract, or other rights of anyone;",
			"Use the Service in violation of any applicable law.",
		],
	},
	{
		id: "refunds",
		heading: "10. Billing and refunds",
		paragraphs: [
			"Premium Access is billed annually through Polar and renews unless cancelled. Cancellation stops future renewal and preserves access through the end of the paid period.",
			"AgentKogei offers no voluntary refunds. Refunds required by law, by card-network rules, or issued by Polar are exceptions and terminate the affected Premium Access. Where you retrieve or install premium content immediately, you consent to immediate performance; consumers in the EU and UK acknowledge that the statutory right of withdrawal is lost once delivery of that digital content begins.",
		],
	},
	{
		id: "ip",
		heading: "11. Intellectual property",
		paragraphs: [
			"The AgentKogei application, CLI, Design Contract specification, and validators are open source under the MIT License, available in the project repository. Open Design Pack content is free to use as described in Section 6. Premium Design Pack content, the Official Catalog, and the AgentKogei name and branding remain our property or that of our licensors. References to React, Next.js, Tailwind CSS, and shadcn/ui identify compatibility only and are the trademarks of their respective owners.",
			"Self-hosting the open-source software does not grant Premium Design Pack content, Pack Credentials, Premium Access, or permission to reproduce the Official Catalog.",
		],
	},
	{
		id: "credentials",
		heading: "12. Pack Credentials",
		paragraphs: [
			"A Pack Credential authorizes one CLI installation to retrieve Premium Design Packs on your behalf. Credentials are revocable and scoped only to premium retrieval; they grant no billing or account-management authority. You are responsible for keeping them secret and for revoking any credential belonging to a lost or retired machine from your account dashboard.",
		],
	},
	{
		id: "privacy",
		heading: "13. Privacy",
		paragraphs: [
			"Your use of the Service is subject to our Privacy Policy. The AgentKogei CLI never transmits your Project's names, paths, Git remotes, file contents, prompts, generated interfaces, or dependency lists.",
		],
	},
	{
		id: "disclaimer",
		heading: "14. Disclaimers",
		paragraphs: [
			"The Service and all Design Contracts are provided “as is” and “as available”, without warranties of any kind, whether express or implied, including merchantability, fitness for a particular purpose, and non-infringement. A Design Contract is design direction for AI coding agents; we do not warrant that agent-generated output will meet your requirements, be error-free, or be fit for production without your own review.",
		],
	},
	{
		id: "liability",
		heading: "15. Limitation of liability",
		paragraphs: [
			"To the maximum extent permitted by law, AgentKogei will not be liable for any indirect, incidental, special, consequential, or punitive damages, or for lost profits, revenue, or data. Our total aggregate liability arising out of or relating to the Service will not exceed the greater of the amount you paid us in the twelve months before the claim or USD $100.",
		],
	},
	{
		id: "indemnification",
		heading: "16. Indemnification",
		paragraphs: [
			"You agree to defend, indemnify, and hold harmless AgentKogei from any claim, demand, loss, or expense (including reasonable legal fees) arising out of your use of the Service, your violation of these Terms, or your infringement of any third-party right.",
		],
	},
	{
		id: "termination",
		heading: "17. Suspension and termination",
		paragraphs: [
			"We may suspend or terminate your access to the Service, and withhold or revoke premium delivery, if you violate these Terms, engage in fraud, or create legal or security exposure. Provisions that by their nature should survive termination — including intellectual-property, disclaimer, liability, and indemnification terms — will survive.",
		],
	},
	{
		id: "changes",
		heading: "18. Changes to these Terms",
		paragraphs: [
			"We may update these Terms as the product evolves. Material changes will be reflected by the “Last updated” date above. Your continued use of the Service after an update takes effect constitutes acceptance of the revised Terms.",
		],
	},
	{
		id: "law",
		heading: "19. Governing law and disputes",
		paragraphs: [
			"These Terms are governed by the law of the jurisdiction in which AgentKogei is established, without regard to its conflict-of-law rules, and you agree to the exclusive jurisdiction of its courts for any dispute. Consumers retain the mandatory protections of their country of residence, and nothing in these Terms limits rights that cannot be waived under applicable law.",
		],
	},
	{
		id: "contact",
		heading: "20. Contact",
		paragraphs: [
			"Questions about these Terms can be raised through the AgentKogei project repository.",
		],
	},
];

export default function TermsPage() {
	return (
		<main>
			<header className="border-b px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
				<div className="mx-auto max-w-3xl">
					<p className="mb-5 font-mono text-muted-foreground text-xs uppercase tracking-[0.24em]">
						Terms
					</p>
					<h1 className="text-balance font-medium text-5xl tracking-[-0.05em] sm:text-6xl">
						Terms of use.
					</h1>
					<p className="mt-6 max-w-2xl text-lg text-muted-foreground leading-8">
						These terms govern your use of AgentKogei's website, Official
						Catalog, CLI, and the Design Contracts it delivers.
					</p>
					<p className="mt-4 font-mono text-muted-foreground text-xs uppercase tracking-[0.16em]">
						Last updated: {lastUpdated}
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
						href={"/privacy" as Route}
						className="underline underline-offset-4 hover:text-foreground"
					>
						Privacy Policy
					</Link>
					.
				</p>
			</div>
		</main>
	);
}
