// import { UMB_COMPOSITION_PICKER_MODAL, type UmbCompositionPickerModalData } from '../../../modals/index.js';
import { UMB_MEMBER_WORKSPACE_CONTEXT } from '../../member-workspace.context.js';
import type { UmbMemberDetailModel } from '../../../types.js';
import { UmbTextStyles } from '@umbraco-cms/backoffice/style';
import { css, html, customElement, state, when } from '@umbraco-cms/backoffice/external/lit';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import type { UmbWorkspaceViewElement } from '@umbraco-cms/backoffice/extension-registry';
import type { UUIBooleanInputEvent } from '@umbraco-cms/backoffice/external/uui';

import './member-workspace-view-member-info.element.js';
import type { UmbInputMemberGroupElement } from '@umbraco-cms/backoffice/member-group';

@customElement('umb-member-workspace-view-member')
export class UmbMemberWorkspaceViewMemberElement extends UmbLitElement implements UmbWorkspaceViewElement {
	private _workspaceContext?: typeof UMB_MEMBER_WORKSPACE_CONTEXT.TYPE;

	constructor() {
		super();

		this.consumeContext(UMB_MEMBER_WORKSPACE_CONTEXT, (context) => {
			this._workspaceContext = context;

			this.observe(this._workspaceContext.isNew, (isNew) => {
				this._isNew = !!isNew;
			});
		});
	}

	@state()
	private _showChangePasswordForm = false;

	@state()
	private _newPasswordError = '';

	@state()
	private _isNew = true;

	#onChange(propertyName: keyof UmbMemberDetailModel, value: UmbMemberDetailModel[keyof UmbMemberDetailModel]) {
		if (!this._workspaceContext) return;

		console.log('Setting', propertyName, value);

		this._workspaceContext.set(propertyName, value);
	}

	#onGroupsUpdated(event: CustomEvent) {
		const uniques = (event.target as UmbInputMemberGroupElement).selectedIds;

		this._workspaceContext?.set('groups', uniques);
	}

	#onPasswordUpdate = () => {
		const newPassword = this.shadowRoot?.querySelector<HTMLInputElement>('uui-input[name="newPassword"]')?.value;
		const confirmPassword = this.shadowRoot?.querySelector<HTMLInputElement>('uui-input[name="confirmPassword"]')
			?.value;

		if (newPassword !== confirmPassword) {
			this._newPasswordError = 'Passwords do not match';
			return;
		}

		this._newPasswordError = '';

		this._workspaceContext?.set('newPassword', newPassword);
	};

	#onNewPasswordCancel = () => {
		this._workspaceContext?.set('newPassword', '');
		this._showChangePasswordForm = false;
		this._newPasswordError = '';
	};

	#renderPasswordInput() {
		if (this._isNew) {
			return html`
				<umb-property-layout label="Password">
					<uui-input
						slot="editor"
						name="newPassword"
						label="New password"
						type="password"
						@input=${() => this.#onPasswordUpdate()}></uui-input>
				</umb-property-layout>

				<umb-property-layout label="Confirm password">
					<uui-input
						slot="editor"
						name="confirmPassword"
						label="Confirm password"
						type="password"
						@input=${() => this.#onPasswordUpdate()}></uui-input>
				</umb-property-layout>
				${when(this._newPasswordError, () => html`<p class="validation-error">${this._newPasswordError}</p>`)}
			`;
		}

		return html`
			<umb-property-layout label="Change password">
				${when(
					this._showChangePasswordForm,
					() => html`
						<div slot="editor">
							<umb-property-layout label="New password">
								<uui-input
									slot="editor"
									name="newPassword"
									label="New password"
									type="password"
									@input=${() => this.#onPasswordUpdate()}></uui-input>
							</umb-property-layout>
							<umb-property-layout label="Confirm password">
								<uui-input
									slot="editor"
									name="confirmPassword"
									label="Confirm password"
									type="password"
									@input=${() => this.#onPasswordUpdate()}></uui-input>
							</umb-property-layout>
							${when(this._newPasswordError, () => html`<p class="validation-error">${this._newPasswordError}</p>`)}
							<uui-button label="Cancel" look="secondary" @click=${this.#onNewPasswordCancel}></uui-button>
						</div>
					`,
					() =>
						html`<uui-button
							slot="editor"
							label="Change password"
							look="secondary"
							@click=${() => (this._showChangePasswordForm = true)}></uui-button>`,
				)}
			</umb-property-layout>
		`;
	}

	#renderLeftColumn() {
		if (!this._workspaceContext) return;
		return html` <div id="left-column">
			<uui-box>
				<umb-property-layout label="${this.localize.term('general_username')}">
					<uui-input
						slot="editor"
						name="login"
						label="${this.localize.term('general_username')}"
						value=${this._workspaceContext.username}
						@input=${(e: Event) => this.#onChange('username', (e.target as HTMLInputElement).value)}></uui-input>
				</umb-property-layout>

				<umb-property-layout label="${this.localize.term('general_email')}">
					<uui-input
						slot="editor"
						name="email"
						label="${this.localize.term('general_email')}"
						@input=${(e: Event) => this.#onChange('email', (e.target as HTMLInputElement).value)}
						value=${this._workspaceContext.email}></uui-input>
				</umb-property-layout>

				${this.#renderPasswordInput()}

				<umb-property-layout label="Member Group">
					<umb-input-member-group
						slot="editor"
						@change=${this.#onGroupsUpdated}
						.selectedIds=${this._workspaceContext.memberGroups}></umb-input-member-group>
				</umb-property-layout>

				<umb-property-layout label="Approved">
					<uui-toggle
						slot="editor"
						.checked=${this._workspaceContext.isApproved}
						@change=${(e: UUIBooleanInputEvent) => this.#onChange('isApproved', e.target.checked)}>
					</uui-toggle>
				</umb-property-layout>

				<umb-property-layout label="Locked out">
					<uui-toggle
						?disabled=${this._isNew || !this._workspaceContext.isLockedOut}
						slot="editor"
						.checked=${this._workspaceContext.isLockedOut}
						@change=${(e: UUIBooleanInputEvent) => this.#onChange('isLockedOut', e.target.checked)}>
					</uui-toggle>
				</umb-property-layout>

				<umb-property-layout label="Two-Factor authentication">
					<uui-toggle
						?disabled=${this._isNew || !this._workspaceContext.isTwoFactorEnabled}
						slot="editor"
						.checked=${this._workspaceContext.isTwoFactorEnabled}
						@change=${(e: UUIBooleanInputEvent) => this.#onChange('isTwoFactorEnabled', e.target.checked)}>
					</uui-toggle>
				</umb-property-layout>
			</uui-box>
		</div>`;
	}

	#renderRightColumn() {
		if (!this._workspaceContext) return;

		return html`
			<div id="right-column">
				<uui-box>
					<div class="general-item">
						<umb-localize class="headline" key="user_failedPasswordAttempts"></umb-localize>
						<span>${this._workspaceContext.failedPasswordAttempts}</span>
					</div>
					<div class="general-item">
						<umb-localize class="headline" key="user_lastLockoutDate"></umb-localize>
						<span>${this._workspaceContext.lastLockOutDate}</span>
					</div>
					<div class="general-item">
						<umb-localize class="headline" key="user_lastLogin"></umb-localize>
						<span>${this._workspaceContext.lastLoginDate}</span>
					</div>
					<div class="general-item">
						<umb-localize class="headline" key="user_passwordChangedGeneric"></umb-localize>
						<span>${this._workspaceContext.lastPasswordChangeDate}</span>
					</div>
				</uui-box>

				<uui-box>
					<umb-member-workspace-view-member-info></umb-member-workspace-view-member-info>
				</uui-box>
			</div>
		`;
	}

	render() {
		if (!this._workspaceContext) {
			return html`<div>Not found</div>`;
		}

		return html` <umb-body-layout header-fit-height>
			<div id="main">${this.#renderLeftColumn()} ${this.#renderRightColumn()}</div>
		</umb-body-layout>`;
	}

	static styles = [
		UmbTextStyles,
		css`
			uui-input {
				width: 100%;
			}
			#main {
				display: flex;
				flex-wrap: wrap;
				gap: var(--uui-size-space-4);
			}
			#left-column {
				/* Is there a way to make the wrapped right column grow only when wrapped? */
				flex: 9999 1 500px;
			}
			#right-column {
				flex: 1 1 350px;
				display: flex;
				flex-direction: column;
				gap: var(--uui-size-space-4);
			}
			uui-box {
				height: fit-content;
			}
			umb-property-layout {
				padding-block: var(--uui-size-space-4);
			}
			umb-property-layout:first-child {
				padding-top: 0;
			}
			umb-property-layout:last-child {
				padding-bottom: 0;
			}
			.validation-error {
				margin-top: 0;
				color: var(--uui-color-danger);
			}

			.general-item {
				display: flex;
				flex-direction: column;
				gap: var(--uui-size-space-1);
			}
			.general-item:not(:last-child) {
				margin-bottom: var(--uui-size-space-6);
			}
			.general-item .headline {
				font-weight: bold;
			}
		`,
	];
}

export default UmbMemberWorkspaceViewMemberElement;

declare global {
	interface HTMLElementTagNameMap {
		'umb-member-workspace-view-member': UmbMemberWorkspaceViewMemberElement;
	}
}
