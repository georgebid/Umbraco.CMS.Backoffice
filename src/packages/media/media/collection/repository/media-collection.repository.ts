import type { UmbMediaCollectionFilterModel } from '../types.js';
import { UmbMediaCollectionServerDataSource } from './media-collection.server.data-source.js';
import type { UmbCollectionRepository } from '@umbraco-cms/backoffice/collection';
import type { UmbControllerHost } from '@umbraco-cms/backoffice/controller-api';

export class UmbMediaCollectionRepository implements UmbCollectionRepository {
	#collectionSource: UmbMediaCollectionServerDataSource;

	constructor(host: UmbControllerHost) {
		this.#collectionSource = new UmbMediaCollectionServerDataSource(host);
	}

	async getDefaultConfiguration() {
		return {
			// TODO: The default Collection data-type ID (for the Media ListView) will come from the server soon.  [LK]
			defaultDataTypeId: '3a0156c4-3b8c-4803-bdc1-6871faa83fff',
		};
	}

	async requestCollection(query: UmbMediaCollectionFilterModel) {
		return this.#collectionSource.getCollection(query);
	}

	destroy(): void {}
}

export default UmbMediaCollectionRepository;
