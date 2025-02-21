import type { IHypixelClient } from "./IHypixelClient"
import type { ApiSkyblockCollections } from "./types/ApiSkyblockCollections"
import type { ApiSkyblockProfile, ApiSkyblockProfilesResponse } from "./types/ApiSkyblockProfilesResponse"

export class HypixelClient implements IHypixelClient {
	private apiKey: string
	private baseUrl: string = "https://api.hypixel.net/v2"

	constructor(apiKey: string) {
		this.apiKey = apiKey
	}

	async getSkyblockProfiles(uuid: string): Promise<ApiSkyblockProfile[] | null> {
		const response = await this.fetchAuthenticated<ApiSkyblockProfilesResponse>("skyblock/profiles", { uuid })
		return response.profiles
	}

	async getSkyblockCollections(): Promise<ApiSkyblockCollections> {
		const response = await this.fetchResource<ApiSkyblockCollections>("resources/skyblock/collections")
		return response
	}

	private async fetchResource<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
		const url = new URL(`${this.baseUrl}/${endpoint}`)
		url.search = new URLSearchParams(params).toString()

		const response = await fetch(url.toString())

		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`)
		}

		const data = await response.json() as T
		return data
	}

	private async fetchAuthenticated<T>(endpoint: string, params: Record<string, string>): Promise<T> {
		const url = new URL(`${this.baseUrl}/${endpoint}`)
		url.search = new URLSearchParams({ ...params, key: this.apiKey }).toString()

		const response = await fetch(url.toString())

		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`)
		}

		const data = await response.json() as T
		return data
	}
}
