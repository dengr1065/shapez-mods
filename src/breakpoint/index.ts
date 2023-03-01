import icon from "./building.webp";
import { Breakpoint } from "./mod";
import _metadata from "./mod.json";

const metadata = _metadata as unknown as ModExtrasMetadata;
metadata.extra.icon = icon;

registerMod(Breakpoint, metadata);
