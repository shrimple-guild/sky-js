import type { ApiSkyblockAuction, ApiSkyblockAuctionPage } from "../types/ApiSkyblockAuction"
import type { ItemService } from "../data/ItemService"
import nbt from "prismarine-nbt"

export class AuctionData {
	private static AUCTION_URL = "https://api.hypixel.net/skyblock/auctions"

	private auctions: ApiSkyblockAuction[]
	private itemCache: Map<number, string>
	private itemService: ItemService

	private pageParseTime = 0

	constructor(itemService: ItemService) {
		this.auctions = []
		this.itemService = itemService
		this.itemCache = new Map()
	}

	getCurrentAuctions() {
		return this.auctions
	}

	async fetchPageAuctions(page: number): Promise<ApiSkyblockAuctionPage> {
		const response = await fetch(`${AuctionData.AUCTION_URL}?page=${page}`)
		const startTime = performance.now()
		const auctionPage = (await response.json()) as ApiSkyblockAuctionPage
		const endTime = performance.now()
		this.pageParseTime += endTime - startTime
		return auctionPage
	}

	async update(): Promise<boolean> {
		this.pageParseTime = 0
		const firstPage = this.fetchPageAuctions(0)
		const pageCount = (await firstPage).totalPages
		const pagePromises = [firstPage]
		for (let p = 1; p < pageCount; p++) {
			pagePromises.push(this.fetchPageAuctions(p))
		}
		const pages = await Promise.all(pagePromises)

		const allPagesSameTime = pages.every((page) => page.lastUpdated == pages[0].lastUpdated)
		if (!allPagesSameTime) return false

		const rawAuctions = pages.flatMap((page) => page.auctions)

		const namePromises = rawAuctions.map((auction) => this.resolveInternalName(auction.item_bytes))

		return true
	}

	async resolveInternalName(itemBytes: string) {
		const buffer = Buffer.from(itemBytes, "base64")
		const unzipped = Bun.gunzipSync(new Uint8Array(buffer))
		const parsed = nbt.parseUncompressed(Buffer.from(unzipped), "big")
		const itemName = this.itemService.resolveItemFromNbt(parsed)
		return itemName
	}

	private hashItemBytes(item: string): number {
		let hash = 0
		for (let i = 0; i < item.length; i++) {
			const chr = item.charCodeAt(i)
			hash = (hash << 5) - hash + chr
			hash |= 0
		}
		return hash
	}
}
