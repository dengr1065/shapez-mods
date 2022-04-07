const { valid } = require("semver");
const { defaultAuthor, website, source } = require("./config.json");
const authorsData = require("./authors.json");

function validateMod(metadata) {
    const properties = {
        entry: "string",
        name: "string",
        description: "string",
        version: "string",
        id: "string"
    };

    for (const [property, type] of Object.entries(properties)) {
        if (typeof metadata[property] !== type) {
            throw new Error(`"${property}" must be a ${type}`);
        }
    }

    if (valid(metadata.version) == null) {
        throw new Error("Invalid version specified");
    }

    return metadata;
}

function unwrapExtras(metadata) {
    metadata.website ??= website;
    metadata.extra ??= {};
    metadata.extra.source = source;

    const authors = metadata.extra?.authors ?? [];
    if (authors.length == 0) {
        authors.push(defaultAuthor);
    }

    for (let i = 0; i < authors.length; i++) {
        authors[i] = authorsData[authors[i]] ?? authors[i];
    }

    if (!metadata.author) {
        let authorsText = authors
            .map((author) => author.name ?? author)
            .join(", ");

        metadata.author = authorsText;
    }
}

function getBanner(metadata) {
    return [
        "Name: " + metadata.name,
        "Description: " + metadata.description,
        "Version: " + metadata.version,
        "Mod authored by " + metadata.author
    ].join("\n");
}

module.exports = { validateMod, unwrapExtras, getBanner };
