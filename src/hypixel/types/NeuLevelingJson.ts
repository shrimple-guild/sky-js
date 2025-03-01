export interface NeuLevelingJson {
	leveling_xp: number[]
	leveling_caps: Record<string, number>
	runecrafting_xp: number[]
	slayer_xp: Record<string, number[]>
	slayer_to_highest_tier: Record<string, number>
	social: number[]
}
