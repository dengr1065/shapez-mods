import { Mod } from "mods/mod";

export class SettingsManager {
    private mod: Mod;

    beltPlannerAlwaysOn: boolean;
    keepBuildingInMapOverview: boolean;

    constructor(mod: Mod) {
        // Apply defaults if missing
        const defaults = SettingsManager.getDefaults();
        for (const key in defaults) {
            if (!(key in mod.settings)) {
                mod.settings[key] = defaults;
            }
        }

        this.beltPlannerAlwaysOn = mod.settings.beltPlannerAlwaysOn;
        this.keepBuildingInMapOverview = mod.settings.keepBuildingInMapOverview;
    }

    static getDefaults() {
        return {
            beltPlannerAlwaysOn: false,
            keepBuildingInMapOverview: true
        };
    }
}
