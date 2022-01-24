import { basicSetup, EditorState, EditorView } from "@codemirror/basic-setup";
import { StreamLanguage } from "@codemirror/stream-parser";
import { less } from "@codemirror/legacy-modes/mode/css";
import { makeButton, makeDiv } from "core/utils";
import { BaseHUDPart } from "game/hud/base_hud_part";
import { DynamicDomAttach } from "game/hud/dynamic_dom_attach";
import { compileLess, setCss } from "./css";
import { InputReceiver } from "core/input_receiver";

export class HUDCustomCSSEditor extends BaseHUDPart {
    constructor(root, mod) {
        super(root);

        /** @type {import("mods/mod").Mod} */
        this.mod = mod;
    }

    createElements(parent) {
        this.element = makeDiv(parent, "ingame_HUD_CustomCSSEditor", []);
    }

    initialize() {
        this.visible = false;
        this.domAttach = new DynamicDomAttach(this.root, this.element);
        this.inputReceiver = new InputReceiver("custom_css_editor");

        this.editor = new EditorView({
            parent: this.element,
            state: EditorState.create({
                extensions: [basicSetup, StreamLanguage.define(less)],
                doc: this.mod.settings.code
            })
        });

        const buttons = makeDiv(this.element, undefined, ["buttons"]);

        const closeBtn = makeButton(buttons, [], "Close");
        this.trackClicks(closeBtn, this.toggle);

        const applyBtn = makeButton(buttons, [], "Apply");
        this.trackClicks(applyBtn, this.applyChanges);
    }

    async applyChanges() {
        const code = this.editor.state.doc.toString();

        try {
            const css = await compileLess(code);
            this.mod.settings.code = code;
            this.mod.settings.css = css;
            setCss(css);

            await this.mod.saveSettings();
        } catch (err) {
            this.mod.dialogs.showWarning("LESS Error", err.toString(), [
                "ok:good"
            ]);
        }
    }

    cleanup() {
        super.cleanup();
        this.editor.destroy();
    }

    update() {
        this.domAttach.update(this.visible);
    }

    toggle() {
        this.visible = !this.visible;
        if (this.visible) {
            this.root.app.inputMgr.makeSureAttachedAndOnTop(this.inputReceiver);
        } else {
            this.root.app.inputMgr.makeSureDetached(this.inputReceiver);
        }
    }
}
