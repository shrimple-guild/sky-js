import { UUIDUtils } from "../../utils/UUIDUtils"
import type { ApiSkyblockProfile } from "../types/ApiSkyblockProfilesResponse"
import { SkyblockMember } from "./SkyblockMember"

export class SkyblockProfile {
	constructor(
		readonly uuid: string,
		readonly raw: ApiSkyblockProfile
	) {}

	getQueriedMember() {
		const raw = this.raw.members[UUIDUtils.compact(this.uuid)]
		if (raw == null) {
			throw Error(`Queried member ${this.uuid} is somehow not a member of profile ${this.getProfileId()}. Weird!`)
		}
		return new SkyblockMember(raw)
	}

	getGamemode(): string {
		return this.raw.game_mode ?? "classic"
	}

	getName(): string {
		return this.raw.cute_name
	}

	getProfileId(): string {
		const uuid = this.raw.profile_id
		return uuid
	}

	getMembers() {
		return Object.keys(this.raw.members)
	}

	isSelected(): boolean {
		return this.raw.selected
	}
}
