import { Mod } from "mods/mod";

export class SettingsManager {
    beltPlannerAlwaysOn: boolean;
    keepBuildingInMapOverview: boolean;
    cycleBuildingsFix: boolean;

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
        this.cycleBuildingsFix = mod.settings.cycleBuildingsFix;
    }

    static getDefaults() {
        return {
            beltPlannerAlwaysOn: false,
            keepBuildingInMapOverview: true,
            cycleBuildingsFix: true
        };
    }
}
