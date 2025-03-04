import type { EliteNextContests } from "../types/EliteNextContests"
import fuzzysort from "fuzzysort"

export class ContestData {
	private static readonly URL = `https://api.elitebot.dev/contests/at/now`
	private static readonly crops = [
		"wheat",
		"carrot",
		"potato",
		"pumpkin",
		"sugar cane",
		"melon",
		"cactus",
		"cocoa beans",
		"mushroom",
		"nether wart"
	]

	private contests: Contest[]

	constructor() {
		this.contests = []
	}

	async update() {
		const response = await fetch(ContestData.URL)
		const data = (await response.json()) as EliteNextContests
		this.contests = Object.entries(data.contests).map(([time, crops]) => {
			return { time: parseInt(time) * 1000, crops }
		})
	}

	closestCrop(crop: string) {
		const trimmed = crop.trim().toLowerCase()
		return fuzzysort.go(trimmed, ContestData.crops, { limit: 1 }).at(0)?.target
	}

	nextCrop(crop: string) {
		return this.contests.find(
			(contest) => contest.time > Date.now() && contest.crops.some((contestCrop) => contestCrop == crop)
		)
	}

	get next() {
		return this.contests.find((contest) => contest.time > Date.now())
	}

	get current() {
		return this.contests.find((contest) => contest.time < Date.now() && contest.time + 1200000 > Date.now())
	}
}

type Contest = {
	time: number
	crops: string[]
}
