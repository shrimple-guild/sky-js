import type { ApiSkyblockProfile } from "../types/ApiSkyblockProfilesResponse"
import { SkyblockProfile } from "./SkyblockProfile"

export class SkyblockProfiles {
	private readonly profiles: SkyblockProfile[]

	constructor(
		private uuid: string,
		profiles: ApiSkyblockProfile[]
	) {
		this.profiles = profiles?.map((profile) => new SkyblockProfile(this.uuid, profile))
	}

	getSelectedProfile(): SkyblockProfile {
		const profile = this.profiles.find((profile) => profile.isSelected())
		if (!profile) throw new Error("No profile selected. Weird!")
		return profile
	}

	getMainProfile(): SkyblockProfile {
		let mainProfile = this.profiles[0]
		for (const profile of this.profiles) {
			if (profile.getQueriedMember().getSkyblockExperience() > mainProfile.getQueriedMember().getSkyblockExperience()) {
				mainProfile = profile
			}
		}
		return mainProfile
	}

	getBingoProfile(): SkyblockProfile {
		const profile = this.profiles.find((profile) => profile.getGamemode() == "bingo")
		if (!profile) throw new Error("No Bingo profile found.")
		return profile
	}

	getByCuteName(name: string): SkyblockProfile {
		const profile = this.profiles.find((profile) => profile.getName().toLowerCase() == name.toLowerCase())
		if (!profile) throw new Error(`No profile with name ${name} found.`)
		return profile
	}

	getByQuery(query: string): SkyblockProfile {
		switch (query.toLowerCase()) {
			case "main":
				return this.getMainProfile()
			case "selected":
				return this.getSelectedProfile()
			case "bingo":
				return this.getBingoProfile()
			default:
				return this.getByCuteName(query)
		}
	}
}
