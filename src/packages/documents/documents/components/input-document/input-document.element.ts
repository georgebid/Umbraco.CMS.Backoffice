import type { UmbDocumentTreeItemModel } from '../../tree/types.js';
import { UmbDocumentPickerContext } from './input-document.context.js';
import { css, html, customElement, property, state, ifDefined, repeat } from '@umbraco-cms/backoffice/external/lit';
import { FormControlMixin } from '@umbraco-cms/backoffice/external/uui';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import { splitStringToArray } from '@umbraco-cms/backoffice/utils';
import { UMB_WORKSPACE_MODAL, UmbModalRouteRegistrationController } from '@umbraco-cms/backoffice/modal';
import { UmbSorterController } from '@umbraco-cms/backoffice/sorter';
import type { UmbDocumentItemModel } from '@umbraco-cms/backoffice/document';

@customElement('umb-input-document')
export class UmbInputDocumentElement extends FormControlMixin(UmbLitElement) {
	#sorter = new UmbSorterController<string>(this, {
		getUniqueOfElement: (element) => {
			return element.getAttribute('detail');
		},
		getUniqueOfModel: (modelEntry) => {
			return modelEntry;
		},
		identifier: 'Umb.SorterIdentifier.InputDocument',
		itemSelector: 'uui-ref-node',
		containerSelector: 'uui-ref-list',
		onChange: ({ model }) => {
			this.selectedIds = model;
		},
	});

	/**
	 * This is a minimum amount of selected items in this input.
	 * @type {number}
	 * @attr
	 * @default 0
	 */
	@property({ type: Number })
	public get min(): number {
		return this.#pickerContext.min;
	}
	public set min(value: number) {
		this.#pickerContext.min = value;
	}

	/**
	 * Min validation message.
	 * @type {boolean}
	 * @attr
	 * @default
	 */
	@property({ type: String, attribute: 'min-message' })
	minMessage = 'This field need more items';

	/**
	 * This is a maximum amount of selected items in this input.
	 * @type {number}
	 * @attr
	 * @default Infinity
	 */
	@property({ type: Number })
	public get max(): number {
		return this.#pickerContext.max;
	}
	public set max(value: number) {
		this.#pickerContext.max = value;
	}

	/**
	 * Max validation message.
	 * @type {boolean}
	 * @attr
	 * @default
	 */
	@property({ type: String, attribute: 'min-message' })
	maxMessage = 'This field exceeds the allowed amount of items';

	public get selectedIds(): Array<string> {
		return this.#pickerContext.getSelection();
	}
	public set selectedIds(ids: Array<string>) {
		this.#pickerContext.setSelection(ids);
		this.#sorter.setModel(ids);
	}

	@property({ type: String })
	startNodeId?: string;

	@property({ type: Array })
	allowedContentTypeIds?: string[] | undefined;

	@property({ type: Boolean })
	showOpenButton?: boolean;

	@property({ type: Boolean })
	ignoreUserStartNodes?: boolean;

	@property()
	public set value(idsString: string) {
		// Its with full purpose we don't call super.value, as thats being handled by the observation of the context selection.
		this.selectedIds = splitStringToArray(idsString);
	}
	public get value() {
		return this.selectedIds.join(',');
	}

	@state()
	private _editDocumentPath = '';

	@state()
	private _items?: Array<UmbDocumentItemModel>;

	#pickerContext = new UmbDocumentPickerContext(this);

	constructor() {
		super();

		new UmbModalRouteRegistrationController(this, UMB_WORKSPACE_MODAL)
			.addAdditionalPath('document')
			.onSetup(() => {
				return { data: { entityType: 'document', preset: {} } };
			})
			.observeRouteBuilder((routeBuilder) => {
				this._editDocumentPath = routeBuilder({});
			});

		this.observe(this.#pickerContext.selection, (selection) => (super.value = selection.join(',')));
		this.observe(this.#pickerContext.selectedItems, (selectedItems) => (this._items = selectedItems));
	}

	connectedCallback(): void {
		super.connectedCallback();

		this.addValidator(
			'rangeUnderflow',
			() => this.minMessage,
			() => !!this.min && this.#pickerContext.getSelection().length < this.min,
		);

		this.addValidator(
			'rangeOverflow',
			() => this.maxMessage,
			() => !!this.max && this.#pickerContext.getSelection().length > this.max,
		);
	}

	protected getFormElement() {
		return undefined;
	}

	#pickableFilter: (item: UmbDocumentTreeItemModel) => boolean = (item) => {
		if (this.allowedContentTypeIds && this.allowedContentTypeIds.length > 0) {
			return this.allowedContentTypeIds.includes(item.documentType.unique);
		}
		return true;
	};

	#openPicker() {
		// TODO: Configure the content picker, with `startNodeId` and `ignoreUserStartNodes` [LK]
		this.#pickerContext.openPicker({
			hideTreeRoot: true,
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			pickableFilter: this.#pickableFilter,
		});
	}

	render() {
		return html`${this.#renderItems()} ${this.#renderAddButton()}`;
	}

	#renderItems() {
		if (!this._items?.length) return;
		return html`<uui-ref-list>
			${repeat(
				this._items,
				(item) => item.unique,
				(item) => this.#renderItem(item),
			)}
		</uui-ref-list>`;
	}

	#renderAddButton() {
		if (this.max > 0 && this.selectedIds.length >= this.max) return;
		return html`<uui-button
			id="add-button"
			look="placeholder"
			@click=${this.#openPicker}
			label=${this.localize.term('general_choose')}></uui-button>`;
	}

	#renderItem(item: UmbDocumentItemModel) {
		if (!item.unique) return;
		// TODO: get correct variant name
		const name = item.variants[0]?.name;

		return html`
			<uui-ref-node name=${name} detail=${ifDefined(item.unique)}>
				${this.#renderIcon(item)} ${this.#renderIsTrashed(item)}
				<uui-action-bar slot="actions">
					${this.#renderOpenButton(item)}
					<uui-button @click=${() => this.#pickerContext.requestRemoveItem(item.unique)} label="Remove document ${name}"
						>${this.localize.term('general_remove')}</uui-button
					>
				</uui-action-bar>
			</uui-ref-node>
		`;
	}

	#renderIcon(item: UmbDocumentItemModel) {
		if (!item.documentType.icon) return;
		return html`<umb-icon slot="icon" name=${item.documentType.icon}></umb-icon>`;
	}

	#renderIsTrashed(item: UmbDocumentItemModel) {
		if (!item.isTrashed) return;
		return html`<uui-tag size="s" slot="tag" color="danger">Trashed</uui-tag>`;
	}

	#renderOpenButton(item: UmbDocumentItemModel) {
		if (!this.showOpenButton) return;

		// TODO: get correct variant name
		const name = item.variants[0]?.name;

		return html`
			<uui-button
				href="${this._editDocumentPath}edit/${item.unique}"
				label="${this.localize.term('general_open')} ${name}">
				${this.localize.term('general_open')}
			</uui-button>
		`;
	}

	static styles = [
		css`
			#add-button {
				width: 100%;
			}

			uui-ref-node[drag-placeholder] {
				opacity: 0.2;
			}
		`,
	];
}

export default UmbInputDocumentElement;

declare global {
	interface HTMLElementTagNameMap {
		'umb-input-document': UmbInputDocumentElement;
	}
}
