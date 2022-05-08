import { Mod } from "mods/mod";
import { apply } from "./website_fix";
import { MOD_ID } from "./constants";
import { StateManager } from "core/state_manager";
import { ModListState, MOD_LIST_STATE } from "./state";
import sourceCss from "./less/index.less";
import { ModInterface } from "mods/mod_interface";
import { modRequire } from "./mod_require";
import api from "./api";
import { StorageImplElectron } from "platform/electron/storage";
import { defaultSettings, readSettings, saveSettings } from "./settings";
import metadata from "./ui/metadata";
import { createLogger } from "core/logging";
import { MODS } from "mods/modloader";
import { checkForUpdates } from "./mod_helpers";

ModInterface.prototype["require"] = modRequire;

// Export needed for type checking
export class ModExtras extends Mod {
    constructor(properties) {
        super(properties);

        this.logger = createLogger("ModExtras");
        this.storage = new StorageImplElectron(this.app);
        this.settings = defaultSettings;
        this.api = api;

        // Not sure what else I can do here
        readSettings(this.storage).then((result) => {
            this.settings = result;
        });

        this.saveSettings = () => saveSettings(this.storage, this.settings);
    }

    init() {
        // Website fix: "cannot read properties of undefined"
        this.signals.appBooted.add(apply);
        this.signals.appBooted.add(this.registerState, this);

        // Replace calls to ModsState with our own
        this.modInterface.replaceMethod(
            StateManager,
            "moveToState",
            this.moveToState
        );

        const css = sourceCss.replaceAll("MOD_ID", MOD_ID.replace(":", "_"));
        this.modInterface.registerCss(css);
    }

    registerState() {
        this.app.stateMgr.register(ModListState);
    }

    /**
     * Used primarily to update the cache, return values are ignored.
     */
    async checkForModUpdates() {
        const pending = [];
        for (const mod of MODS.mods) {
            pending.push(checkForUpdates(mod));
        }

        await Promise.all(pending);
        return;
    }

    moveToState(superMethod, [stateKey, ...params]) {
        if (stateKey == "ModsState") {
            stateKey = MOD_LIST_STATE;
        }

        return superMethod(stateKey, ...params);
    }
}

registerMod(ModExtras, metadata);
