import { TrackedState } from "core/tracked_state";

export class ArrayTrackedState extends TrackedState {
    set(array) {
        if (!this.equals(array)) {
            this.lastSeenValue = array;
            this.callback(array);
        }
    }

    equals(array) {
        if (this.lastSeenValue == undefined) {
            return false;
        }

        if (this.lastSeenValue.length !== array.length) {
            return false;
        }

        for (let i = 0; i < array.length; i++) {
            if (this.lastSeenValue[i] !== array[i]) {
                // at least one element differs
                return false;
            }
        }

        return true;
    }
}
