import { FuzzySearch } from "../../utils/FuzzySearch"
import { SkyblockMember } from "../structures/SkyblockMember"
import type { NeuLevelingJson } from "../types/NeuLevelingJson"
import { Level, type LevelData } from "../utils/Level"
import type { ConstantManager } from "./ConstantManager"

export class SlayerData {
	private slayerLevels: Record<string, Level>
	private slayerHighestTier: Record<string, number>

	private static searcher = new FuzzySearch<string>(
		{ names: ["revenant horror", "zombie"], result: "zombie" },
		{ names: ["tarantula broodfather", "spider"], result: "spider" },
		{ names: ["sven packmaster", "wolf", "woof"], result: "wolf" },
		{ names: ["voidgloom seraph", "enderman"], result: "enderman" },
		{ names: ["inferno demonlord", "blaze"], result: "blaze" },
		{ names: ["riftstalker bloodfiend", "vampire"], result: "vampire" }
	)

	constructor(repo: ConstantManager) {
		this.slayerLevels = {}
		this.slayerHighestTier = {}
		repo.onReload((repo) => this.update(repo))
	}

	async update(repo: ConstantManager) {
		const data = repo.getConstant<NeuLevelingJson>("leveling")

		for (const [slayer, curve] of Object.entries(data.slayer_xp)) {
			this.slayerLevels[slayer] = Level.fromCumulative(curve)
		}

		this.slayerHighestTier = data.slayer_to_highest_tier
	}

	getSlayerNames() {
		return Object.keys(this.slayerHighestTier)
	}

	getSlayerResult(member: SkyblockMember, name: string): SlayerResult {
		const xp = member.getSlayerXp(name)
		const level = this.slayerLevels[name].for(xp).getLevelData()
		const tierKills: number[] = []
		for (let i = 1; i <= this.slayerHighestTier[name]; i++) {
			tierKills.push(member.getSlayerBossKills(name, i))
		}
		return { name, level, tierKills }
	}

	getAllSlayers(member: SkyblockMember): Record<string, SlayerResult> {
		const slayers: Record<string, SlayerResult> = {}
		for (const name of this.getSlayerNames()) {
			slayers[name] = this.getSlayerResult(member, name)
		}
		return slayers
	}
}

type SlayerResult = {
	name: string
	level: LevelData
	tierKills: number[]
}
