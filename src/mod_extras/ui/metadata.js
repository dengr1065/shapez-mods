import info from "../mod.json";
import { MOD_ID } from "../constants";
import icon from "../assets/icon.webp";
import changelog from "../changelog.json";
import readmeSource from "../README.md";

/**
 * @param {{}} object
 * @param {string[]} path
 */
function getNestedPropertyOf(object, path) {
    let current = object;
    while (path[0] && typeof current === "object") {
        current = current[path.shift()];
    }

    if (path.length > 0) {
        // One of path segments was not an object
        return undefined;
    }

    return current;
}

/**
 * Replaces placeholders such as {{name}} or {{extra.source}}
 * with values from metadata.
 * @param {string} text
 */
function replaceFromMetadata(text) {
    const placeholders = text.match(/{{.+?}}/g);

    for (const holder of placeholders) {
        const path = holder.slice(2, -2).split(".");
        const value = getNestedPropertyOf(info, path);

        if (value !== undefined) {
            text = text.replace(holder, value);
        }
    }

    return text;
}

info.id = MOD_ID;
info.extra.icon = icon;
info.extra.changelog = changelog;
info.extra.readme = replaceFromMetadata(readmeSource);

export default info;
