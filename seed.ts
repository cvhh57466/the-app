import { db } from './src/firebase.ts';
import { attractions } from './src/data.ts';
import { doc, setDoc } from 'firebase/firestore';

async function seed() {
  console.log('Seeding ' + attractions.length + ' attractions...');
  let count = 0;
  for (const item of attractions) {
    try {
      await setDoc(doc(db, 'attractions', item.id), item);
      count++;
    } catch (err) {
      console.error('Failed to insert ' + item.id, err);
    }
  }
  console.log(`Successfully seeded ${count} attractions.`);
  process.exit(0);
}

seed();
