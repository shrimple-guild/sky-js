interface ApiCollectionTier {
	tier: number
	amountRequired: number
	unlocks: string[]
}

interface ApiCollectionItem {
	name: string
	maxTiers: number
	tiers: ApiCollectionTier[]
}

interface ApiCollectionCategory {
	name: string
	items: Record<string, ApiCollectionItem>
}

export interface ApiSkyblockCollections {
	success: boolean
	lastUpdated: number
	version: string
	collections: Record<string, ApiCollectionCategory>
}
