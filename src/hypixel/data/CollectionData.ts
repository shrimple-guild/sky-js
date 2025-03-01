import { FuzzySearch } from "../../utils/FuzzySearch"
import type { IHypixelClient } from "../IHypixelClient"
import type { SkyblockMember } from "../structures/SkyblockMember"
import { Level } from "../utils/Level"

export class CollectionData {
	private client: IHypixelClient
	private collections: Record<string, Collection>
	private searcher: FuzzySearch<string>

	constructor(client: IHypixelClient) {
		this.client = client
		this.collections = {}
		this.searcher = new FuzzySearch()
	}

	async update() {
		const apiCollections = (await this.client.getSkyblockCollections()).collections

		this.collections = {}
		this.searcher.clear()

		for (const [apiCategory, categoryCollections] of Object.entries(apiCollections)) {
			const category = apiCategory.toLowerCase()
			for (const [id, apiCollection] of Object.entries(categoryCollections.items)) {
				const tierAmounts = apiCollection.tiers.map((tier) => tier.amountRequired)
				const collection: Collection = {
					name: apiCollection.name,
					id,
					tiers: Level.fromCumulative(tierAmounts),
					category
				}
				this.collections[collection.id] = collection
				this.searcher.add({
					names: [collection.name],
					result: collection.id
				})
			}
		}
	}

	getCollection(member: SkyblockMember, id: string): CollectionResult {
		const collectionData = this.collections[id]
		const individualAmount = member.getCollection(id)
		const tierData = collectionData.tiers.for(individualAmount)
		const coopAmount = member.getProfile().getCollectionAmount(id)
		const coopTier = collectionData.tiers.for(coopAmount).getLevel()
		const unlockedGuess = Math.max(tierData.getLevel(), coopTier)
		const collection: CollectionResult = {
			name: collectionData.name,
			id: collectionData.id,
			category: collectionData.category,
			amount: individualAmount,
			coopAmount,
			unlockedTier: unlockedGuess,
			maxTier: tierData.getMaxLevel()
		}
		return collection
	}

	getAllCollections(member: SkyblockMember) {
		const collections: Record<string, CollectionResult> = {}
		for (const id of Object.keys(this.collections)) {
			collections[id] = this.getCollection(member, id)
		}
		return collections
	}
}

type CollectionResult = {
	name: string
	id: string
	category: string
	amount: number
	coopAmount: number
	unlockedTier: number
	maxTier: number
}

type Collection = {
	name: string
	id: string
	tiers: Level
	category: string
}
