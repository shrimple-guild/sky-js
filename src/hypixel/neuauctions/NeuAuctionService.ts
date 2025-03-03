import { FuzzySearch } from "../../utils/FuzzySearch"
import { ItemService } from "../data/ItemService"
import { Database } from "bun:sqlite";

export class NeuAuctionService {
    private static URL = "https://moulberry.codes/lowestbin.json"
    private itemService: ItemService
    private items: FuzzySearch<LowestBin>
    private timestamp: number

    constructor(itemService: ItemService, dir?: string) {
        this.itemService = itemService
        this.items = new FuzzySearch()
        this.timestamp = 0
        
        const dbPath = dir ? `${dir}/lowestbin-cache.sqlite` : ":memory:";
        const db = new Database(dbPath);

        // Create table if it doesn't exist
        db.exec(`
            CREATE TABLE IF NOT EXISTS auctions (
                internalName TEXT PRIMARY KEY,
                lowestBin INTEGER,
                timestamp INTEGER
            )
        `);

     
    }

    async update() {
        const response = await fetch(NeuAuctionService.URL)
        const currentLowestBins = await response.json() as Record<string, number>
        this.timestamp = Date.now()
        this.items.clear()
        for (const [auctionInternalName, lowestBin] of Object.entries(currentLowestBins)) {
            const name = this.itemService.resolveItemFromAuctionInternalName(auctionInternalName)
            const auction = { lowestBin, ...name, timestamp: this.timestamp }
            this.items.add({ names: [auction.displayName], result: auction})
        }
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

type LowestBin = {
    timestamp: number,
    displayName: string,
    internalName: string,
    lowestBin: number
}

