type ApiBazaarOrder = {
	amount: number
	pricePerUnit: number
	orders: number
}

type ApiBazaarQuickStatus = {
	productId: string
	sellPrice: number
	sellVolume: number
	sellMovingWeek: number
	sellOrders: number
	buyPrice: number
	buyVolume: number
	buyMovingWeek: number
	buyOrders: number
}

type ApiBazaarProduct = {
	product_id: string
	sell_summary: ApiBazaarOrder[]
	buy_summary: ApiBazaarOrder[]
	quick_status: ApiBazaarQuickStatus
}

export type ApiBazaarResponse = {
	success: boolean
	lastUpdated: number
	products: Record<string, ApiBazaarProduct>
}
