import type { UmbContentTypePropertyStructureManager } from './content-type-structure-manager.class.js';
import type { UmbContentTypeModel, UmbPropertyContainerTypes, UmbPropertyTypeContainerModel } from './types.js';
import type { UmbControllerHost } from '@umbraco-cms/backoffice/controller-api';
import { UmbArrayState, UmbBooleanState, UmbObserverController } from '@umbraco-cms/backoffice/observable-api';

export class UmbContentTypeContainerStructureHelper<T extends UmbContentTypeModel> {
	#host: UmbControllerHost;
	#init;
	#initResolver?: (value: unknown) => void;

	#structure?: UmbContentTypePropertyStructureManager<T>;

	private _ownerType?: UmbPropertyContainerTypes = 'Tab';
	private _childType?: UmbPropertyContainerTypes = 'Group';
	private _isRoot = false;
	/**
	 * The owner id is the owning container (The container that is begin presented, the container is the parent of the child containers)
	 * If set to null, this helper class will provide containers of the root.
	 */
	private _ownerId?: string | null;
	private _ownerName?: string;

	// Containers defined in data might be more than actual containers to display as we merge them by name.
	// Direct containers are the containers defining the total of this container(Multiple containers with the same name and type)
	private _ownerAlikeContainers: UmbPropertyTypeContainerModel[] = [];
	// Owner containers are containers owned by the owner Content Type (The specific one up for editing)
	private _ownerContainers: UmbPropertyTypeContainerModel[] = [];

	// State containing the merged containers (only one pr. name):
	#containers = new UmbArrayState<UmbPropertyTypeContainerModel>([], (x) => x.id);
	readonly containers = this.#containers.asObservable();

	#hasProperties = new UmbBooleanState(false);
	readonly hasProperties = this.#hasProperties.asObservable();

	constructor(host: UmbControllerHost) {
		this.#host = host;
		this.#init = new Promise((resolve) => {
			this.#initResolver = resolve;
		});

		this.#containers.sortBy((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
	}

	public setStructureManager(structure: UmbContentTypePropertyStructureManager<T>) {
		this.#structure = structure;
		this.#initResolver?.(undefined);
		this.#initResolver = undefined;
		this._observeOwnerAlikeContainers();
	}

	public setType(value?: UmbPropertyContainerTypes) {
		if (this._ownerType === value) return;
		this._ownerType = value;
		this._observeOwnerAlikeContainers();
	}
	public getType() {
		return this._ownerType;
	}

	public setContainerChildType(value?: UmbPropertyContainerTypes) {
		if (this._childType === value) return;
		this._childType = value;
		this._observeOwnerAlikeContainers();
	}
	public getContainerChildType() {
		return this._childType;
	}

	public setName(value?: string) {
		if (this._ownerName === value) return;
		this._ownerName = value;
		this._observeOwnerAlikeContainers();
	}
	public getName() {
		return this._ownerName;
	}

	public setIsRoot(value: boolean) {
		if (this._isRoot === value) return;
		this._isRoot = value;
		this._observeOwnerAlikeContainers();
	}
	public getIsRoot() {
		return this._isRoot;
	}

	public setOwnerId(value: string | null | undefined) {
		if (this._ownerId === value) return;
		this._ownerId = value;
	}
	public getOwnerId() {
		return this._ownerId;
	}

	private _observeOwnerAlikeContainers() {
		if (!this.#structure || !this._ownerType) return;

		if (this._isRoot) {
			this.#containers.setValue([]);
			// We cannot have root properties currently, therefor we set it to false:
			this.#hasProperties.setValue(false);
			this._observeRootContainers();
			new UmbObserverController(
				this.#host,
				this.#structure.ownerContainersOf(this._ownerType),
				(ownerContainers) => {
					this._ownerContainers = ownerContainers || [];
				},
				'_observeOwnerContainers',
			);
		} else if (this._ownerName) {
			new UmbObserverController(
				this.#host,
				this.#structure.containersByNameAndType(this._ownerName, this._ownerType),
				(ownerALikeContainers) => {
					this.#containers.setValue([]);
					this._ownerContainers = ownerALikeContainers.filter((x) => x.id === this._ownerId) || [];
					this._ownerAlikeContainers = ownerALikeContainers || [];
					if (this._ownerAlikeContainers.length > 0) {
						this._observeChildContainerProperties();
						this._observeChildContainers();
					}
				},
				'_observeOwnerContainers',
			);
		}
	}

	private _observeChildContainerProperties() {
		if (!this.#structure) return;

		this._ownerAlikeContainers.forEach((container) => {
			new UmbObserverController(
				this.#host,
				this.#structure!.hasPropertyStructuresOf(container.id!),
				(hasProperties) => {
					this.#hasProperties.setValue(hasProperties);
				},
				'_observeOwnerHasProperties_' + container.id,
			);
		});
	}

	private _observeChildContainers() {
		if (!this.#structure || !this._ownerName || !this._childType) return;

		this._ownerAlikeContainers.forEach((container) => {
			new UmbObserverController(
				this.#host,
				this.#structure!.containersOfParentKey(container.id, this._childType!),
				this._insertGroupContainers,
				'_observeGroupsOf_' + container.id,
			);
		});
	}

	private _observeRootContainers() {
		if (!this.#structure || !this._isRoot) return;

		new UmbObserverController(
			this.#host,
			this.#structure.rootContainers(this._childType!),
			(rootContainers) => {
				this.#containers.setValue([]);
				this._insertGroupContainers(rootContainers);
			},
			'_observeRootContainers',
		);
	}

	private _insertGroupContainers = (groupContainers: UmbPropertyTypeContainerModel[]) => {
		groupContainers.forEach((group) => {
			if (group.name !== null && group.name !== undefined) {
				if (!this.#containers.getValue().find((x) => x.name === group.name)) {
					this.#containers.appendOne(group);
				}
			}
		});
	};

	/**
	 * Returns true if the container is an owner container.
	 */
	isOwnerContainer(containerId?: string) {
		if (!this.#structure || !containerId) return;

		return this._ownerContainers.find((x) => x.id === containerId) !== undefined;
	}

	/**
	 * Returns true if the container is an owner container.
	 */
	isOwnerChildContainer(containerId?: string) {
		if (!this.#structure || !containerId) return;

		return (
			this.#containers
				.getValue()
				.find((x) => (x.id === containerId && this._ownerId ? x.parent?.id === this._ownerId : x.parent === null)) !==
			undefined
		);
	}

	/** Manipulate methods: */

	async insertContainer(container: UmbPropertyTypeContainerModel, sortOrder = 0) {
		await this.#init;
		if (!this.#structure) return false;

		const newContainer = { ...container, sortOrder };

		await this.#structure.insertContainer(null, newContainer);
		return true;
	}

	async addContainer(parentContainerId?: string | null, sortOrder?: number) {
		if (!this.#structure) return;

		await this.#structure.createContainer(null, parentContainerId, this._childType, sortOrder);
	}

	async removeContainer(groupId: string) {
		await this.#init;
		if (!this.#structure) return false;

		await this.#structure.removeContainer(null, groupId);
		return true;
	}

	async partialUpdateContainer(containerId: string, partialUpdate: Partial<UmbPropertyTypeContainerModel>) {
		await this.#init;
		if (!this.#structure || !containerId || !partialUpdate) return;

		return await this.#structure.updateContainer(null, containerId, partialUpdate);
	}

	async updateContainerName(containerId: string, containerParentId: string | null, name: string) {
		await this.#init;
		if (!this.#structure) return;

		const newName =
			this.#structure.makeContainerNameUniqueForOwnerContentType(name, this._childType, containerParentId) ?? name;

		return await this.partialUpdateContainer(containerId, { name: newName });
	}
}
