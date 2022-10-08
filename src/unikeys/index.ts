import { Mod } from "mods/mod";
import _metadata from "./mod.json";
import icon from "./icon.webp";
import { gMetaBuildingRegistry } from "core/global_registries";
import { MetaBuilding } from "game/meta_building";
import { copyBuildingTranslation, shouldCreateBinding } from "./util";
import { KEYMAPPINGS } from "game/key_action_mapper";

class UniKeys extends Mod {
    init() {
        this.signals.appBooted.add(this.registerKeys, this);
    }

    registerKeys() {
        const missingBuildings: MetaBuilding[] =
            gMetaBuildingRegistry.entries.filter(
                shouldCreateBinding.bind(null, this)
            );

        for (const building of missingBuildings) {
            const buildingId = building.getId();
            KEYMAPPINGS.buildings[buildingId] = {
                id: buildingId,
                keyCode: "Not Set"
            };

            copyBuildingTranslation(building);
        }
    }
}

const metadata = <ModExtrasMetadata>(<unknown>_metadata);

metadata.extra.icon = icon;
registerMod(UniKeys, metadata);
