import { BestiaryData } from "../hypixel/data/BestiaryData"
import type { NeuRepoManager } from "../hypixel/data/NeuRepoManager"
import { SkillData } from "../hypixel/data/SkillData"
import { SlayerData } from "../hypixel/data/SlayerData"
import type { HypixelService } from "../hypixel/HypixelService"
import type { MojangService } from "../mojang/MojangService"

export class Services {
    readonly hypixel: HypixelService
    readonly mojang: MojangService

    readonly bestiaryData: BestiaryData
    readonly skillData: SkillData
    readonly slayerData: SlayerData
    
    constructor(hypixel: HypixelService, mojang: MojangService, neu: NeuRepoManager) {
        this.hypixel = hypixel
        this.mojang = mojang
        
        this.bestiaryData = new BestiaryData(neu)
        this.skillData = new SkillData(neu)
        this.slayerData = new SlayerData(neu)
    }
}