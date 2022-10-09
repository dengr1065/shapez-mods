import { makeDiv } from "core/utils";
import { HUDKeybindingOverlay } from "game/hud/parts/keybinding_overlay";
import { getStringForKeyCode, KEYMAPPINGS } from "game/key_action_mapper";
import { ModInterface } from "mods/mod_interface";
import { T } from "translations";

type KeybindingDisplayCondition = (hud: HUDKeybindingOverlay) => boolean;
type KeybindingMapping = {
    keyCode: number;
    modifiers: {
        shift: boolean;
        alt: boolean;
        ctrl: boolean;
    };
};

function formatKeybinding(mapping: KeybindingMapping) {
    let modifiers = "";

    if (mapping.modifiers?.shift) {
        modifiers += "⇪ ";
    }
    if (mapping.modifiers?.alt) {
        modifiers += T.global.keys.alt + " ";
    }
    if (mapping.modifiers?.ctrl) {
        modifiers += T.global.keys.control + " ";
    }

    return modifiers + getStringForKeyCode(mapping.keyCode);
}

function addKeybinding(
    this: HUDKeybindingOverlay,
    keybindingId: string,
    condition: KeybindingDisplayCondition
) {
    const label = T.keybindings.mappings[keybindingId];
    const mapping: KeybindingMapping = KEYMAPPINGS.mods[keybindingId];

    const element = makeDiv(this.element, null, ["binding"]);

    const codeElement = document.createElement("code");
    codeElement.classList.add("keybinding");
    codeElement.innerText = formatKeybinding(mapping);
    element.appendChild(codeElement);

    const labelElement = document.createElement("label");
    labelElement.innerText = label;
    element.appendChild(labelElement);

    // Label/keys is mostly for compatibility
    this.keybindings.push({
        label,
        keys: [mapping.keyCode],
        condition: () => condition.call(this, this),
        cachedElement: element,
        cachedVisibility: false
    });
}

export function registerKeybindingForOverlay(
    modInterface: ModInterface,
    { id, condition }: { id: string; condition: KeybindingDisplayCondition }
) {
    modInterface.runAfterMethod(
        HUDKeybindingOverlay,
        "createElements",
        function () {
            addKeybinding.call(this, id, condition);
        }
    );
}
