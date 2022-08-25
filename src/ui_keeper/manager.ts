import { createLogger } from "core/logging";
import { BaseHUDPart } from "game/hud/base_hud_part";
import { HUDDebugInfo } from "game/hud/parts/debug_info";
import { GameRoot } from "game/root";

enum VisibilitySupport {
    None,
    Toggle,
    ShowHide,
    Property,
    DebugInfo
}

type SupportedHUDPart = BaseHUDPart & {
    visible: boolean;
    toggle?: () => void;
};

type VisibilityStore = Record<string, boolean | string>;

/**
 * List of HUD class names to skip when getting visibility.
 */
export const blocklist = ["HUDSettingsMenu"];
const knownSupport = {
    HUDDebugInfo: VisibilitySupport.DebugInfo
};

const logger = createLogger("UI Keeper");

function getVisibilitySupport(element: BaseHUDPart) {
    if (blocklist.includes(element.constructor.name)) {
        return VisibilitySupport.None;
    }

    if (element.constructor.name in knownSupport) {
        return knownSupport[element.constructor.name];
    }

    if (!("visible" in element)) {
        // We need visible property to retreive the state
        return VisibilitySupport.None;
    }

    if ("toggle" in element) {
        return VisibilitySupport.Toggle;
    }

    if ("show" in element && "hide" in element) {
        return VisibilitySupport.ShowHide;
    }

    return VisibilitySupport.Property;
}

function getSupportedElements(root: GameRoot) {
    return Object.values(root.hud.parts).filter(
        (e) => getVisibilitySupport(e) !== VisibilitySupport.None
    ) as SupportedHUDPart[];
}

export function getVisibility(root: GameRoot): VisibilityStore {
    const elements = getSupportedElements(root);
    const result: VisibilityStore = {};

    for (const element of elements) {
        // Special handling for debug info
        if (element instanceof HUDDebugInfo) {
            result[element.constructor.name] = element.trackedMode.get();
            continue;
        }

        // This is pretty easy
        result[element.constructor.name] = element.visible;
    }

    return result;
}

/**
 * Finds the instance of specified HUD element.
 */
function findElement(root: GameRoot, name: string) {
    return Object.values(root.hud.parts).find(
        (element) => element.constructor.name === name
    ) as SupportedHUDPart;
}

function setElementState(element: SupportedHUDPart, state: boolean | string) {
    const method = getVisibilitySupport(element);

    switch (method) {
        case VisibilitySupport.Property:
            element.visible = state as boolean;
            break;
        case VisibilitySupport.ShowHide:
            element[state ? "show" : "hide"]();
            break;
        case VisibilitySupport.Toggle:
            if (state !== element.visible) {
                element.toggle();
            }
            break;
        case VisibilitySupport.DebugInfo:
            if (element instanceof HUDDebugInfo) {
                element.trackedMode.set(state);
                element.lastTick = 0;
                element.updateLabels();
            } else {
                logger.error("DebugInfo visibility support is invalid");
            }
            break;
        default:
            logger.warn("Attempted to set visibility on unsupported element");
    }
}

export function setVisibility(root: GameRoot, visibility: VisibilityStore) {
    const current = getVisibility(root);

    for (const elementName in visibility) {
        if (!(elementName in current)) {
            logger.warn(
                `Missing element ${elementName} present in requested state`
            );
            continue;
        }

        // Compare the states to do less work
        if (visibility[elementName] !== current[elementName]) {
            setElementState(
                findElement(root, elementName),
                visibility[elementName]
            );
        }
    }
}
