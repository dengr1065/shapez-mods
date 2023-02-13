import changelog from "./changelog.json";
import icon from "./icon.webp";
import { HubNuke } from "./mod";
import _metadata from "./mod.json";
import readme from "./README.md";

const metadata = _metadata as unknown as ModExtrasMetadata;
metadata.extra.icon = icon;
metadata.extra.readme = readme;
metadata.extra.changelog = changelog;

registerMod(HubNuke, metadata);
