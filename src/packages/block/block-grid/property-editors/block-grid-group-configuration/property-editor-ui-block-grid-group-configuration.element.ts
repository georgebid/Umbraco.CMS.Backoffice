import { html, customElement, property, css } from '@umbraco-cms/backoffice/external/lit';
import type { UmbPropertyEditorUiElement } from '@umbraco-cms/backoffice/extension-registry';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import type { UmbPropertyEditorConfigCollection } from '@umbraco-cms/backoffice/property-editor';
import { UmbTextStyles } from '@umbraco-cms/backoffice/style';
import { UmbId } from '@umbraco-cms/backoffice/id';
import type { UmbBlockGridTypeGroupType } from '@umbraco-cms/backoffice/block-grid';

@customElement('umb-property-editor-ui-block-grid-group-configuration')
export class UmbPropertyEditorUIBlockGridGroupConfigurationElement
	extends UmbLitElement
	implements UmbPropertyEditorUiElement
{
	private _value: Array<UmbBlockGridTypeGroupType> = [];

	@property({ type: Array })
	public get value(): Array<UmbBlockGridTypeGroupType> {
		return this._value;
	}
	public set value(value: Array<UmbBlockGridTypeGroupType>) {
		this._value = value || [];
	}

	@property({ attribute: false })
	public set config(config: UmbPropertyEditorConfigCollection | undefined) {}

	#addGroup() {
		this.value = [...this._value, { name: 'Unnamed group', key: UmbId.new() }];
		this.dispatchEvent(new CustomEvent('property-value-change'));
	}

	render() {
		return html`
			<uui-button label=${this.localize.term('blockEditor_addBlockGroup')} look="placeholder" @click=${this.#addGroup}>
				${this.localize.term('blockEditor_addBlockGroup')}
			</uui-button>
		`;
	}

	static styles = [
		UmbTextStyles,
		css`
			uui-button {
				display: block;
			}
		`,
	];
}

export default UmbPropertyEditorUIBlockGridGroupConfigurationElement;

declare global {
	interface HTMLElementTagNameMap {
		'umb-property-editor-ui-block-grid-group-configuration': UmbPropertyEditorUIBlockGridGroupConfigurationElement;
	}
}
