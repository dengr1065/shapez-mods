import { Mod } from "mods/mod";
import { ModMetadata } from "mods/modloader";

declare global {
    const shapez = {};
    function registerMod(constructor: typeof Mod, metadata: ModMetadata);

    declare interface TypedSignal<T extends unknown[]> {
        add(receiver: (...args: T) => string | void, scope?: object);
        addToTop(receiver: (...args: T) => string | void, scope?: object);
        remove(receiver: (...args: T) => string | void);

        dispatch(...args: T): string | void;

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

declare module "core/config" {
    export namespace globalConfig {
        export const tileSize: 32;
    }
}
