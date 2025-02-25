export class TextUtils {
    static removeFormatting(text: string) {
        return text.replace(/\u00A7[0-9A-FK-OR]/gi, "");
    }

    static toSnakeCase(text: string): string {
        return text.replace(/\s+/g, '_').toLowerCase()
    }

    static toTitleCase(text: string): string {
        return text.replace(/\w\S*/g, (txt) => {
            return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
        });
    }
}