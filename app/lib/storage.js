'use client';

/**
 * Firebase Firestore implementation
 */
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy
} from 'firebase/firestore';
import { db, auth } from './firebase';

const COLLECTION_NAME = 'projects';

export async function getProjects() {
    if (!auth.currentUser) return [];

    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where('userId', '==', auth.currentUser.uid),
            orderBy('updatedAt', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error getting projects:', error);
        return [];
    }
}

export async function getProject(id) {
    if (!id) return null;
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            // Basic security check: ensure it belongs to the user
            if (data.userId === auth.currentUser?.uid) {
                return { id: docSnap.id, ...data };
            }
        }
        return null;
    } catch (error) {
        console.error('Error getting project:', error);
        return null;
    }
}

export async function saveProject(project) {
    if (!auth.currentUser) throw new Error('User harus login untuk menyimpan data.');

    const projectId = project.id;
    const projectRef = doc(db, COLLECTION_NAME, projectId);

    const now = new Date().toISOString();
    const projectData = {
        ...project,
        userId: auth.currentUser.uid,
        updatedAt: now
    };

    // If it's a new project, add createdAt
    const docSnap = await getDoc(projectRef);
    if (!docSnap.exists()) {
        projectData.createdAt = now;
    }

    try {
        await setDoc(projectRef, projectData, { merge: true });
        return projectData;
    } catch (error) {
        console.error('Error saving project:', error);
        throw error;
    }
}

export async function deleteProject(id) {
    if (!id) return;
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await deleteDoc(docRef);
    } catch (error) {
        console.error('Error deleting project:', error);
    }
}

// Auth storage is now handled directly by Firebase and AuthContext
export function getAuth() { return null; }
export function setAuth() { }
export function clearAuth() { }
