import readme from "./README.md";
import icon from "./assets/icon.webp";
import { RateChanger } from "./mod";
import _metadata from "./mod.json";

const metadata = _metadata as unknown as ModExtrasMetadata;
metadata.extra.icon = icon;
metadata.extra.readme = readme;

registerMod(RateChanger, metadata);
