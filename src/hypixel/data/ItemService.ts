import * as fs from "fs/promises"
import type { NeuItemJson } from "../types/NeuItemJson"
import { TextUtils } from "../../utils/TextUtils"
import type { NBT } from "prismarine-nbt"

export class ItemService {
	private dir: string
	private items: Record<string, ItemName | undefined>

	constructor(dir: string) {
		this.dir = dir
		this.items = {}
	}

	async loadItems(): Promise<void> {
		const files = await fs.readdir(this.dir)
		const newItems: Record<string, ItemName | undefined> = {}
		for (const file of files) {
			if (file.endsWith(".json")) {
				const filePath = `${this.dir}/${file}`
				const fileContent = await fs.readFile(filePath, "utf-8")
				const data = JSON.parse(fileContent) as NeuItemJson
				if (this.isItem(data)) {
					newItems[data.internalname] = {
						displayName: this.getDisplayNameFromJson(data),
                        internalName: data.internalname,
					}
				}
			}
		}
		this.items = newItems
	}

	getItems() {
		return this.items
	}

	getDisplayName(internalName: string): ItemName {
		const name = this.items[internalName]
		if (name) return name
		const displayName = internalName
			.split(/[;_]/)
			.map((str) => TextUtils.toTitleCase(str))
			.join(" ")
        return { internalName, displayName }
	}

    private getInternalNameFromBazaar(id: string) {
        const enchantRegex = /ENCHANTMENT_(\D*)_(\d+)/
		const match = enchantRegex.exec(id)
		if (match) {
			return `${match[1]};${match[2]}`
		}
		return id.replaceAll(":", "-")
    }

	resolveItemFromBazaar(id: string): ItemName {
		const internalName = this.getInternalNameFromBazaar(id)
        const enchantRegex = /(?:ENCHANTMENT_)(?:ULTIMATE_)?(.+)/
        const enchantment = enchantRegex.exec(id)?.[1]
        let displayName = enchantment 
            ? TextUtils.toTitleCase(enchantment) 
            : this.getDisplayName(internalName).displayName
        return { internalName, displayName }
	}

	resolveItemFromNbt(tag: NBT): string {
		// @ts-ignore
		return tag.value["i"]?.value?.value?.[0]?.tag?.value?.ExtraAttributes?.value?.id?.value ?? ""
	}

	private getDisplayNameFromJson(itemData: NeuItemJson) {
		return TextUtils.removeFormatting(itemData.displayname)
	}

	private isItem(itemData: NeuItemJson) {
		const mobRegex = /.*?((_MONSTER)|(_NPC)|(_ANIMAL)|(_MINIBOSS)|(_BOSS)|(_SC))$/
		const isMob = mobRegex.test(itemData.internalname)
		return !isMob
	}
}

type ItemName = {
	displayName: string,
    internalName: string,
}
