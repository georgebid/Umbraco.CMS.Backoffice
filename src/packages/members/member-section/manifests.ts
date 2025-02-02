import type { ManifestSection } from '@umbraco-cms/backoffice/extension-registry';

const section: ManifestSection = {
	type: 'section',
	alias: 'Umb.Section.Members',
	name: 'Members Section',
	weight: 300,
	meta: {
		label: 'Members',
		pathname: 'member-management',
	},
};

export const manifests = [section];
