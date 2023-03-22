import { createLogger } from "core/logging";
import { Mod } from "mods/mod";
import blueprintSprite from "./blueprint.webp";
import { BreakpointBuilding, BREAKPOINT_BUILDING_ID } from "./building";
import buildingSprite from "./building.webp";
import { BreakpointComponent } from "./component";
import { getPauseAndStep } from "./pause_and_step";
import { BreakpointSystem } from "./system";
import toolbarIcon from "./toolbar.webp";

export class Breakpoint extends Mod {
    logger = createLogger(this);

    init() {
        this.modInterface.registerNewBuilding({
            metaClass: BreakpointBuilding
        });
        this.modInterface.registerComponent(BreakpointComponent);
        this.modInterface.registerGameSystem({
            id: `${this.metadata.id}:Breakpoint`,
            systemClass: BreakpointSystem,
            before: "end"
        });

        this.modInterface.registerSprite(
            `sprites/buildings/${BREAKPOINT_BUILDING_ID}.png`,
            buildingSprite
        );
        this.modInterface.registerSprite(
            `sprites/blueprints/${BREAKPOINT_BUILDING_ID}.png`,
            blueprintSprite
        );

        this.modInterface.setBuildingToolbarIcon(
            BREAKPOINT_BUILDING_ID,
            toolbarIcon
        );
        this.signals.appBooted.add(this.addToToolbar.bind(this));
    }

    addToToolbar() {
        if (getPauseAndStep() === undefined) {
            this.logger.error("Pause and Step is not installed!");
            this.dialogs.showWarning(
                "Missing Dependency",
                "Breakpoint requires Pause and Step to function."
            );
            return;
        }

        this.modInterface.addNewBuildingToToolbar({
            toolbar: "wires",
            location: "secondary",
            metaClass: BreakpointBuilding
        });
    }
}
