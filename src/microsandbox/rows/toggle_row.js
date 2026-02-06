import { makeButton } from "core/utils";
import { Row } from "./row";

export class ToggleRow extends Row {
    create() {
        this.element.classList.add("toggle");

        this.button = makeButton(this.element);
        this.update(this.getter());

        this.hud.trackClicks(this.button, () => {
            const newValue = !this.getter();

            this.setter(newValue);
            this.update(newValue);
        });
    }

    update(value) {
        this.button.innerText = this.label + (value ? ": ON" : ": OFF");
        this.button.classList.toggle("active", value);
    }
}
