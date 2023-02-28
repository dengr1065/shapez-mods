import { NodeSpammer } from "./mod";
import _metadata from "./mod.json";

const metadata = _metadata as unknown as ModExtrasMetadata;
registerMod(NodeSpammer, metadata);
