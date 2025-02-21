export class UUIDUtils {
	private static standardPattern = /^[0-9a-f]{8}-?[0-9a-f]{4}-?4[0-9a-f]{3}-?[89ab][0-9a-f]{3}-?[0-9a-f]{12}$/i
    private static compactPattern = /^[0-9a-f]{12}4[0-9a-f]{3}[89ab][0-9a-f]{15}$/i

	static isValid(uuid: string): boolean {
        if (uuid.length == 36) {
            return this.standardPattern.test(uuid)
        }

        if (uuid.length == 32) {
            return this.compactPattern.test(uuid)
        }

        return false
	}

	static compact(uuid: string): string {
		if (!this.isValid(uuid)) {
			throw new Error("Invalid UUIDv4 format")
		}
		return uuid.replaceAll("-", "").toLowerCase()
	}

	static standard(uuid: string): string {
		const compact = UUIDUtils.compact(uuid)
		return `${compact.slice(0, 8)}-${compact.slice(8, 12)}-${compact.slice(12, 16)}-${compact.slice(16, 20)}-${compact.slice(20)}`
	}
}
