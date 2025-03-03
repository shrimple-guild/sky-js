import type { NeuItemJson } from "../types/NeuItemJson"
import { TextUtils } from "../../utils/TextUtils"
import { type NBT } from "prismarine-nbt"
import type { NeuRepoManager } from "./NeuRepoManager"

export class ItemService {
	private items: Record<string, ItemName | undefined>
	private static RARITIES = ["Common", "Uncommon", "Rare", "Epic", "Legendary", "Mythic"]

	constructor(repo: NeuRepoManager) {
		this.items = {}
		repo.onReload((repo) => this.loadItems(repo))
	}

	private async loadItems(repo: NeuRepoManager): Promise<void> {
		const items = repo.getConstant<Record<string, NeuItemJson>>("items")
		const newItems: Record<string, ItemName | undefined> = {}
		for (const item of Object.values(items)) {
			if (this.isItem(item)) {
				newItems[item.internalname] = {
					displayName: this.getDisplayNameFromJson(item),
					internalName: item.internalname
				}
			}
		}
		this.items = newItems
	}

	getItems() {
		return this.items
	}

	resolveItemFromAuctionInternalName(auctionInternalName: string): ItemName {
		let [internalName, ...attributes] = auctionInternalName.split("+")
		const attributeRegex = /ATTRIBUTE_(\D+);(\d+)/
		if (internalName == "ATTRIBUTE_SHARD" && attributes[0]) {
			const attribute = attributeRegex.exec(attributes[0])
			if (attribute) {
				internalName = `ATTRIBUTE_SHARD_${attribute[1]};${attribute[2]}`
			}
		}
		return this.resolveItemFromInternalName(internalName)
	}

	resolveItemFromInternalName(internalName: string): ItemName {
		const name = this.items[internalName]
		if (name) return name
		const displayName = internalName
			.split(/[;_]/)
			.map((str) => TextUtils.toTitleCase(str))
			.join(" ")
		return { internalName, displayName }
	}

	private getInternalNameFromBazaar(id: string) {
		const enchantRegex = /ENCHANTMENT_(\D+)_(\d+)/
		const match = enchantRegex.exec(id)
		if (match) {
			return `${match[1]};${match[2]}`
		}
		return id.replaceAll(":", "-")
	}

	resolveItemFromBazaar(id: string): ItemName {
		const internalName = this.getInternalNameFromBazaar(id)
		return this.resolveItemFromInternalName(internalName)
	}

	resolveItemFromNbt(tag: NBT): string {
		// @ts-ignore
		return tag.value["i"]?.value?.value?.[0]?.tag?.value?.ExtraAttributes?.value?.id?.value ?? ""
	}

	private getDisplayNameFromJson(itemData: NeuItemJson) {
		let cleaned = TextUtils.removeFormatting(itemData.displayname)
		cleaned = TextUtils.stripNonAscii(cleaned).trim()

		// handle skill exp boost pet items
		const petItemMatcher = /PET_ITEM_(\w+)_SKILL_BOOST_(\w+)/.exec(itemData.internalname)
		if (petItemMatcher) {
			return TextUtils.toTitleCase(`${petItemMatcher[2]} ${petItemMatcher[1]} Exp Boost`)
		}

		// handle pet display names
		const petMatcher = /\[Lvl {LVL}\] (.+)/.exec(cleaned)
		if (petMatcher) {
			const petName = petMatcher[1]
			const petRarityNum = parseInt(itemData.internalname.split(";")[1])
			const rarity = ItemService.RARITIES[petRarityNum]
			return `${rarity} ${petName}`
		}

		// handle attribute display names
		const attributeMatcher = /ATTRIBUTE_SHARD_(\D+);(\d+)/.exec(itemData.internalname)
		if (attributeMatcher) {
			return `${TextUtils.toTitleCase(attributeMatcher[1])} ${attributeMatcher[2]} Attribute Shard`
		}

		// handle enchanted book display names
		if (cleaned == "Enchanted Book") {
			const [name, level] = itemData.internalname.split(";")
			return `${TextUtils.toTitleCase(name)} ${level} Enchanted Book`
		}

		return TextUtils.attemptDeromanizeLast(cleaned)
	}

	private isItem(itemData: NeuItemJson) {
		const mobRegex = /.*?((_MONSTER)|(_NPC)|(_ANIMAL)|(_MINIBOSS)|(_BOSS)|(_SC))$/
		const isMob = mobRegex.test(itemData.internalname)
		return !isMob
	}
}

type ItemName = {
	displayName: string
	internalName: string
}
