import { gMetaBuildingRegistry } from "core/global_registries";
import { SingletonFactory } from "core/singleton_factory";
import { Vector } from "core/vector";
import { MetaBuilding } from "game/meta_building";
import { Mod } from "mods/mod";
import { requireModExtras } from "../../lib/me_stub";
import _metadata from "./mod.json";
import buildingData from "./building.json";
import sprite from "./planter.png";
import blueprintSprite from "./planter_blueprint.png";
import readme from "./README.md";

class WiseMysticalTree extends Mod {
    init() {
        if (!requireModExtras(this)) {
            return;
        }

        this.signals.appBooted.add(this.addPlanter, this);
    }

    addPlanter() {
        const registry: SingletonFactory = gMetaBuildingRegistry;
        const planterClass = registry.findById("planter").constructor;

        // This kinda sucks
        const tutorialImage = (<typeof MetaBuilding>(
            planterClass
        )).getAllVariantCombinations()[0]["tutorialImageBase64"];

        this.modInterface.addVariantToExistingBuilding(
            <new () => MetaBuilding>planterClass,
            _metadata.id,
            {
                ...buildingData,
                isUnlocked: () => [true],
                dimensions: new Vector(1, 1),
                regularSpriteBase64: sprite,
                blueprintSpriteBase64: blueprintSprite,
                tutorialImageBase64: tutorialImage
            }
        );
    }
}

const metadata = <ModExtrasMetadata>(<unknown>_metadata);
metadata.extra.icon = sprite;
metadata.extra.readme = readme;

registerMod(WiseMysticalTree, metadata);
