import { MODS } from "mods/modloader";
import {
    getFillStoragesRows,
    setupFillStoragesHooks
} from "./api/fill_storages";
import { getPackagingRows, setupPackagingHooks } from "./api/packaging";
import { ButtonRow } from "./rows/button_row";
import { LabelRow } from "./rows/label_row";
import { NumberRow } from "./rows/number_row";
import { Row } from "./rows/row";
import { ToggleRow } from "./rows/toggle_row";

export const rowClasses = {
    Row,
    LabelRow,
    NumberRow,
    ToggleRow,
    ButtonRow
};

export const integrations = {
    shapezIndustries: {
        enabled: isModPresent("shapez-industries")
    },
    packaging: {
        enabled: isModPresent("packaging"),
        createRows: getPackagingRows
    },
    fillStorages: {
        enabled: isModPresent("fill-storage"),
        createRows: getFillStoragesRows
    }
};

function isModPresent(id) {
    return MODS.mods.some((mod) => mod.metadata.id === id);
}

/**
 * @param {import("mods/mod").Mod} mod
 */
export function setupIntegrations(mod) {
    if (integrations.packaging.enabled) {
        setupPackagingHooks(mod, integrations.packaging);
    }

    if (integrations.fillStorages.enabled) {
        setupFillStoragesHooks(mod);
    }
}
