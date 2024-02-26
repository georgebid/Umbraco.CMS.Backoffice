export type UmbObjectWithVariantProperties = {
	culture: string | null;
	segment: string | null;
};

export function variantPropertiesObjectToString(variant: UmbObjectWithVariantProperties): string {
	// Currently a direct copy of the toString method of variantId.
	return (variant.culture || UMB_INVARIANT_CULTURE) + (variant.segment ? `_${variant.segment}` : '');
}

export const UMB_INVARIANT_CULTURE = 'invariant';

export class UmbVariantId {
	public static Create(variantData: UmbObjectWithVariantProperties): UmbVariantId {
		return Object.freeze(new UmbVariantId(variantData.culture, variantData.segment));
	}

	public static CreateInvariant(): UmbVariantId {
		return Object.freeze(new UmbVariantId(null, null));
	}

	public static FromString(str: string): UmbVariantId {
		const split = str.split('_');
		const culture = split[0] === UMB_INVARIANT_CULTURE ? null : split[0];
		const segment = split[1] ?? null;
		return Object.freeze(new UmbVariantId(segment, culture));
	}

	public readonly culture: string | null = null;
	public readonly segment: string | null = null;
	public readonly schedule: { publishTime?: string | null; unpublishTime?: string | null } | null = null;

	constructor(culture: string | null, segment: string | null) {
		this.culture = (culture === UMB_INVARIANT_CULTURE ? null : culture?.toLowerCase()) ?? null;
		this.segment = segment ?? null;
	}

	public compare(obj: UmbObjectWithVariantProperties): boolean {
		return this.equal(new UmbVariantId(obj.culture, obj.segment));
	}

	public equal(variantId: UmbVariantId): boolean {
		return this.culture === variantId.culture && this.segment === variantId.segment;
	}

	public toString(): string {
		// Currently a direct copy of the VariantPropertiesObjectToString method const.
		return (this.culture || UMB_INVARIANT_CULTURE) + (this.segment ? `_${this.segment}` : '');
	}

	public toCultureString(): string {
		return this.culture || UMB_INVARIANT_CULTURE;
	}

	public toSegmentString(): string {
		return this.segment || '';
	}

	public isCultureInvariant(): boolean {
		return this.culture === null;
	}

	public isSegmentInvariant(): boolean {
		return this.segment === null;
	}

	public isInvariant(): boolean {
		return this.culture === null && this.segment === null;
	}

	public toObject(): UmbObjectWithVariantProperties {
		return { culture: this.culture, segment: this.segment };
	}

	// TODO: needs localization option:
	// TODO: Consider if this should be handled else where, it does not seem like the responsibility of this class, since it contains wordings:
	public toDifferencesString(variantId: UmbVariantId): string {
		let r = '';

		if (variantId.culture !== this.culture) {
			r = 'Invariant';
		}

		if (variantId.segment !== this.segment) {
			r = (r !== '' ? ' ' : '') + 'Unsegmented';
		}

		return r;
	}
}
