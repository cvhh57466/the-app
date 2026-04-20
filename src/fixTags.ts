import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import fs from 'fs';

// @ts-ignore
const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const STRICT_CATEGORY_MAP = {
  "美食": ['餐廳', '小吃', '小吃攤', '夜市', '咖啡廳', '甜點', '海鮮', '風味餐', '特色料理', '小館'],
  "騎車": ['自行車道', '單車道', '鐵馬道', '自行車步道', '綠色隧道'],
  "藝文": ['藝術', '展覽', '文創', '博物館', '美術館', '音樂', '圖書館', '書法', '故事館'],
  "親子": ['溜滑梯', '沙坑', '親子', '遊戲場', '兒童', '牧場', '農場'],
  "購物": ['商圈', '購物中心', '百貨', 'outlet', '市場', '市集', '廣場', '老街'],
  "夜景": ['夜景', '觀景台', '點燈', '光雕', '看夜景']
};

const INVALID_FOOD_MATCHES = ['野餐', '餐飲', '套餐', '提供餐', '賣餐', '買'];

async function fixTags() {
  const querySnapshot = await getDocs(collection(db, 'attractions'));
  let updatedCount = 0;

  for (const docSnap of querySnapshot.docs) {
    const data = docSnap.data();
    // We want to rebuild the list.
    // If we can't reliably rebuild, maybe we just explicitly REMOVE "美食" from obvious non-food places?
    // Actually, let's keep "踏青" and "歷史" and whatever was there initially.
    // Since I messed it up, let's just do a pass to filter out bad "美食".
    let categories = data.categories || [];
    let originalCategories = [...categories];
    const textToSearch = ((data.name || '') + ' ' + (data.description || '')).toLowerCase();

    // 1. If it's a park, pond, etc. without explicit food words, remove food.
    if (categories.includes('美食')) {
      const hasStrictFood = STRICT_CATEGORY_MAP['美食'].some(kw => textToSearch.includes(kw));
      const hasInvalidFood = INVALID_FOOD_MATCHES.some(kw => textToSearch.includes(kw));
      const isNature = ['公園', '步道', '埤塘', '保護區', '水庫', '森林', '水地', '農場'].some(kw => textToSearch.includes(kw));
      
      // If it is a nature area, and doesn't clearly state "餐廳" or "夜市", AND we only matched loosely last time...
      // Let's just remove "美食" if it doesn't match the new STRICT map.
      if (!hasStrictFood && !textToSearch.includes('老街')) { // Lao jie (old street) always has food
        categories = categories.filter(c => c !== '美食');
      }
      
      // If it matched invalid like "野餐" (picnic), definitely not "美食" unless it's a restaurant.
      if (hasInvalidFood && !hasStrictFood && !textToSearch.includes('老街')) {
        categories = categories.filter(c => c !== '美食');
      }
    }

    // If categories changed, save it
    if (categories.join(',') !== originalCategories.join(',')) {
      await updateDoc(doc(db, 'attractions', docSnap.id), { categories });
      updatedCount++;
      console.log(`Cleaned: ${data.name} -> removed invalid tags. New tags: ${categories.join(', ')}`);
    }
  }

  console.log(`Done! Cleaned ${updatedCount} attractions.`);
  process.exit(0);
}

fixTags();
