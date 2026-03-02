
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

export const getApiUrl = (endpoint: string) => {
    // Ensure the endpoint starts with a slash
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${API_BASE_URL}${cleanEndpoint}`;
};
