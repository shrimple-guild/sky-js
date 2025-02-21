import type { ApiSkyblockMember } from "../types/ApiSkyblockProfilesResponse"

export class SkyblockMember {
	constructor(readonly raw: ApiSkyblockMember) {}

	getSkyblockExperience() {
		return this.raw?.leveling?.experience ?? 0
	}

    getSkyblockLevel() {
        return this.getSkyblockExperience() / 100
    }

    isSkillsApiEnabled() {
        return this.raw.player_data?.experience != null
    }

    isCollectionsApiEnabled() {
        return this.raw.collection != null
    }

    getFarmingLevelCap() {
        return (this.raw.jacobs_contest?.perks?.farming_level_cap ?? 0) + 50
    }

    getTamingLevelCap() {
        return (this.raw.pets_data?.pet_care?.pet_types_sacrificed?.length ?? 0) + 50
    }

    getSkillXp(name: string) {
        return this.raw.player_data?.experience?.[`SKILL_${name.toUpperCase()}`] ?? 0
    }

    getBestiaryKills(mob: string): number {
        return this.raw.bestiary?.kills?.[mob] ?? 0
    }

    getBestiaryDeaths(mob: string): number {
        return this.raw.bestiary?.deaths?.[mob] ?? 0
    }

    getSlayerXp(slayer: string) {
        return this.raw.slayer?.slayer_bosses?.[slayer]?.xp ?? 0
    }

    getSlayerBossKills(slayer: string, tier: number) {
        return this.raw.slayer?.slayer_bosses?.[slayer]?.[`boss_kills_tier_${tier - 1}`] ?? 0
    }
}
