import { Mod } from "mods/mod";
import { ModMetadata } from "mods/modloader";

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
    assertIsOfType(value: any, type: any): boolean;
    isInteger(value: any): value is number;
    isIntegerInRange(
        value: any,
        min: number = -Infinity,
        max: number = Infinity
    ): value is number;
}
