import fetch from 'node-fetch';
import { db } from './src/firebase';
import { collection, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore';

async function run() {
  let allSpots = [];
  
  // 1. Fetch Attractions
  console.log("Fetching Attractions...");
  let page = 1;
  let hasMore = true;
  while (hasMore) {
    try {
      const res = await fetch(`https://travel.tycg.gov.tw/open-api/zh-tw/Travel/Attraction?page=${page}`, { headers: { 'Accept': 'application/json' } });
      const data = await res.json() as any;
      if (data && data.Infos && data.Infos.Info && data.Infos.Info.length > 0) {
        for (const s of data.Infos.Info) {
          if (s.Images && s.Images.Image && s.Images.Image.length > 0) {
             let imgInfo = s.Images.Image;
             if (!Array.isArray(imgInfo)) imgInfo = [imgInfo]; 
             if (imgInfo[0] && imgInfo[0].Src) {
               allSpots.push({
                 id: "A-" + s.Id,
                 name: s.Name,
                 category: s.TYCategory || "踏青",
                 ticket: s.Ticketinfo || "免費或依現場為主",
                 hours: s.Opentime || "依官方公告為主",
                 desc: s.Description || s.Toldescribe || "推薦景點",
                 lng: parseFloat(s.Px),
                 lat: parseFloat(s.Py),
                 imageUrl: imgInfo[0].Src
               });
             }
          }
        }
        page++;
      } else {
        hasMore = false;
      }
    } catch(e) { hasMore = false; }
  }

  // 2. Fetch Restaurants
  console.log("Fetching Restaurants...");
  page = 1;
  hasMore = true;
  while (hasMore) {
    try {
      const res = await fetch(`https://travel.tycg.gov.tw/open-api/zh-tw/Travel/Restaurant?page=${page}`, { headers: { 'Accept': 'application/json' } });
      const data = await res.json() as any;
      if (data && data.Infos && data.Infos.Info && data.Infos.Info.length > 0) {
        for (const s of data.Infos.Info) {
          if (s.Images && s.Images.Image && s.Images.Image.length > 0) {
             let imgInfo = s.Images.Image;
             if (!Array.isArray(imgInfo)) imgInfo = [imgInfo]; 
             if (imgInfo[0] && imgInfo[0].Src) {
               allSpots.push({
                 id: "R-" + s.Id,
                 name: s.Name,
                 category: "美食",  // Force food category
                 ticket: "依餐點計費",
                 hours: s.Opentime || "依各店家為主",
                 desc: s.Description || s.Toldescribe || "推薦必吃美食餐廳",
                 lng: parseFloat(s.Px),
                 lat: parseFloat(s.Py),
                 imageUrl: imgInfo[0].Src
               });
             }
          }
        }
        page++;
      } else {
        hasMore = false;
      }
    } catch(e) { hasMore = false; }
  }
  
  // 3. Fetch Accommodation (just for hot spring / resorts if any, but let's take them as '飯店/住宿')
  console.log("Fetching Accommodation...");
  page = 1;
  hasMore = true;
  while (hasMore) {
    try {
      const res = await fetch(`https://travel.tycg.gov.tw/open-api/zh-tw/Travel/Accommodation?page=${page}`, { headers: { 'Accept': 'application/json' } });
      const data = await res.json() as any;
      if (data && data.Infos && data.Infos.Info && data.Infos.Info.length > 0) {
        for (const s of data.Infos.Info) {
          if (s.Images && s.Images.Image && s.Images.Image.length > 0) {
             let imgInfo = s.Images.Image;
             if (!Array.isArray(imgInfo)) imgInfo = [imgInfo]; 
             if (imgInfo[0] && imgInfo[0].Src) {
               allSpots.push({
                 id: "H-" + s.Id,
                 name: s.Name,
                 category: "放鬆", // Treat hotels as relaxation
                 ticket: "依房型與專案計費",
                 hours: "24小時服務",
                 desc: s.Description || s.Toldescribe || "精選住宿與渡假村",
                 lng: parseFloat(s.Px),
                 lat: parseFloat(s.Py),
                 imageUrl: imgInfo[0].Src
               });
             }
          }
        }
        page++;
      } else {
        hasMore = false;
      }
    } catch(e) { hasMore = false; }
  }

  console.log(`Finished fetching! Total spots with guaranteed images: ${allSpots.length}`);

  // Pre-process categories and contexts
  const finalAttractions = allSpots.map(s => {
    const rawCat = typeof s.category === 'string' ? s.category : (Array.isArray(s.category) ? s.category[0] : "踏青");
    const catMap: Record<string, string> = {
      "自然風景": "踏青", "觀光工廠": "親子", "休閒農場": "踏青",
      "產業文化": "歷史", "歷史建築": "歷史", "文化設施": "藝文",
      "在地美食": "美食", "特色街區": "購物", "公園": "親子",
      "美食": "美食", "放鬆": "住宿"
    };
    let cat = catMap[rawCat] || "踏青";
    
    // Auto tags based on text
    let tags = [];
    if (s.name.includes('園') || s.name.includes('牧場') || s.name.includes('工廠') || cat==='親子') tags.push('親子同遊');
    if (cat === '住宿' || cat === '美食') tags.push('雨天備案');
    if (s.desc.includes('免門票') || s.ticket.includes('免費') || s.ticket.includes('Free')) tags.push('免門票');
    if (s.name.includes('浪漫') || s.desc.includes('約會') || cat==='住宿') tags.push('情侶約會');
    // Ensure unique
    tags = [...Array.from(new Set(tags))];
    if (tags.length === 0) tags.push('網美打卡');

    return {
       name: s.name,
       categories: [cat],
       contextTags: tags,
       lat: s.lat,
       lng: s.lng,
       description: s.desc.substring(0, 480) + (s.desc.length > 480 ? '...' : ''),
       imageUrl: s.imageUrl,
       hours: s.hours.substring(0, 90),
       ticketInfo: s.ticket.substring(0, 90)
    };
  });

  const uniqueSites = [];
  const names = new Set();
  for (const f of finalAttractions) {
     if (!names.has(f.name)) {
        names.add(f.name);
        uniqueSites.push(f);
     }
  }

  console.log(`Writing ${uniqueSites.length} unique robust official spots...`);
  for (let i=0; i<uniqueSites.length; i++) {
    const attr = uniqueSites[i];
    const docId = `ty-mega-${i.toString().padStart(4, '0')}`;
    await setDoc(doc(db, 'attractions', docId), attr);
    if (i % 100 === 0) console.log(`Written ${i} spots...`);
  }

  console.log("Database successfully MEGA-SEEDED!");
  process.exit(0);
}

run();
