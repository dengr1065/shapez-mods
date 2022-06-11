import { createLogger } from "core/logging";
import { Mod } from "mods/mod";
import { StorageImplElectron } from "platform/electron/storage";
import { builtInFixes, initializeFixes } from "./builtin";
import * as fixStore from "./fix_store";
import styles from "./styles.less";
import metadata from "./mod.json";
import icon from "./assets/icon.webp";
import { FixesState, mainMenuPostEnter } from "./fixes_state";
import { MainMenuState } from "states/main_menu";

const CONFIG_FILE = "FixManager.json";
const logger = createLogger("FixManager");

class FixManager extends Mod {
    api = fixStore;
    storage = new StorageImplElectron(this.app);

    init() {
        initializeFixes(this.modInterface);
        this.modInterface.registerCss(styles);
        this.signals.appBooted.add(this.registerState, this);

        // Add the Main Menu button
        this.modInterface.runAfterMethod(
            MainMenuState,
            "onEnter",
            mainMenuPostEnter
        );

        // Once all mods are ready
        this.signals.appBooted.add(fixStore.findFixes);

        const readConfigPromise = this.storage
            .initialize()
            .then(() => this.readConfig());

        const appBootedPromise = new Promise((resolve) => {
            logger.log(`Registered ${fixStore.getFixCount()} fixes.`);
            this.signals.appBooted.add(resolve);
        });

        Promise.all([readConfigPromise, appBootedPromise]).then(() => {
            // Now we know enabled fixes and made sure everything is
            // initialized.
            this.restoreFixes();
        });
    }

    async readConfig() {
        try {
            const data = await this.storage.readFileAsync(CONFIG_FILE);
            const parsed = JSON.parse(data);
            if (!Array.isArray(parsed)) {
                throw new Error("Invalid config data!");
            }

            for (const fixId of parsed) {
                // Add this fix to load it later
                fixStore.enabledFixes.add(fixId);
            }
        } catch {
            logger.warn("Failed to read the config file, likely missing.");
        }

        const count = fixStore.enabledFixes.size;
        logger.log(`Config / ${count} fixes enabled.`);
    }

    async writeConfig() {
        const fixArray = [...fixStore.enabledFixes];
        const data = JSON.stringify(fixArray);
        await this.storage.writeFileAsync(CONFIG_FILE, data);
        logger.debug("Config / Written successfully.");
    }

    registerState() {
        logger.debug("Fixes state registered.");
        this.modInterface.registerGameState(FixesState);
    }

    /**
     * Once all mods are ready and list of fixes was loaded,
     * we can turn them on.
     */
    restoreFixes() {
        for (const fixId of fixStore.enabledFixes) {
            const fix = fixStore.getFixById(fixId);
            if (fix === null) {
                logger.warn(`Missing fix "${fixId}", deleting.`);
                fixStore.enabledFixes.delete(fixId);
                continue;
            }

            // Enable that fix
            fixStore.toggleFix(fix, true);
        }

        // Write the config to remove missing fixes
        this.writeConfig();
        logger.debug("Initialization done.");
    }

    provideFixes() {
        return builtInFixes;
    }
}

metadata.extra.icon = icon;
registerMod(FixManager, metadata);
