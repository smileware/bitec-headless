export function generateStyleTags(processedStyles = []) {
    return processedStyles.map((style) => {
        if (style.src) {
            return `<link rel="stylesheet" href="${style.src}" />`;
        }
        if (style.after) {
            return `<style>${Array.isArray(style.after) ? style.after.join('') : style.after}</style>`;
        }
        return '';
    }).filter(Boolean).join('\n');
}
