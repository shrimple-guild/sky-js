export class Level {
	private curve: number[]
	private maxLevel: number

	static fromCumulative(cumulative: number[]) {
		return new Level(cumulative)
	}

	static fromLevel(level: number[]) {
		const cumulative: number[] = []
		let total = 0
		for (const xp of level) {
			total += xp
			cumulative.push(total)
		}
		return Level.fromCumulative(cumulative)
	}

	private constructor(curve: number[], maxLevel?: number) {
		this.curve = curve
		this.maxLevel = Math.min(maxLevel ?? Infinity, this.curve.length)
	}

	getMaxLevel() {
		return this.maxLevel
	}

	withMaxLevel(maxLevel: number): Level {
		return new Level(this.curve, maxLevel)
	}

	withMaxXp(maxXp: number): Level {
		let level = this.maxLevel
		for (let i = 0; i < this.curve.length; i++) {
			if (this.curve[i] > maxXp) {
				level = i
				break
			}
		}
		return this.withMaxLevel(level)
	}

	for(xp: number, cap?: number): ResolvedLevel {
		return new ResolvedLevel(this.curve, this.maxLevel, xp, cap)
	}
}

class ResolvedLevel {
	private curve: number[]
	private maxLevel: number
	private level?: number
	private totalXp: number
	private cap: number

	constructor(curve: number[], maxLevel: number, totalXp: number, cap?: number) {
		this.curve = curve
		this.maxLevel = maxLevel
		this.totalXp = totalXp
		this.cap = Math.min(cap ?? Infinity, this.maxLevel)
	}

	getTotalXp() {
		return this.totalXp
	}

	getMaxLevel() {
		return this.maxLevel
	}

	getCapLevel() {
		return this.cap
	}

	getLevel() {
		if (this.level != null) {
			return this.level
		}

		const maxAchievableLevel = this.getCapLevel()

		for (let i = 0; i < maxAchievableLevel; i++) {
			if (this.curve[i] > this.totalXp) {
				return i
			}
		}

		this.level = maxAchievableLevel
		return this.level
	}

	getCurrentXp(): number {
		const level = this.getLevel()
		const previousLevelXp = level !== 0 ? this.curve[level - 1] : 0
		return this.totalXp - previousLevelXp
	}

	getLevelXp(): number | undefined {
		const level = this.getLevel()
		if (level == this.maxLevel) return undefined
		const previousLevelXp = level !== 0 ? this.curve[level - 1] : 0
		return this.curve[level] - previousLevelXp
	}

	getLevelData(): LevelData {
		return {
			level: this.getLevel(),
			currentXp: this.getCurrentXp(),
			levelXp: this.getLevelXp(),
			totalXp: this.getTotalXp(),
			maxLevel: this.getMaxLevel()
		}
	}
}

export type LevelData = {
	level: number
	currentXp: number
	levelXp?: number
	totalXp: number
	maxLevel: number
}
