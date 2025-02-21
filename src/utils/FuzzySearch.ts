import fuzzysort from "fuzzysort"

export class FuzzySearch<T> {
    private targets: Target<T>[] 

    constructor(...targets: { names: string[], result: T }[]) {
        this.targets = []
        this.add(...targets)
    }

    add(...targets: { names: string[], result: T }[]) {
        for (const target of targets) {
            this.targets.push({ result: target.result, names: target.names })
        }
    }

    clear() {
        this.targets = []
    }

    search(query: string): T | undefined {
        const result = fuzzysort.go(query, this.targets, { key: obj => obj.names.join(), limit: 1 })
        return result[0]?.obj?.result
    }
}

type Target<T> = {
    names: string[],
    result: T
}