import { Component } from "game/component";
import { types } from "savegame/serialization";
import metadata from "./mod.json";

export const BREAKPOINT_COMPONENT_ID = `${metadata.id}:Breakpoint`;

export class BreakpointComponent extends Component {
    wasTruthy: boolean;

    constructor({ wasTruthy = false }) {
        super();
        this.wasTruthy = wasTruthy;
    }

    static getId() {
        return BREAKPOINT_COMPONENT_ID;
    }

    static getSchema() {
        return {
            wasTruthy: types.bool
        };
    }
}
