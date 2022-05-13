import { lerp } from "core/utils";

/**
 * @param {number} dt
 * @this {import("game/camera").Camera}
 */
export function internalUpdateZooming(dt) {
    if (this.currentlyPinching || this.desiredZoom === null) {
        return;
    }

    const diff = this.zoomLevel - this.desiredZoom;
    if (Math.abs(diff) > 0.01) {
        let fade = 0.01;
        if (diff > 0) {
            // Zoom out faster than in
            fade = 0.012;
        }

        this.zoomLevel = lerp(this.zoomLevel, this.desiredZoom, dt * fade);
    } else {
        this.zoomLevel = this.desiredZoom;
        this.desiredZoom = null;
    }
}
