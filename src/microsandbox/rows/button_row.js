import { makeButton } from "core/utils";
import { Row } from "./row";

export class ButtonRow extends Row {
    create() {
        this.element.classList.add("button");
        this.button = makeButton(this.element);
        this.button.innerText = this.label;

        this.hud.trackClicks(this.button, () => {
            // Getter is used as a reference
            this.setter(this.getter());
        });
    }

    update() {
        // Do nothing
    }
}
