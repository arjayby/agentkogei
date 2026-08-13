import { renderSocialCard } from "@/components/social-card-image";
import { currentRelease, getDesignSystem } from "@/lib/catalog";
import { guides } from "@/lib/guides";
import {
	designSystemSocialCard,
	designSystemsSocialCard,
	guideSocialCard,
	guidesSocialCard,
	homepageSocialCard,
	methodologySocialCard,
	type SocialCardDefinition,
	socialImagePath,
} from "@/lib/social-metadata";

type SocialImageRouteProps = {
	params: Promise<{ segments: string[] }>;
};

function resolveSocialCard(
	segments: string[],
): SocialCardDefinition | undefined {
	const imagePath = `/social/${segments.join("/")}`;
	const staticCard = [
		homepageSocialCard,
		guidesSocialCard,
		methodologySocialCard,
		designSystemsSocialCard,
		...guides.map(guideSocialCard),
	].find((card) => socialImagePath(card) === imagePath);
	if (staticCard) return staticCard;

	if (segments[0] !== "design-systems" || segments.length !== 3) {
		return undefined;
	}
	const designSystem = getDesignSystem(segments[1] ?? "");
	if (!designSystem || currentRelease(designSystem).version !== segments[2]) {
		return undefined;
	}
	return designSystemSocialCard(designSystem);
}

export async function GET(
	_request: Request,
	{ params }: SocialImageRouteProps,
) {
	const { segments } = await params;
	const card = resolveSocialCard(segments);
	if (!card) return new Response("Social preview not found", { status: 404 });
	return renderSocialCard(card);
}
