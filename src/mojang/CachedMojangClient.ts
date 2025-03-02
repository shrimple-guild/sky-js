import type { IMojangClient } from "./IMojangClient"
import type { MojangPlayer } from "./MojangPlayer"
import { MojangClient } from "./MojangClient"
import KeyvSqlite from "@keyv/sqlite"
import Keyv from "keyv"
import { UUIDUtils } from "../utils/UUIDUtils"

export class CachedMojangClient implements IMojangClient {
	private cache = new Keyv<MojangPlayer>({
		store: new KeyvSqlite("sqlite://data/mojang-cache.sqlite"),
		ttl: 1000 * 60 * 60,
		namespace: undefined
	})

	private client = new MojangClient()

	async getByName(name: string): Promise<MojangPlayer | null> {
		const nameKey = this.getNameKey(name)
		const cached = await this.cache.get(nameKey)
		if (cached) return cached

		const player = await this.client.getByName(name)
		if (!player) return null

		await this.cachePlayer(player)

		return player
	}

	async getByUuid(uuid: string): Promise<MojangPlayer | null> {
		const uuidKey = this.getUuidKey(uuid)
		const cached = await this.cache.get(uuidKey)
		if (cached) return cached

		const player = await this.client.getByUuid(uuid)
		if (!player) return null

		await this.cachePlayer(player)

		return player
	}

	async cachePlayer(player: MojangPlayer) {
		await Promise.all([
			this.cache.set(this.getUuidKey(player.uuid), player),
			this.cache.set(this.getNameKey(player.name), player)
		])
	}

	private getUuidKey(uuid: string) {
		return `uuid:${UUIDUtils.compact(uuid)}`
	}

	private getNameKey(name: string) {
		return `name:${name.toLowerCase()}`
	}
}
