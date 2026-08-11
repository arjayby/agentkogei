import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import {
	type DesignSystemEvaluationRecord,
	designSystemEvaluationFileName,
	designSystemEvaluationRecordSchema,
} from "./design-system-evaluation";
import {
	type DesignSystemIdentity,
	designSystemIdentitySchema,
} from "./design-system-identity";
import {
	compareDesignSystemReleaseVersions,
	type DesignSystemReleaseVersion,
	designSystemReleaseVersionSchema,
} from "./release-version";
import { validateDesignSystemRelease } from "./validator";

export type PublishedDesignSystemRelease = {
	version: DesignSystemReleaseVersion;
	directory: string;
	metadata: DesignSystemEvaluationRecord;
};

export type PublishedDesignSystem = {
	id: DesignSystemIdentity;
	versions: DesignSystemReleaseVersion[];
	currentRelease: DesignSystemReleaseVersion;
	directory: string;
	directoryFor(version: DesignSystemReleaseVersion): string;
	releases: PublishedDesignSystemRelease[];
};

async function readMetadata(releaseDirectory: string) {
	return designSystemEvaluationRecordSchema.parse(
		JSON.parse(
			await readFile(
				path.join(releaseDirectory, designSystemEvaluationFileName),
				"utf8",
			),
		),
	);
}

/**
 * Discovers and validates every Published Design System below one release root.
 * Directory names provide addressability while canonical release metadata
 * proves the identity and semantic version at that address.
 */
export async function discoverPublishedDesignSystems(
	releasesDirectory: string,
): Promise<PublishedDesignSystem[]> {
	const identityEntries = await readdir(releasesDirectory, {
		withFileTypes: true,
	});
	const errors: string[] = [];
	const discovered: PublishedDesignSystem[] = [];

	for (const identityEntry of identityEntries.sort((left, right) =>
		left.name.localeCompare(right.name),
	)) {
		if (!identityEntry.isDirectory()) {
			errors.push(
				`${identityEntry.name}: expected a Design System identity directory`,
			);
			continue;
		}
		const parsedIdentity = designSystemIdentitySchema.safeParse(
			identityEntry.name,
		);
		if (!parsedIdentity.success) {
			errors.push(`${identityEntry.name}: invalid Design System identity`);
			continue;
		}
		const identity = parsedIdentity.data;

		const identityDirectory = path.join(releasesDirectory, identity);
		const versionEntries = await readdir(identityDirectory, {
			withFileTypes: true,
		});
		const releases: PublishedDesignSystemRelease[] = [];

		for (const versionEntry of versionEntries.sort((left, right) =>
			left.name.localeCompare(right.name),
		)) {
			const parsedVersion = designSystemReleaseVersionSchema.safeParse(
				versionEntry.name,
			);
			if (!versionEntry.isDirectory() || !parsedVersion.success) {
				errors.push(
					`${identity}/${versionEntry.name}: invalid Design System Release directory name`,
				);
				continue;
			}

			const version = parsedVersion.data;
			const releaseDirectory = path.join(identityDirectory, version);
			const validation = await validateDesignSystemRelease(releaseDirectory);
			if (!validation.ok) {
				for (const error of validation.errors) {
					errors.push(`${identity}@${version}: ${error}`);
				}
				continue;
			}

			const metadata = await readMetadata(releaseDirectory);
			if (metadata.id !== identity) {
				errors.push(
					`${identity}@${version}: metadata identity ${metadata.id} does not match its release directory`,
				);
			}
			if (metadata.designSystemRelease.version !== version) {
				errors.push(
					`${identity}@${version}: metadata version ${metadata.designSystemRelease.version} does not match its release directory`,
				);
			}
			const expectedRoute = `/design-systems/${identity}`;
			if (metadata.preview.route !== expectedRoute) {
				errors.push(
					`${identity}@${version}: preview route ${metadata.preview.route} does not match ${expectedRoute}`,
				);
			}
			releases.push({ version, directory: releaseDirectory, metadata });
		}

		releases.sort((left, right) =>
			compareDesignSystemReleaseVersions(left.version, right.version),
		);
		const current = releases.at(-1);
		if (!current) {
			errors.push(`${identity}: no valid Design System Release`);
			continue;
		}
		const versions = releases.map(({ version }) => version);
		discovered.push({
			id: identity,
			versions,
			currentRelease: current.version,
			directory: current.directory,
			directoryFor(version) {
				const release = releases.find(
					(candidate) => candidate.version === version,
				);
				if (!release) {
					throw new Error(
						`Unknown ${identity} Design System Release ${version}`,
					);
				}
				return release.directory;
			},
			releases,
		});
	}

	const directoriesByMetadataIdentity = new Map<DesignSystemIdentity, string>();
	for (const designSystem of discovered) {
		for (const release of designSystem.releases) {
			const previousDirectory = directoriesByMetadataIdentity.get(
				release.metadata.id,
			);
			if (previousDirectory && previousDirectory !== designSystem.id) {
				errors.push(
					`${release.metadata.id}: duplicate published identity in ${previousDirectory} and ${designSystem.id}`,
				);
			} else {
				directoriesByMetadataIdentity.set(release.metadata.id, designSystem.id);
			}
		}
	}

	if (errors.length > 0) {
		throw new Error(
			`Published Design System discovery failed:\n${errors.join("\n")}`,
		);
	}

	return discovered.sort((left, right) => {
		const leftOrder = left.releases.at(-1)?.metadata.preview.order ?? 0;
		const rightOrder = right.releases.at(-1)?.metadata.preview.order ?? 0;
		return leftOrder - rightOrder || left.id.localeCompare(right.id);
	});
}
