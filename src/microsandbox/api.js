import { Row } from "./rows/row";
import { LabelRow } from "./rows/label_row";
import { NumberRow } from "./rows/number_row";
import { ToggleRow } from "./rows/toggle_row";
import { ButtonRow } from "./rows/button_row";
import { getModExtrasRows } from "./api/mod_extras";
import { getPackagingRows, setupPackagingHooks } from "./api/packaging";
import {
    getFillStoragesRows,
    setupFillStoragesHooks
} from "./api/fill_storages";
import { MODS } from "mods/modloader";

export const rowClasses = {
    Row,
    LabelRow,
    NumberRow,
    ToggleRow,
    ButtonRow
};

export const integrations = {
    modExtras: {
        enabled: false,
        id: "dengr1065:mod_extras",
        api: undefined,
        createRows: getModExtrasRows
    },
    shapezIndustries: {
        enabled: false,
        id: "shapez-industries"
    },
    packaging: {
        enabled: false,
        id: "packaging",
        createRows: getPackagingRows
    },
    fillStorages: {
        enabled: false,
        id: "fill-storage",
        createRows: getFillStoragesRows
    }
};

/**
 * @param {import("mods/mod").Mod} mod
 */
export function setupIntegrations(mod) {
    const modRequire = ModExtras?.require;
    if (!modRequire) {
        // Mod Extras is not installed
        return;
    }

    integrations.modExtras.api = modRequire(
        integrations.modExtras.id,
        "0.x",
        true
    )?.api;

    if (integrations.modExtras.api) {
        integrations.modExtras.enabled = true;
    } else {
        // Old version
        return;
    }

    integrations.shapezIndustries.enabled = !!modRequire(
        integrations.shapezIndustries.id,
        "*",
        true
    );

    integrations.packaging.enabled = !!modRequire(
        integrations.packaging.id,
        ">=1.2.3",
        true
    );

    if (integrations.packaging.enabled) {
        setupPackagingHooks(mod, integrations.packaging);
    }

    // Fill Storages does not use semver
    integrations.fillStorages.enabled = MODS.mods.some(
        (mod) => mod.metadata.id == integrations.fillStorages.id
    );

    if (integrations.fillStorages.enabled) {
        setupFillStoragesHooks(mod);
    }
}
