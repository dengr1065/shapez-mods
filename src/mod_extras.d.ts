import { Mod } from "mods/mod";

declare global {
    const ModExtras: ModExtrasAPI;
}

declare interface ModExtrasAPI {
    version: string;
    require(id: string, version: string = "*", optional: boolean = false): Mod;
    assertIsOfType(value: any, type: any): boolean;
    isInteger(value: any): value is Number;
    isIntegerInRange(
        value: any,
        min: number = -Infinity,
        max: number = Infinity
    ): value is Number;
}
