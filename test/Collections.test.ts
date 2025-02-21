import { expect, test } from "bun:test";
import { IHypixelClient } from "../src/hypixel/IHypixelClient";
import { ApiSkyblockCollections } from "../src/hypixel/types/ApiSkyblockCollections";
import collectionResponse from "../test/api-collections.json"
import { Collections } from "../src/hypixel/utils/Collections";

const client: IHypixelClient = {
    getSkyblockProfiles: (uuid: string) => {
        throw new Error();
    },

    getSkyblockCollections: () => {
        const collections: ApiSkyblockCollections = collectionResponse
        return Promise.resolve(collections)
    }
}

test("gets a valid collection", async () => {
    const collections = await Collections.initialize(client)
    const carrotCollection = collections.getCollection("CARROT_ITEM")
    expect(carrotCollection).not.toBeUndefined()
    expect(carrotCollection!.id).toBe("CARROT_ITEM")
    expect(carrotCollection!.name).toBe("Carrot")
    expect(carrotCollection!.collection.getLevelData(1000).level).toBe(3)
});