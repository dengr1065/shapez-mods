import { refreshRateOptions } from "profile/application_settings";
import { T } from "translations";
import I18N from "./assets/strings.json";
import metadata from "./mod.json";

T[metadata.id] = I18N;
export const MOD_ID = metadata.id;
export { I18N };

export function getTickRateOptions() {
    const options = new Set(refreshRateOptions);

    options.add("1");
    options.add("5");

    return [...options]
        .map((option) => parseInt(option))
        .filter((option) => option > 0)
        .sort((a, b) => a - b);
}
