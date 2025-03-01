import { EventEmitter } from "events"
import * as fs from "fs/promises"

export class ConstantManager {
	private readonly dir: string
	private constants: Map<string, any> = new Map()
	private emitter: EventEmitter

	constructor(dir: string) {
		this.emitter = new EventEmitter()
		this.dir = dir
	}

	async loadConstants(): Promise<void> {
		const files = await fs.readdir(this.dir)
		const newConstants: Map<string, any> = new Map()
		for (const file of files) {
			if (file.endsWith(".json")) {
				const filePath = `${this.dir}/${file}`
				const fileContent = await fs.readFile(filePath, "utf-8")
				const data = JSON.parse(fileContent)
				const key = file.replace(".json", "")
				newConstants.set(key, data)
			}
		}
		this.constants = newConstants
		this.emitter.emit("repoReload", this)
	}

	onReload(listener: (repo: ConstantManager) => void): void {
		this.emitter.addListener("repoReload", listener)
	}

	getConstant<T>(name: string): T {
		const data = this.constants.get(name)
		if (!data) {
			throw new Error(`Constant resource ${name} not found`)
		}
		return data as T
	}
}
