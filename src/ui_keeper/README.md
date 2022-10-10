![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)

**UI Keeper** is a mod that saves your time when opening your savegame. It keeps
the visibility state of many HUD elements for each savegame and restores it
accordingly. Since 1.1.0, active layer is also preserved.

This mod can be safely added to older savegames and is completely safe to
remove.

### Usage

No action required: UI Keeper will _automatically_ save your layout when exiting
a savegame, and restore it when you enter the savegame again.

### Mod Compatibility

To support UI Keeper in your HUD elements, they should expose `visible` property
and implement `toggle` method. It's that simple!

### Configuration

By default, some elements (such as pause screen) are not saved because they
shouldn't be or cannot be restored. However, some mods can add HUD elements that
UI Keeper doesn't know about. If these elements should not be restored, you can
add their class names to the configuration file.
