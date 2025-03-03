import { FuzzySearch } from "../../utils/FuzzySearch"
import { TextUtils } from "../../utils/TextUtils"
import { SkyblockMember } from "../structures/SkyblockMember"
import type { NeuBestiaryJson, NeuFamilyData } from "../types/NeuBestiaryJson"
import { Level } from "../utils/Level"
import type { NeuRepoManager } from "./NeuRepoManager"

type BestiaryFamily = {
	name: string
	mobs: string[]
	curve: Level
	categories: string[]
}

type CategoryData = {
	categories: string[]
	families: NeuFamilyData[]
}

export class BestiaryData {
	private families: BestiaryFamily[]
	private searcher: FuzzySearch<BestiarySearchResult>

	constructor(repo: NeuRepoManager) {
		this.families = []
		this.searcher = new FuzzySearch()
		repo.onReload((repo) => this.update(repo))
	}

	private update(repo: NeuRepoManager) {
		const { brackets, ...categories } = repo.getConstant<NeuBestiaryJson>("bestiary")

		const bracketLevels: Record<string, Level> = {}

		for (const [bracket, tiers] of Object.entries(brackets)) {
			bracketLevels[bracket] = Level.fromCumulative(tiers)
		}

		const flattenedCategories: CategoryData[] = []

		for (const category of Object.values(categories)) {
			if (category.hasSubcategories) {
				const { hasSubcategories, name, icon, ...subcategories } = category
				for (const sub of Object.values(subcategories)) {
					flattenedCategories.push({
						categories: [category.name, sub.name],
						families: sub.mobs
					})
				}
			} else {
				flattenedCategories.push({
					categories: [category.name],
					families: category.mobs
				})
			}
		}

		const flattenedFamilies: BestiaryFamily[] = []

		for (const category of flattenedCategories) {
			for (const family of category.families) {
				flattenedFamilies.push({
					name: TextUtils.removeFormatting(family.name),
					mobs: family.mobs,
					curve: bracketLevels[family.bracket].withMaxXp(family.cap),
					categories: category.categories
				})
			}
		}

		this.families = flattenedFamilies

		this.searcher.clear()
		for (const family of this.families) {
			this.searcher.add({
				result: { type: "family", name: family.name },
				names: [family.name]
			})
		}
	}

	searchForBestiary(member: SkyblockMember, query: string) {
		const search = this.searcher.search(query)
		if (!search) {
			throw new Error(`Found no results for \"${search}\".`)
		}

		if (search.type == "family") {
			return this.getBestiary(member, search.name)
		}
	}

	getBestiary(member: SkyblockMember, name: string): BestiaryResult {
		const bestiary = this.getByName(name)

		let kills = 0
		let deaths = 0

		for (const mob of bestiary.mobs) {
			kills += member.getBestiaryKills(mob)
			deaths += member.getBestiaryDeaths(mob)
		}

		const levelData = bestiary.curve.for(kills)
		return {
			name: bestiary.name,
			kills,
			deaths,
			tier: levelData.getLevel(),
			maxTier: levelData.getMaxLevel(),
			currentKills: levelData.getCurrentXp(),
			tierKills: levelData.getLevelXp()
		}
	}

	getAllBestiaries(member: SkyblockMember): Record<string, BestiaryResult> {
		const bestiaries: Record<string, BestiaryResult> = {}
		for (const family of this.families) {
			bestiaries[TextUtils.toSnakeCase(family.name)] = this.getBestiary(member, family.name)
		}
		return bestiaries
	}

	getByName(name: string): BestiaryFamily {
		const family = this.families.find((family) => family.name == name)
		if (!family) {
			throw new Error(`Bestiary \"${name}\" does not exist!`)
		}
		return family
	}
}

type BestiarySearchResult = {
	name: string
	type: "family" | "category"
}

type BestiaryResult = {
	name: string
	kills: number
	deaths: number
	tier: number
	maxTier: number
	currentKills: number
	tierKills?: number
}
