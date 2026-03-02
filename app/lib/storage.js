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
        const p = await apiGetProject(id);
        // Normalize backend JSON string fields to what the frontend expects
        if (p && p.pitchDeck) {
            p.pitch = { ...p.pitchDeck };
            try { p.pitch.marketSize = JSON.parse(p.pitchDeck.marketSizeJson || '{}'); } catch (e) { }
            try { p.pitch.competitors = JSON.parse(p.pitchDeck.competitorsJson || '[]'); } catch (e) { }
            try { p.pitch.team = JSON.parse(p.pitchDeck.teamJson || '[]'); } catch (e) { }
            p.pitch.unitEconomics = { cac: p.pitchDeck.cac || 0, ltv: p.pitchDeck.ltv || 0 };
        }
        return p;
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
