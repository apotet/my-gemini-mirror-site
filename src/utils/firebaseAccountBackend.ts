// This file is imported on demand, never by the initial guest bundle.
import { initializeApp, type FirebaseOptions } from 'firebase/app';
import { browserLocalPersistence, browserPopupRedirectResolver, GoogleAuthProvider, inMemoryPersistence, initializeAuth, onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { collection, doc, initializeFirestore, memoryLocalCache, onSnapshot, runTransaction } from 'firebase/firestore';
import type { AccountSyncBackend, SyncIdentity } from './accountSyncStore';

const userLabel = (user: User): SyncIdentity => ({
  uid: user.uid, label: user.email || user.displayName || 'Аккаунт Google',
});

export function createFirebaseAccountBackend(config: FirebaseOptions): AccountSyncBackend {
  const app = initializeApp(config, 'netops-mirror-account');
  const auth = initializeAuth(app, {
    persistence: [browserLocalPersistence, inMemoryPersistence],
    popupRedirectResolver: browserPopupRedirectResolver,
  });
  const db = initializeFirestore(app, { localCache: memoryLocalCache() });
  const root = 'netopsMirrorUsers';
  const favorite = (uid: string, id: string) => doc(db, root, uid, 'favorites', id);
  const resume = (uid: string) => doc(db, root, uid, 'settings', 'resume');
  function assertCurrent(uid: string, current: () => boolean) {
    if (!current() || auth.currentUser?.uid !== uid) throw new Error('Signed-in account changed');
    if (typeof navigator !== 'undefined' && !navigator.onLine) throw new Error('Offline');
  }

  return {
    observeAuth: (next, failed) => onAuthStateChanged(auth, user => next(user ? userLabel(user) : null), failed),
    signIn: async () => {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      return userLabel((await signInWithPopup(auth, provider)).user);
    },
    signOut: () => signOut(auth),
    watchFavorites: (uid, next, failed) => onSnapshot(
      collection(db, root, uid, 'favorites'), { includeMetadataChanges: true },
      snapshot => next({
        value: snapshot.docs.filter(item => item.data().active === true).map(item => item.id),
        confirmed: !snapshot.metadata.fromCache && !snapshot.metadata.hasPendingWrites,
      }), failed,
    ),
    watchResume: (uid, next, failed) => onSnapshot(
      resume(uid), { includeMetadataChanges: true },
      snapshot => {
        const value: unknown = snapshot.data()?.lessonId;
        next({
          value: typeof value === 'string' ? value : null,
          confirmed: !snapshot.metadata.fromCache && !snapshot.metadata.hasPendingWrites,
        });
      }, failed,
    ),
    setFavorite: async (uid, id, active, current) => {
      assertCurrent(uid, current);
      await runTransaction(db, async transaction => {
        assertCurrent(uid, current);
        transaction.set(favorite(uid, id), { active });
      });
    },
    setResume: async (uid, lessonId, current) => {
      assertCurrent(uid, current);
      await runTransaction(db, async transaction => {
        assertCurrent(uid, current);
        transaction.set(resume(uid), { lessonId });
      });
    },
    importMissing: async (uid, data, current) => {
      // Separate create-if-missing transactions cannot overwrite another device’s
      // record or resurrect a favorite that was explicitly removed (tombstone).
      for (const id of data.favorites) {
        assertCurrent(uid, current);
        const ref = favorite(uid, id);
        await runTransaction(db, async transaction => {
          assertCurrent(uid, current);
          const existing = await transaction.get(ref);
          assertCurrent(uid, current);
          if (!existing.exists()) transaction.set(ref, { active: true });
        });
      }
      const lessonId = data.resumeId;
      if (lessonId) {
        assertCurrent(uid, current);
        const ref = resume(uid);
        await runTransaction(db, async transaction => {
          assertCurrent(uid, current);
          const existing = await transaction.get(ref);
          assertCurrent(uid, current);
          if (!existing.exists()) transaction.set(ref, { lessonId });
        });
      }
    },
  };
}
