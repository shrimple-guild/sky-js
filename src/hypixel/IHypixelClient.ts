import type { ApiSkyblockCollections } from "./types/ApiSkyblockCollections"
import type { ApiSkyblockProfile } from "./types/ApiSkyblockProfilesResponse"

// todo: add cached implementation
export interface IHypixelClient {
	getSkyblockProfiles(uuid: string): Promise<ApiSkyblockProfile[] | null>
	getSkyblockCollections(): Promise<ApiSkyblockCollections> 
}
