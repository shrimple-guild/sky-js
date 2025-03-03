import romans from "romans"
export class TextUtils {
	/**
	 * Removes Minecraft formatting codes from a given text.
	 *
	 * @param {string} text - The input text containing formatting codes.
	 * @returns {string} The cleaned text without formatting codes.
	 */
	static removeFormatting(text: string): string {
		return text.replace(/\u00A7[0-9A-FK-OR]/gi, "")
	}

	/**
	 * Converts a given text to snake_case.
	 * Spaces are replaced with underscores, and all letters are converted to lowercase.
	 *
	 * @param {string} text - The input text to be converted.
	 * @returns {string} The snake_case version of the input text.
	 */
	static toSnakeCase(text: string): string {
		return text.replace(/\s+/g, "_").toLowerCase()
	}

	/**
	 * Converts a given text to Title Case.
	 * Removes underscores. Then, each word's first letter is capitalized, and the rest
	 * are converted to lowercase.
	 *
	 * @param {string} text - The input text to be converted.
	 * @returns {string} The title-cased version of the input text.
	 */
	static toTitleCase(text: string): string {
		return text.replaceAll("_", " ").replace(/\w\S*/g, (txt) => {
			return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
		})
	}

	static stripNonAscii(text: string): string {
		return text.replace(/[^\x00-\x7F]/g, "")
	}

	static attemptDeromanize(text: string): string {
		try {
			return romans.deromanize(text).toString()
		} catch (e) {
			return text
		}
	}

	static attemptDeromanizeLast(text: string): string {
		const split = text.split(" ")
		if (split.length <= 1) return text
		const last = this.attemptDeromanize(split.pop()!!)
		split.push(last)
		return split.join(" ")
 	}	
}
