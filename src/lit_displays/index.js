import { makeOffscreenBuffer } from "core/buffer_utils";
import { globalConfig } from "core/config";
import { Mod } from "mods/mod";
import { renderDisplays } from "./display";
import info from "./mod.json";
import icon from "./icon.webp";

export class LitDisplays extends Mod {
    init() {
        const [canvas, context] = makeOffscreenBuffer(
            globalConfig.mapChunkWorldSize,
            globalConfig.mapChunkWorldSize,
            { smooth: false }
        );

        this.canvas = canvas;
        this.context = context;

        this.signals.appBooted.add(this.setDrawHook, this);
    }

    setDrawHook() {
        const overviewHook = ModExtras.require(
            "dengr1065:overview_hook",
            "^1.0.0"
        );

        overviewHook.hook(this, renderDisplays.bind(this));
    }
}

info.extra.icon = icon;
registerMod(LitDisplays, info);
