import { Mod } from "mods/mod";
import info from "./mod.json";
import icon from "./assets/icon.png";
import { apply } from "./website_fix";
import { MOD_ID } from "./constants";
import { StateManager } from "core/state_manager";
import { ModListState, MOD_LIST_STATE } from "./state";
import sourceCss from "./less/index.less";
import { ModInterface } from "mods/mod_interface";
import { modRequire } from "./mod_require";
import authors from "../authors.json";
import api from "./api";
import changelog from "./changelog.json";

ModInterface.prototype["require"] = modRequire;

class ModExtras extends Mod {
    constructor(properties) {
        super(properties);

        this.api = api;
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

    moveToState(superMethod, [stateKey, ...params]) {
        if (stateKey == "ModsState") {
            stateKey = MOD_LIST_STATE;
        }

        return superMethod(stateKey, ...params);
    }
}

info.id = MOD_ID;
info.extra.icon = icon;
info.extra.authors.push(authors.dengr1065);
info.extra.changelog = changelog;
info.settings = {
    showLibraryMods: false,
    lastViewedChangelogs: {}
};

// eslint-disable-next-line no-undef
registerMod(ModExtras, info);
