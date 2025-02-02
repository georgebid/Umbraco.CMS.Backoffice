import type { UmbBackofficeManifestKind } from '@umbraco-cms/backoffice/extension-registry';
import { UMB_ENTITY_ACTION_DEFAULT_KIND_MANIFEST } from '@umbraco-cms/backoffice/entity-action';

export const manifest: UmbBackofficeManifestKind = {
	type: 'kind',
	alias: 'Umb.Kind.EntityAction.Tree.ReloadChildrenOf',
	matchKind: 'reloadTreeItemChildren',
	matchType: 'entityAction',
	manifest: {
		...UMB_ENTITY_ACTION_DEFAULT_KIND_MANIFEST.manifest,
		type: 'entityAction',
		kind: 'reloadTreeItemChildren',
		api: () => import('./reload-tree-item-children.action.js'),
		weight: 100,
		forEntityTypes: [],
		meta: {
			icon: 'icon-refresh',
			label: 'Reload children',
		},
	},
};
