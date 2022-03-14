import { makeButtonElement } from "core/utils";
import { MOD_ID } from "../constants";

const clsToggle = (MOD_ID + ":toggle").replaceAll(":", "_");
const clsToggleOn = (MOD_ID + ":on").replaceAll(":", "_");

function onOffLabel(label, value) {
    return label + ": " + (value ? "ON" : "OFF");
}

export function makeToggleButton(parent, label, defaultValue) {
    const toggle = {
        element: makeButtonElement([clsToggle], ""),
        value: defaultValue,
        handler: () => {
            toggle.value = !toggle.value;
            toggle.element.classList.toggle(clsToggleOn, toggle.value);
            toggle.element.innerText = onOffLabel(label, toggle.value);
        }
    };

    toggle.element.classList.toggle(clsToggleOn, defaultValue);
    toggle.element.innerText = onOffLabel(label, defaultValue);

    if (parent) {
        parent.appendChild(toggle.element);
    }
    return toggle;
}
