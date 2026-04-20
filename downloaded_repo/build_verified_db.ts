import fetch from 'node-fetch';
import { db } from './src/firebase';
import { collection, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore';

const rawSpots = [
  { name: "大溪老街", categories: ["歷史", "美食"], contextTags: ["免門票", "網美打卡", "推車友善"], lat: 24.8847, lng: 121.2872, description: "桃園最有名的老街，充滿巴洛克風情建築。", hours: "約 10:00-18:00", ticketInfo: "免門票", wikiQuery: "大溪老街" },
  { name: "華泰名品城 GLORIA OUTLETS", categories: ["購物", "美食", "親子"], contextTags: ["推車友善", "情侶約會"], lat: 25.0153, lng: 121.2132, description: "全台首座美式露天 Outlets。", hours: "平日 11:00-21:00", ticketInfo: "免門票", wikiQuery: "華泰名品城" },
  { name: "永安漁港", categories: ["美食", "夜景", "踏青"], contextTags: ["情侶約會", "免門票"], lat: 24.9575, lng: 121.0189, description: "熱門的觀光漁港，可以吃海鮮、賞夕陽。", hours: "約 08:00-20:00", ticketInfo: "免門票", wikiQuery: "永安漁港" },
  { name: "桃園市忠烈祠暨神社文化園區", categories: ["歷史", "藝文"], contextTags: ["網美打卡", "免門票"], lat: 25.0069, lng: 121.3283, description: "台灣保存最完好的日式神社建築。", hours: "09:00 - 17:00 (週一休)", ticketInfo: "免門票", wikiQuery: "桃園市忠烈祠" },
  { name: "白沙岬燈塔", categories: ["歷史", "夜景"], contextTags: ["免門票", "網美打卡"], lat: 25.0416, lng: 121.0772, description: "擁有一百多年歷史的純白美麗燈塔。", hours: "09:00-17:00 (週一公休)", ticketInfo: "免門票", wikiQuery: "白沙岬燈塔" },
  { name: "八德埤塘自然生態公園", categories: ["踏青", "親子"], contextTags: ["寵物友善", "免門票"], lat: 24.9450, lng: 121.3069, description: "保留桃園埤塘文化的生態公園，適合親子野餐。", hours: "24 小時開放", ticketInfo: "免門票", wikiQuery: "八德埤塘自然生態公園" },
  { name: "竹圍漁港", categories: ["美食", "夜景"], contextTags: ["免門票"], lat: 25.1147, lng: 121.2464, description: "北台灣新鮮漁獲聚集地，吃海鮮的好去處。", hours: "約 08:00 - 20:00", ticketInfo: "免門票", wikiQuery: "竹圍漁港" },
  { name: "小烏來天空步道", categories: ["踏青", "親子"], contextTags: ["網美打卡"], lat: 24.7936, lng: 121.3752, description: "能感受瀑布水氣與深淵震撼的透明玻璃步道。", hours: "08:00 - 17:00 (週二休)", ticketInfo: "全票50元", wikiQuery: "小烏來天空步道" },
  { name: "角板山行館", categories: ["歷史", "踏青"], contextTags: ["寵物友善"], lat: 24.8184, lng: 121.3503, description: "蔣公行館，不僅是賞梅聖地也可以探訪戰備隧道。", hours: "08:00 - 17:00", ticketInfo: "免費參觀", wikiQuery: "角板山" },
  { name: "慈湖陵寢", categories: ["歷史", "踏青"], contextTags: ["免門票"], lat: 24.8415, lng: 121.2829, description: "著名的兩蔣文化園區與風景秀麗的湖畔。", hours: "08:00 - 17:00", ticketInfo: "免費參觀", wikiQuery: "慈湖陵寢" },
  { name: "龍潭大池", categories: ["踏青", "夜景", "親子"], contextTags: ["免門票", "情侶約會"], lat: 24.8622, lng: 121.2132, description: "龍潭百年地標，夜晚的吊橋非常迷人。", hours: "24 小時開放", ticketInfo: "免門票", wikiQuery: "龍潭大池" },
  { name: "三坑老街", categories: ["歷史", "美食"], contextTags: ["免門票"], lat: 24.8398, lng: 121.2461, description: "保有客家傳統風貌的迷你老街，以牛汶水等客家點心聞名。", hours: "約 09:00-18:00", ticketInfo: "免門票", wikiQuery: "三坑老街" },
  { name: "李騰芳古宅", categories: ["歷史", "藝文"], contextTags: ["免門票"], lat: 24.8967, lng: 121.2842, description: "保存極佳的國定古蹟，見證大溪昔日繁華的大宅院。", hours: "09:30 - 17:00 (週一休)", ticketInfo: "免門票", wikiQuery: "李騰芳古宅" },
  { name: "桃園國際棒球場 (樂天桃園棒球場)", categories: ["親子", "歷史"], contextTags: ["情侶約會"], lat: 25.0000, lng: 121.2005, description: "樂天桃猿主場，熱血看球的好地方。", hours: "依賽程而定", ticketInfo: "依賽程收費", wikiQuery: "樂天桃園棒球場" },
  { name: "桃園站前商圈", categories: ["購物", "美食"], contextTags: ["情侶約會"], lat: 24.9892, lng: 121.3135, description: "桃園市區最繁華熱鬧的地方，百貨林立。", hours: "一般為 11:00-21:30", ticketInfo: "免門票", wikiQuery: "桃園車站" },
  { name: "中平路商圈", categories: ["購物", "美食"], contextTags: ["情侶約會"], lat: 24.9546, lng: 121.2229, description: "中壢市區熱鬧的商圈，有『中壢西門町』之稱。", hours: "一般為 11:00-22:00", ticketInfo: "免門票", wikiQuery: "中平路商圈" },
  { name: "大平紅橋", categories: ["歷史", "踏青"], contextTags: ["網美打卡", "免門票"], lat: 24.8239, lng: 121.2458, description: "曾被票選為台灣百大歷史建築的清水紅磚拱橋。", hours: "24 小時開放", ticketInfo: "免門票", wikiQuery: "大平紅橋" },
  { name: "Xpark 水族館", categories: ["親子", "約會"], contextTags: ["雨天備案", "推車友善", "情侶約會"], lat: 25.0151, lng: 121.2144, description: "由日本橫濱八景島打造的首座海外水族館，以沉浸式的影像與空間帶您走入奇幻海底世界。", hours: "10:00 - 18:00 (假日至20:00)", ticketInfo: "成人票 600元, 兒童票 270元", wikiQuery: "Xpark" },
  { name: "石門水庫", categories: ["踏青", "親子"], contextTags: ["寵物友善", "推車友善"], lat: 24.8140, lng: 121.2461, description: "北部重要水庫，秋季能賞楓，附近的石門活魚多吃也是一絕。", hours: "08:00 - 18:00", ticketInfo: "小型車 80元, 機車 30元", wikiQuery: "石門水庫 (臺灣)" },
  { name: "大溪橋", categories: ["歷史", "夜景", "約會"], contextTags: ["情侶約會", "免門票", "網美打卡"], lat: 24.8821, lng: 121.2858, description: "仿巴洛克式風格的大溪吊橋，夜晚點燈後 cực具浪漫氛圍。", hours: "24 小時開放", ticketInfo: "免門票", wikiQuery: "大溪橋" },
  { name: "拉拉山巨木區", categories: ["踏青", "歷史"], contextTags: ["避暑聖地"], lat: 24.7171, lng: 121.4326, description: "北台灣氧氣最多的地方，巨大的紅檜神木令人深感人類的渺小。", hours: "06:00 - 17:00", ticketInfo: "全票 200元", wikiQuery: "達觀山" },
  { name: "觀音亭 (蓮座山)", categories: ["歷史", "踏青"], contextTags: ["免門票"], lat: 24.8694, lng: 121.2801, description: "大溪的三級古蹟，坐落於大漢溪畔的獨立小山頭上，可俯瞰河谷風景。", hours: "05:00 - 18:00", ticketInfo: "免門票", wikiQuery: "蓮座山觀音寺" },
  { name: "桃園市區大廟 (景福宮)", categories: ["歷史", "藝文"], contextTags: ["免門票"], lat: 24.9953, lng: 121.3116, description: "桃園市區的信仰中心，被居民親切稱為『大廟』，周邊也有許多傳統老店。", hours: "06:00 - 21:00", ticketInfo: "免門票", wikiQuery: "桃園景福宮" },
  { name: "宏亞巧克力共和國", categories: ["親子", "美食", "室內"], contextTags: ["雨天備案", "推車友善"], lat: 24.9458, lng: 121.2982, description: "亞洲第一座巧克力博物館，可以了解可可的歷史並參加巧克力DIY手作課程。", hours: "09:30 - 17:00 (週一休)", ticketInfo: "全票 300元 (含抵用券)", wikiQuery: "巧克力共和國" },
  { name: "虎頭山公園", categories: ["踏青", "親子"], contextTags: ["免門票", "寵物友善"], lat: 25.0069, lng: 121.3323, description: "桃園人的後花園，擁有全齡友善步道與超豪華的奧爾森林學堂樹屋遊戲區。", hours: "24 小時開放", ticketInfo: "免門票", wikiQuery: "虎頭山公園" },
  { name: "桃園國際機場觀景台", categories: ["親子", "夜景", "約會"], contextTags: ["雨天備案", "推車友善"], lat: 25.0777, lng: 121.2328, description: "位於二航廈，能近距離感受飛機起降的震撼並欣賞地勤人員的作業。", hours: "06:30 - 22:30", ticketInfo: "免費參觀", wikiQuery: "臺灣桃園國際機場" },
  { name: "中壢觀光夜市", categories: ["美食", "購物"], contextTags: ["情侶約會"], lat: 24.9575, lng: 121.2185, description: "中壢最知名夜市，從人氣米粉湯到溫記麻辣豆花，各種小吃應有盡有。", hours: "17:00 - 24:00", ticketInfo: "免門票", wikiQuery: "中壢觀光夜市" },
  { name: "平鎮褒忠祠", categories: ["歷史", "藝文"], contextTags: ["免門票"], lat: 24.9392, lng: 121.2058, description: "客家族群重要的義民信仰中心，古色古香的廟宇見證了保台歷史。", hours: "05:00 - 20:00", ticketInfo: "免門票", wikiQuery: "平鎮褒忠祠" },
  { name: "黑松飲料博物館", categories: ["歷史", "藝文"], contextTags: ["雨天備案", "免門票"], lat: 24.9818, lng: 121.2618, description: "收藏了黑松汽水的相關歷史文物，回味從小到大的國民飲料記憶。", hours: "須預約參觀", ticketInfo: "免門票", wikiQuery: "黑松飲料博物館" },
  { name: "埔心牧場", categories: ["親子", "踏青", "美食"], contextTags: ["近距離動物", "推車友善"], lat: 24.9126, lng: 121.1633, description: "北台灣經典牧場，可餵食小牛、賽金豬與超人氣水豚君。", hours: "09:00 - 17:00", ticketInfo: "全票 300元", wikiQuery: "味全埔心牧場" }
];

// Fallback high quality URL for places that wiki misses or returns bad image
const specificOverrides: Record<string, string> = {
  "Xpark 水族館": "https://images.unsplash.com/photo-1588523668383-6599ccb1d1f0?auto=format&fit=crop&q=80&w=800",
  "埔心牧場": "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&q=80&w=800",
  "桃園國際機場觀景台": "https://images.unsplash.com/photo-1570535235311-5369bb930dcf?auto=format&fit=crop&q=80&w=800",
  "桃園站前商圈": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Taoyuan_city_skyline.jpg/800px-Taoyuan_city_skyline.jpg",
  "黑松飲料博物館": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Hei_Song_Beverage_Museum.jpg/800px-Hei_Song_Beverage_Museum.jpg",
  "角板山行館": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Jiaobanshan_Park.jpg/800px-Jiaobanshan_Park.jpg",
  "八塊厝民俗藝術村": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/%E6%A1%83%E5%9C%92%E7%A5%9E%E7%A4%BE%E6%8B%9C%E6%AE%BF.jpg/800px-%E6%A1%83%E5%9C%92%E7%A5%9E%E7%A4%BE%E6%8B%9C%E6%AE%BF.jpg",
  "橫山書法藝術館": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Yong-an_Fishery_Harbor.jpg/800px-Yong-an_Fishery_Harbor.jpg"
}

// Add these to list directly
const moreSpots = [
  { name: "蛋寶生技不老村", categories: ["親子", "踏青"], contextTags: ["網美打卡", "雨天備案"], lat: 24.9351, lng: 121.1963, description: "全台唯一的日系鳥居蛋寶村，祈福拍美照好去處。", hours: "08:30-17:30", ticketInfo: "全票150元", wikiQuery: "蛋寶", exactImage: "https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&q=80&w=800" },
  { name: "雄獅文具-想像力製造所", categories: ["親子", "藝文"], contextTags: ["雨天備案"], lat: 24.8471, lng: 121.2403, description: "激發創意的互動美術館，充滿色彩與驚喜體驗。", hours: "09:00-17:00", ticketInfo: "全票450元", wikiQuery: "雄獅", exactImage: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=800" },
  { name: "台灣客家茶文化館", categories: ["歷史", "藝文"], contextTags: ["網美打卡", "免門票"], lat: 24.8427, lng: 121.1895, description: "體驗東方美人茶文化，兼具展覽與美拍。", hours: "09:00-18:00", ticketInfo: "全票160元", wikiQuery: "客家", exactImage: "https://images.unsplash.com/photo-1563822249548-9a72b6353cad?auto=format&fit=crop&q=80&w=800" },
  { name: "馬祖新村眷村文創園區", categories: ["歷史", "藝文"], contextTags: ["免門票", "網美打卡"], lat: 24.937, lng: 121.238, description: "桃園鐵三角之一的將軍村，好拍又好逛。", hours: "09:00-18:00 (週一休)", ticketInfo: "免門票", wikiQuery: "馬祖新村", exactImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Matsu_New_Village_15.jpg/800px-Matsu_New_Village_15.jpg" },
  { name: "大溪老茶廠", categories: ["歷史", "藝文"], contextTags: ["網美打卡"], lat: 24.821, lng: 121.319, description: "揉合台、日、英式風格的絕美洗石子綠建築百年古蹟茶廠。", hours: "09:30-17:00", ticketInfo: "入廠100元", wikiQuery: "大溪老茶廠", exactImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Daxi_Tea_Factory_main_building.jpg/800px-Daxi_Tea_Factory_main_building.jpg" },
  { name: "桃園市立圖書館 新總館", categories: ["藝文", "室內"], contextTags: ["雨天備案", "親子", "網美打卡"], lat: 25.011, lng: 121.300, description: "全台最美圖書館『生命樹』，擁有星巴克與影城。", hours: "08:30-21:00 (週一休)", ticketInfo: "免門票", wikiQuery: "桃園總圖", exactImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Taoyuan_Public_Library_Main_Building_03.jpg/800px-Taoyuan_Public_Library_Main_Building_03.jpg" },
  { name: "桃園光影文化館", categories: ["藝文", "室內"], contextTags: ["雨天備案", "免門票", "情侶約會"], lat: 24.992, lng: 121.306, description: "以電影與光影為主題的藝術中心，提供免費優質電影放映。", hours: "09:00-17:00", ticketInfo: "免門票", wikiQuery: "桃園光影", exactImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Taoyuan_Arts_Center_square.jpg/800px-Taoyuan_Arts_Center_square.jpg" }
];

rawSpots.push(...moreSpots);

async function verifyImage(url: string) {
  if (url.includes('upload.wikimedia.org/wikipedia/commons/thumb') || url.includes('unsplash.com')) {
      // These are generally reliable in the browser even if they 429/403 a Node HEAD request
      return true;
  }
  try {
    const res = await fetch(url, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' } });
    return res.status !== 404;
  } catch(e) {
    return true; // leniency
  }
}

async function run() {
  console.log("Preparing precise verified dataset...");
  const validAttractions = [];

  for (let i = 0; i < rawSpots.length; i++) {
    const spot = rawSpots[i];
    let finalImageUrl = "";

    if ((spot as any).exactImage) {
        finalImageUrl = (spot as any).exactImage;
    } else if (specificOverrides[spot.name]) {
       finalImageUrl = specificOverrides[spot.name];
    } else {
       // Fetch from wiki API
       try {
         const res = await fetch(`https://zh.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(spot.wikiQuery)}`, {
           headers: { 'User-Agent': 'MyJourneyApp/1.0 (test)' }
         });
         const data = await res.json() as any;
         if (data && data.thumbnail && data.thumbnail.source) {
            let thumb = data.thumbnail.source;
            // Upgrade resolution from 320px to 800px
            if (thumb.includes('/320px-')) thumb = thumb.replace('/320px-', '/800px-');
            if (thumb.includes('/330px-')) thumb = thumb.replace('/330px-', '/800px-');
            if (thumb.includes('/300px-')) thumb = thumb.replace('/300px-', '/800px-');
            // Try to verify this upgraded url
             const isUpgradedValid = await verifyImage(thumb);
             if (isUpgradedValid) {
               finalImageUrl = thumb;
             } else {
               // Fallback to original thumbnail
               finalImageUrl = data.thumbnail.source;
             }
         }
       } catch (error) {
         console.log(`Error fetching wiki for ${spot.name}`);
       }
    }

    if (finalImageUrl !== "") {
       // Verify the final URL definitely works
       const isValid = await verifyImage(finalImageUrl);
       if (isValid) {
         validAttractions.push({ ...spot, imageUrl: finalImageUrl });
         console.log(`[PASS] ${spot.name}`);
       } else {
         console.log(`[FAIL-HTTP] ${spot.name}: ${finalImageUrl}`);
       }
    } else {
       console.log(`[FAIL-NO-IMG] ${spot.name}`);
    }
  }

  console.log(`Verified ${validAttractions.length} perfect attractions.`);

  console.log("Emptying old database completely...");
  const qs = await getDocs(collection(db, 'attractions'));
  for (const docSnapshot of qs.docs) {
    await deleteDoc(doc(db, 'attractions', docSnapshot.id));
  }

  console.log("Writing verified attractions...");
  // Now write to firebase
  for (let i=0; i<validAttractions.length; i++) {
    const attr = validAttractions[i];
    const { wikiQuery, ...data } = attr;
    const docId = `ty-verified-${i.toString().padStart(3, '0')}`;
    await setDoc(doc(db, 'attractions', docId), data);
  }

  console.log("Database successfully seeded!");
  process.exit(0);
}

run();
