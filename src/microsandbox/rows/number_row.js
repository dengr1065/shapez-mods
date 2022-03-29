import { makeButton } from "core/utils";
import { Row } from "./row";

export class NumberRow extends Row {
    create() {
        super.create();
        this.element.classList.add("number");

        this.minusButton = makeButton(this.element, ["minus"]);
        this.hud.trackClicks(this.minusButton, () => this.adjust(-1));

        this.plusButton = makeButton(this.element, ["plus"]);
        this.hud.trackClicks(this.plusButton, () => this.adjust(+1));

        if (this.options.additionalAdjustSize === undefined) {
            return;
        }

        const adjustSize = this.options.additionalAdjustSize;
        this.element.classList.add("additional");

        this.addMinusButton = makeButton(this.element, ["min"]);
        this.hud.trackClicks(this.addMinusButton, () =>
            this.adjust(-adjustSize)
        );

        this.addPlusButton = makeButton(this.element, ["max"]);
        this.hud.trackClicks(this.addPlusButton, () =>
            this.adjust(+adjustSize)
        );
    }

    adjust(value) {
        const { min, max } = this.options;
        const current = this.getter();
        const newValue = current + value;

        if (min !== undefined && newValue < min) {
            if (current !== min) {
                this.setter(min);
            }
            return;
        }

        if (max !== undefined && newValue > max) {
            if (current !== max) {
                this.setter(max);
            }
            return;
        }

        this.setter(newValue);
    }

    setColor(color) {
        const buttons = this.element.getElementsByTagName("button");
        for (const button of buttons) {
            button.style.backgroundColor = color;
        }
    }
}
