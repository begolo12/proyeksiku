'use client';

/**
 * localStorage wrapper — designed to be swapped with Firebase Firestore
 */

const STORAGE_KEY = 'proyeksiku_data';

function getData() {
    if (typeof window === 'undefined') return { projects: [] };
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : { projects: [] };
    } catch {
        return { projects: [] };
    }
}

function saveData(data) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getProjects() {
    return getData().projects || [];
}

export function getProject(id) {
    const projects = getProjects();
    return projects.find(p => p.id === id) || null;
}

export function saveProject(project) {
    const data = getData();
    const index = data.projects.findIndex(p => p.id === project.id);
    if (index >= 0) {
        data.projects[index] = { ...project, updatedAt: new Date().toISOString() };
    } else {
        data.projects.push({ ...project, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    saveData(data);
    return project;
}

export function deleteProject(id) {
    const data = getData();
    data.projects = data.projects.filter(p => p.id !== id);
    saveData(data);
}

// Auth storage
const AUTH_KEY = 'proyeksiku_auth';

export function getAuth() {
    if (typeof window === 'undefined') return null;
    try {
        const auth = localStorage.getItem(AUTH_KEY);
        return auth ? JSON.parse(auth) : null;
    } catch {
        return null;
    }
}

export function setAuth(user) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

export function clearAuth() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(AUTH_KEY);
}
