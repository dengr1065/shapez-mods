import { clamp, makeDiv } from "core/utils";
import { BaseHUDPart } from "game/hud/base_hud_part";
import { getTickRateOptions } from "./util";

export class HUDRateChanger extends BaseHUDPart {
    private element: HTMLDivElement;
    private rateButtons = new Map<number, HTMLDivElement>();
    private defaultRate = -1;
    private lastNonDefaultRate = -1;

    createElements(parent: HTMLElement) {
        this.element = makeDiv(parent, "ingame_HUD_RateChanger");

        const rateContainer = makeDiv(this.element, "rateButtons");
        this.createRateButtons(rateContainer);
    }

    initialize() {
        this.defaultRate = this.root.app.settings.getDesiredFps();

        // Update buttons to match current tick rate
        this.setTickRate(this.root.dynamicTickrate.currentTickRate);
    }

    adjustRate(decrease: boolean) {
        const current = this.root.dynamicTickrate.currentTickRate;
        const options = getTickRateOptions();

        const currentIndex = options.indexOf(current);
        const newIndex = clamp(
            currentIndex + (decrease ? -1 : 1),
            0,
            options.length - 1
        );

        if (newIndex !== currentIndex) {
            this.setTickRate(options[newIndex]);
        }
    }

    toggleCustomRate(): boolean {
        if (this.lastNonDefaultRate < 0) {
            return false;
        }

        const current = this.root.dynamicTickrate.currentTickRate;
        const target =
            current === this.defaultRate
                ? this.lastNonDefaultRate
                : this.defaultRate;

        this.setTickRate(target);
        return true;
    }

    private setTickRate(target: number) {
        const isCustom = target !== this.defaultRate;
        this.root.dynamicTickrate.setTickRate(target);

        if (isCustom) {
            this.lastNonDefaultRate = target;
        }

        this.element.classList.toggle("custom", isCustom);
        for (const [rate, button] of this.rateButtons) {
            button.classList.toggle("active", rate === target);
        }
    }

    private createRateButtons(container: HTMLElement) {
        const options = getTickRateOptions();

        for (const tickRate of options) {
            const classes = ["tickRateOption", "noPressEffect"];
            const button = makeDiv(container, undefined, classes);
            button.id = "tickRate" + tickRate;
            button.innerText = tickRate.toString();

            this.trackClicks(button, this.setTickRate.bind(this, tickRate));
            this.rateButtons.set(tickRate, button);
        }
    }
}
