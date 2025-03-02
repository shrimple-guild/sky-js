import Keyv from "keyv"
import KeyvSqlite from "@keyv/sqlite"
import type { IHypixelClient } from "./IHypixelClient"
import type { ApiSkyblockProfile } from "./types/ApiSkyblockProfilesResponse"
import type { ApiSkyblockCollections } from "./types/ApiSkyblockCollections"
import type { ApiBazaarResponse } from "./types/ApiSkyblockBazaar"
import { UUIDUtils } from "../utils/UUIDUtils"

export class CachedHypixelClient implements IHypixelClient {
	private cache = new Keyv({
		store: new KeyvSqlite("sqlite://data/hypixel-cache.sqlite"),
		ttl: 1000 * 3 * 60,
		namespace: undefined
	})

	private client: IHypixelClient

	constructor(client: IHypixelClient) {
		this.client = client
	}

	async getSkyblockProfiles(uuid: string): Promise<ApiSkyblockProfile[] | null> {
		const cacheKey = `profiles:${UUIDUtils.compact(uuid)}`
		const cached = await this.cache.get(cacheKey)
		if (cached) return cached

		const profiles = await this.client.getSkyblockProfiles(uuid)
		if (!profiles) return null

		await this.cache.set(cacheKey, profiles)
		return profiles
	}

	async getSkyblockCollections(): Promise<ApiSkyblockCollections> {
		return this.client.getSkyblockCollections()
	}

	async getSkyblockBazaar(): Promise<ApiBazaarResponse> {
		return this.client.getSkyblockBazaar()
	}
}
