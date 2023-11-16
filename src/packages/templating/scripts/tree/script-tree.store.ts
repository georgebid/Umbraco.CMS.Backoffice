import { UmbContextToken } from '@umbraco-cms/backoffice/context-api';
import { UmbControllerHostElement } from '@umbraco-cms/backoffice/controller-api';
import { UmbEntityTreeStore } from '@umbraco-cms/backoffice/tree';

/**
 * @export
 * @class UmbScriptTreeStore
 * @extends {UmbStoreBase}
 * @description - Tree Data Store for Script Items
 */
export class UmbScriptTreeStore extends UmbEntityTreeStore {
	/**
	 * Creates an instance of UmbScriptTreeStore.
	 * @param {UmbControllerHostElement} host
	 * @memberof UmbScriptTreeStore
	 */
	constructor(host: UmbControllerHostElement) {
		super(host, UMB_SCRIPT_TREE_STORE_CONTEXT.toString());
	}
}

export const UMB_SCRIPT_TREE_STORE_CONTEXT = new UmbContextToken<UmbScriptTreeStore>('UmbScriptTreeStore');
