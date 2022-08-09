# shapez-mods

A personalized environment for [shapez] mod development with [Mod
Extras][mod-extras] support. Made possible thanks to [webpack] and a bunch of
random hacks.

This repository also includes mods I've made. If you just want to play with
them, download them [here][skimnerphi].

[shapez]: https://github.com/tobspr/shapez.io
[mod-extras]: https://skimnerphi.net/mods/mod_extras/
[webpack]: https://webpack.js.org
[skimnerphi]: https://skimnerphi.net/

## Build

```bash
yarn # install dependencies
yarn build # or 'yarn watch' for development
```

Note that production builds are located in a subdirectory.

## Workflow

The environment is designed to work on multiple mods at the same time. Typings
(`types.d.ts`) can be used to make development faster and replace import
statements with `shapez` destructuring.

To generate typings, execute this command in the shapez repository:

```bash
yarn tsc src/js/application.js --declaration --allowJs --emitDeclarationOnly --skipLibCheck --out types.js
```

…and copy the generated file to the root directory of environment.

For now, the environment only provides tools to aid mod development, testing and
deployment is not covered. As the goal is to stay simple, some features are not
provided out of the box or considered pointless:

-   Automated mod registry
-   Sprite asset loading and atlas stitching
-   SCSS/Sass with shapez functions and mixins
-   External YAML translation loader

Some of these may be added in the future.

### `config.json` and `authors.json`

**Warning: Mod IDs are prefixed with the ID of first author.** Design your mods
with this in mind.

In order to reduce metadata duplication, common properties may be shared between
mods. Authors must be specified in Mod Extras format only, vanilla metadata will
be generated automatically. Website for all mods can be defined in
`config.json`, and `defaultAuthor` is used to allow omitting authors entirely.
`authors.json` should contain information about all "known" authors - their
display name, icon (optional) and e-mail (also optional).

### Testing

It's possible to make use of `--load-mod` and symlinks. This only works for
builds without Steam integration.

```bash
$ pwd
/shapez-mods
$ ln -s ../shapez-build/shapezio .
$ ./shapezio --load-mod="build/mod_extras.mod.js,build/microsandbox.mod.js"
```
