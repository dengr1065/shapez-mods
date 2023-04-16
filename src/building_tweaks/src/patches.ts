import { DrawParameters } from "core/draw_parameters";
import { STOP_PROPAGATION } from "core/signal";
import { Vector } from "core/vector";
import { HUDBuildingPlacer } from "game/hud/parts/building_placer";
import { HUDBuildingPlacerLogic } from "game/hud/parts/building_placer_logic";
import { KEYMAPPINGS } from "game/key_action_mapper";
import { MetaBuilding } from "game/meta_building";
import { SOUNDS } from "platform/sound";
import { getBuildingTweaksMod } from "./util";

export function postInitialize(this: HUDBuildingPlacerLogic) {
    this.buildingTweaks = getBuildingTweaksMod();
}

export function isDirectionLockActiveGetter(this: HUDBuildingPlacerLogic) {
    const metaBuilding: MetaBuilding | null = this.currentMetaBuilding.get();
    const variant: string = this.currentVariant.get();
    if (
        metaBuilding == null ||
        !metaBuilding.getHasDirectionLockAvailable(variant)
    ) {
        return false;
    }

    const directionLockKey = KEYMAPPINGS.placementModifiers.lockBeltDirection;
    const locked = this.root.keyMapper.getBinding(directionLockKey).pressed;

    if (!this.buildingTweaks.settingsManager.beltPlannerAlwaysOn) {
        // Use the vanilla logic
        return locked;
    }

    // Invert the lock if multiplace is enabled
    const multiplace = this.root.app.settings.getSetting("alwaysMultiplace");
    return multiplace ? !locked : locked;
}

export function updatePatch(
    this: HUDBuildingPlacerLogic,
    srcMethod: () => void
) {
    if (!this.buildingTweaks.settingsManager.keepBuildingInMapOverview) {
        srcMethod.call(this);
        return;
    }

    // Abort placement if a dialog was shown in the meantime
    if (this.root.hud.hasBlockingOverlayOpen()) {
        this.abortPlacement();
        return;
    }

    // Always update since the camera might have moved
    const mousePos = this.root.app.mousePosition;
    if (mousePos) {
        this.onMouseMove(mousePos);
    }
}

export function tryPlaceCurrentBuildingAtPatch(
    this: HUDBuildingPlacerLogic,
    srcMethod: (tile: Vector) => boolean,
    [tile]: [Vector]
) {
    // Direct copy-paste from vanilla

    const metaBuilding: MetaBuilding = this.currentMetaBuilding.get();
    const { rotation, rotationVariant } =
        metaBuilding.computeOptimalDirectionAndRotationVariantAtTile({
            root: this.root,
            tile,
            rotation: this.currentBaseRotation,
            variant: this.currentVariant.get(),
            layer: metaBuilding.getLayer()
        });

    const entity = this.root.logic.tryPlaceBuilding({
        origin: tile,
        rotation,
        rotationVariant,
        originalRotation: this.currentBaseRotation,
        building: this.currentMetaBuilding.get(),
        variant: this.currentVariant.get()
    });

    if (entity) {
        // Succesfully placed, find which entity we actually placed
        this.root.signals.entityManuallyPlaced.dispatch(entity);

        // Check if we should flip the orientation (used for tunnels)
        if (
            metaBuilding.getFlipOrientationAfterPlacement() &&
            !this.root.keyMapper.getBinding(
                KEYMAPPINGS.placementModifiers.placementDisableAutoOrientation
            ).pressed
        ) {
            this.currentBaseRotation = (180 + this.currentBaseRotation) % 360;
        }

        // Check if we should stop placement
        if (
            !metaBuilding.getStayInPlacementMode() &&
            !this.root.keyMapper.getBinding(
                KEYMAPPINGS.placementModifiers.placeMultiple
            ).pressed &&
            !this.root.app.settings.getAllSettings().alwaysMultiplace
        ) {
            // Stop placement
            this.currentMetaBuilding.set(null);
        }
        return true;
    } else {
        return false;
    }
}

export function onMouseMovePatch(
    this: HUDBuildingPlacerLogic,
    srcMethod: (pos: Vector) => string,
    [pos]: [Vector]
) {
    if (!this.buildingTweaks.settingsManager.keepBuildingInMapOverview) {
        return srcMethod.call(this);
    }

    // NOTE: Code mostly copy-pasted from vanilla follows

    // Check for direction lock
    if (this.isDirectionLockActive) {
        return;
    }

    const metaBuilding: MetaBuilding = this.currentMetaBuilding.get();
    if ((metaBuilding || this.currentlyDeleting) && this.lastDragTile) {
        const oldPos = this.lastDragTile;
        const newPos = this.root.camera.screenToWorld(pos).toTileSpace();

        // Check if camera is moving, since then we do nothing
        if (this.root.camera.desiredCenter) {
            this.lastDragTile = newPos;
            return;
        }

        // Check if anything changed
        if (!oldPos.equals(newPos)) {
            // Automatic Direction
            if (
                metaBuilding &&
                metaBuilding.getRotateAutomaticallyWhilePlacing(
                    this.currentVariant.get()
                ) &&
                !this.root.keyMapper.getBinding(
                    KEYMAPPINGS.placementModifiers
                        .placementDisableAutoOrientation
                ).pressed
            ) {
                const delta = newPos.sub(oldPos);
                const angleDeg = Math.degrees(delta.angle());
                this.currentBaseRotation =
                    (Math.round(angleDeg / 90) * 90 + 360) % 360;

                // Holding alt inverts the placement
                if (
                    this.root.keyMapper.getBinding(
                        KEYMAPPINGS.placementModifiers.placeInverse
                    ).pressed
                ) {
                    this.currentBaseRotation =
                        (180 + this.currentBaseRotation) % 360;
                }
            }

            // bresenham
            let x0 = oldPos.x;
            let y0 = oldPos.y;
            const x1 = newPos.x;
            const y1 = newPos.y;

            const dx = Math.abs(x1 - x0);
            const dy = Math.abs(y1 - y0);
            const sx = x0 < x1 ? 1 : -1;
            const sy = y0 < y1 ? 1 : -1;
            let err = dx - dy;

            let anythingPlaced = false;
            let anythingDeleted = false;

            while (this.currentlyDeleting || this.currentMetaBuilding.get()) {
                if (this.currentlyDeleting) {
                    // Deletion
                    const contents = this.root.map.getLayerContentXY(
                        x0,
                        y0,
                        this.root.currentLayer
                    );
                    if (
                        contents &&
                        !contents.queuedForDestroy &&
                        !contents.destroyed
                    ) {
                        if (this.root.logic.tryDeleteBuilding(contents)) {
                            anythingDeleted = true;
                        }
                    }
                } else {
                    // Placement
                    if (this.tryPlaceCurrentBuildingAt(new Vector(x0, y0))) {
                        anythingPlaced = true;
                    }
                }

                if (x0 === x1 && y0 === y1) break;
                const e2 = 2 * err;
                if (e2 > -dy) {
                    err -= dy;
                    x0 += sx;
                }
                if (e2 < dx) {
                    err += dx;
                    y0 += sy;
                }
            }

            if (anythingPlaced) {
                this.root.soundProxy.playUi(metaBuilding.getPlacementSound());
            }
            if (anythingDeleted) {
                this.root.soundProxy.playUi(SOUNDS.destroyBuilding);
            }
        }

        this.lastDragTile = newPos;
        return STOP_PROPAGATION;
    }
}

export function onMouseUpPatch(
    this: HUDBuildingPlacerLogic,
    srcMethod: () => void
) {
    if (!this.buildingTweaks.settingsManager.keepBuildingInMapOverview) {
        srcMethod.call(this);
        return;
    }

    // Unconditionally finish placement, be it belt planner or something else
    if (
        this.lastDragTile &&
        this.currentlyDragging &&
        this.isDirectionLockActive
    ) {
        this.executeDirectionLockedPlacement();
    }

    this.abortDragging();
}

export function drawPatch(
    this: HUDBuildingPlacer,
    srcMethod: (parameters: DrawParameters) => void,
    [parameters]: [DrawParameters]
) {
    if (
        this.buildingTweaks.settingsManager.keepBuildingInMapOverview &&
        this.root.camera.getIsMapOverlayActive() &&
        this.isDirectionLockActive
    ) {
        // Draw belt planner manually
        this.drawDirectionLock(parameters);
    }

    srcMethod.call(this, parameters);
}
