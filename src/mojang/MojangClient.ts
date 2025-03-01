import { HTTPException } from "hono/http-exception"
import type { IMojangClient } from "./IMojangClient"
import type { MojangPlayer } from "./MojangPlayer"
import { UUIDUtils } from "../utils/UUIDUtils"

export class MojangClient implements IMojangClient {
	async getByName(username: string): Promise<MojangPlayer | null> {
		const response = await fetch(`https://api.mojang.com/users/profiles/minecraft/${username}`)
		if (response.status == 200) {
			const player = (await response.json()) as ApiMojangPlayer
			return this.getMojangPlayer(player)
		} else if (response.status == 404) {
			return null
		} else {
			throw new HTTPException(500, { message: `Mojang returned ${response.status} ${response.statusText}` })
		}
	}

	async getByUuid(uuid: string): Promise<MojangPlayer | null> {
		const response = await fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`)
		if (response.status == 200) {
			const player = (await response.json()) as ApiMojangPlayer
			return this.getMojangPlayer(player)
		} else if (response.status == 204) {
			return null
		} else {
			throw new HTTPException(500, { message: `Mojang returned ${response.status} ${response.statusText}` })
		}
	}

	private getMojangPlayer(player: { name: string; id: string }): MojangPlayer {
		return { uuid: UUIDUtils.standard(player.id), name: player.name }
	}
}

interface ApiMojangPlayer {
	name: string
	id: string
}
