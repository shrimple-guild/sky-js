import { Parser } from "tar"
import { Readable } from "stream"
import path from "path"
import type { NeuItemJson } from "../types/NeuItemJson"
import { logger } from "../../logging/Logger"

export class NeuRepoManager {
	private readonly org: string
	private readonly repo: string
	private readonly branch: string
	private readonly path: string
	private constants: Map<string, any>
	private listeners: RepoListener[]
	private hasLoaded: boolean

	constructor(org: string, repo: string, branch: string, path: string) {
		this.repo = repo
		this.org = org
		this.branch = branch
		this.path = path
		this.constants = new Map()
		this.listeners = []
		this.hasLoaded = false
	}

	getConstant<T>(name: string): T {
		const data = this.constants.get(name)
		if (!data) {
			throw new Error(`Constant resource ${name} not found`)
		}
		return data as T
	}

	onReload(listener: RepoListener): void {
		this.listeners.push(listener)
	}

	private notifyListeners() {
		for (const listener of this.listeners) {
			listener(this)
		}
	}

	async load() {
		logger.log(`Checking NEU repository status.`)
		const promises = [this.getLocalCommit(), this.fetchLatestCommit()]
		const [localCommit, remoteCommit] = await Promise.all(promises)
		let shouldLoadTar = !this.hasLoaded
		logger.debug(`- Remote commit: ${remoteCommit}`)
		logger.debug(`- Local commit: ${localCommit}`)
		if (remoteCommit != localCommit) {
			logger.debug(`Downloading NEU repository.`)
			const startTime = performance.now()
			await this.downloadTar(remoteCommit)
			const endTime = performance.now()
			shouldLoadTar = true
			logger.debug(`Downloaded in ${(endTime - startTime).toFixed(2)} ms.`)
		}

		if (!shouldLoadTar) {
			logger.debug("Already loaded constants. Skipping.")
			return
		} else {
			logger.debug("Loading constants from this commit.")
		}

		const startTime = performance.now()

		const entries = await this.fetchRepoEntries()

		const items: Record<string, NeuItemJson> = {}

		for (const entry of entries) {
			const path = this.splitFileName(entry.path)
			if (path.extension != "json") continue
			if (path.directory == "constants") {
				this.constants.set(path.name, this.bufferToJson(entry.content))
			} else if (path.directory == "items") {
				items[path.name] = this.bufferToJson(entry.content)
			}
		}
		this.constants.set("items", items)
		const endTime = performance.now()
		const loadTime = (endTime - startTime).toFixed(2)

		logger.log(`Loaded ${this.constants.size} constants from NEU repository (${loadTime} ms).`)
		this.hasLoaded = true
		this.notifyListeners()
	}

	private async fetchLatestCommit(): Promise<string> {
		const commitApiUrl = `https://api.github.com/repos/${this.org}/${this.repo}/commits/${this.branch}`
		const response = await fetch(commitApiUrl)
		if (!response.ok) throw new Error(`Failed to fetch commit data: ${response.statusText}`)

		const data = (await response.json()) as ApiCommitResponse
		return data.sha
	}

	private async downloadTar(commit: string): Promise<ArrayBuffer> {
		const tarballUrl = `https://api.github.com/repos/${this.org}/${this.repo}/tarball/${commit}`
		const response = await fetch(tarballUrl)
		if (!response.ok) throw new Error(`Failed to fetch tarball: ${response.statusText}`)
		const arrayBuffer = await response.arrayBuffer()
		await Bun.write(this.getNeuRepoPath(), arrayBuffer)
		await Bun.write(this.getCommitHashPath(), commit)
		return arrayBuffer
	}

	private async fetchRepoEntries(): Promise<TarEntry[]> {
		const file = Bun.file(this.getNeuRepoPath())
		const buffer = Buffer.from(await file.arrayBuffer())
		return new Promise((resolve, reject) => {
			const parseStream = new Parser()
			const entries: TarEntry[] = []

			parseStream.on("entry", (entry) => {
				const chunks: Buffer[] = []
				entry.on("data", (chunk: Buffer) => chunks.push(chunk))
				// @ts-expect-error
				entry.on("end", () => entries.push({ path: entry.path, content: Buffer.concat(chunks) }))
			})

			parseStream.on("end", () => resolve(entries))
			parseStream.on("error", (error) => reject(error))

			const bufferStream = new Readable()
			// @ts-expect-error
			bufferStream.pipe(parseStream)
			bufferStream.push(buffer)
			bufferStream.push(null)
		})
	}

	private getNeuRepoPath() {
		return path.join(this.path, "neu-repo.tar.gz")
	}

	private getCommitHashPath() {
		return path.join(this.path, "neu-commit-hash.txt")
	}

	private async getLocalCommit(): Promise<string> {
		const commitFile = Bun.file(this.getCommitHashPath())
		const exists = await commitFile.exists()
		if (!exists) return "[none]"
		return commitFile.text()
	}

	private splitFileName(filePath: string): FilePath {
		const directory = path.dirname(filePath).split(path.sep).pop() || ""
		const extension = path.extname(filePath).slice(1)
		const name = path.basename(filePath, path.extname(filePath))
		return {
			directory,
			name,
			extension
		}
	}

	private bufferToJson(buffer: Buffer): any {
		return JSON.parse(buffer.toString("utf-8"))
	}
}

type RepoListener = (repo: NeuRepoManager) => void

interface ApiCommitResponse {
	sha: string
}

type FilePath = {
	directory: string
	name: string
	extension: string
}

type TarEntry = {
	path: string
	content: Buffer
}
