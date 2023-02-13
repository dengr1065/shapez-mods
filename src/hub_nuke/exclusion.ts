import { DialogWithForm } from "core/modal_dialog_elements";
import { FormElementInput } from "core/modal_dialog_forms";
import { Signal } from "core/signal";
import { HUDModalDialogs } from "game/hud/parts/modal_dialogs";
import { ShapeDefinition } from "game/shape_definition";

export function showAddExclusionDialog(
    dialogs: HUDModalDialogs
): TypedSignal<[string]> {
    const keyInput = new FormElementInput({
        id: "shapeKey",
        label: "",
        placeholder: "",
        defaultValue: "",
        validator: ShapeDefinition.isValidShortKey
    });

    const dialog = new DialogWithForm({
        app: dialogs.app,
        title: "Hub Nuke",
        desc: "Enter a shape key to exclude from nuking:",
        formElements: [keyInput],
        buttons: ["cancel:bad:escape", "ok:good:enter"],
        closeButton: false
    });

    const signal: TypedSignal<[string]> = new Signal();
    const okSignal: Signal = dialog.buttonSignals["ok"];
    okSignal.add(() => {
        const key: string = keyInput.getValue();
        signal.dispatch(key);
    });

    dialogs.internalShowDialog(dialog);
    return signal;
}
