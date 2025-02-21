export class TextUtils {
    static removeFormatting(text: string) {
        return text.replace(/\u00A7[0-9A-FK-OR]/gi, "");
    }

    static toSnakeCase(text: string): string {
        return text.replace(/\s+/g, '_').toLowerCase()
    }
}