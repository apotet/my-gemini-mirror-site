import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { collection, deleteDoc, doc, getDoc, getDocs, runTransaction, setDoc, updateDoc } from 'firebase/firestore';

if (!/^127\.0\.0\.1:\d+$/.test(process.env.FIRESTORE_EMULATOR_HOST ?? '')) {
  throw new Error('Run only against the loopback Firestore emulator.');
}

const env = await initializeTestEnvironment({
  projectId: 'demo-netops-sync',
  firestore: { rules: await readFile(new URL('../firestore.rules', import.meta.url), 'utf8') },
});
const favoriteCollection = (db, uid) => collection(db, 'netopsMirrorUsers', uid, 'favorites');
const favorite = (db, uid, id = 'l3-arp') => doc(favoriteCollection(db, uid), id);
const resume = (db, uid) => doc(db, 'netopsMirrorUsers', uid, 'settings', 'resume');

try {
  await env.clearFirestore();
  const learner = env.authenticatedContext('learner').firestore();
  const phone = env.authenticatedContext('learner').firestore();
  const other = env.authenticatedContext('other').firestore();
  const guest = env.unauthenticatedContext().firestore();

  const arp = favorite(learner, 'learner');
  await assertSucceeds(setDoc(arp, { active: true }));
  await assertSucceeds(getDoc(arp));
  await assertSucceeds(getDocs(favoriteCollection(learner, 'learner')));
  await assertSucceeds(updateDoc(arp, { active: false }));
  await assertSucceeds(setDoc(resume(learner, 'learner'), { lessonId: 'l3-arp' }));
  await assertSucceeds(getDoc(resume(learner, 'learner')));
  const importIfMissing = (db, ref, record) => runTransaction(db, async tx => {
    if (!(await tx.get(ref)).exists()) tx.set(ref, record);
  });
  await assertSucceeds(Promise.all([
    setDoc(favorite(learner, 'learner', 'l3-icmp-basics'), { active: true }),
    setDoc(favorite(phone, 'learner', 'tcpip-model'), { active: true }),
    importIfMissing(phone, favorite(phone, 'learner'), { active: true }),
    importIfMissing(phone, resume(phone, 'learner'), { lessonId: 'tcpip-model' }),
  ]));
  assert.equal((await getDoc(arp)).data().active, false);
  assert.equal((await getDoc(resume(phone, 'learner'))).data().lessonId, 'l3-arp');
  const favorites = await getDocs(favoriteCollection(phone, 'learner'));
  assert.deepEqual(favorites.docs.filter(item => item.data().active).map(item => item.id).sort(), ['l3-icmp-basics', 'tcpip-model']);

  for (const db of [guest, other]) {
    await assertFails(getDoc(favorite(db, 'learner')));
    await assertFails(getDocs(favoriteCollection(db, 'learner')));
    await assertFails(setDoc(favorite(db, 'learner'), { active: true }));
    await assertFails(getDoc(resume(db, 'learner')));
    await assertFails(setDoc(resume(db, 'learner'), { lessonId: 'l3-arp' }));
  }

  await assertSucceeds(setDoc(favorite(other, 'other'), { active: true }));
  await assertFails(deleteDoc(arp));
  await assertFails(setDoc(arp, { active: 'true' }));
  await assertFails(setDoc(arp, { active: true, extra: true }));
  await assertFails(setDoc(favorite(learner, 'learner', 'invalid lesson ID'), { active: true }));
  await assertFails(setDoc(resume(learner, 'learner'), { lessonId: 'a'.repeat(97) }));
  await assertFails(setDoc(resume(learner, 'learner'), { lessonId: 'l3-arp', answers: [] }));
  await assertFails(getDocs(collection(learner, 'netopsMirrorUsers', 'learner', 'settings')));
  await assertFails(setDoc(doc(learner, 'netopsMirrorUsers', 'learner'), { email: 'demo@example.com' }));
  console.log('PASS Firestore sync: owner-only reads and writes, schema checks, favorite removal markers');
} finally {
  await env.cleanup();
}
