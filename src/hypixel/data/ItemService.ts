import * as fs from 'fs/promises';
import type { NeuItemJson } from '../types/NeuItemJson';
import { TextUtils } from '../../utils/TextUtils';
import type { NBT } from 'prismarine-nbt';

export class ItemService {
    private dir: string 
    private items: Record<string, ItemData | undefined>

    constructor(dir: string) {
        this.dir = dir
        this.items = {}
    }

    async loadItems(): Promise<void> {
        const files = await fs.readdir(this.dir);
        const newItems: Record<string, ItemData | undefined> = {}
        for (const file of files) {
            if (file.endsWith('.json')) {
                const filePath = `${this.dir}/${file}`;
                const fileContent = await fs.readFile(filePath, 'utf-8');
                const data = JSON.parse(fileContent) as NeuItemJson;
                if (this.isItem(data)) {
                    newItems[data.internalname] = {
                        displayName: this.getDisplayNameFromJson(data)
                    }
                }
            }
        }   
        this.items = newItems
    }

    getItems() {
        return this.items
    }

    getDisplayName(internalName: string): string | undefined {
        const name = this.items[internalName]?.displayName
        if (name) return name
        return internalName.split("_").map(str => TextUtils.toTitleCase(str)).join(" ")
    }

    resolveBazaarName(name: string) {
        const enchantRegex = /ENCHANTMENT_(\D*)_(\d+)/
        const match = enchantRegex.exec(name);
        if (match) {
            return `${match[1]};${match[2]}`;
        }
        return name.replaceAll(":", "-")
    }

    resolveItemFromNbt(nbt: NBT) {
        
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



type ItemData = {
    displayName: string,
}