import { db } from './src/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

const contexts = ["雨天備案", "寵物友善", "推車友善", "夜間景點", "免門票", "網美打卡", "情侶約會", "文青必讀"];
const hoursPool = ["09:00 - 18:00", "24 小時開放", "11:00 - 21:00", "10:00 - 20:00", "週一休館，平日 10:00-17:00"];
const tickets = ["免門票", "全票 $150 / 半票 $75", "免門票", "依現場公告為主", "入園 $200 (可抵消費)"];

async function upgrade() {
  console.log("Upgrading database...");
  const qs = await getDocs(collection(db, 'attractions'));
  let count = 0;
  for (const d of qs.docs) {
    const data = d.data();
    
    // Pick 1-3 random context tags
    const shuffledContexts = [...contexts].sort(() => 0.5 - Math.random());
    const selectedContexts = shuffledContexts.slice(0, Math.floor(Math.random() * 3) + 1);
    
    const updates = {
       contextTags: data.contextTags || selectedContexts,
       hours: data.hours || hoursPool[Math.floor(Math.random() * hoursPool.length)],
       ticketInfo: data.ticketInfo || tickets[Math.floor(Math.random() * tickets.length)]
    };
    await updateDoc(doc(db, 'attractions', d.id), updates);
    count++;
  }
  console.log(`upgraded ${count} attractions`);
  process.exit(0);
}

upgrade();
