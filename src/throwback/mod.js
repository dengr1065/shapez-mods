import { Vector } from "core/vector";
import { HUDWaypoints } from "game/hud/parts/waypoints";
import { Mod } from "mods/mod";
import { MODS } from "mods/modloader";
import { T } from "translations";
import { equalsEpsilon } from "./vector_fix";
import { Camera } from "game/camera";
import { createLogger } from "core/logging";
import metadata from "./mod.json";
import icon from "./icon.webp";

/** @returns {Throwback} */
function getMod() {
    return MODS.mods.find((m) => m.metadata.id === metadata.id);
}

/** @this {HUDWaypoints} */
function recordPosition() {
    const mod = getMod();
    const oldPos = this.root.camera.center;

    if (mod.last && oldPos.equalsEpsilon(mod.last.center, 5)) {
        mod.logger.log("Skipping write because we're already there");
        return;
    }

    if (mod.last == null || !mod.isInWaypoints(this.root)) {
        // Only write last position if it won't overwrite a non-waypoint one
        mod.logger.log("Writing position ", oldPos.toString());
        mod.last = {
            center: oldPos.copy(),
            layer: this.root.currentLayer,
            zoomLevel: this.root.camera.zoomLevel
        };
    }
}

class Throwback extends Mod {
    init() {
        /** @type {import("game/hud/parts/waypoints").Waypoint | null} */
        this.last = null;
        this.signals.gameInitialized.add(() => (this.last = null));
        this.logger = createLogger("Throwback");

        // Apply the vector patch
        this.modInterface.replaceMethod(Vector, "equalsEpsilon", equalsEpsilon);

        // Record when switching waypoints
        this.modInterface.runBeforeMethod(
            HUDWaypoints,
            "moveToWaypoint",
            recordPosition
        );

        // ...and returning to the Hub
        this.modInterface.runBeforeMethod(
            Camera,
            "centerOnMap",
            recordPosition
        );

        this.modInterface.registerIngameKeybinding({
            id: `${metadata.id}:return`,
            translation: "Return to previous location",
            keyCode: 8, // Couldn't find it in KEYCODES namespace
            handler: this.throwback.bind(this)
        });

        this.modInterface.registerTranslations("en", {
            [metadata.id]: {
                missing: "Couldn't find where to return!"
            }
        });
    }

    /**
     * Returns true if the camera position is present in waypoint list.
     * @param {import("game/root").GameRoot} root Game root, used to fetch list
     */
    isInWaypoints(root) {
        /** @type {import("game/hud/parts/waypoints").HUDWaypoints} */
        const waypointsHud = root.hud.parts.waypoints;
        if (!waypointsHud) {
            return false;
        }

        return waypointsHud.waypoints.some((waypoint) => {
            const { x, y } = waypoint.center;
            const target = new Vector(x, y);
            return (
                root.camera.center.equalsEpsilon(target, 5) &&
                root.currentLayer == waypoint.layer
            );
        });
    }

    /**
     * Returns to the previous location, if it exists.
     * @param {import("game/root").GameRoot} root
     */
    throwback(root) {
        if (this.last === null) {
            /** @type {import("game/hud/parts/notifications").HUDNotifications} */
            const notificationsHud = root.hud.parts.notifications;
            if (!notificationsHud) {
                return;
            }

            // Notify the user
            this.logger.log("No point recorded");
            return notificationsHud.internalShowNotification(
                T[metadata.id].missing,
                "error"
            );
        }

        if (this.last.center.equalsEpsilon(root.camera.center)) {
            // No need to run empty movement
            this.logger.log("Camera matches last point");
            return;
        }

        if (root.camera.desiredCenter) {
            // Ignore - already in movement
            this.logger.log("Not executing because already in movement");
            return;
        }

        // No waypoint check here to make travel faster
        const newPoint = {
            center: root.camera.center.copy(),
            layer: root.currentLayer,
            zoomLevel: root.camera.zoomLevel
        };

        this.logger.log("Moving to", this.last.center.toString());
        root.camera.setDesiredCenter(this.last.center);
        root.camera.setDesiredZoom(this.last.zoomLevel);
        root.currentLayer = this.last.layer;

        this.logger.log(
            "Writing previous throwback:",
            newPoint.center.toString()
        );
        this.last = newPoint;
    }
}

metadata.extra.icon = icon;
registerMod(Throwback, metadata);
