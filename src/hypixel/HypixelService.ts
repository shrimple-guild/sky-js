import type { IHypixelClient } from "./IHypixelClient"
import { SkyblockProfiles } from "./structures/SkyblockProfiles"

export class HypixelService {
	private client: IHypixelClient

	constructor(client: IHypixelClient) {
		this.client = client
	}

	async getSkyblockProfiles(uuid: string): Promise<SkyblockProfiles | null> {
		const profiles = await this.client.getSkyblockProfiles(uuid)
		if (!profiles) return null
		return new SkyblockProfiles(uuid, profiles)
	}
	

}
