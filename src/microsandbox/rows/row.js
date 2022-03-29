import { TrackedState } from "core/tracked_state";
import { makeDiv } from "core/utils";

/** @template T */
export class Row {
    /**
     * @param {import("../hud").HUDMicroSandbox} hud
     */
    constructor(hud, { label, getter, setter, ...options }) {
        this.hud = hud;

        /** @type {HTMLDivElement} */
        this.element = makeDiv(hud.element, undefined, ["row"]);

        /** @type {string} */
        this.label = label;

        /** @type {() => T} */
        this.getter = getter;

        /** @type {(T) => void} */
        this.setter = setter;

        /** @type {TrackedState} */
        this.value = new TrackedState(this.update, this);

        this.options = options;

        this.create();
    }

    create() {
        this.labelElement = document.createElement("span");
        this.labelElement.classList.add("label");
        this.update(this.getter());

        this.element.appendChild(this.labelElement);
    }

    update(value) {
        this.labelElement.innerText = `${this.label}: ${value}`;
    }
}
