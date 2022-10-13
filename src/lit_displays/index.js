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

        this.renderOnWiresLayer = true;
        this.renderShapes = true;

        this.signals.appBooted.add(this.setDrawHook, this);
    }

    setDrawHook() {
        const overviewHook = ModExtras.require(
            "dengr1065:overview_hook",
            "^1.0.0"
        );

        overviewHook.hook(this, renderDisplays.bind(this));
    }

    provideFixes() {
        /** @type {Fix} */
        const renderOnWiresLayerFix = {
            id: this.metadata.id + ":skip_render_on_wires_layer",
            name: "Don't show on Wires layer",
            enable: () => (this.renderOnWiresLayer = false),
            disable: () => (this.renderOnWiresLayer = true)
        };

        /** @type {Fix} */
        const renderShapesFix = {
            id: this.metadata.id + ":render_shapes_as_white",
            name: "Render shapes as white color",
            enable: () => (this.renderShapes = false),
            disable: () => (this.renderShapes = true)
        };

        return [renderOnWiresLayerFix, renderShapesFix];
    }
}

info.extra.icon = icon;
registerMod(LitDisplays, info);
