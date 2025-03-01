import type { ApiBazaarResponse } from "../types/ApiSkyblockBazaar"
import { BazaarProduct } from "./BazaarProduct"

export class Bazaar {
	private raw: ApiBazaarResponse

	constructor(raw: ApiBazaarResponse) {
		this.raw = raw
	}

	getProduct(id: string): BazaarProduct {
		const product = this.raw.products[id]
		if (!product) throw new Error(`No such product "${id}".`)
		return new BazaarProduct(product)
	}

	getProductIds(): string[] {
		return Object.keys(this.raw.products)
	}
}
