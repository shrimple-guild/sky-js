import type { MojangPlayer } from '../mojang/MojangPlayer';
import type { Services } from './Services';

export class Player {
    readonly uuid: string;
    readonly name: string;
    private services: Services;

    constructor(player: MojangPlayer, services: Services) {
        this.uuid = player.uuid
        this.name = player.name;
        this.services = services;
    }

    getSkyblockProfiles() {
        return this.services.hypixel.getSkyblockProfiles(this.uuid)
    }

    async getSkyblockProfile(query: string) {
        const profiles = await this.getSkyblockProfiles()
        if (!profiles) return null
        return profiles.getByQuery(query)
    }
}