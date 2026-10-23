import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import { initializeFirebaseApp } from './firebase';
import type { Routine, Todo, DailyReflection, UserProfile, ThemeConfig } from '../types';

/**
 * Safe timeout wrapper for Cloud Firestore network calls.
 * Ensures local-first operations never hang indefinitely if Firestore API is disabled, offline, or slow.
 */
const FIRESTORE_TIMEOUT_MS = 3000;

function withTimeout<T>(promise: Promise<T>, timeoutMs = FIRESTORE_TIMEOUT_MS): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Cloud Firestore request timed out after ${timeoutMs}ms`)),
        timeoutMs
      )
    ),
  ]);
}

/**
 * Get the initialized Firestore database instance
 */
function getDb() {
  const { db } = initializeFirebaseApp();
  return db;
}

// ==========================================
// USER PROFILE & ONBOARDING
// ==========================================

export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const db = getDb();
  if (!db) return null;

  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await withTimeout(getDoc(userDocRef));
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
  } catch (err) {
    console.warn('Could not fetch user profile from Cloud Firestore:', err);
  }
  return null;
}

export async function saveUserProfile(uid: string, profile: Partial<UserProfile>): Promise<void> {
  const db = getDb();
  if (!db) return;

  try {
    const userDocRef = doc(db, 'users', uid);
    await withTimeout(
      setDoc(
        userDocRef,
        {
          ...profile,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      )
    );
  } catch (err) {
    console.warn('Could not save user profile to Cloud Firestore:', err);
    throw err;
  }
}

export async function fetchUserTheme(uid: string): Promise<ThemeConfig | null> {
  const db = getDb();
  if (!db) return null;

  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await withTimeout(getDoc(userDocRef));
    if (snap.exists()) {
      const data = snap.data();
      if (data.themeConfig) {
        return data.themeConfig as ThemeConfig;
      }
    }
  } catch (err) {
    console.warn('Could not fetch theme from Cloud Firestore:', err);
  }
  return null;
}

export async function saveUserTheme(uid: string, theme: ThemeConfig): Promise<void> {
  const db = getDb();
  if (!db) return;

  try {
    const userDocRef = doc(db, 'users', uid);
    await withTimeout(
      setDoc(
        userDocRef,
        {
          themeConfig: theme,
          colorMode: theme.colorMode,
          starterTheme: theme.presetId,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      )
    );
  } catch (err) {
    console.warn('Could not save user theme to Cloud Firestore:', err);
    throw err;
  }
}

// ==========================================
// ROUTINES
// ==========================================

export async function fetchUserRoutines(uid: string): Promise<Routine[]> {
  const db = getDb();
  if (!db) return [];

  try {
    const colRef = collection(db, 'users', uid, 'routines');
    const snap = await withTimeout(getDocs(colRef));
    const routines: Routine[] = [];
    snap.forEach(docSnap => {
      routines.push(docSnap.data() as Routine);
    });
    return routines.sort((a, b) => a.order - b.order);
  } catch (err) {
    console.warn('Could not fetch routines from Cloud Firestore (using local storage):', err);
    return [];
  }
}

export async function saveUserRoutine(uid: string, routine: Routine): Promise<void> {
  const db = getDb();
  if (!db) return;

  try {
    const docRef = doc(db, 'users', uid, 'routines', routine.id);
    await withTimeout(setDoc(docRef, routine, { merge: true }), 3000);
  } catch (err) {
    console.warn('Could not sync routine to Cloud Firestore (saved safely in local storage):', err);
    throw err;
  }
}

export async function deleteUserRoutine(uid: string, routineId: string): Promise<void> {
  const db = getDb();
  if (!db) return;

  try {
    const docRef = doc(db, 'users', uid, 'routines', routineId);
    await withTimeout(deleteDoc(docRef), 3000);
  } catch (err) {
    console.warn('Could not delete routine from Cloud Firestore:', err);
    throw err;
  }
}

// ==========================================
// TODOS
// ==========================================

export async function fetchUserTodos(uid: string): Promise<Todo[]> {
  const db = getDb();
  if (!db) return [];

  try {
    const colRef = collection(db, 'users', uid, 'todos');
    const snap = await withTimeout(getDocs(colRef));
    const todos: Todo[] = [];
    snap.forEach(docSnap => {
      todos.push(docSnap.data() as Todo);
    });
    return todos.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (err) {
    console.warn('Could not fetch todos from Cloud Firestore:', err);
    return [];
  }
}

export async function saveUserTodo(uid: string, todo: Todo): Promise<void> {
  const db = getDb();
  if (!db) return;

  try {
    const docRef = doc(db, 'users', uid, 'todos', todo.id);
    await withTimeout(setDoc(docRef, todo, { merge: true }), 3000);
  } catch (err) {
    console.warn('Could not save todo to Cloud Firestore:', err);
    throw err;
  }
}

export async function deleteUserTodo(uid: string, todoId: string): Promise<void> {
  const db = getDb();
  if (!db) return;

  try {
    const docRef = doc(db, 'users', uid, 'todos', todoId);
    await withTimeout(deleteDoc(docRef), 3000);
  } catch (err) {
    console.warn('Could not delete todo from Cloud Firestore:', err);
    throw err;
  }
}

// ==========================================
// REFLECTIONS
// ==========================================

export async function fetchUserReflections(uid: string): Promise<Record<string, DailyReflection>> {
  const db = getDb();
  if (!db) return {};

  try {
    const colRef = collection(db, 'users', uid, 'reflections');
    const snap = await withTimeout(getDocs(colRef));
    const reflections: Record<string, DailyReflection> = {};
    snap.forEach(docSnap => {
      const data = docSnap.data() as DailyReflection;
      reflections[data.date] = data;
    });
    return reflections;
  } catch (err) {
    console.warn('Could not fetch reflections from Cloud Firestore:', err);
    return {};
  }
}

export async function saveUserReflection(uid: string, reflection: DailyReflection): Promise<void> {
  const db = getDb();
  if (!db) return;

  try {
    const docRef = doc(db, 'users', uid, 'reflections', reflection.date);
    await withTimeout(setDoc(docRef, reflection, { merge: true }), 3000);
  } catch (err) {
    console.warn('Could not save reflection to Cloud Firestore:', err);
    throw err;
  }
}

export async function carryForwardUserTodos(uid: string, todoIds: string[], newDueDate: string): Promise<void> {
  const db = getDb();
  if (!db || todoIds.length === 0) return;

  try {
    const batch = writeBatch(db);
    todoIds.forEach(id => {
      const ref = doc(db, 'users', uid, 'todos', id);
      batch.update(ref, { dueDate: newDueDate, updatedAt: new Date().toISOString() });
    });
    await withTimeout(batch.commit(), 3000);
  } catch (err) {
    console.warn('Could not carry forward todos in Cloud Firestore:', err);
  }
}

export async function deleteUserAccountData(uid: string): Promise<void> {
  const db = getDb();
  if (!db) return;

  try {
    // 1. Delete routines
    const routinesSnap = await withTimeout(getDocs(collection(db, 'users', uid, 'routines')));
    for (const d of routinesSnap.docs) {
      await withTimeout(deleteDoc(d.ref));
    }

    // 2. Delete todos
    const todosSnap = await withTimeout(getDocs(collection(db, 'users', uid, 'todos')));
    for (const d of todosSnap.docs) {
      await withTimeout(deleteDoc(d.ref));
    }

    // 3. Delete reflections
    const reflectionsSnap = await withTimeout(getDocs(collection(db, 'users', uid, 'reflections')));
    for (const d of reflectionsSnap.docs) {
      await withTimeout(deleteDoc(d.ref));
    }

    // 4. Delete user document
    await withTimeout(deleteDoc(doc(db, 'users', uid)));
  } catch (err) {
    console.error('Error deleting user account data in Firestore:', err);
    throw err;
  }
}
