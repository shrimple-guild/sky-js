import type { MojangPlayer } from "./MojangPlayer";

export interface IMojangService {
	get(query: string): Promise<MojangPlayer | null>
}