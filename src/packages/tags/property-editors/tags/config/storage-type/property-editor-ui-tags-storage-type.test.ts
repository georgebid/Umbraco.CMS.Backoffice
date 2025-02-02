import { expect, fixture, html } from '@open-wc/testing';
import { UmbPropertyEditorUITagsStorageTypeElement } from './property-editor-ui-tags-storage-type.element.js';
import { type UmbTestRunnerWindow, defaultA11yConfig } from '@umbraco-cms/internal/test-utils';

describe('UmbPropertyEditorUITagsStorageTypeElement', () => {
	let element: UmbPropertyEditorUITagsStorageTypeElement;

	beforeEach(async () => {
		element = await fixture(html`
			<umb-property-editor-ui-tags-storage-type></umb-property-editor-ui-tags-storage-type>
		`);
	});

	it('is defined with its own instance', () => {
		expect(element).to.be.instanceOf(UmbPropertyEditorUITagsStorageTypeElement);
	});

	if ((window as UmbTestRunnerWindow).__UMBRACO_TEST_RUN_A11Y_TEST) {
		it('passes the a11y audit', async () => {
			await expect(element).shadowDom.to.be.accessible(defaultA11yConfig);
		});
	}
});
