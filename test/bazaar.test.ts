import { describe, it, expect } from "bun:test"
import { Bazaar } from "../src/hypixel/bazaar/Bazaar"
import bazaarResponse from "./bazaar.json"
import bazaarChiliPepper from "./bazaar-product-chili.json"
import bazaarEmpty from "./bazaar-product-empty.json"
import { BazaarProduct } from "../src/hypixel/bazaar/BazaarProduct"
import { ItemService } from "../src/hypixel/data/ItemService"
import { BazaarService } from "../src/hypixel/bazaar/BazaarService"
import { HypixelClient } from "../src/hypixel/HypixelClient"


const dataDir = Bun.env["SKYJS_DATA_DIR"]!
const itemService = new ItemService(`${dataDir}/repo/neu/items`)
await itemService.loadItems()

const hypixelClient = new HypixelClient(Bun.env["HYPIXEL_API_KEY"]!)

describe("BazaarService", () => {
    it("should get product by name", async () => {
        const bazaar = new BazaarService(itemService, hypixelClient)
        await bazaar.update()
        const product = bazaar.searchProduct("e iron block")
        expect(product?.productId).toBe("ENCHANTED_IRON_BLOCK")
    })
})

describe("Bazaar", () => {
    it("should get all product ids", () => {
        const bazaar = new Bazaar(bazaarResponse)
        const productIds = bazaar.getProductIds()
        expect(productIds.length).toBeGreaterThanOrEqual(1000)
    })

    it("should get a product by its product id", () => {
        const bazaar = new Bazaar(bazaarResponse)
        const chiliPepper = bazaar.getProduct("CHILI_PEPPER")
        expect(chiliPepper.getProductId()).toBe("CHILI_PEPPER")
    })
})

describe("BazaarProduct", () => {
    it("should get values of an product with orders", () => {
        const product = new BazaarProduct(bazaarChiliPepper)
        expect(product.getInstabuyPrice()).toBe(191844.6)
        expect(product.getInstasellPrice()).toBe(178993.9)
        const { quantity: sellQuantity, price: sellPrice } = product.getSellPrice()
        expect(sellQuantity).toBe(3632)
        expect(sellPrice).toBeCloseTo(650105021.8)

        const { quantity: buyQuantity, price: buyPrice } = product.getBuyPrice(100)
        expect(buyQuantity).toBe(100)
        expect(buyPrice).toBeCloseTo(19184467.9)

        const { quantity: oversellQuantity, price: oversellPrice } = product.getSellPrice(4000)
        expect(oversellQuantity).toBe(3632)
        expect(oversellPrice).toBeCloseTo(650105021.8)
    })

    it("should get values of an product without orders", () => {
        const product = new BazaarProduct(bazaarEmpty)
        expect(product.getInstabuyPrice()).toBe(null)
        expect(product.getInstasellPrice()).toBe(null)
        const { quantity: sellQuantity, price: sellPrice } = product.getSellPrice()
        expect(sellQuantity).toBe(0)
        expect(sellPrice).toBeCloseTo(0)
    })

})