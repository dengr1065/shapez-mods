import { Signal } from "core/signal";
import { makeDiv } from "core/utils";
import { BaseHUDPart } from "game/hud/base_hud_part";
import { DynamicDomAttach } from "game/hud/dynamic_dom_attach";
import { HUDSandboxController } from "game/hud/parts/sandbox_controller";
import { generateLevelDefinitions } from "game/modes/regular";
import { T } from "translations";
import { integrations } from "./api";
import { LabelRow } from "./rows/label_row";
import { NumberRow } from "./rows/number_row";

const rowColors = [
    "#ea17c0",
    "#c92c2c",
    "#2c6bc9",
    "#2daf2f",
    "#8e34b5",
    "#ea9310"
];

const upgradeShortNames = {
    belt: "Transport",
    miner: "Extraction",
    processors: "Processing",
    painting: "Painting"
};

export class HUDMicroSandbox extends BaseHUDPart {
    constructor(root) {
        super(root);

        /** @type {TypedSignal<[number]>} */
        this.levelChanged = new Signal();
    }

    createElements(parent) {
        this.element = makeDiv(parent, "ingame_HUD_MicroSandbox");
        this.rows = [
            new LabelRow(this, {
                getter: () => "\u00b5Sandbox - Main"
            }),
            new NumberRow(this, {
                label: "Level",
                getter: () => this.root.hubGoals.level,
                setter: (value) => this.setLevel(value),
                min: 1
            }),
            ...this.createUpgradeRows()
        ];
    }

    initialize() {
        this.visible = false;
        this.domAttach = new DynamicDomAttach(this.root, this.element);
        this.freeBlueprints = false;
        this.unlockRewards = false;

        for (const integration of Object.values(integrations)) {
            if (integration.enabled && integration.createRows) {
                this.rows.push(...integration.createRows(this));
            }
        }

        for (const row of this.rows) {
            if (!("setColor" in row)) {
                continue;
            }

            const color = rowColors.shift();
            row.setColor(color);
            rowColors.push(color);
        }
    }

    update() {
        this.domAttach.update(this.visible);

        for (const row of this.rows) {
            // Update values for all rows
            row.value.set(row.getter());
        }
    }

    toggle() {
        this.visible = !this.visible;
    }

    createUpgradeRows() {
        const rows = [
            new LabelRow(this, {
                getter: () => "\u00b5Sandbox - Upgrades"
            })
        ];

        if (integrations.shapezIndustries.enabled) {
            // Sorry, but my sanity > SI support
            return [];
        }

        // Handling upgrade setting would require too much
        // copy-paste, so just delegate it to the vanilla function
        // while it exists
        const modifyUpgrade = HUDSandboxController?.prototype?.modifyUpgrade;
        if (!modifyUpgrade) {
            return;
        }

        for (const id in this.root.hubGoals.upgradeLevels) {
            const setter = (value) =>
                modifyUpgrade.call(this, id, value - this.upgrades[id] - 1);

            const row = new NumberRow(this, {
                label: upgradeShortNames[id] ?? T.shopUpgrades[id].name ?? id,
                getter: () => this.upgrades[id] + 1,
                setter,
                additionalAdjustSize: 100,
                min: 1,
                max: this.root.gameMode.getUpgrades()[id].length + 1
            });
            rows.push(row);
        }

        return rows;
    }

    get upgrades() {
        return this.root.hubGoals.upgradeLevels;
    }

    setLevel(value) {
        // Setting the level needs special handling
        const rewards = generateLevelDefinitions().map((goal) => goal.reward);
        const gameRewards = this.root.hubGoals.gainedRewards;
        for (let i = 1; i <= rewards.length; i++) {
            // Unset reward if level is higher, else set
            const reward = rewards[i - 1];
            gameRewards[reward] = i >= value ? 0 : 1;
        }

        this.root.hubGoals.level = value;
        this.levelChanged.dispatch(value);
        this.root.hubGoals.computeNextGoal();

        // reset shapes for our new goal (so it doesn't get skipped)
        const key = this.root.hubGoals.currentGoal.definition.getHash();
        this.root.hubGoals.storedShapes[key] = 0;

        this.root.hud.parts.pinnedShapes?.rerenderFull();
    }
}
