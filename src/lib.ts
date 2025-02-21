import { HypixelClient } from "./hypixel/HypixelClient";
import { HypixelService } from "./hypixel/HypixelService";
import { MojangService } from "./mojang/MojangService";

const mojangService = new MojangService()
const hypixelClient = new HypixelClient(Bun.env["HYPIXEL_API_KEY"]!!)
const hypixelService = new HypixelService(hypixelClient)


async function getSkyblockProfiles() {
    const player = await mojangService.get("appable")
    if (!player) return
    hypixelService.getSkyblockProfiles(player.uuid)
}



const skyblock: any = null

skyblock.player("appable").getSkyblockProfile("orange").getSkill("fishing").getCurrentXp()