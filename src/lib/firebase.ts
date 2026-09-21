import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  getDocFromServer,
  collection, 
  getDocs, 
  deleteDoc, 
  query, 
  orderBy, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Destination, Provider } from '../types';

// Initialize Firebase SDK
export const firebaseApp = initializeApp(firebaseConfig);

// Initialize Firestore with configured database ID
export const db = getFirestore(
  firebaseApp, 
  firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? firebaseConfig.firestoreDatabaseId
    : '(default)'
);

// Initialize Firebase Auth
export const auth = getAuth(firebaseApp);
export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.setCustomParameters({
  prompt: 'select_account'
});

// Diagnostic connection test as recommended by Firebase integration guidelines
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('[Firebase] Connection to Firestore verified.');
    return true;
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Firebase] Firestore client appears offline. Retrying or using cache.');
    }
    return false;
  }
}

// User Profile model in Firestore
export interface FirestoreUserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'traveller' | 'admin';
  responsiblePoints: number;
  createdAt: string;
  updatedAt: string;
}

// Authentication Helpers
export async function signInWithGoogle(): Promise<FirebaseUser> {
  const result = await signInWithPopup(auth, googleAuthProvider);
  const user = result.user;
  
  // Sync or create user profile in Firestore
  try {
    const userRef = doc(db, 'users', user.uid);
    const existingSnap = await getDoc(userRef);
    if (!existingSnap.exists()) {
      const newProfile: FirestoreUserProfile = {
        id: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'Kerala Explorer',
        photoURL: user.photoURL || '',
        role: 'traveller',
        responsiblePoints: 85,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await setDoc(userRef, newProfile);
    }
  } catch (err) {
    console.warn('[Firebase] Could not auto-sync user profile doc:', err);
  }
  
  return user;
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

// Firestore Persistence: User Profile
export async function syncUserProfile(user: FirebaseUser, role?: 'traveller' | 'admin'): Promise<FirestoreUserProfile | null> {
  try {
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data() as FirestoreUserProfile;
      if (role && data.role !== role) {
        const updated = { ...data, role, updatedAt: new Date().toISOString() };
        await setDoc(userRef, updated, { merge: true });
        return updated;
      }
      return data;
    } else {
      const profile: FirestoreUserProfile = {
        id: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'Responsible Traveller',
        photoURL: user.photoURL || '',
        role: role || 'traveller',
        responsiblePoints: 85,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await setDoc(userRef, profile);
      return profile;
    }
  } catch (err) {
    console.warn('[Firebase] Error syncing profile:', err);
    return null;
  }
}

// Firestore Persistence: Saved Itineraries
export interface FirestoreItinerary {
  id: string;
  userId: string;
  title: string;
  corridor: string;
  score: number;
  daysCount: number;
  totalBudget: number;
  createdAt: string;
  updatedAt: string;
  stopsSummary?: string;
}

export async function saveItineraryToFirestore(userId: string, itinerary: Omit<FirestoreItinerary, 'userId' | 'createdAt' | 'updatedAt'>): Promise<boolean> {
  try {
    const itRef = doc(db, 'users', userId, 'saved_itineraries', itinerary.id);
    const now = new Date().toISOString();
    await setDoc(itRef, {
      ...itinerary,
      userId,
      createdAt: now,
      updatedAt: now
    });
    return true;
  } catch (err) {
    console.warn('[Firebase] Error saving itinerary to Firestore:', err);
    return false;
  }
}

export async function getSavedItinerariesFromFirestore(userId: string): Promise<FirestoreItinerary[]> {
  try {
    const colRef = collection(db, 'users', userId, 'saved_itineraries');
    const snap = await getDocs(colRef);
    return snap.docs.map(d => d.data() as FirestoreItinerary);
  } catch (err) {
    console.warn('[Firebase] Error loading saved itineraries:', err);
    return [];
  }
}

export async function deleteSavedItineraryFromFirestore(userId: string, itineraryId: string): Promise<boolean> {
  try {
    const itRef = doc(db, 'users', userId, 'saved_itineraries', itineraryId);
    await deleteDoc(itRef);
    return true;
  } catch (err) {
    console.warn('[Firebase] Error deleting itinerary:', err);
    return false;
  }
}

// Firestore Persistence: Bookmarked Providers
export interface FirestoreBookmark {
  id: string;
  userId: string;
  providerId: string;
  providerName: string;
  category: string;
  location: string;
  createdAt: string;
}

export async function saveBookmarkToFirestore(userId: string, bookmark: Omit<FirestoreBookmark, 'userId' | 'createdAt'>): Promise<boolean> {
  try {
    const bmRef = doc(db, 'users', userId, 'bookmarks', bookmark.id);
    await setDoc(bmRef, {
      ...bookmark,
      userId,
      createdAt: new Date().toISOString()
    });
    return true;
  } catch (err) {
    console.warn('[Firebase] Error saving bookmark:', err);
    return false;
  }
}

export async function getBookmarksFromFirestore(userId: string): Promise<FirestoreBookmark[]> {
  try {
    const colRef = collection(db, 'users', userId, 'bookmarks');
    const snap = await getDocs(colRef);
    return snap.docs.map(d => d.data() as FirestoreBookmark);
  } catch (err) {
    console.warn('[Firebase] Error fetching bookmarks:', err);
    return [];
  }
}

export async function removeBookmarkFromFirestore(userId: string, bookmarkId: string): Promise<boolean> {
  try {
    const bmRef = doc(db, 'users', userId, 'bookmarks', bookmarkId);
    await deleteDoc(bmRef);
    return true;
  } catch (err) {
    console.warn('[Firebase] Error removing bookmark:', err);
    return false;
  }
}

// Firestore Persistence: Community Responsible Travel Notes
export interface FirestoreCommunityNote {
  id: string;
  userId: string;
  authorName: string;
  location: string;
  tipText: string;
  category: string;
  responsibleImpact: string;
  verified: boolean;
  createdAt: string;
}

export async function postCommunityNote(note: Omit<FirestoreCommunityNote, 'createdAt'>): Promise<boolean> {
  try {
    const noteRef = doc(db, 'community_notes', note.id);
    await setDoc(noteRef, {
      ...note,
      createdAt: new Date().toISOString()
    });
    return true;
  } catch (err) {
    console.warn('[Firebase] Error saving community note:', err);
    return false;
  }
}

export async function fetchCommunityNotes(): Promise<FirestoreCommunityNote[]> {
  try {
    const colRef = collection(db, 'community_notes');
    const snap = await getDocs(colRef);
    return snap.docs.map(d => d.data() as FirestoreCommunityNote);
  } catch (err) {
    console.warn('[Firebase] Error fetching community notes:', err);
    return [];
  }
}

// -------------------------------------------------------------
// Google Database (Firestore) Operations: Query & Seed
// -------------------------------------------------------------

export interface GoogleDatabaseQueryInput {
  location?: string;
  category?: string;
  maxBudget?: number;
  searchTerm?: string;
  verifiedOnly?: boolean;
}

/**
 * Ensures Google Cloud Firestore has seed destinations and providers.
 * If collections are empty, seeds with verified initial registry data.
 */
export async function seedGoogleDatabaseIfEmpty(
  seedDestinations: Destination[],
  seedProviders: Provider[]
): Promise<{ seededDestinations: boolean; seededProviders: boolean }> {
  let seededDestinations = false;
  let seededProviders = false;

  try {
    const destSnap = await getDocs(collection(db, 'destinations'));
    if (destSnap.empty && seedDestinations.length > 0) {
      console.log(`[Google DB] Seeding ${seedDestinations.length} destinations to Firestore...`);
      for (const dest of seedDestinations) {
        await setDoc(doc(db, 'destinations', dest.id), dest);
      }
      seededDestinations = true;
    }

    const provSnap = await getDocs(collection(db, 'providers'));
    if (provSnap.empty && seedProviders.length > 0) {
      console.log(`[Google DB] Seeding ${seedProviders.length} providers & stays to Firestore...`);
      for (const prov of seedProviders) {
        await setDoc(doc(db, 'providers', prov.id), prov);
      }
      seededProviders = true;
    }
  } catch (err) {
    console.warn('[Google DB] Error during database seed check:', err);
  }

  return { seededDestinations, seededProviders };
}

/**
 * Query Destinations from the Google Firestore database based on location / area input
 */
export async function fetchDestinationsFromGoogleDB(areaFilter?: string): Promise<{
  data: Destination[];
  source: 'google-firestore-db' | 'local-fallback';
  queriedAt: string;
}> {
  try {
    const colRef = collection(db, 'destinations');
    const snap = await getDocs(colRef);

    if (!snap.empty) {
      let results = snap.docs.map(d => d.data() as Destination);
      if (areaFilter && areaFilter !== 'All Locations') {
        const lowerFilter = areaFilter.toLowerCase();
        results = results.filter(d => 
          d.area.toLowerCase().includes(lowerFilter) || 
          d.name.toLowerCase().includes(lowerFilter) ||
          d.tagline.toLowerCase().includes(lowerFilter)
        );
      }
      return {
        data: results,
        source: 'google-firestore-db',
        queriedAt: new Date().toLocaleTimeString()
      };
    }
  } catch (err) {
    console.warn('[Google DB] Firestore destination query failed, falling back:', err);
  }

  return {
    data: [],
    source: 'local-fallback',
    queriedAt: new Date().toLocaleTimeString()
  };
}

/**
 * Query Stays & Providers from the Google Firestore database on the basis of input
 * (location, stay category, budget slider, keyword query)
 */
export async function fetchProvidersFromGoogleDB(
  input: GoogleDatabaseQueryInput
): Promise<{
  data: Provider[];
  source: 'google-firestore-db' | 'local-fallback';
  totalMatched: number;
  queriedAt: string;
}> {
  try {
    const colRef = collection(db, 'providers');
    const snap = await getDocs(colRef);

    if (!snap.empty) {
      let results = snap.docs.map(d => d.data() as Provider);

      // Filter on basis of user input:
      // 1. Location match
      if (input.location && input.location !== 'All Locations') {
        const loc = input.location.toLowerCase();
        results = results.filter(p => p.location.toLowerCase().includes(loc));
      }

      // 2. Category match (e.g., Homestay)
      if (input.category) {
        results = results.filter(p => p.category.toLowerCase() === input.category?.toLowerCase());
      }

      // 3. Budget cap match
      if (typeof input.maxBudget === 'number' && input.maxBudget > 0) {
        results = results.filter(p => p.startingPrice <= (input.maxBudget ?? 10000));
      }

      // 4. Keyword search term
      if (input.searchTerm && input.searchTerm.trim() !== '') {
        const query = input.searchTerm.toLowerCase().trim();
        results = results.filter(p => 
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.location.toLowerCase().includes(query) ||
          p.services.some(s => s.toLowerCase().includes(query))
        );
      }

      // 5. Verification status
      if (input.verifiedOnly) {
        results = results.filter(p => p.verificationStatus === 'Verified Local Partner' || p.verificationStatus === 'Official Source');
      }

      return {
        data: results,
        source: 'google-firestore-db',
        totalMatched: results.length,
        queriedAt: new Date().toLocaleTimeString()
      };
    }
  } catch (err) {
    console.warn('[Google DB] Firestore provider query failed, falling back:', err);
  }

  return {
    data: [],
    source: 'local-fallback',
    totalMatched: 0,
    queriedAt: new Date().toLocaleTimeString()
  };
}
