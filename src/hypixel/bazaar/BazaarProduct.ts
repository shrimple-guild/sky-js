import type { ApiBazaarOrder, ApiBazaarProduct } from "../types/ApiSkyblockBazaar"

export class BazaarProduct {
	private product: ApiBazaarProduct

	constructor(product: ApiBazaarProduct) {
		this.product = product
	}

	getProductId() {
		return this.product.product_id
	}

	getInstasellPrice(): number | null {
		return this.product.sell_summary[0]?.pricePerUnit ?? null
	}

	getInstabuyPrice(): number | null {
		return this.product.buy_summary[0]?.pricePerUnit ?? null
	}

	getBuyPrice(amount?: number) {
		return this.getBulkPrice(this.product.buy_summary, amount)
	}

	getSellPrice(amount?: number) {
		return this.getBulkPrice(this.product.sell_summary, amount)
	}

	private getQuantity(orders: ApiBazaarOrder[]) {
		let amount = 0
		for (const order of orders) {
			amount += order.amount * order.orders
		}
		return amount
	}

	private getBulkPrice(orders: ApiBazaarOrder[], amount?: number) {
		if (amount == null) {
			amount = this.getQuantity(orders)
		}
		const startingAmount = amount
		let money = 0
		let index = 0
		while (amount > 0) {
			let order = orders[index]
			if (!order) break
			let buyAmount = Math.min(amount, order.amount * order.orders)
			money += buyAmount * order.pricePerUnit
			amount -= buyAmount
			index++
		}
		return {
			quantity: startingAmount - amount,
			price: money
		}
	}
}
