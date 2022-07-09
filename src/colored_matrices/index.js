import { gMetaBuildingRegistry } from "core/global_registries";
import { Mod } from "mods/mod";
import { ColoredMatricesConfigState } from "./config";
import configStyles from "./config.less";
import { generateModIcon } from "./icon";
import metadata from "./mod.json";
import { patchModInterface } from "./mod_interface_patch";

/**
 * Patched implementation of getSilhouetteColor.
 * @param {ColoredMatrices} mod
 * @param {string} buildingId
 * @this {import("game/meta_building").MetaBuilding}
 */
function methodPatch(
    mod,
    buildingId,
    superMethod,
    [variant, rotationVariant, ...args]
) {
    if (mod.settings.enabled) {
        const variants = mod.settings.colors[buildingId];
        const color = ((variants ?? {})[variant] ?? {})[rotationVariant];

        if (color) {
            return color;
        }
    }

    return superMethod(variant, rotationVariant, ...args);
}

class ColoredMatrices extends Mod {
    init() {
        this.modInterface.registerCss(configStyles);

        // Wait until booted, then patch each building
        this.signals.appBooted.add(this.patchBuildings, this);
        this.signals.appBooted.add(this.registerState, this);

        /** @type {import("core/singleton_factory").SingletonFactory} */
        this.registry = gMetaBuildingRegistry;

        this.modInterface.registerTranslations("en", {
            buildings: {
                hub: {
                    default: {
                        name: "HUB"
                    }
                }
            }
        });
    }

    patchBuildings() {
        const thisRef = this;

        // Update colors before patching to avoid useless wrapping
        this.updateColors();

        for (const buildingId in this.registry.idToEntry) {
            /** @type {import("game/meta_building").MetaBuilding} */
            const building = this.registry.idToEntry[buildingId];
            const metaClass = building.constructor;

            // Is this dirty? Yes, but it's a good way to avoid globals
            this.modInterface.replaceMethod(
                metaClass,
                "getSilhouetteColor",
                function (...args) {
                    return methodPatch.call(this, thisRef, buildingId, ...args);
                }
            );
        }
    }

    registerState() {
        this.modInterface.registerGameState(ColoredMatricesConfigState);
    }

    /**
     * Makes sure colors for all variant combinations are present.
     */
    updateColors() {
        for (const buildingId in this.registry.idToEntry) {
            this.settings.colors[buildingId] ??= {};
            const buildingColors = this.settings.colors[buildingId];

            /** @type {import("game/meta_building").MetaBuilding} */
            const building = this.registry.idToEntry[buildingId];
            const metaClass = building.constructor;

            const combinations = metaClass.getAllVariantCombinations();
            for (const { variant, rotationVariant } of combinations) {
                const defaultColor = building.getSilhouetteColor(
                    variant,
                    rotationVariant
                );

                buildingColors[variant] ??= [];
                buildingColors[variant][rotationVariant ?? 0] ??= defaultColor;
            }
        }
    }
}

metadata.extra.icon = generateModIcon();

patchModInterface();
registerMod(ColoredMatrices, metadata);
