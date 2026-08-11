export function readContentInteger(
    searchParams,
    name,
    { fallback = null, min = 1, max = Number.MAX_SAFE_INTEGER } = {}
) {
    const rawValue = searchParams.get(name);
    if (rawValue === null) {
        return { valid: true, value: fallback };
    }
    if (!/^\d+$/.test(rawValue)) {
        return { valid: false, value: null };
    }

    const value = Number.parseInt(rawValue, 10);
    return Number.isSafeInteger(value) && value >= min && value <= max
        ? { valid: true, value }
        : { valid: false, value: null };
}

export function readContentEnum(searchParams, name, allowed, fallback) {
    const value = searchParams.get(name);
    if (value === null) {
        return { valid: true, value: fallback };
    }
    return allowed.has(value)
        ? { valid: true, value }
        : { valid: false, value: null };
}

export function readContentLanguage(searchParams) {
    return readContentEnum(searchParams, 'language', new Set(['en', 'th']), 'en');
}
