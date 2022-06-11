import { Mod } from "mods/mod";

declare type FixFunction = (this: Mod) => void;

declare global {
    declare type Fix = {
        id: string;
        affectsSavegame?: boolean;
        enable: FixFunction;
        disable: FixFunction;
        name?: string;
        author?: string;
        /** Used for reverse lookup, don't set this! */
        _mod: Mod;
    };
}
