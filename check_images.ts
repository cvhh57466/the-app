import { db } from './src/firebase';
import { collection, getDocs } from 'firebase/firestore';

async function check() {
  const qs = await getDocs(collection(db, 'attractions'));
  let checked = 0;
  qs.forEach(d => {
    if (checked < 10) {
      console.log(d.data().name, d.data().categories, d.data().imageUrl);
    }
    checked++;
  });
  console.log("total", checked);
  process.exit(0);
}

check();
