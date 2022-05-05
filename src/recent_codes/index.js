import { DialogWithForm } from "core/modal_dialog_elements";
import { FormElementItemChooser } from "core/modal_dialog_forms";
import { HUDModalDialogs } from "game/hud/parts/modal_dialogs";
import { ShapeItem } from "game/items/shape_item";
import { typeItemSingleton } from "game/item_resolver";
import { Mod } from "mods/mod";
import { MODS } from "mods/modloader";
import {
    deserializeSchema,
    serializeSchema,
    types
} from "savegame/serialization";
import info from "./mod.json";

const constantSignalItemPicker = "signalItem";
const constantSignalInput = "signalValue";
const settingsSchema = {
    recents: types.array(typeItemSingleton)
};

// puzzle dlc code prevents parsing of true/false
// unless the entity has WiredPins component, but
// we can't access the entity without hacky stuff
// ...so we don't, but this breaks mods that
// modify constant signal components or schema
const fakeEntity = {
    components: {
        WiredPins: true
    }
};

/** @returns {RecentCodes} */
function getMod() {
    return MODS.mods.find((mod) => mod.metadata.id === info.id);
}

/** @this {FormElementItemChooser} */
function preBindEvents() {
    if (this.id !== constantSignalItemPicker) {
        // Not a constant signal
        return;
    }

    const mod = getMod();

    // Remove duplicates of matching items and add our own
    this.items = this.items.filter(
        (item) => !mod.recents.some((i) => item.equals(i))
    );
    this.items.unshift(...mod.recents);
}

/**
 * @this {HUDModalDialogs}
 * @param {import("core/modal_dialog_elements").Dialog} dialog
 */
function postInternalShowDialog(dialog) {
    if (!(dialog instanceof DialogWithForm)) {
        return;
    }

    const isPicker = (element) => element.id == constantSignalItemPicker;
    if (!dialog.formElements.some(isPicker)) {
        return;
    }

    /**
     *
     * @param {string|import("game/base_item").BaseItem} item
     */
    const handler = (item) => {
        // Once an item is chosen, write it to our recents
        if (typeof item === "string") {
            /** @type {import("game/hud/parts/constant_signal_edit").HUDConstantSignalEdit} */
            const part = this.root.hud.parts.constantSignalEdit;
            item = part.parseSignalCode(fakeEntity, item);

            if (item == null) {
                // code is invalid, skip saving it
                return;
            }
        }

        getMod().updateRecents(item);
    };

    // Set handler for dialog completion
    dialog.buttonSignals.ok?.add(() => {
        const element = dialog.formElements.find(
            (e) => e.id == constantSignalInput
        );
        handler(element.getValue());
    });
    dialog.valueChosen.add(handler);
}

function customPinsProvider() {
    // We store items, but Custom Pins only takes definitions
    // also, it is useful to filter out garbage

    /** @type {import("game/base_item").BaseItem[]} */
    const allItems = getMod().recents;
    const shapeItems = allItems.filter((item) => item instanceof ShapeItem);

    return shapeItems.map((item) => item.definition);
}

class RecentCodes extends Mod {
    init() {
        this.modInterface.runBeforeMethod(
            FormElementItemChooser,
            "bindEvents",
            preBindEvents
        );

        this.modInterface.runAfterMethod(
            HUDModalDialogs,
            "internalShowDialog",
            postInternalShowDialog
        );

        this.signals.appBooted.add(this.initCustomPins, this);
        this.signals.gameInitialized.add(this.getRecents, this);
    }

    initCustomPins() {
        // Custom Pins integration
        try {
            this.modInterface
                .require("dengr1065:custom_pins", "^1.0.0")
                .addProvider(customPinsProvider);
        } catch (err) {
            // Ignore missing ME or Custom Pins
            console.log(err);
        }
    }

    getRecents(root) {
        deserializeSchema(this, settingsSchema, this.settings, null, root);
    }

    /**
     * @param {import("game/base_item").BaseItem} item
     */
    updateRecents(item) {
        const clean = this.recents.filter((i) => !i.equals(item));
        clean.unshift(item);

        this.recents = clean.slice(0, 15);
        this.settings = serializeSchema(
            {
                recents: this.recents
            },
            settingsSchema
        );
        this.saveSettings();
    }
}

// eslint-disable-next-line no-undef
registerMod(RecentCodes, info);
