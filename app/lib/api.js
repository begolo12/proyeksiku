const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

/**
 * Mendapatkan token JWT dari localStorage
 */
export const getToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('proyeksiku_token');
    }
    return null;
};

/**
 * Menyimpan token JWT ke localStorage
 */
export const setToken = (token) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('proyeksiku_token', token);
    }
};

/**
 * Menghapus token JWT dari localStorage
 */
export const removeToken = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('proyeksiku_token');
        localStorage.removeItem('proyeksiku_user');
    }
};

/**
 * Helper untuk melakukan fetch dengan header Authorization
 */
const fetchWithAuth = async (endpoint, options = {}) => {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Terjadi kesalahan pada server');
    }

    return response.json();
};

// --- AUTH API ---

export const apiLogin = async (email, password) => {
    const data = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    }).then(res => {
        if (!res.ok) return res.json().then(d => { throw new Error(d.error) });
        return res.json();
    });

    setToken(data.token);
    localStorage.setItem('proyeksiku_user', JSON.stringify(data.user));
    return data;
};

export const apiRegister = async (name, email, password) => {
    return fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
    }).then(res => {
        if (!res.ok) return res.json().then(d => { throw new Error(d.error) });
        return res.json();
    });
};

// --- PROJECTS API ---

export const apiGetProjects = () => fetchWithAuth('/projects');

export const apiGetProject = (id) => fetchWithAuth(`/projects/${id}`);

export const apiSaveProject = (projectData) => {
    const method = projectData.id ? 'PUT' : 'POST';
    const endpoint = projectData.id ? `/projects/${projectData.id}` : '/projects';
    return fetchWithAuth(endpoint, {
        method,
        body: JSON.stringify(projectData),
    });
};

export const apiDeleteProject = (id) => fetchWithAuth(`/projects/${id}`, {
    method: 'DELETE',
});
