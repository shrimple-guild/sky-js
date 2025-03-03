import type { SkyblockMember } from "../structures/SkyblockMember"
import type { NeuLevelingJson } from "../types/NeuLevelingJson"
import { Level } from "../utils/Level"
import type { ConstantManager } from "./ConstantManager"

export class DungeonsData {
	private dungeonLevel: Level

	constructor(repo: ConstantManager) {
		this.dungeonLevel = Level.fromCumulative([50])
		repo.onReload((repo) => this.update(repo))
	}

	private update(repo: ConstantManager) {
		const data = repo.getConstant<NeuLevelingJson>("leveling")
		data.catacombs
	}

	getAllDungeons(member: SkyblockMember) {
		const general = {
			level: this.getDungeonLevelData(member.getDungeonXp()),
			secrets: member.getDungeonSecrets()
		}
		const floors = this.getAllFloors(member)
		const classes = {
			healer: member.getDungeonClassXp("healer"),
			berserk: member.getDungeonClassXp("berserk"),
			tank: member.getDungeonClassXp("tank"),
			archer: member.getDungeonClassXp("archer"),
			mage: member.getDungeonClassXp("mage")
		}
		return { general, floors, classes }
	}

	private getAllFloors(member: SkyblockMember) {
		const floors = []
		for (let i = 0; i <= 7; i++) {
			floors.push(this.getDungeonFloor(member, "catacombs", i))
		}
		for (let i = 1; i <= 7; i++) {
			floors.push(this.getDungeonFloor(member, "master_catacombs", i))
		}
		return floors
	}

	private getDungeonFloor(member: SkyblockMember, mode: "catacombs" | "master_catacombs", floor: number) {
		const data = member.getDungeonData(mode, floor)
		const modeAbbreviation = mode == "catacombs" ? "F" : "M"
		const isEntrance = mode == "catacombs" && floor == 0
		const shortName = isEntrance ? "E" : `${modeAbbreviation}${floor}`
		return {
			mode,
			floor,
			shortName,
			fastestTimes: {
				any: data?.fastestTime,
				s: data?.fastestTimeS,
				sPlus: data?.fastestTimeSPlus
			},
			completions: data?.tierCompletions ?? 0
		}
	}

	private getDungeonLevelData(xp: number) {
		const level = this.dungeonLevel.for(xp)
		return {
			xp: level.getTotalXp(),
			level: level.getLevel(),
			levelXp: level.getLevelXp(),
			currentXp: level.getCurrentXp()
		}
	}
}
