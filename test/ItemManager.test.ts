import { describe, it, expect } from "bun:test";
import { ItemService } from "../src/hypixel/data/ItemService";

const dataDir = Bun.env["SKYJS_DATA_DIR"]!!

describe("ItemManager", () => {
    it("should load items and get the display name of God Potion", async () => {
        const manager = new ItemService(`${dataDir}/repo/neu/items`)
        await manager.loadItems()
        const name = manager.getDisplayName("GOD_POTION")
        expect(name).toBe("God Potion")
    });

    it("should return backup name for nonexistent name", async () => {
        const manager = new ItemService(`${dataDir}/repo/neu/items`)
        await manager.loadItems()
        const name = manager.getDisplayName("NON_EXISTENT_ITEM")
        expect(name).toBe("Non Existent Item")
    });
});
