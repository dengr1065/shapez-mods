// Loader which unwraps supported mod extras data
// As a side effect, the JSON data gets minified :)

const { unwrapExtras } = require("./mod_utils");

module.exports = (json) => {
    const metadata = JSON.parse(json);
    unwrapExtras(metadata);

    return JSON.stringify(metadata);
};
