import { Rectangle } from "core/rectangle";
import { formatBigNumberFull, makeDiv } from "core/utils";
import { Blueprint } from "game/blueprint";
import { BaseHUDPart } from "game/hud/base_hud_part";
import { DynamicDomAttach } from "game/hud/dynamic_dom_attach";
import { ArrayTrackedState } from "./array_tracked_state";

/**
 * @param {HTMLDivElement} parent
 * @param {string} name
 */
function makeField(parent, name) {
    const label = makeDiv(parent, undefined, ["label"]);
    label.innerText = name;

    const value = makeDiv(parent);
    return value;
}

export class HUDAreaInfo extends BaseHUDPart {
    createElements(parent) {
        this.element = makeDiv(parent, "ingame_HUD_AreaInfo", []);

        this.buildingsCount = makeField(this.element, "Buildings");
        this.blueprintCost = makeField(this.element, "Cost");
        this.selectionArea = makeField(this.element, "Area");
    }

    initialize() {
        this.selectedBuildings = new ArrayTrackedState(
            this.onBuildingsSelected,
            this
        );
        this.domAttach = new DynamicDomAttach(this.root, this.element);
    }

    /**
     * @param {number[]} uids
     */
    onBuildingsSelected(uids) {
        if (uids.length == 0) {
            return;
        }

        this.buildingsCount.innerText = uids.length;

        const blueprint = Blueprint.fromUids(this.root, uids);
        this.blueprintCost.innerText = formatBigNumberFull(blueprint.getCost());

        // Now, try to find the area by extending rectangle
        let rectangle = new Rectangle();

        for (const { components } of blueprint.entities) {
            const bounds = components.StaticMapEntity.getTileSpaceBounds();
            rectangle = rectangle.getUnion(bounds);
        }

        this.selectionArea.innerHTML = `${rectangle.w}&times;${rectangle.h}`;
    }

    update() {
        const selector = this.root.hud.parts.massSelector;
        const placer = this.root.hud.parts.blueprintPlacer;

        if (!selector || !placer) {
            return;
        }

        const blueprint = placer.currentBlueprint.get();
        this.selectedBuildings.set([...selector.selectedUids]);
        this.domAttach.update(!blueprint && selector.selectedUids.size > 0);
    }
}
