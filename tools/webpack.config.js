/* eslint-disable */
const { readFileSync } = require("fs");
const { resolve } = require("path");
const { BannerPlugin, DefinePlugin } = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");
const { resolveEntries, modsMetadata } = require("./entry_resolver");
const { getBanner } = require("./mod_utils");

const cssLoaders = ["to-string-loader", "css-loader"];

const isDev = process.env.NODE_ENV !== "production";
const buildDir = isDev ? "." : "prod";

const config = {
    entry: resolveEntries(),
    output: {
        path: resolve("./build/", buildDir),
        filename: "[name].mod.js"
    },
    module: {
        rules: [
            { test: /mod\.json$/, use: ["./tools/extras_loader"] },
            { test: /\.less$/, use: [...cssLoaders, "less-loader"] },
            { test: /\.css$/, use: cssLoaders },
            { test: /\.(webp|png|svg|woff2)$/, type: "asset/inline" },
            { test: /\.md$/, use: ["html-loader", "markdown-loader"] },
            {
                test: /\.ts$/,
                use: ["ts-loader"],
                exclude: /node_modules/
            }
        ]
    },
    optimization: {
        minimize: !isDev,
        minimizer: [
            new TerserPlugin({
                extractComments: false
            })
        ]
    },
    resolve: {
        extensions: [".js", ".ts"]
    },
    plugins: [
        new BannerPlugin(({ chunk }) => getBanner(modsMetadata[chunk.name])),
        new DefinePlugin({ registerMod: "window.$shapez_registerMod" })
    ]
};

try {
    const types = readFileSync("./types.d.ts", "utf-8");
    const modules = types
        .split(/declare\smodule\s"/gm)
        .map((m) => m.slice(0, m.indexOf('"')))
        .join("|");

    // This regex is still incomplete. I will try to improve it
    // next time it fails.
    const regex = new RegExp(
        `import\\s{([\\w\\d\\s,]*?)}\\sfrom\\s"(${modules})";`,
        "gms"
    );

    // Used for JS and TS->JS
    const shapezLoader = {
        loader: "string-replace-loader",
        options: {
            search: regex,
            replace: (_, imports) => `const {${imports}} = shapez;`
        }
    };

    // New rule for JS
    config.module.rules.push({
        test: /\.js$/,
        exclude: /node_modules/,
        ...shapezLoader
    });

    // Second loader for TS->JS
    config.module.rules[5].use.unshift(shapezLoader);
} catch {
    console.warn("Failed to find types.d.ts, imports won't be mapped.");
}

module.exports = config;
