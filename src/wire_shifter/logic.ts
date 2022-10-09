import { MetaWireBuilding } from "game/buildings/wire";
import { StaticMapEntityComponent } from "game/components/static_map_entity";
import { Entity } from "game/entity";
import { HUDMassSelector } from "game/hud/parts/mass_selector";
import { GameRoot } from "game/root";
import { WireShifter } from "./mod";

function getMassSelector(root: GameRoot) {
    if (!("massSelector" in root.hud.parts)) {
        // Can't select in current game mode
        return null;
    }

    const massSelector: HUDMassSelector = root.hud.parts["massSelector"];
    return massSelector;
}

function isWireEntity(entity: Entity) {
    const staticComp = entity.components.StaticMapEntity;
    if (staticComp === undefined) {
        // Some sort of custom (non-building) entity
        return false;
    }

    return staticComp.getMetaBuilding() instanceof MetaWireBuilding;
}

/**
 * Returns an array of selected entities that are wires.
 */
function getSelectedWires(massSelector: HUDMassSelector) {
    const entityMap = massSelector.root.entityMgr.getFrozenUidSearchMap();
    const entityIds = [...massSelector.selectedUids];

    return entityIds.map((id) => entityMap.get(id)).filter(isWireEntity);
}

function getNextVariantFor(
    staticComp: StaticMapEntityComponent,
    root: GameRoot
) {
    const metaBuilding: MetaWireBuilding = staticComp.getMetaBuilding();
    const allVariants = metaBuilding.getAvailableVariants(root);
    const current = staticComp.getVariant();

    // When holding reverse rotation key (usually SHIFT), use previous one
    const reverseKey = root.keyMapper.getBindingById("rotateInverseModifier");
    const direction = reverseKey.pressed ? -1 : 1;

    return allVariants.at(
        (allVariants.indexOf(current) + direction) % allVariants.length
    );
}

/**
 * Actual work is being done here.
 */
function replaceWires(selector: HUDMassSelector, wireEntities: Entity[]) {
    const root = selector.root;

    for (const wire of wireEntities) {
        selector.selectedUids.delete(wire.uid);
        root.logic.tryDeleteBuilding(wire);

        const staticComp = wire.components.StaticMapEntity;
        const nextVariant = getNextVariantFor(staticComp, root);

        const newEntity = root.logic.tryPlaceBuilding({
            building: staticComp.getMetaBuilding(),
            origin: staticComp.origin.copy(),
            rotation: staticComp.rotation,
            originalRotation: staticComp.originalRotation,
            variant: nextVariant,
            rotationVariant: staticComp.getRotationVariant()
        });

        selector.selectedUids.add(newEntity.uid);
    }
}

/**
 * The keybinding handler, checks some conditions and calls replaceWires
 * as a bulk operation.
 */
export function shiftWireColors(this: WireShifter, root: GameRoot) {
    const massSelector = getMassSelector(root);
    if (massSelector === null) {
        this.logger.log("Mass Selector is not available.");
        return;
    }

    if (!massSelector.selectedUids?.size) {
        this.logger.log("Nothing is currently selected.");
        return;
    }

    const wireEntities = getSelectedWires(massSelector);
    if (wireEntities.length == 0) {
        this.logger.log("No wires in selection.");
        return;
    }

    root.logic.performBulkOperation(
        replaceWires.bind(this, massSelector, wireEntities)
    );
}
