import { GameRoot } from "game/root";

type Upgrade = {
    required: { shape: string; amount: number }[];
    excludePrevious?: boolean;
};

export function getAllUpgradeKeys(root: GameRoot): Set<string> {
    const upgrades = root.gameMode.getUpgrades();
    const keys: string[] = [];

    for (const upgradeType in upgrades) {
        const upgradePath: Upgrade[] = upgrades[upgradeType];

        for (const { required } of upgradePath) {
            const upgradeKeys = required.map((r) => r.shape);
            keys.push(...upgradeKeys);
        }
    }

    // Use a Set to deduplicate the keys
    return new Set(keys);
}
