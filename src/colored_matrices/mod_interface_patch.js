import { ModInterface } from "mods/mod_interface";

/**
 * @param {typeof import("game/meta_building").MetaBuilding} metaClass
 * @param {string} variant
 * @param {object} payload
 * @param {number[]=} payload.rotationVariants
 * @param {string=} payload.tutorialImageBase64
 * @param {string=} payload.regularSpriteBase64
 * @param {string=} payload.blueprintSpriteBase64
 * @param {string=} payload.name
 * @param {string=} payload.description
 * @param {Vector=} payload.dimensions
 * @param {(import("game/root").GameRoot) => [string, string][]=} payload.additionalStatistics
 * @param {(import("game/root").GameRoot) => boolean[]=} payload.isUnlocked
 * @this {import("mods/mod_interface").ModInterface}
 */
function patch(metaClass, variant, payload) {
    payload.rotationVariants ??= [0];

    if (payload.tutorialImageBase64) {
        this.setBuildingTutorialImage(
            metaClass,
            variant,
            payload.tutorialImageBase64
        );
    }

    if (payload.regularSpriteBase64) {
        this.registerBuildingSprites(metaClass, variant, {
            regularBase64: payload.regularSpriteBase64
        });
    }

    if (payload.blueprintSpriteBase64) {
        this.registerBuildingSprites(metaClass, variant, {
            blueprintBase64: payload.blueprintSpriteBase64
        });
    }

    if (payload.name && payload.description) {
        this.registerBuildingTranslation(metaClass, variant, {
            name: payload.name,
            description: payload.description
        });
    }

    const internalId = new metaClass().getId() + "-" + variant;

    // Extend static methods
    this.extendObject(metaClass, ({ $old }) => ({
        getAllVariantCombinations() {
            return [
                ...$old.getAllVariantCombinations.call(this),
                ...payload.rotationVariants.map((rotationVariant) => ({
                    internalId,
                    variant,
                    rotationVariant
                }))
            ];
        }
    }));

    // Dimensions
    const $variant = variant;
    if (payload.dimensions) {
        this.extendClass(metaClass, ({ $old }) => ({
            getDimensions(variant) {
                if (variant === $variant) {
                    return payload.dimensions;
                }
                return $old.getDimensions.apply(this, arguments);
            }
        }));
    }

    if (payload.additionalStatistics) {
        this.extendClass(metaClass, ({ $old }) => ({
            getAdditionalStatistics(root, variant) {
                if (variant === $variant) {
                    return payload.additionalStatistics(root);
                }
                return $old.getAdditionalStatistics.call(this, root, variant);
            }
        }));
    }

    if (payload.isUnlocked) {
        this.extendClass(metaClass, ({ $old }) => ({
            getAvailableVariants(root) {
                if (payload.isUnlocked(root)) {
                    return [
                        ...$old.getAvailableVariants.call(this, root),
                        $variant
                    ];
                }
                return $old.getAvailableVariants.call(this, root);
            }
        }));
    }

    // Register our variant finally, with rotation variants
    payload.rotationVariants.forEach((rotationVariant) =>
        shapez.registerBuildingVariant(
            rotationVariant ? internalId + "-" + rotationVariant : internalId,
            metaClass,
            variant,
            rotationVariant
        )
    );
}

/**
 * Because the addVariantToExistingBuilding doesn't work and
 * Colored Matrices relies on this method, we need to patch it.
 */
export function patchModInterface() {
    ModInterface.prototype.addVariantToExistingBuilding = patch;
}
