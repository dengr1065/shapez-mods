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
    const cls = name.toLowerCase();

    const label = makeDiv(parent, undefined, ["label", cls]);
    label.innerText = name;

    const value = makeDiv(parent, undefined, [cls]);
    return value;
}

/**
 * Gets compatible cost of specified blueprint
 * @param {Blueprint} blueprint
 */
function getCost(blueprint) {
    const cost = blueprint.getCost();
    return (Array.isArray(cost) ? cost : [cost])
        .filter((typeCost) => typeCost > 0)
        .map(formatBigNumberFull)
        .join(", ");
}

export class HUDAreaInfo extends BaseHUDPart {
    constructor(root, mod) {
        super(root);

        /** @type {import("mods/mod").Mod} */
        this.mod = mod;
    }

    createElements(parent) {
        this.element = makeDiv(parent, "ingame_HUD_AreaInfo", []);

        this.fields = {
            buildings: makeField(this.element, "Buildings"),
            cost: makeField(this.element, "Cost"),
            area: makeField(this.element, "Area"),
            density: makeField(this.element, "Density")
        };

        for (const key of this.mod.settings.fields) {
            // Only show fields selected in settings
            const elements = this.element.getElementsByClassName(key);
            for (const element of elements) {
                element.classList.add("visible");
            }
        }

        const { background, foreground } = this.mod.settings;
        this.element.style.backgroundColor = background;
        this.element.style.color = foreground;
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

        const blueprint = Blueprint.fromUids(this.root, uids);

        // Now, try to find the area by extending rectangle
        let rectangle = new Rectangle();
        let tiles = 0;

        for (const { components } of blueprint.entities) {
            const bounds = components.StaticMapEntity.getTileSpaceBounds();
            tiles += bounds.w * bounds.h;

            rectangle = rectangle.getUnion(bounds);
        }

        const { w, h } = rectangle;
        const area = w * h;

        const usage = (tiles / area) * 100;

        this.fields.buildings.innerText = `${uids.length} (${tiles})`;
        this.fields.cost.innerText = getCost(blueprint);
        this.fields.area.innerHTML = `${w}&times;${h} (${area})`;
        this.fields.density.innerText = `${usage.toFixed(1)}%`;
    }

    update() {
        const selector = this.root.hud.parts.massSelector;
        const placer = this.root.hud.parts.blueprintPlacer;

        if (!selector || !placer) {
            return;
        }

        const blueprint = placer.currentBlueprint.get();
        const fields = this.mod.settings.fields;
        const costOnly = fields.length == 1 && fields.includes("cost");

        this.selectedBuildings.set([...selector.selectedUids]);
        let shouldShow = selector.selectedUids.size > 0;

        if (this.mod.settings.useForBlueprints && blueprint && !costOnly) {
            shouldShow = true;
        }

        this.domAttach.update(shouldShow);
        this.element.classList.toggle("forceHideCost", blueprint);

        const heightProp = "--area-info-hud-height";
        const currentHeight = document.body.style.getPropertyValue(heightProp);
        const newHeight = this.element.clientHeight + "px";

        if (currentHeight == newHeight) {
            return;
        }

        document.body.style.setProperty(heightProp, newHeight);
    }
}
