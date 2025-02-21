import { UUIDUtils } from "../utils/UUIDUtils"
import { CachedMojangClient } from "./CachedMojangClient"
import type { IMojangService } from "./IMojangService"
import type { MojangPlayer } from "./MojangPlayer"

/**
 * Retrieves Mojang player information based on either UUID or username. All Mojang API requests are cached.
 */
export class MojangService implements IMojangService {
	private usernamePattern = /^[a-zA-Z0-9_]{3,16}$/
	private client: CachedMojangClient

	constructor() {
		this.client = new CachedMojangClient()
	}

	/**
	 * Retrieves Mojang player information based on the provided query.
	 * The query can be either a UUID or a username.
	 *
	 * @param query - The UUID or username to search for.
	 * @returns A promise that resolves to a `MojangPlayer` object or null if not found.
	 */
	async get(query: string): Promise<MojangPlayer | null> {
		if (UUIDUtils.isValid(query)) {
			return this.client.getByUuid(query)
		}

		if (this.isValidUsername(query)) {
			return this.client.getByName(query)
		}

		return null
	}

	private isValidUsername(username: string): boolean {
		return this.usernamePattern.test(username)
	}
}
