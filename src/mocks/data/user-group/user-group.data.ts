import type { UserGroupItemResponseModel, UserGroupResponseModel } from '@umbraco-cms/backoffice/external/backend-api';

export type UmbMockUserGroupModel = UserGroupResponseModel & UserGroupItemResponseModel;

export const data: Array<UmbMockUserGroupModel> = [
	{
		id: 'user-group-administrators-id',
		name: 'Administrators',
		icon: 'icon-medal',
		documentStartNode: { id: 'all-property-editors-document-id' },
		fallbackPermissions: [
			'Umb.Document.Read',
			'Umb.Document.Create',
			'Umb.Document.Update',
			'Umb.Document.Delete',
			'Umb.Document.CreateBlueprint',
			'Umb.Document.Notifications',
			'Umb.Document.Publish',
			'Umb.Document.Permissions',
			'Umb.Document.Unpublish',
			'Umb.Document.Duplicate',
			'Umb.Document.Move',
			'Umb.Document.Sort',
			'Umb.Document.CultureAndHostnames',
			'Umb.Document.PublicAccess',
			'Umb.Document.Rollback',
		],
		permissions: [
			{
				$type: 'DocumentPermissionPresentationModel',
				verbs: ['Umb.Document.Rollback'],
				document: { id: 'simple-document-id' },
			},
		],
		sections: [],
		languages: [],
		hasAccessToAllLanguages: true,
		documentRootAccess: true,
		mediaRootAccess: true,
		isSystemGroup: true,
	},
	{
		id: 'user-group-editors-id',
		name: 'Editors',
		icon: 'icon-tools',
		documentStartNode: { id: 'all-property-editors-document-id' },
		fallbackPermissions: [
			'Umb.Document.Read',
			'Umb.Document.Create',
			'Umb.Document.Update',
			'Umb.Document.Delete',
			'Umb.Document.CreateBlueprint',
			'Umb.Document.Notifications',
			'Umb.Document.Publish',
			'Umb.Document.Unpublish',
			'Umb.Document.Duplicate',
			'Umb.Document.Move',
			'Umb.Document.Sort',
			'Umb.Document.PublicAccess',
			'Umb.Document.Rollback',
		],
		permissions: [],
		sections: [],
		languages: [],
		hasAccessToAllLanguages: true,
		documentRootAccess: true,
		mediaRootAccess: true,
		isSystemGroup: true,
	},
	{
		id: 'user-group-sensitive-data-id',
		name: 'Sensitive data',
		icon: 'icon-lock',
		documentStartNode: { id: 'all-property-editors-document-id' },
		fallbackPermissions: [],
		permissions: [],
		sections: [],
		languages: [],
		hasAccessToAllLanguages: true,
		documentRootAccess: true,
		mediaRootAccess: true,
		isSystemGroup: true,
	},
	{
		id: 'user-group-translators-id',
		name: 'Translators',
		icon: 'icon-globe',
		documentStartNode: { id: 'all-property-editors-document-id' },
		fallbackPermissions: ['Umb.Document.Read', 'Umb.Document.Update'],
		permissions: [],
		sections: [],
		languages: [],
		hasAccessToAllLanguages: true,
		documentRootAccess: true,
		mediaRootAccess: true,
		isSystemGroup: true,
	},
	{
		id: 'user-group-writers-id',
		name: 'Writers',
		icon: 'icon-edit',
		documentStartNode: { id: 'all-property-editors-document-id' },
		fallbackPermissions: [
			'Umb.Document.Read',
			'Umb.Document.Create',
			'Umb.Document.Update',
			'Umb.Document.Notifications',
		],
		permissions: [],
		sections: [],
		languages: [],
		hasAccessToAllLanguages: true,
		documentRootAccess: true,
		mediaRootAccess: true,
		isSystemGroup: false,
	},
];
