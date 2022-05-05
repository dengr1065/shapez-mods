import { HUDPinnedShapes } from "game/hud/parts/pinned_shapes";
import { Mod } from "mods/mod";
import metadata from "./mod.json";
import styles from "./fixes.less";
import {
    deserialize,
    isShapePinned,
    pinNewShape,
    postRerenderFull,
    serialize,
    unpinShape
} from "./logic";
import { HUDGameMenu } from "game/hud/parts/game_menu";
import { makeDivElement } from "core/utils";
import { DialogWithForm } from "core/modal_dialog_elements";
import {
    FormElementCheckbox,
    FormElementInput,
    FormElementItemChooser
} from "core/modal_dialog_forms";
import { enumSubShape, ShapeDefinition } from "game/shape_definition";
import { enumColors } from "game/colors";
import { createLogger } from "core/logging";

/**
 * This allows other mods to register predefined shape handlers,
 * allowing them to add custom shape definitions into the list.
 */
const predefinedShapeHandlers = [];
const logger = createLogger("CustomPins");

/**
 * Launches a shape chooser form to select a shape to pin.
 * @this {HUDGameMenu}
 */
function pinNewCustomShape() {
    const shapeChooser = new FormElementItemChooser({
        id: "customShapeChooser",
        items: getDefaultItems(this.root)
    });

    const keyInput = new FormElementInput({
        id: "customShapeKey",
        label: "Or enter short key of the shape you want to pin:",
        placeholder: "",
        validator: ShapeDefinition.isValidShortKey
    });

    const useThroughput = new FormElementCheckbox({
        id: "customShapeUseThroughput",
        label: "Display delivery rate/throughput",
        defaultValue: false
    });

    const dialog = new DialogWithForm({
        app: this.root.app,
        title: "Pin a custom shape",
        desc: "Choose one of the suggested shapes:",
        formElements: [shapeChooser, keyInput, useThroughput],
        buttons: ["cancel:bad:escape", "ok:good:enter"],
        closeButton: false
    });

    const closeHandler = (shape) => {
        const throughput = useThroughput.getValue();

        this.root.hud.signals.shapePinRequested.dispatch(
            shape, // definition to pin
            true, // pin as a custom shape
            throughput // display throughput
        );
    };

    dialog.valueChosen.add(() => {
        dialog.closeRequested.dispatch();

        /** @type {import("game/items/shape_item").ShapeItem} */
        const item = shapeChooser.chosenItem;
        closeHandler(item.definition);
    });

    dialog.buttonSignals.ok.add(() => {
        const key = keyInput.getValue();

        const definitionMgr = this.root.shapeDefinitionMgr;
        closeHandler(definitionMgr.getShapeFromShortKey(key));
    });

    this.root.hud.parts.dialogs.internalShowDialog(dialog);
}

function postCreatePinnedShapesElements() {
    // As early as possible
    this.customPinnedShapes = [];
}

/**
 * @this {HUDGameMenu}
 */
function postCreateMenuElements() {
    const button = makeDivElement(null, ["button", "pin"]);
    this.trackClicks(button, pinNewCustomShape);

    // Insert our pin button before the save button
    this.element.insertBefore(button, this.saveButton);
}

/**
 * @param {import("game/root").GameRoot} root
 */
function getDefaultItems(root) {
    const shapes = [];

    // Integrations
    for (const handler of predefinedShapeHandlers) {
        try {
            // Root may be used to retreive contextual results
            shapes.unshift(...handler(root));
        } catch (err) {
            logger.error("Failed to run one of the predefined shape handlers!");
        }
    }

    // All base shapes
    for (const subShape of Object.values(enumSubShape)) {
        const quad = { subShape, color: enumColors.uncolored };
        const layer = [quad, quad, quad, quad];

        shapes.push(new ShapeDefinition({ layers: [layer] }));
    }

    return shapes.map((shape) =>
        root.shapeDefinitionMgr.getShapeItemFromDefinition(shape)
    );
}

class CustomPins extends Mod {
    init() {
        logger.log("Init phase!");
        this.modInterface.registerCss(styles);

        // HUD Stuff
        this.modInterface.runAfterMethod(
            HUDPinnedShapes,
            "createElements",
            postCreatePinnedShapesElements
        );

        this.modInterface.runAfterMethod(
            HUDGameMenu,
            "createElements",
            postCreateMenuElements
        );

        // (De-)serializing
        this.modInterface.replaceMethod(
            HUDPinnedShapes,
            "serialize",
            serialize
        );

        this.modInterface.replaceMethod(
            HUDPinnedShapes,
            "deserialize",
            deserialize
        );

        // Runtime
        this.modInterface.replaceMethod(
            HUDPinnedShapes,
            "isShapePinned",
            isShapePinned
        );

        this.modInterface.runAfterMethod(
            HUDPinnedShapes,
            "rerenderFull",
            postRerenderFull
        );

        // Pin/unpin (dirty)
        this.modInterface.replaceMethod(
            HUDPinnedShapes,
            "pinNewShape",
            pinNewShape
        );

        this.modInterface.replaceMethod(
            HUDPinnedShapes,
            "unpinShape",
            unpinShape
        );

        logger.log("Patched HUDPinnedShapes and HUDGameMenu.");
    }

    addProvider(handler) {
        logger.log("Registered a predefined shape handler.");
        predefinedShapeHandlers.push(handler);
    }
}

registerMod(CustomPins, metadata);
