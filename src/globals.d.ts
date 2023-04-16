import { Mod } from "mods/mod";

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

    declare interface ModMetadata {
        // Upstream ModMetadata is defined incorrectly
        name: string;
        version: string;
        author: string;
        website: string;
        description: string;
        id: string;
        minimumGameVersion?: string;
        settings: object;
        doesNotAffectSavegame?: boolean;
    }

    declare interface Math {
        degrees(rad: number): number;
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
        export const mapChunkSize: 16;
    }
}

declare module "game/key_action_mapper" {
    export namespace KEYMAPPINGS {
        export namespace placementModifiers {
            export const placeMultiple = {
                keyCode: number
            };
            export const placementDisableAutoOrientation = {
                keyCode: number
            };
            export const placeInverse = {
                keyCode: number
            };
            export const lockBeltDirection = {
                keyCode: number
            };
        }
    }
}
