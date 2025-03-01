import { FuzzySearch } from "../../utils/FuzzySearch"
import type { ItemService } from "../data/ItemService"
import type { IHypixelClient } from "../IHypixelClient"
import { Bazaar } from "./Bazaar"
import type { BazaarProduct } from "./BazaarProduct"

export class BazaarService {
	private itemService: ItemService
	private client: IHypixelClient
	private bazaar?: Bazaar
	private fuzzySearch: FuzzySearch<string>

	constructor(itemService: ItemService, client: IHypixelClient) {
		this.itemService = itemService
		this.client = client
		this.fuzzySearch = new FuzzySearch()
	}

	async update() {
		const data = await this.client.getSkyblockBazaar()
		this.bazaar = new Bazaar(data)
		const productIds = this.bazaar.getProductIds()
		for (const id of productIds) {
			const internalName = this.itemService.bazaarToInternalName(id)
			const displayName = this.itemService.getDisplayName(internalName)
			if (displayName) {
				this.fuzzySearch.add({ names: [internalName, displayName], result: id })
			}
		}
	}

	searchProduct(name: string): BazaarProductData | null {
		const bazaarId = this.fuzzySearch.search(name)
		if (!bazaarId) return null
        const product = this.bazaar?.getProduct(bazaarId)
        if (!product) return null
		return this.resolveProduct(product)
	}

    getProducts() {
        const bazaar = this.bazaar
        if (!bazaar) return {}
        const productIds = bazaar.getProductIds()
        const out: Record<string, BazaarProductData> = {}

        for (const id of productIds) {
            const product = bazaar.getProduct(id)
            const data = this.resolveProduct(product)
            if (data) {
                out[id] = data
            }
        }
        return out
    }

    resolveProduct(product: BazaarProduct): BazaarProductData | null {
        const internalName = this.itemService.bazaarToInternalName(product.getProductId())
		const displayName = this.itemService.getDisplayName(internalName)
        if (!displayName) {
            return null
        }
        return {
            name: displayName,
            internalName: internalName,
            productId: product.getProductId(),
            instabuy: product.getInstabuyPrice(),
            instasell: product.getInstasellPrice(),
            buyMarket: product.getBuyPrice(),
            sellMarket: product.getSellPrice()
        }
    }
}

type BazaarProductData = {
    name: string,
    internalName: string,
    productId: string,
    instabuy: number | null,
    instasell: number | null,
    buyMarket: { quantity: number, price: number },
    sellMarket: { quantity: number, price: number },
}
