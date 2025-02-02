import type { UmbMemberTypeDetailModel } from '../../../types.js';
import type { UmbMemberTypeWorkspaceContext } from '../../member-type-workspace.context.js';
import type { UmbMemberTypeWorkspaceViewEditPropertiesElement } from './member-type-workspace-view-edit-properties.element.js';
import type { UUIInputEvent } from '@umbraco-cms/backoffice/external/uui';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import { css, html, customElement, property, state, repeat, ifDefined } from '@umbraco-cms/backoffice/external/lit';
import { UmbTextStyles } from '@umbraco-cms/backoffice/style';
import {
	UmbContentTypeContainerStructureHelper,
	type UmbPropertyTypeContainerModel,
} from '@umbraco-cms/backoffice/content-type';
import { UMB_WORKSPACE_CONTEXT } from '@umbraco-cms/backoffice/workspace';

import './member-type-workspace-view-edit-properties.element.js';
import { UmbSorterController } from '@umbraco-cms/backoffice/sorter';

@customElement('umb-member-type-workspace-view-edit-tab')
export class UmbMemberTypeWorkspaceViewEditTabElement extends UmbLitElement {
	#model: Array<UmbPropertyTypeContainerModel> = [];
	#sorter = new UmbSorterController<UmbPropertyTypeContainerModel, UmbMemberTypeWorkspaceViewEditPropertiesElement>(
		this,
		{
			getUniqueOfElement: (element) =>
				element.querySelector('umb-member-type-workspace-view-edit-properties')!.getAttribute('container-id'),
			getUniqueOfModel: (modelEntry) => modelEntry.id,
			identifier: 'member-type-container-sorter',
			itemSelector: '.container-handle',
			containerSelector: '.container-list',
			onChange: ({ model }) => {
				this._groups = model;
				this.#model = model;
			},
			onEnd: ({ item }) => {
				/** Explanation: If the item is the first in list, we compare it to the item behind it to set a sortOrder.
				 * If it's not the first in list, we will compare to the item in before it, and check the following item to see if it caused overlapping sortOrder, then update
				 * the overlap if true, which may cause another overlap, so we loop through them till no more overlaps...
				 */
				const model = this.#model;
				const newIndex = model.findIndex((entry) => entry.id === item.id);

				// Doesn't exist in model
				if (newIndex === -1) return;

				// First in list
				if (newIndex === 0 && model.length > 1) {
					this._groupStructureHelper.partialUpdateContainer(item.id, { sortOrder: model[1].sortOrder - 1 });
					return;
				}

				// Not first in list
				if (newIndex > 0 && model.length > 1) {
					const prevItemSortOrder = model[newIndex - 1].sortOrder;

					let weight = 1;
					this._groupStructureHelper.partialUpdateContainer(item.id, { sortOrder: prevItemSortOrder + weight });

					// Check for overlaps
					model.some((entry, index) => {
						if (index <= newIndex) return;
						if (entry.sortOrder === prevItemSortOrder + weight) {
							weight++;
							this._groupStructureHelper.partialUpdateContainer(entry.id, { sortOrder: prevItemSortOrder + weight });
						}
						// Break the loop
						return true;
					});
				}
			},
		},
	);

	private _ownerTabId?: string | null;

	// TODO: get rid of this:
	@property({ type: String })
	public get ownerTabId(): string | null | undefined {
		return this._ownerTabId;
	}
	public set ownerTabId(value: string | null | undefined) {
		if (value === this._ownerTabId) return;
		const oldValue = this._ownerTabId;
		this._ownerTabId = value;
		this._groupStructureHelper.setOwnerId(value);
		this.requestUpdate('ownerTabId', oldValue);
	}

	private _tabName?: string | undefined;

	@property({ type: String })
	public get tabName(): string | undefined {
		return this._groupStructureHelper.getName();
	}
	public set tabName(value: string | undefined) {
		if (value === this._tabName) return;
		const oldValue = this._tabName;
		this._tabName = value;
		this._groupStructureHelper.setName(value);
		this.requestUpdate('tabName', oldValue);
	}

	@state()
	private _noTabName?: boolean;

	@property({ type: Boolean })
	public get noTabName(): boolean {
		return this._groupStructureHelper.getIsRoot();
	}
	public set noTabName(value: boolean) {
		this._noTabName = value;
		this._groupStructureHelper.setIsRoot(value);
	}

	_groupStructureHelper = new UmbContentTypeContainerStructureHelper<UmbMemberTypeDetailModel>(this);

	@state()
	_groups: Array<UmbPropertyTypeContainerModel> = [];

	@state()
	_hasProperties = false;

	@state()
	_sortModeActive?: boolean;

	constructor() {
		super();

		this.consumeContext(UMB_WORKSPACE_CONTEXT, (context) => {
			this._groupStructureHelper.setStructureManager((context as UmbMemberTypeWorkspaceContext).structure);
			this.observe(
				(context as UmbMemberTypeWorkspaceContext).isSorting,
				(isSorting) => {
					this._sortModeActive = isSorting;

					if (isSorting) {
						this.#sorter.setModel(this._groups);
					} else {
						this.#sorter.setModel([]);
					}
				},
				'_observeIsSorting',
			);
		});
		this.observe(this._groupStructureHelper.containers, (groups) => {
			this._groups = groups;
			if (this._sortModeActive) {
				this.#sorter.setModel(this._groups);
			} else {
				this.#sorter.setModel([]);
			}
			this.requestUpdate('_groups');
		});
		this.observe(this._groupStructureHelper.hasProperties, (hasProperties) => {
			this._hasProperties = hasProperties;
			this.requestUpdate('_hasProperties');
		});
	}

	#onAddGroup = () => {
		// Idea, maybe we can gather the sortOrder from the last group rendered and add 1 to it?
		this._groupStructureHelper.addContainer(this._ownerTabId);
	};

	render() {
		return html`
		${
			this._sortModeActive
				? html`<uui-button
						id="convert-to-tab"
						label=${this.localize.term('contentTypeEditor_convertToTab') + '(Not implemented)'}
						look="placeholder"></uui-button>`
				: ''
		}

		${
			!this._noTabName
				? html`
						<uui-box>
							<umb-member-type-workspace-view-edit-properties
								container-id=${ifDefined(this.ownerTabId === null ? undefined : this.ownerTabId)}
								container-type="Tab"
								container-name=${this.tabName || ''}></umb-member-type-workspace-view-edit-properties>
						</uui-box>
				  `
				: ''
		}
				<div class="container-list" ?sort-mode-active=${this._sortModeActive}>
					${repeat(
						this._groups,
						(group) => group.id + '' + group.name + group.sortOrder,
						(group) =>
							html`<uui-box class="container-handle">
								${this.#renderHeader(group)}
								<umb-member-type-workspace-view-edit-properties
									container-id=${ifDefined(group.id)}
									container-type="Group"
									container-name=${group.name || ''}></umb-member-type-workspace-view-edit-properties>
							</uui-box> `,
					)}
				</div>
				${this.#renderAddGroupButton()}
			</div>
		`;
	}

	#renderHeader(group: UmbPropertyTypeContainerModel) {
		const inherited = !this._groupStructureHelper.isOwnerChildContainer(group.id!);

		if (this._sortModeActive) {
			return html`<div slot="header">
				<div>
					<uui-icon name=${inherited ? 'icon-merge' : 'icon-navigation'}></uui-icon>
					${this.#renderInputGroupName(group)}
				</div>
				<uui-input
					type="number"
					label=${this.localize.term('sort_sortOrder')}
					@change=${(e: UUIInputEvent) =>
						this._groupStructureHelper.partialUpdateContainer(group.id!, {
							sortOrder: parseInt(e.target.value as string) || 0,
						})}
					.value=${group.sortOrder || 0}
					?disabled=${inherited}></uui-input>
			</div> `;
		} else {
			return html`<div slot="header">
				${inherited ? html`<uui-icon name="icon-merge"></uui-icon>` : this.#renderInputGroupName(group)}
			</div> `;
		}
	}

	#renderInputGroupName(group: UmbPropertyTypeContainerModel) {
		return html`<uui-input
			label=${this.localize.term('contentTypeEditor_group')}
			placeholder=${this.localize.term('placeholders_entername')}
			.value=${group.name}
			@change=${(e: InputEvent) => {
				const newName = (e.target as HTMLInputElement).value;
				this._groupStructureHelper.updateContainerName(group.id!, group.parent?.id ?? null, newName);
			}}></uui-input>`;
	}

	#renderAddGroupButton() {
		if (this._sortModeActive) return;
		return html`<uui-button
			label=${this.localize.term('contentTypeEditor_addGroup')}
			id="add"
			look="placeholder"
			@click=${this.#onAddGroup}>
			${this.localize.term('contentTypeEditor_addGroup')}
		</uui-button>`;
	}

	static styles = [
		UmbTextStyles,
		css`
			[drag-placeholder] {
				opacity: 0.5;
			}

			[drag-placeholder] > * {
				visibility: hidden;
			}

			#add {
				width: 100%;
			}

			#add:first-child {
				margin-top: var(--uui-size-layout-1);
			}

			uui-box {
				margin-bottom: var(--uui-size-layout-1);
			}

			[data-umb-group-id] {
				display: block;
				position: relative;
			}

			div[slot='header'] {
				flex: 1;
				display: flex;
				align-items: center;
				justify-content: space-between;
			}

			div[slot='header'] > div {
				display: flex;
				align-items: center;
				gap: var(--uui-size-3);
			}

			uui-input[type='number'] {
				max-width: 75px;
			}

			[sort-mode-active] div[slot='header'] {
				cursor: grab;
			}

			.container-list {
				display: grid;
				gap: 10px;
			}

			#convert-to-tab {
				margin-bottom: var(--uui-size-layout-1);
				display: flex;
			}
		`,
	];
}

export default UmbMemberTypeWorkspaceViewEditTabElement;

declare global {
	interface HTMLElementTagNameMap {
		'umb-member-type-workspace-view-edit-tab': UmbMemberTypeWorkspaceViewEditTabElement;
	}
}
