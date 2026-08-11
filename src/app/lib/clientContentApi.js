export async function fetchContentApi(path, params = {}) {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
            searchParams.set(key, String(value));
        }
    });

    const response = await fetch(`${path}?${searchParams.toString()}`, {
        headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
        throw new Error(`Content request failed with status ${response.status}`);
    }

    return response.json();
}
