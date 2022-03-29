import { Row } from "./row";

export class LabelRow extends Row {
    create() {
        super.create();
        this.element.classList.add("label");
    }

    update(value) {
        this.labelElement.innerText = value;
    }
}
