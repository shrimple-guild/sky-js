import trophyFishConstants from "../../constants/trophyfish.json"
import { FuzzySearch } from "../../utils/FuzzySearch"
import type { SkyblockMember } from "../structures/SkyblockMember"

export class TrophyFishData {
	private fuzzySearch: FuzzySearch<{ api: string; display: string }>

	constructor() {
		this.fuzzySearch = new FuzzySearch()
		for (const fish of trophyFishConstants) {
			this.fuzzySearch.add({ names: [fish.display], result: fish })
		}
	}

	private getTrophyFish(member: SkyblockMember, fish: { api: string; display: string }): TrophyFish {
		const bronze = member.getTrophyFish(fish.api, "bronze")
		const silver = member.getTrophyFish(fish.api, "silver")
		const gold = member.getTrophyFish(fish.api, "gold")
		const diamond = member.getTrophyFish(fish.api, "diamond")
		const total = bronze + silver + gold + diamond
		return {
			apiName: fish.api,
			displayName: fish.display,
			count: total,
			tiers: { bronze, silver, gold, diamond }
		}
	}

	searchTrophyFish(member: SkyblockMember, query: string): TrophyFish | null {
		const fish = this.fuzzySearch.search(query)
		if (!fish) return null
		return this.getTrophyFish(member, fish)
	}

	getAllTrophyFish(member: SkyblockMember) {
		const trophyFish: Record<string, TrophyFish> = {}
		for (const fish of trophyFishConstants) {
			trophyFish[fish.api] = this.getTrophyFish(member, fish)
		}
		return trophyFish
	}
}

type TrophyFish = {
	apiName: string
	displayName: string
	count: number
	tiers: {
		bronze: number
		silver: number
		gold: number
		diamond: number
	}
}
