import { GameRoot } from "game/root";
import { Mod } from "mods/mod";
import { SerializedGame } from "savegame/savegame_typedefs";
import { blocklist, getVisibility, setVisibility } from "./manager";
import metadata from "./mod.json";
import changelog from "./changelog.json";
import readme from "./README.md";
import icon from "./icon.webp";
import { HUDWiresOverlay } from "game/hud/parts/wires_overlay";

class UIKeeper extends Mod {
    private activeLayerStoreId = `${metadata.id}:activeLayer`;

    init() {
        if ("blocklist" in this.settings) {
            blocklist.push(...this.settings.blocklist);
        }

        this.signals.gameSerialized.add(this.onGameSerialized.bind(this));
        this.signals.gameDeserialized.add(this.onGameDeserialized.bind(this));
    }

    onGameSerialized(root: GameRoot, dump: SerializedGame) {
        // Keep missing stuff there, in case of mod list change
        dump.modExtraData[metadata.id] ??= {};

        // Write active layer
        dump.modExtraData[this.activeLayerStoreId] = root.currentLayer;

        // Merge the visibility states
        dump.modExtraData[metadata.id] = {
            ...dump.modExtraData[metadata.id],
            ...getVisibility(root)
        };
    }

    onGameDeserialized(root: GameRoot, dump: SerializedGame) {
        if (!(metadata.id in dump.modExtraData)) {
            // Nothing to restore
            return;
        }

        // Restore active layer (dirty, but ensures no invalid state)
        const lastLayer = dump.modExtraData[this.activeLayerStoreId];
        if (
            lastLayer &&
            lastLayer !== "regular" &&
            this.settings.keepActiveLayer
        ) {
            // This will fail if a mod makes switchLayer depend on props
            HUDWiresOverlay.prototype.switchLayers.call({ root });
        }

        setVisibility(root, dump.modExtraData[metadata.id]);
    }
}

const extra = (<ModExtrasMetadata>(<unknown>metadata)).extra;
extra.changelog = changelog;
extra.readme = readme;
extra.icon = icon;

registerMod(UIKeeper, metadata as unknown as ModExtrasMetadata);
