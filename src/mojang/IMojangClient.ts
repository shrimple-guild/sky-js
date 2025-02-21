import type { MojangPlayer } from "./MojangPlayer"

export interface IMojangClient {
	getByName(name: string): Promise<MojangPlayer | null>
	getByUuid(uuid: string): Promise<MojangPlayer | null>
}
