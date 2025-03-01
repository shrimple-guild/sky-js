import type { IHypixelClient } from "./IHypixelClient"
import type { ApiBazaarResponse } from "./types/ApiSkyblockBazaar"
import type { ApiSkyblockCollections } from "./types/ApiSkyblockCollections"
import type { ApiSkyblockProfile, ApiSkyblockProfilesResponse } from "./types/ApiSkyblockProfilesResponse"

export class HypixelClient implements IHypixelClient {
	private apiKey: string
	private baseUrl: string = "https://api.hypixel.net/v2"

	constructor(apiKey: string) {
		this.apiKey = apiKey
	}

	async getSkyblockProfiles(uuid: string): Promise<ApiSkyblockProfile[] | null> {
		const response = await this.fetch<ApiSkyblockProfilesResponse>("skyblock/profiles", true, { uuid })
		return response.profiles
	}

	async getSkyblockCollections(): Promise<ApiSkyblockCollections> {
		const response = await this.fetch<ApiSkyblockCollections>("resources/skyblock/collections", false)
		return response
	}

	async getSkyblockBazaar(): Promise<ApiBazaarResponse> {
		const response = await this.fetch<ApiBazaarResponse>("skyblock/bazaar", false)
		return response
	}

	private async fetch<T>(endpoint: string, authenticated: boolean, params: Record<string, string> = {}): Promise<T> {
		const url = new URL(`${this.baseUrl}/${endpoint}`)
		const authenticatedParams = authenticated ? { ...params, key: this.apiKey } : params
		url.search = new URLSearchParams(authenticatedParams).toString()
		const urlString = url.toString()
		const safeUrlString = urlString.replace(this.apiKey, "****")

		const response = await fetch(urlString)

		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}, URL: ${safeUrlString}`)
		}

		const data = (await response.json()) as T
		return data
	}
}
