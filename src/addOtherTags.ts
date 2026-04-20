import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import fs from 'fs';

// @ts-ignore
const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const CATEGORY_MAP = {
  "美食": ['餐廳', '美食', '夜市', '咖啡', '甜點', '小吃', '料理', '餅', '麵', '喝', '餐', '茶', '冰', '豆干', '名產', '海鮮', '客家'],
  "騎車": ['自行車', '單車', '鐵馬', '騎車', '腳踏車', '綠色隧道', '車道', '單騎'],
  "藝文": ['藝術', '展覽', '文創', '博物館', '美術館', '音樂', '閱讀', '圖書館', '書法', '故事館', '畫', '藝文', '展出', '表演', '展館'],
  "親子": ['親子', '兒童', '溜滑梯', '玩具', '遊戲', '牧場', '農場', '動物', '生態', 'diy', '玩水', '沙坑', '遊樂', '鞦韆'],
  "購物": ['購物', '商圈', '購物中心', '百貨', 'outlet', '市場', '買', '市集', '廣場', '商場', '街', '老街'],
  "夜景": ['夜景', '觀景台', '星空', '晚', '看夜景', '點燈', '光雕', '夜間', '夕陽', '傍晚']
};

async function addTags() {
  const querySnapshot = await getDocs(collection(db, 'attractions'));
  let updatedCount = 0;

  for (const docSnap of querySnapshot.docs) {
    const data = docSnap.data();
    const categories = data.categories || [];
    const textToSearch = ((data.name || '') + ' ' + (data.description || '')).toLowerCase();

    let needsUpdate = false;

    // 我們已經有 '踏青' 和 '歷史' 了, 現在補上其他的
    for (const [category, keywords] of Object.entries(CATEGORY_MAP)) {
      const shouldAdd = keywords.some(kw => textToSearch.includes(kw));
      if (shouldAdd && !categories.includes(category)) {
        categories.push(category);
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      await updateDoc(doc(db, 'attractions', docSnap.id), { categories });
      updatedCount++;
      console.log(`Updated: ${data.name} -> ${categories.join(', ')}`);
    }
  }

  console.log(`Done! Updated ${updatedCount} attractions.`);
  process.exit(0);
}

addTags();
