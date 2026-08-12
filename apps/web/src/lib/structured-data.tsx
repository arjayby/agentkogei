export const publicOrigin = "https://agentkogei.dev";

export const homepageDescription =
	"Complete design systems that stop generic design slop and keep every screen consistent.";

export const agentKogeiOrganization = {
	"@type": "Organization",
	"@id": `${publicOrigin}/#organization`,
	name: "AgentKogei",
	url: `${publicOrigin}/`,
} as const;

type StructuredDataProps = {
	data: unknown;
	identity: string;
};

export function StructuredData({ data, identity }: StructuredDataProps) {
	return (
		<script
			type="application/ld+json"
			data-agentkogei-structured-data={identity}
			dangerouslySetInnerHTML={{
				__html: JSON.stringify(data).replaceAll("<", "\\u003c"),
			}}
		/>
	);
}
