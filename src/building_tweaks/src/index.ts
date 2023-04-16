import changelog from "../changelog.json";
import icon from "../icon.webp";
import _metadata from "../mod.json";
import readme from "../README.md";
import { BuildingTweaks } from "./mod";
import { SettingsManager } from "./settings";

const metadata = _metadata as unknown as ModExtrasMetadata;
metadata.settings = SettingsManager.getDefaults();
metadata.extra.icon = icon;
metadata.extra.readme = readme;
metadata.extra.changelog = changelog;

registerMod(BuildingTweaks, metadata);
