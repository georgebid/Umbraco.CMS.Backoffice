import { manifest as storageType } from './config/storage-type/manifests.js';
import type { ManifestPropertyEditorUi } from '@umbraco-cms/backoffice/extension-registry';

const manifest: ManifestPropertyEditorUi = {
	type: 'propertyEditorUi',
	alias: 'Umb.PropertyEditorUi.Tags',
	name: 'Tags Property Editor UI',
	js: () => import('./property-editor-ui-tags.element.js'),
	meta: {
		label: 'Tags',
		propertyEditorSchemaAlias: 'Umbraco.Tags',
		icon: 'icon-tags',
		group: 'common',
	},
};

const config: Array<ManifestPropertyEditorUi> = [storageType];

export const manifests = [manifest, ...config];
