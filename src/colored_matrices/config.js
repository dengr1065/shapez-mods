import { makeOffscreenBuffer } from "core/buffer_utils";
import { gMetaBuildingRegistry } from "core/global_registries";
import { Loader } from "core/loader";
import { TextualGameState } from "core/textual_game_state";
import { makeDiv, makeDivElement } from "core/utils";
import { MetaHubBuilding } from "game/buildings/hub";
import { defaultBuildingVariant } from "game/meta_building";
import { MODS } from "mods/modloader";
import { T } from "translations";
import metadata from "./mod.json";

export class ColoredMatricesConfigState extends TextualGameState {
    constructor() {
        super("ColoredMatricesConfigState");

        this.mod = MODS.mods.find((mod) => mod.metadata.id == metadata.id);
    }

    getStateHeaderTitle() {
        return "Colored Matrices Configuration";
    }

    onEnter() {
        const content = document.querySelector(".mainContent");
        const label = document.createElement("label");

        const labelText = document.createElement("span");
        labelText.innerText = "Modify Map Overview colors";

        const enabledCheckbox = document.createElement("input");
        enabledCheckbox.type = "checkbox";
        enabledCheckbox.checked = this.mod.settings.enabled;
        enabledCheckbox.addEventListener("change", () => {
            this.mod.settings.enabled = enabledCheckbox.checked;
        });

        label.appendChild(labelText);
        label.appendChild(enabledCheckbox);
        content.appendChild(label);

        for (const buildingId in this.mod.settings.colors) {
            this.renderBuilding(content, buildingId);
        }
    }

    /**
     * @param {HTMLDivElement} parent
     * @param {string} buildingId
     */
    renderBuilding(parent, buildingId) {
        /** @type {import("game/meta_building").MetaBuilding} */
        const building = gMetaBuildingRegistry.idToEntry[buildingId];

        // First, append the building name
        const header = makeDiv(parent, undefined, ["header"]);
        header.innerText =
            T.buildings[buildingId][defaultBuildingVariant]?.name;

        // Now, add buttons for every variant combination
        const combinations = makeDivElement(undefined, ["combinations"]);

        for (const combination of building.constructor.getAllVariantCombinations()) {
            const { variant, rotationVariant } = combination;
            this.renderVariantCombination(
                combinations,
                buildingId,
                variant,
                rotationVariant ?? 0
            );
        }

        parent.appendChild(combinations);
    }

    /**
     * @param {HTMLDivElement} parent
     * @param {string} buildingId
     * @param {string} variant
     * @param {number} rotationVariant
     */
    renderVariantCombination(parent, buildingId, variant, rotationVariant) {
        const root = makeDivElement(undefined, ["combination"]);

        /** @type {import("game/meta_building").MetaBuilding} */
        const building = gMetaBuildingRegistry.idToEntry[buildingId];
        const dimensions = building.getDimensions(variant).multiplyScalar(64);
        const [icon, iconCtx] = makeOffscreenBuffer(
            dimensions.x,
            dimensions.y,
            {
                smooth: true,
                reusable: false,
                label: `cm-preview-${buildingId}-${variant}-${rotationVariant}`
            }
        );

        this.drawBuilding(
            iconCtx,
            gMetaBuildingRegistry.idToEntry[buildingId],
            variant,
            rotationVariant
        );

        const picker = document.createElement("input");
        picker.type = "color";
        picker.value = this.getColor(building, variant, rotationVariant);

        this.trackClicks(icon, () => {
            // Reset to default color
            const defaultColor = this.getColor(
                building,
                variant,
                rotationVariant,
                true
            );

            this.setColor(buildingId, variant, rotationVariant, defaultColor);
            picker.value = defaultColor;
        });

        picker.addEventListener("change", () => {
            const newColor = picker.value;
            this.setColor(buildingId, variant, rotationVariant, newColor);
        });

        root.appendChild(icon);
        root.appendChild(picker);
        parent.appendChild(root);
    }

    /**
     * Draws a building on the specified canvas context.
     * @param {CanvasRenderingContext2D} ctx
     * @param {import("game/meta_building").MetaBuilding} building
     * @param {string} variant
     * @param {number} rotationVariant
     */
    drawBuilding(ctx, building, variant, rotationVariant) {
        let sprite = building.getSprite(rotationVariant, variant);

        if (sprite === null) {
            sprite = building.getBlueprintSprite(rotationVariant, variant);
        }

        if (building instanceof MetaHubBuilding) {
            sprite = Loader.getSprite("sprites/buildings/hub.png");
        }

        if (sprite) {
            sprite.draw(ctx, 0, 0, ctx.canvas.width, ctx.canvas.height);
        }
    }

    /**
     * Returns current color choice for a building variant combination.
     * @param {import("game/meta_building").MetaBuilding} building
     * @param {string} variant
     * @param {number} rotationVariant
     * @param {boolean} [forceDefault]
     * @returns {string}
     */
    getColor(building, variant, rotationVariant, forceDefault = false) {
        const cmEnabled = this.mod.settings.enabled;
        if (forceDefault && cmEnabled) {
            this.mod.settings.enabled = false;
        }

        let color = building.getSilhouetteColor(variant, rotationVariant);
        this.mod.settings.enabled = cmEnabled;

        if (color.length == 4 && color.startsWith("#")) {
            const red = color[1].repeat(2);
            const green = color[2].repeat(2);
            const blue = color[3].repeat(2);
            return `#${red}${green}${blue}`;
        }

        return color;
    }

    /**
     * Sets the color choice for provided building variant combination.
     * @param {string} buildingId
     * @param {string} variant
     * @param {number} rotationVariant
     * @param {string} color
     */
    setColor(buildingId, variant, rotationVariant, color) {
        this.mod.settings.colors[buildingId][variant][rotationVariant] = color;
    }

    onLeave() {
        this.mod.saveSettings();
    }
}
