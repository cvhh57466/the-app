import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import fs from 'fs';

// @ts-ignore
const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function addHistoryTag() {
  const querySnapshot = await getDocs(collection(db, 'attractions'));
  let updatedCount = 0;

  for (const docSnap of querySnapshot.docs) {
    const data = docSnap.data();
    const categories = data.categories || [];
    const textToSearch = ((data.name || '') + ' ' + (data.description || '')).toLowerCase();

    // 判斷是否應該加上「歷史」標籤
    const keywords = ['歷史', '古蹟', '老街', '人文', '眷村', '遺址', '文化', '廟', '神社'];
    const shouldAddHistory = keywords.some(kw => textToSearch.includes(kw));

    if (shouldAddHistory && !categories.includes('歷史')) {
      categories.push('歷史');
      await updateDoc(doc(db, 'attractions', docSnap.id), { categories });
      updatedCount++;
      console.log(`Added '歷史' tag to: ${data.name}`);
    }
  }

  console.log(`Done! Updated ${updatedCount} attractions.`);
  process.exit(0);
}

addHistoryTag();
