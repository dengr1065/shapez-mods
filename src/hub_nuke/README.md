![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)

**Hub Nuke** lets you remove irrelevant shapes from your Hub, keeping your stats
tab clean and improving game performance. The mod adds a keybinding that you can
use to trigger removal process. By default you can clean your Hub using
<kbd>CTRL</kbd> + <kbd>F9</kbd>, but this can be changed in game settings.

**There is no confirmation.** As soon as you press <kbd>CTRL</kbd> +
<kbd>F9</kbd> everything except level(s), upgrades, blueprint shape and shape
keys you want to preserve will be removed from your Hub.

Hub Nuke can also preserve shapes from past levels if you want to, but this
functionality requires [**Zeitgeist**](https://skimnerphi.net/mods/zeitgeist/)
to be installed. Otherwise, only shapes for the current goal will be preserved.

Other mods are generally supported, including those that add custom game modes.
However, shapes for custom systems (such as "Research") will not be preserved
out of the box. If you wish to keep some shape keys, you can press
<kbd>CTRL</kbd> + <kbd>ALT</kbd> + <kbd>F9</kbd> or add them to the
configuration file.

The configuration file is provided by shapez, and can be found in `saves/`
directory. You can also change whether blueprint and upgrade shapes are
preserved, as well as choose how many levels you want to keep (if Zeitgeist is
installed).

<style>
.modReadme {
    font-family: serif;
    background: #efe0e0;
    color: #222222;
    padding: 0.5em;
    border-radius: 0.3em;
}

.modReadme p a {
    color: #223f7f !important;
}

.modReadme p {
    margin: 0.8em 0 !important;
}

.modReadme kbd {
    font-family: inherit;
    font-size: 90%;
    padding: 0.1em;
    background: #00000010;
    border: 0.02em solid #00000020;
    border-radius: 0.2em;
    box-shadow: 0 -0.1em 0 0 #00000020 inset;
}
</style>
