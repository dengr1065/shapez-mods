import { modRequire } from "./mod_require";
import metadata from "./ui/metadata";

export const UTILS = {
    version: metadata.version,
    require: modRequire,
    assertIsOfType,
    isInteger,
    isIntegerInRange
};

function assertIsOfType(value, type) {
    const useTypeOf = typeof type === "string";
    if (useTypeOf ? typeof value === type : value instanceof type) {
        return;
    }

    const typeDesc = value.constructor?.name ?? typeof value;
    const targetTypeDesc = useTypeOf ? type : type.name;

    const message = `${value} (${typeDesc}) is not of type ${targetTypeDesc}!`;
    throw new Error(message);
}

function isInteger(value) {
    return typeof value === "number" && value === Math.floor(value);
}

function isIntegerInRange(value, min = -Infinity, max = Infinity) {
    if (!isInteger(value)) {
        return false;
    }

    return value <= max && value >= min;
}
