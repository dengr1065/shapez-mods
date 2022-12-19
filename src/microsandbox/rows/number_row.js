import { DialogWithForm } from "core/modal_dialog_elements";
import { FormElementInput } from "core/modal_dialog_forms";
import { makeButton } from "core/utils";
import { Row } from "./row";

export class NumberRow extends Row {
    create() {
        super.create();
        this.element.classList.add("number");

        if (this.options.valueEditing) {
            this.element.classList.add("editable");
            this.editValueButton = makeButton(this.element, ["edit"]);
            this.hud.trackClicks(this.editValueButton, () => this.edit());
        }

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

    get integerOnly() {
        // Number rows are integer-only by default
        return !("integerOnly" in this.options) || this.options.integerOnly;
    }

    clamp(value) {
        const { min, max } = this.options;

        if (min !== undefined && value < min) {
            return min;
        }

        if (max !== undefined && value > max) {
            return max;
        }

        return this.integerOnly ? Math.floor(value) : value;
    }

    isValid(value, cast = false) {
        if (cast) {
            value = parseFloat(value);
        }

        return this.clamp(value) === value;
    }

    adjust(value) {
        const current = this.getter();
        const newValue = this.clamp(current + value);

        if (current !== newValue) {
            this.setter(newValue);
        }
    }

    edit() {
        const dialogs = this.hud.root.hud.parts.dialogs;
        const valueInput = new FormElementInput({
            id: "valueInput",
            label: "",
            placeholder: "",
            defaultValue: this.getter().toString(),
            validator: (value) => this.isValid(value, true)
        });

        const dialog = new DialogWithForm({
            app: this.hud.root.app,
            title: `Edit ${this.label}`,
            desc: `Enter the new value for ${this.label}`,
            formElements: [valueInput],
            buttons: ["cancel:bad:escape", "ok:good:enter"],
            closeButton: false
        });

        dialog.buttonSignals.ok.add(() => {
            const newValue = parseFloat(valueInput.getValue());
            if (this.getter() !== newValue) {
                this.setter(newValue);
            }
        });

        // I don't think I'm supposed to use this, but vanilla does
        dialogs.internalShowDialog(dialog);
    }

    setColor(color) {
        const buttons = this.element.getElementsByTagName("button");
        for (const button of buttons) {
            button.style.backgroundColor = color;
        }
    }
}
