import { integrations } from "../api";
import { Row } from "./row";

export class ToggleRow extends Row {
    create() {
        this.element.classList.add("toggle");
        this.button = integrations.modExtras.api.makeToggleButton(
            this.element,
            this.label,
            this.getter()
        );

        this.hud.trackClicks(this.button.element, () => {
            // Note: at this point, internal value is the same,
            // so we invert it
            this.setter(!this.button.value);
        });
    }

    update(value) {
        // Small hack to make button represent the actual value
        this.button.value = !value;
        this.button.handler();
    }
}
