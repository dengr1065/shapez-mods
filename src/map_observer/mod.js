import { globalConfig } from "core/config";
import { Mod } from "mods/mod";
import { StorageImplElectron } from "platform/electron/storage";
import info from "./mod.json";

const defaultSettings = {
    _comment:
        "Value below will be applied to the game. (vanilla = 0.9, default = 0.6)",
    minZoom: 0.6
};

class MapObserver extends Mod {
    init() {
        this.storage = new StorageImplElectron(this.app);
        this.prepareSettings().then(() => this.setMinZoom());
    }

    async prepareSettings() {
        const file = this.metadata.id + "_settings.json";
        this.settings = defaultSettings;

        try {
            // Manually read settings from the file
            const stored = await this.storage.readFileAsync(file);
            this.settings = JSON.parse(stored);
        } catch (err) {
            // Settings file doesn't exist yet (or is corrupt)
            const data = this.serializeSettings(this.settings);
            await this.storage.writeFileAsync(file, data);
        }
    }

    serializeSettings(data) {
        return JSON.stringify(data, undefined, 2);
    }

    setMinZoom() {
        // This is a "single line" mod, but it's useful for some people.
        globalConfig.mapChunkOverviewMinZoom = this.settings.minZoom ?? 0.6;
    }
}

// eslint-disable-next-line no-undef
registerMod(MapObserver, info);
