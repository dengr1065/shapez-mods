import { enumDirectionToAngle } from "core/vector";
import { MetaTrashBuilding } from "game/buildings/trash";
import { defaultBuildingVariant } from "game/meta_building";
import { Mod } from "mods/mod";
import metadata from "./mod.json";

class TrashFixer extends Mod {
    init() {
        this.signals.gameInitialized.add(this.onGameReady, this);
    }

    /**
     * We have root, and can hook up entity signals
     * @param {import("game/root").GameRoot} root
     */
    onGameReady(root) {
        root.signals.entityAdded.add(this.onEntityReady, this);
        root.signals.entityGotNewComponent.add(this.onEntityReady, this);
    }

    /**
     * Now just fix the rotation if we see a trash
     * @param {import("game/entity").Entity} entity
     */
    onEntityReady(entity) {
        if (!("StaticMapEntity" in entity.components)) {
            return;
        }

        const component = entity.components.StaticMapEntity;
        if (
            component.getMetaBuilding() instanceof MetaTrashBuilding &&
            component.getVariant() == defaultBuildingVariant &&
            component.rotation !== enumDirectionToAngle.top
        ) {
            component.rotation = enumDirectionToAngle.top;
        }
    }
}

registerMod(TrashFixer, metadata);
