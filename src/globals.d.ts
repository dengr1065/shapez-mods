import { Mod } from "mods/mod";
import { ModMetadata } from "mods/modloader";

declare global {
    function registerMod(constructor: typeof Mod, metadata: ModMetadata);

    declare interface TypedSignal<T extends any[]> {
        add(
            receiver: (...args: T) => "STOP_PROPAGATION" | void,
            scope?: object
        );
        addToTop(
            receiver: (...args: T) => "STOP_PROPAGATION" | void,
            scope?: object
        );
        remove(receiver: (...args: T) => "STOP_PROPAGATION" | void);

        dispatch(...args: T): "STOP_PROPAGATION" | void;

        removeAll();
    }

    declare module "*.less" {
        const content: string;
        export default content;
    }

    declare module "*.css" {
        const content: string;
        export default content;
    }

    declare module "*.webp" {
        const content: string;
        export default content;
    }

    declare module "*.png" {
        const content: string;
        export default content;
    }

    declare module "*.svg" {
        const content: string;
        export default content;
    }

    declare module "*.woff2" {
        const content: string;
        export default content;
    }

    declare module "*.md" {
        const content: string;
        export default content;
    }
}
