import { FuzzySearch } from "../../utils/FuzzySearch"
import { ItemService } from "../data/ItemService"
import { Database } from "bun:sqlite"

export class NeuAuctionService {
	private static URL = "https://moulberry.codes/lowestbin.json"
	private itemService: ItemService
	private items: FuzzySearch<LowestBin>
	private db: Database
	private timestamp: number

	constructor(itemService: ItemService, dir?: string) {
		this.itemService = itemService
		this.items = new FuzzySearch()
		this.timestamp = 0

		const dbPath = dir ? `${dir}/lowestbin-cache.sqlite` : ":memory:"
		this.db = new Database(dbPath, { strict: true })

		this.db.exec(`
            CREATE TABLE IF NOT EXISTS auctions (
                internalName TEXT PRIMARY KEY,
                timestamp REAL,
                lowestBin REAL
            )
        `)
	}

	async update() {
		const response = await fetch(NeuAuctionService.URL)
		const currentLowestBins = (await response.json()) as Record<string, number>
		this.timestamp = Date.now()
		const newItems = []
		for (const [auctionInternalName, lowestBin] of Object.entries(currentLowestBins)) {
			const name = this.itemService.resolveItemFromAuctionInternalName(auctionInternalName)
			newItems.push({ lowestBin, ...name, timestamp: this.timestamp })
		}
		this.insertIntoDatabase(newItems)

		this.items.clear()
		const query = this.db.prepare<LowestBinRow, []>(`
			SELECT internalName, lowestBin, timestamp FROM auctions
		`)
		const allLowestBinRows = query.all()
		for (const lowestBinRow of allLowestBinRows) {
			const name = this.itemService.resolveItemFromInternalName(lowestBinRow.internalName)
			const lowestBin = { ...lowestBinRow, displayName: name.displayName }
			this.items.add({ names: [name.displayName], result: lowestBin })
		}
	}

	private insertIntoDatabase(newItems: LowestBin[]) {
		const query = this.db.prepare<LowestBinRow, any>(`
			INSERT OR REPLACE INTO auctions (internalName, lowestBin, timestamp) 
			VALUES ($internalName, $lowestBin, $timestamp)
		`)
		this.db.transaction(() => {
			for (const item of newItems) {
				query.run(item)
			}
		})()
	}

	searchForAuction(query: string): LowestBinResult | null {
		const lowestBin = this.items.search(query)
		if (lowestBin == null) {
			return null
		}
		return { ...lowestBin, current: this.timestamp == lowestBin.timestamp }
	}
}

type LowestBinResult = LowestBin & { current: boolean }

type LowestBinRow = {
	timestamp: number
	internalName: string
	lowestBin: number
}
type LowestBin = LowestBinRow & { displayName: string }
