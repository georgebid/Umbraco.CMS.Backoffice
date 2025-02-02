import type { UmbPropertyTypeModel } from '@umbraco-cms/backoffice/content-type';
import { UmbDocumentTypeDetailRepository, UMB_DOCUMENT_TYPE_PICKER_MODAL } from '@umbraco-cms/backoffice/document-type';
import { UmbChangeEvent } from '@umbraco-cms/backoffice/event';
import {
	css,
	html,
	customElement,
	property,
	state,
	repeat,
	ifDefined,
	nothing,
	query,
} from '@umbraco-cms/backoffice/external/lit';
import type { UUIComboboxEvent, UUIComboboxElement } from '@umbraco-cms/backoffice/external/uui';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import { UmbMediaTypeDetailRepository } from '@umbraco-cms/backoffice/media-type';
import {
	UMB_MEDIA_TYPE_PICKER_MODAL,
	UMB_MODAL_MANAGER_CONTEXT,
	type UmbModalManagerContext,
} from '@umbraco-cms/backoffice/modal';

interface FieldPickerValue {
	alias: string;
	label: string;
}

enum FieldType {
	MEDIA_TYPE = 'media-type',
	DOCUMENT_TYPE = 'document-type',
	SYSTEM = 'system',
}

@customElement('umb-field-dropdown-list')
export class UmbFieldDropdownListElement extends UmbLitElement {
	@property({ type: Boolean, attribute: 'exclude-media-type', reflect: true })
	public excludeMediaType = false;

	private _value: FieldPickerValue | undefined;
	@property({ type: Object })
	public get value(): FieldPickerValue | undefined {
		return this._value;
	}
	public set value(val: FieldPickerValue | undefined) {
		const oldVal = this._value;
		this._value = val;
		this.requestUpdate('value', oldVal);
		this.dispatchEvent(new UmbChangeEvent());
	}

	@state()
	private _type?: FieldType;

	@state()
	private _uniqueName?: string;

	@state()
	private _unique?: string;

	@query('#value')
	private _valueElement?: UUIComboboxElement;

	#documentTypeDetailRepository = new UmbDocumentTypeDetailRepository(this);
	#mediaTypeDetailRepository = new UmbMediaTypeDetailRepository(this);
	#modalManager?: UmbModalManagerContext;

	@state()
	private _customFields: Array<Partial<UmbPropertyTypeModel>> = [];

	private _systemFields: Array<Partial<UmbPropertyTypeModel>> = [
		{ alias: 'sortOrder', name: this.localize.term('general_sort') },
		{ alias: 'updateDate', name: this.localize.term('content_updateDate') },
		{ alias: 'updater', name: this.localize.term('content_updatedBy') },
		{ alias: 'createDate', name: this.localize.term('content_createDate') },
		{ alias: 'owner', name: this.localize.term('content_createBy') },
		{ alias: 'published', name: this.localize.term('content_isPublished') },
		{ alias: 'contentTypeAlias', name: this.localize.term('content_documentType') },
	];

	constructor() {
		super();
		this.consumeContext(UMB_MODAL_MANAGER_CONTEXT, (modalManager) => {
			this.#modalManager = modalManager;
		});
	}

	async #getDocumentTypeFields() {
		if (!this.#modalManager) return;
		const modalContext = this.#modalManager.open(this, UMB_DOCUMENT_TYPE_PICKER_MODAL, {
			data: {
				hideTreeRoot: true,
				multiple: false,
			},
		});

		const modalValue = await modalContext.onSubmit();
		const unique = modalValue.selection[0] ?? '';

		const { data } = await this.#documentTypeDetailRepository.requestByUnique(unique);
		if (!data) return;

		this._unique = data.unique;
		this._uniqueName = data.name;
		this._customFields = data.properties;
	}

	async #getMediaTypeFields() {
		if (!this.#modalManager) return;
		const modalContext = this.#modalManager.open(this, UMB_MEDIA_TYPE_PICKER_MODAL, {
			data: {
				hideTreeRoot: true,
				multiple: false,
			},
		});

		const modalValue = await modalContext.onSubmit();
		const unique = modalValue.selection[0] ?? '';

		const { data } = await this.#mediaTypeDetailRepository.requestByUnique(unique);
		if (!data) return;

		this._unique = data.unique;
		this._uniqueName = data.name;
		this._customFields = data.properties;
	}

	#onChange(e: UUIComboboxEvent) {
		this._type = (e.composedPath()[0] as UUIComboboxElement).value as FieldType;
		this.value = undefined;
		if (this._valueElement) this._valueElement.value = '';

		switch (this._type) {
			case FieldType.DOCUMENT_TYPE:
				this.#getDocumentTypeFields();
				break;
			case FieldType.MEDIA_TYPE:
				this.#getMediaTypeFields();
				break;
			default:
				this._uniqueName = '';
				this._unique = '';
				this._customFields = this._systemFields;
				break;
		}
	}

	#onChangeValue(e: UUIComboboxEvent) {
		e.stopPropagation();
		const alias = (e.composedPath()[0] as UUIComboboxElement).value as FieldType;
		this.value = this._customFields.find((field) => field.alias === alias) as FieldPickerValue;
	}

	render() {
		return html`
			<uui-combobox id="preview">
				<uui-combobox-list @change=${this.#onChange}>
					<uui-combobox-list-option value="system">
						<strong>${this.localize.term('formSettings_systemFields')}</strong>
					</uui-combobox-list-option>
					<uui-combobox-list-option value="document-type" display-value=${this.localize.term('content_documentType')}>
						<strong> ${this.localize.term('content_documentType')} </strong>
						${this.localize.term('defaultdialogs_treepicker')}
					</uui-combobox-list-option>
					${!this.excludeMediaType
						? html`<uui-combobox-list-option
								value="media-type"
								display-value=${this.localize.term('content_mediatype')}>
								<strong> ${this.localize.term('content_mediatype')} </strong>
								${this.localize.term('defaultdialogs_treepicker')}
						  </uui-combobox-list-option>`
						: nothing}
				</uui-combobox-list>
			</uui-combobox>
			${this.#renderAliasDropdown()}
		`;
	}

	#renderAliasDropdown() {
		if (this._type !== FieldType.SYSTEM && !this._unique) return;
		return html`<strong>${this._uniqueName}</strong>
			<uui-combobox id="value" value=${ifDefined(this.value?.alias)}>
				<uui-combobox-list @change=${this.#onChangeValue}>
					${repeat(
						this._customFields,
						(field) => field.alias,
						(field) =>
							html`<uui-combobox-list-option value=${ifDefined(field.alias)}>${field.alias}</uui-combobox-list-option>`,
					)}
				</uui-combobox-list>
			</uui-combobox>`;
	}

	static styles = [
		css`
			uui-combobox {
				width: 100%;
			}
			strong {
				display: block;
			}
			uui-combobox-list-option {
				padding: calc(var(--uui-size-2, 6px) + 1px);
			}
		`,
	];
}

export default UmbFieldDropdownListElement;

declare global {
	interface HTMLElementTagNameMap {
		'umb-field-dropdown-list': UmbFieldDropdownListElement;
	}
}
