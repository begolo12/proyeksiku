'use client';

/**
 * Go API implementation (Replacing Firebase)
 */
import {
    apiGetProjects,
    apiGetProject,
    apiSaveProject,
    apiDeleteProject
} from './api';

export async function getProjects() {
    try {
        return await apiGetProjects();
    } catch (error) {
        console.error('Error getting projects:', error);
        return [];
    }
}

export async function getProject(id) {
    if (!id) return null;
    try {
        return await apiGetProject(id);
    } catch (error) {
        console.error('Error getting project:', error);
        return null;
    }
}

export async function saveProject(project) {
    try {
        return await apiSaveProject(project);
    } catch (error) {
        console.error('Error saving project:', error);
        throw error;
    }
}

export async function deleteProject(id) {
    if (!id) return;
    try {
        await apiDeleteProject(id);
    } catch (error) {
        console.error('Error deleting project:', error);
        throw error;
    }
}

// Auth storage is now handled directly by AuthContext
export function getAuth() { return null; }
export function setAuth() { }
export function clearAuth() { }
