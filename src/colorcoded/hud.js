import { ClickDetector } from "core/click_detector";
import { makeDiv } from "core/utils";
import { enumColorToShortcode } from "game/colors";
import { BaseHUDPart } from "game/hud/base_hud_part";
import { DynamicDomAttach } from "game/hud/dynamic_dom_attach";
import { COLOR_ITEM_SINGLETONS } from "game/items/color_item";

export const SIGNAL_NAME = "dengr1065:colorcoded:buildingsPainted";

export class HUDColorSelector extends BaseHUDPart {
    createElements(parent) {
        this.element = makeDiv(parent, "ingame_HUD_ColorSelector");
        let colorCount = 0;

        for (const item of Object.values(COLOR_ITEM_SINGLETONS)) {
            const canvas = document.createElement("canvas");
            canvas.width = 64;
            canvas.height = 64;
            const context = canvas.getContext("2d");
            item.drawFullSizeOnCanvas(context, 64);
            this.element.appendChild(canvas);

            const detector = new ClickDetector(canvas, {});
            detector.click.add(this.repaintSelection.bind(this, item));
            colorCount++;
        }

        const columns = Math.ceil(colorCount / 10);
        this.element.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    }

    initialize() {
        this.domAttach = new DynamicDomAttach(this.root, this.element, {
            attachClass: "visible",
            timeToKeepSeconds: 0.3
        });
    }

    repaintSelection(item) {
        /** @type {import("game/hud/parts/mass_selector").HUDMassSelector} */
        const selector = this.root.hud.parts.massSelector;
        const target = enumColorToShortcode[item.color];

        const entities = [...selector.selectedUids]
            .map((uid) => this.root.entityMgr.findByUid(uid))
            .filter((entity) => entity.components.ColorCoded)
            .filter((entity) => entity.components.ColorCoded.color != target);

        for (const entity of entities) {
            entity.components.ColorCoded.color = target;
        }

        this.root.signals[SIGNAL_NAME].dispatch(entities);
    }

    update() {
        const selector = this.root.hud.parts.massSelector;
        this.domAttach.update(selector.selectedUids.size > 0);
    }
}
