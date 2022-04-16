import { globalConfig } from "core/config";
import { THEMES } from "game/theme";
import { Mod } from "mods/mod";
import { StorageImplElectron } from "platform/electron/storage";
import info from "./mod.json";
import { MapObserverSettingsState } from "./settings";
import settingsCSS from "./settings.less";

const defaultSettings = {
    minZoom: 0.6,
    customizeGrid: false,
    gridBackground: "#1a2b19",
    gridForeground: "#243d23"
};

const vanillaThemeMapColors = {};

class MapObserver extends Mod {
    init() {
        this.modInterface.registerCss(settingsCSS);

        this.storage = new StorageImplElectron(this.app);
        this.settingsFile = this.metadata.id + "_settings.json";
        this.saveSettings = () => this.saveCustomSettings();
        this.prepareSettings();

        this.signals.appBooted.add(() => {
            // Store vanilla theme colors so we can disable the customization
            for (const theme in THEMES) {
                vanillaThemeMapColors[theme] = {
                    background: THEMES[theme].map.background,
                    grid: THEMES[theme].map.grid
                };
            }

            this.modInterface.registerGameState(MapObserverSettingsState);
            this.setConfig();
        });
    }

    async prepareSettings() {
        this.settings = defaultSettings;

        try {
            // Manually read settings from the file
            const stored = await this.storage.readFileAsync(this.settingsFile);
            this.settings = JSON.parse(stored);

            // Set missing settings keys
            for (const key in defaultSettings) {
                if (!(key in this.settings)) {
                    this.settings[key] = defaultSettings[key];
                }
            }
        } catch (err) {
            // Settings file doesn't exist yet (or is corrupt)
            const data = this.serializeSettings(this.settings);
            await this.storage.writeFileAsync(this.settingsFile, data);
        }
    }

    async saveCustomSettings() {
        const data = this.serializeSettings(this.settings);
        await this.storage.writeFileAsync(this.settingsFile, data);
    }

    serializeSettings(data) {
        return JSON.stringify(data, undefined, 2);
    }

    setConfig() {
        // This is a "single line" mod, but it's useful for some people.
        globalConfig.mapChunkOverviewMinZoom = this.settings.minZoom ?? 0.6;

        if (this.settings.customizeGrid) {
            // Set our customized colors
            for (const theme in THEMES) {
                THEMES[theme].map.background = this.settings.gridBackground;
                THEMES[theme].map.grid = this.settings.gridForeground;
            }
        } else {
            // Restore vanilla colors
            for (const theme in THEMES) {
                const vanilla = vanillaThemeMapColors[theme];
                THEMES[theme].map.background = vanilla.background;
                THEMES[theme].map.grid = vanilla.grid;
            }
        }
    }
}

registerMod(MapObserver, info);
