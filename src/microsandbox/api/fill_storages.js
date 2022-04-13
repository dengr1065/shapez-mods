import { lerp } from "core/utils";
import {
    BOOL_FALSE_SINGLETON,
    BOOL_TRUE_SINGLETON
} from "game/items/boolean_item";
import { StorageSystem } from "game/systems/storage";
import { ToggleRow } from "../rows/toggle_row";

/** @this {StorageSystem} */
function updateHook(superMethod) {
    /** @type {import("../hud").HUDMicroSandbox} */
    const hud = this.root.hud.parts.microSandbox;

    for (const entity of this.allEntities) {
        const { Storage, ItemEjector, WiredPins } = entity.components;
        if (Storage.isPackager) {
            const oldEntities = this.allEntities;
            this.allEntities = [entity];
            superMethod();
            this.allEntities = oldEntities;
            continue;
        }

        eject: if (Storage.storedItem && Storage.storedCount > 0) {
            const nextSlot = ItemEjector.getFirstFreeSlot();
            if (nextSlot === null) {
                break eject;
            }

            if (ItemEjector.tryEject(nextSlot, Storage.storedItem)) {
                if (!hud.infiniteStorages) {
                    Storage.storedCount--;
                }

                if (Storage.storedCount === 0) {
                    Storage.storedItem = null;
                }
            }
        }

        let targetAlpha = Storage.storedCount > 0 ? 1 : 0;
        if (hud.infiniteStorages) {
            targetAlpha = 1;
        }

        Storage.overlayOpacity = lerp(
            Storage.overlayOpacity,
            targetAlpha,
            0.05
        );

        if (!WiredPins) {
            continue;
        }

        WiredPins.slots[0].value = Storage.storedItem;
        WiredPins.slots[1].value = Storage.getIsFull()
            ? BOOL_TRUE_SINGLETON
            : BOOL_FALSE_SINGLETON;
    }
}

export function getFillStoragesRows(hud) {
    hud.infiniteStorages = false;
    return [
        new ToggleRow(hud, {
            label: "Infinite Storages",
            getter: () => hud.infiniteStorages,
            setter: (value) => (hud.infiniteStorages = value)
        })
    ];
}

/**
 * @param {import("mods/mod").Mod} mod
 */
export function setupFillStoragesHooks(mod) {
    mod.modInterface.replaceMethod(StorageSystem, "update", updateHook);
}
