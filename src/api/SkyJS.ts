import type { NeuRepoManager as NeuRepoManager } from "../hypixel/data/NeuRepoManager";
import type { HypixelService } from "../hypixel/HypixelService";
import type { MojangService } from "../mojang/MojangService";
import { Player } from "./Player";
import { Services } from "./Services";

export class SkyJS {

    private services: Services

    constructor(hypixel: HypixelService, mojang: MojangService, neu: NeuRepoManager) {
        this.services = new Services(hypixel, mojang, neu)
    }

    async player(query: string) {
        const mojangPlayer = await this.services.mojang.get(query)
        if (!mojangPlayer) {
            throw new Error(`No player for \"${query}\" exists.`)
        }
        return new Player(mojangPlayer, this.services)
    }
}