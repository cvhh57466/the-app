import { db } from './src/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

async function fixImages() {
  const qs = await getDocs(collection(db, 'attractions'));
  let count = 0;
  
  // Categorized high-quality placeholders as fallback
  const categoryImages: Record<string, string[]> = {
    '踏青': [
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1500595046743-cd271d694cb4?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1470071131384-001b85755536?w=600&h=400&fit=crop'
    ],
    '美食': [
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1555126634-323283e090fa?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&h=400&fit=crop'
    ],
    '藝文': [
      'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1531058020387-3be344556be6?w=600&h=400&fit=crop'
    ],
    '歷史': [
      'https://images.unsplash.com/photo-1600371694380-6bc5ba5d6e2e?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1588612128710-182eb6118d6a?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1579450841258-208151ed422e?w=600&h=400&fit=crop'
    ],
    '購物': [
      'https://images.unsplash.com/photo-1555529771-835f59bfc50c?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&h=400&fit=crop'
    ],
    '夜景': [
      'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?w=600&h=400&fit=crop'
    ],
    '親子': [
      'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=600&h=400&fit=crop'
    ]
  };

  const docs = qs.docs;
  for (const d of docs) {
    const data = d.data();
    const categories = data.categories || [];
    
    // Choose fallback based on category
    let matchedGallery: string[] = [];
    for (const c of categories) {
      if (categoryImages[c]) {
        matchedGallery = categoryImages[c];
        break;
      }
    }
    if (matchedGallery.length === 0) matchedGallery = categoryImages['踏青'];
    
    // Pick deterministic image based on name length to ensure consistency but spread
    const idx = data.name.length % matchedGallery.length;
    let newImg = matchedGallery[idx];
    
    // Specific hardcoded matches for very famous places in Taoyuan to ensure complete accuracy
    if (data.name.includes("水族") || data.name.includes("Xpark")) {
      newImg = "https://images.unsplash.com/photo-1582967788606-a171c1080cb0?w=600&h=400&fit=crop";
    } else if (data.name.includes("大溪老街")) {
      newImg = "https://upload.wikimedia.org/wikipedia/commons/0/0b/%E5%A4%A7%E6%BA%AA_%E5%92%8C%E5%B9%B3%E8%B7%AF%E8%80%81%E8%A1%97_Daxi_Old_Street_-_panoramio.jpg";
    } else if (data.name.includes("華泰名品")) {
      newImg = "https://upload.wikimedia.org/wikipedia/commons/a/ae/Gloria_Outlets_20230402.jpg";
    } else if (data.name.includes("石門水庫")) {
      newImg = "https://upload.wikimedia.org/wikipedia/commons/e/ea/Shimen_Reservoir_20201121_04.jpg";
    } else if (data.name.includes("拉拉山") || data.name.includes("神木")) {
      newImg = "https://upload.wikimedia.org/wikipedia/commons/3/3b/Lalashan_Nature_Protection_Zone.jpg";
    } else if (data.name.includes("機場")) {
      newImg = "https://upload.wikimedia.org/wikipedia/commons/8/87/Taoyuan_International_Airport_Terminal_1_Departure_Hall.jpg";
    } else if (data.name.includes("慈湖")) {
      newImg = "https://upload.wikimedia.org/wikipedia/commons/0/0a/Cihu_Mausoleum_2010.jpg";
    } else if (data.name.includes("永安漁港") || data.name.includes("海螺")) {
       // 永安漁港
       newImg = "https://upload.wikimedia.org/wikipedia/commons/f/ff/Yongan_Fishing_Port_2022.jpg";
    }

    if (newImg !== data.imageUrl) {
      console.log('updating', d.id, data.name);
      await updateDoc(doc(db, 'attractions', d.id), {
        imageUrl: newImg
      });
      count++;
    }
  }
  
  console.log(`Fixed images for ${count} attractions`);
  process.exit(0);
}

fixImages();
