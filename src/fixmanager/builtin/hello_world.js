/** Dialog shows only while this fix is enabled */
let fixState = false;

/**
 * Shows a dialog when entering a game
 * @param {import("mods/mod_interface").ModInterface} modInterface
 */
export function initializeHelloWorldFix(modInterface) {
    /** @type {TypedSignal<[import("game/root").GameRoot]>} */
    const signal = modInterface.modLoader.signals.gameStarted;
    signal.add((root) => {
        if (fixState === false) {
            return;
        }

        root.hud.parts.dialogs?.showInfo("FixManager", "Hello, World!");
    });
}

/** @type {Fix} */
const helloWorldFix = {
    id: "hello_world",
    name: "Hello, World!",
    affectsSavegame: false,
    enable: function () {
        // This one is pretty simple
        fixState = true;
    },
    disable: function () {
        fixState = false;
    }
};

export default helloWorldFix;
