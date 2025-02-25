import { UUIDUtils } from "../../utils/UUIDUtils"
import type { ApiSkyblockProfile } from "../types/ApiSkyblockProfilesResponse"
import { SkyblockMember } from "./SkyblockMember"

export class SkyblockProfile {
	constructor(
		readonly uuid: string,
		readonly raw: ApiSkyblockProfile
	) {}

	getQueriedMember() {
		const rawMember = this.raw.members[UUIDUtils.compact(this.uuid)]
		if (rawMember == null) {
			throw Error(`Queried member ${this.uuid} is somehow not a member of profile ${this.getProfileId()}. Weird!`)
		}
		return new SkyblockMember(this, rawMember)
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

	getMemberUuids() {
		return Object.keys(this.raw.members)
	}

	getMembers(): Record<string, SkyblockMember> {
		const members: Record<string, SkyblockMember> = {}
		for (const uuid of this.getMemberUuids()) {
			members[uuid] = this.getMember(uuid)
		}
		return members
	}

	getMember(uuid: string) {
		const rawMember = this.raw.members[uuid]
		return new SkyblockMember(this, rawMember)
	}

	isSelected(): boolean {
		return this.raw.selected
	}

	getCollectionAmount(id: string): number {
		let amount = 0
		for (const member of Object.values(this.getMembers())) {
			amount += member.getCollection(id)
		}
		return amount
	}
}

