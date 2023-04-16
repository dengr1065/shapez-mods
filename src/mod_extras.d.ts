import { Mod } from "mods/mod";

declare global {
    const ModExtras: ModExtrasAPI;

    interface ModExtrasMetadata extends ModMetadata {
        extra?: {
            icon?: string;
            readme?: string;
            changelog?: Record<string, string[]>;
        };
    }
}

declare interface ModExtrasAPI {
    version: string;
    require(id: string, version: string = "*", optional: boolean = false): Mod;
    assertIsOfType<U, T>(value: U, type: T): U is T;
    isInteger(value: unknown): value is number;
    isIntegerInRange(
        value: unknown,
        min: number = -Infinity,
        max: number = Infinity
    ): value is number;
}

declare interface ModExtrasToggleButton {
    element: HTMLButtonElement;
    value: boolean;
    handler: () => void;
}
