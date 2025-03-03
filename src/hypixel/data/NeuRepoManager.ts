import extract from "extract-zip"
import renameOverwrite from "rename-overwrite"
import { EventEmitter } from "node:stream"

export class NeuRepoManager {
	private repoDir: string
	private emitter: EventEmitter

	constructor(repoDir: string) {
		this.repoDir = repoDir
		this.emitter = new EventEmitter()
	}

	async update(org: string, repo: string, branch: string): Promise<string> {
		const latestCommit = await this.fetchLatestCommitSha(org, repo, branch)
		const shouldUpdate = await this.shouldUpdate(latestCommit)
		if (shouldUpdate) {
			await this.writeRepository(org, repo, latestCommit)
		}
		this.emitter.emit("dataUpdated")
		return latestCommit
	}

	onReload(event: "dataUpdated", listener: () => void): void {
		this.emitter.addListener(event, listener)
	}

	private async fetchLatestCommitSha(org: string, repo: string, branch: string): Promise<string> {
		const commitApiUrl = `https://api.github.com/repos/${org}/${repo}/commits/${branch}`
		const response = await fetch(commitApiUrl)
		if (!response.ok) {
			throw new Error(`Failed to fetch commit data: ${response.statusText}`)
		}
		const data = (await response.json()) as ApiCommitResponse
		return data.sha
	}

	private async writeRepository(org: string, repo: string, commit: string): Promise<void> {
		const downloadUrl = `https://github.com/${org}/${repo}/archive/${commit}.zip`
		const response = await fetch(downloadUrl)
		if (!response.ok) {
			throw new Error(`Failed to download repository: ${response.statusText}`)
		}
		const zipPath = `${this.repoDir}/neu.zip`
		await Bun.write(zipPath, response)
		await extract(zipPath, { dir: this.repoDir })
		const extractedFolder = `${this.repoDir}/${repo}-${commit}`
		await renameOverwrite(extractedFolder, `${this.repoDir}/neu`)
		await Bun.write(this.getCommitHashPath(), commit)
	}

	private async shouldUpdate(latestCommit: string) {
		const commitFile = Bun.file(this.getCommitHashPath())
		const exists = await commitFile.exists()
		if (!exists) return true
		const currentCommit = await commitFile.text()
		return currentCommit != latestCommit
	}

	private getCommitHashPath() {
		return `${this.repoDir}/commit-hash.txt`
	}
}

interface ApiCommitResponse {
	sha: string
}
