import type { UmbInputMemberTypeElement } from '@umbraco-cms/backoffice/member-type';
import type { UmbInputDocumentTypeElement } from '@umbraco-cms/backoffice/document-type';
import type { UmbInputMediaTypeElement } from '@umbraco-cms/backoffice/media-type';
import type { UmbTreePickerSource } from '@umbraco-cms/backoffice/components';
import type { UmbPropertyEditorUiElement } from '@umbraco-cms/backoffice/extension-registry';
import { customElement, html, property, state } from '@umbraco-cms/backoffice/external/lit';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import { UMB_PROPERTY_DATASET_CONTEXT } from '@umbraco-cms/backoffice/property';
import { UmbPropertyValueChangeEvent } from '@umbraco-cms/backoffice/property-editor';

/**
 * @element umb-property-editor-ui-tree-picker-source-type-picker
 */
@customElement('umb-property-editor-ui-tree-picker-source-type-picker')
export class UmbPropertyEditorUITreePickerSourceTypePickerElement
	extends UmbLitElement
	implements UmbPropertyEditorUiElement
{
	#datasetContext?: typeof UMB_PROPERTY_DATASET_CONTEXT.TYPE;

	@property()
	public set value(value: string) {
		if (value) {
			this.#selectedIds = value.split(',');
		} else {
			this.#selectedIds = [];
		}
	}
	public get value(): string {
		return this.#selectedIds.join(',');
	}

	@state()
	private sourceType: string = 'content';

	#initialized: boolean = false;

	constructor() {
		super();

		this.consumeContext(UMB_PROPERTY_DATASET_CONTEXT, (datasetContext) => {
			this.#datasetContext = datasetContext;
			this._observeProperty();
		});
	}

	private async _observeProperty() {
		if (!this.#datasetContext) return;
		this.observe(
			await this.#datasetContext.propertyValueByAlias('startNode'),
			(value) => {
				if (!value) return;

				const startNode = value as UmbTreePickerSource;
				if (startNode?.type) {
					// If we had a sourceType before, we can see this as a change and not the initial value,
					// so let's reset the value, so we don't carry over content-types to the new source type.
					if (this.#initialized && this.sourceType !== startNode.type) {
						this.#setValue([]);
					}

					this.sourceType = startNode.type;

					if (!this.#initialized) {
						this.#initialized = true;
					}
				}
			},
			'observeValue',
		);
	}

	#onChange(event: CustomEvent) {
		switch (this.sourceType) {
			case 'content':
				this.#setValue((<UmbInputDocumentTypeElement>event.target).selectedIds);
				break;
			case 'media':
				this.#setValue((<UmbInputMediaTypeElement>event.target).selectedIds);
				break;
			case 'member':
				this.#setValue((<UmbInputMemberTypeElement>event.target).selectedIds);
				break;
			default:
				break;
		}
	}

	#selectedIds: Array<string> = [];

	#setValue(value: string[]) {
		this.value = value.join(',');
		this.dispatchEvent(new UmbPropertyValueChangeEvent());
	}

	render() {
		return this.#renderType();
	}

	#renderType() {
		switch (this.sourceType) {
			case 'content':
				return this.#renderTypeContent();
			case 'media':
				return this.#renderTypeMedia();
			case 'member':
				return this.#renderTypeMember();
			default:
				return html`<p>No source type found</p>`;
		}
	}

	#renderTypeContent() {
		return html`<umb-input-document-type
			@change=${this.#onChange}
			.selectedIds=${this.#selectedIds}></umb-input-document-type>`;
	}

	#renderTypeMedia() {
		return html`<umb-input-media-type
			@change=${this.#onChange}
			.selectedIds=${this.#selectedIds}></umb-input-media-type>`;
	}

	#renderTypeMember() {
		return html`<umb-input-member-type
			@change=${this.#onChange}
			.selectedIds=${this.#selectedIds}></umb-input-member-type>`;
	}
}

export default UmbPropertyEditorUITreePickerSourceTypePickerElement;

declare global {
	interface HTMLElementTagNameMap {
		'umb-property-editor-ui-tree-picker-source-type-picker': UmbPropertyEditorUITreePickerSourceTypePickerElement;
	}
}
