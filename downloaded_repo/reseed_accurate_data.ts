import { db } from './src/firebase';
import { collection, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore';

const exactSpots = [
  {
    id: "ty-exact-01",
    name: "大溪老街",
    categories: ["歷史", "美食"],
    contextTags: ["免門票", "網美打卡", "推車友善"],
    lat: 24.8847, lng: 121.2872,
    description: "桃園最有名的老街，充滿巴洛克風情建築，可以品嚐大溪豆干、拿破崙派等地道美食。週末經常有街頭藝人表演，非常適合全家大小一起走走。",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/0/0b/%E5%A4%A7%E6%BA%AA_%E5%92%8C%E5%B9%B3%E8%B7%AF%E8%80%81%E8%A1%97_Daxi_Old_Street_-_panoramio.jpg",
    hours: "24 小時開放 (店家多於 10:00-18:00 營業)",
    ticketInfo: "免門票"
  },
  {
    id: "ty-exact-02",
    name: "華泰名品城 GLORIA OUTLETS",
    categories: ["購物", "美食", "親子"],
    contextTags: ["推車友善", "情侶約會", "雨天備案"],
    lat: 25.0153, lng: 121.2132,
    description: "全台首座美式露天 Outlets，緊鄰高鐵桃園站與機捷A18站。各品牌常有驚喜折扣，園區內也有多樣化的餐飲選擇。",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/ae/Gloria_Outlets_20230402.jpg",
    hours: "平日 11:00-21:00 / 假日 11:00-22:00",
    ticketInfo: "免門票，依消費計費"
  },
  {
     id: "ty-exact-03",
     name: "石門水庫",
     categories: ["踏青", "親子"],
     contextTags: ["推車友善", "寵物友善"],
     lat: 24.8140, lng: 121.2461,
     description: "台灣北部的重要水庫，一年四季風景各異。秋天賞楓、春天賞櫻，著名的石門活魚多吃也是來到這裡必嚐的美味。",
     imageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/ea/Shimen_Reservoir_20201121_04.jpg",
     hours: "08:00 - 18:00",
     ticketInfo: "大型車300元、小型車80元、機車30元，依現場公告為主"
  },
  {
     id: "ty-exact-04",
     name: "永安漁港",
     categories: ["美食", "夜景", "踏青"],
     contextTags: ["情侶約會", "免門票", "網美打卡"],
     lat: 24.9575, lng: 121.0189,
     description: "位於新屋區的觀光漁港，不僅有新鮮便宜的海鮮可大啖，還能到觀海橋上看夕陽。一旁還有全新完工的『海螺文化體驗園區』可以拍照打卡。",
     imageUrl: "https://upload.wikimedia.org/wikipedia/commons/f/ff/Yongan_Fishing_Port_2022.jpg",
     hours: "生鮮館與熟食館約 08:00-20:00，依各攤位為主",
     ticketInfo: "免門票"
  },
  {
     id: "ty-exact-05",
     name: "桃園忠烈祠暨神社文化園區",
     categories: ["歷史", "藝文"],
     contextTags: ["網美打卡", "情侶約會", "免門票"],
     lat: 25.0069, lng: 121.3283,
     description: "台灣保存最完整的日式神社建築！全區檜木打造，風景清幽，環境讓人有種一秒飛到日本的錯覺，是熱門的網美拍照景點。",
     imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c2/Taoyuan_Shinto_Shrine.jpg",
     hours: "09:00 - 17:00 (週一休園)",
     ticketInfo: "免費參觀"
  },
  {
     id: "ty-exact-06",
     name: "拉拉山巨木區",
     categories: ["踏青", "歷史"],
     contextTags: ["寵物友善", "避暑聖地"],
     lat: 24.7171, lng: 121.4326,
     description: "北台灣氧氣最多的地方！園區內有十幾棵千百年紅檜巨木，步道平緩好走，適合全家來享受被神木與芬多精包圍的療癒感。",
     imageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/3b/Lalashan_Nature_Protection_Zone.jpg",
     hours: "06:00 - 17:00",
     ticketInfo: "全票200元、半票100元"
  },
  {
     id: "ty-exact-07",
     name: "白沙岬燈塔",
     categories: ["歷史", "夜景", "踏青"],
     contextTags: ["免門票", "網美打卡", "推車友善"],
     lat: 25.0416, lng: 121.0772,
     description: "位於觀音區，是一座擁有百年歷史的白色燈塔。塔身潔白且高聳，周邊綠樹成蔭，還設有環形步道，非常適合散步拍美照。",
     imageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d4/Baishajia_Lighthouse.jpg",
     hours: "夏令: 09:00-18:00 / 冬令: 09:00-17:00 (週一公休)",
     ticketInfo: "免費參觀"
  },
  {
     id: "ty-exact-08",
     name: "八德埤塘自然生態公園",
     categories: ["踏青", "親子"],
     contextTags: ["寵物友善", "推車友善", "免門票"],
     lat: 24.9450, lng: 121.3069,
     description: "保留了桃園埤塘文化的生態公園。園內有大片綠地與水鳥棲息的池塘，經常看到小鴨子在水面滑行，是非常適合親子野餐與遛狗放電的好去處。",
     imageUrl: "https://upload.wikimedia.org/wikipedia/commons/9/92/Bade_Pond_Ecology_Park.jpg",
     hours: "24 小時開放",
     ticketInfo: "免門票"
  },
  {
     id: "ty-exact-09",
     name: "竹圍漁港",
     categories: ["美食", "夜景", "踏青"],
     contextTags: ["免門票", "推車友善"],
     lat: 25.1147, lng: 121.2464,
     description: "北台灣知名觀光漁港。一樓販售新鮮特級漁獲，二樓則是代客料理與海鮮餐廳，是喜愛海鮮、生魚片的老饕們假日必訪之處。",
     imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/%E7%AB%B9%E5%9C%8D%E6%BC%81%E6%B8%AF%E5%A4%A7%E9%96%80_-_panoramio.jpg/1200px-%E7%AB%B9%E5%9C%8D%E6%BC%81%E6%B8%AF%E5%A4%A7%E9%96%80_-_panoramio.jpg",
     hours: "約 08:00 - 20:00 (依各攤商為主)",
     ticketInfo: "免門票"
  },
  {
     id: "ty-exact-10",
     name: "小烏來天空步道",
     categories: ["踏青", "親子"],
     contextTags: ["網美打卡", "情侶約會"],
     lat: 24.7936, lng: 121.3752,
     description: "突出於溪谷與瀑布上方的透明玻璃步道！站在上面可以感受飛瀑在腳底奔流的震撼度，考驗你的膽量。",
     imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/1a/Xiao_Wulai_Skywalk_in_Taoyuan_2.jpg",
     hours: "08:00 - 17:00 (週二休園)",
     ticketInfo: "全票50元、優待票30元"
  },
  {
     id: "ty-exact-11",
     name: "角板山行館",
     categories: ["歷史", "踏青"],
     contextTags: ["寵物友善", "推車友善"],
     lat: 24.8184, lng: 121.3503,
     description: "前總統蔣公的行館之一，園區內種植了極多梅樹，冬天賞梅必來。戰備隧道與豐富的自然生態也是一大亮點。",
     imageUrl: "https://upload.wikimedia.org/wikipedia/commons/2/27/Jiaobanshan_Park.jpg",
     hours: "08:00 - 17:00",
     ticketInfo: "免費參觀"
  },
  {
     id: "ty-exact-12",
     name: "慈湖陵寢",
     categories: ["歷史", "踏青"],
     contextTags: ["免門票", "推車友善"],
     lat: 24.8415, lng: 121.2829,
     description: "著名的兩蔣文化園區，分為前慈湖與後慈湖，除了具有歷史意義外，風景十分秀麗。這裡也匯集了全台各地移置過來的蔣公銅像公園。",
     imageUrl: "https://upload.wikimedia.org/wikipedia/commons/0/0a/Cihu_Mausoleum_2010.jpg",
     hours: "08:00 - 17:00",
     ticketInfo: "前慈湖/紀念公園免費，後慈湖需提前網路申請並購票"
  },
  {
     id: "ty-exact-13",
     name: "龍潭大池",
     categories: ["踏青", "夜景", "親子"],
     contextTags: ["免門票", "推車友善", "情侶約會"],
     lat: 24.8622, lng: 121.2132,
     description: "龍潭的知名地標湖泊！湖中有一座宏偉的南天宮，橫跨湖面的超美吊橋更是夜晚點燈後的絕美亮點，周邊有兒童共融遊戲場與腳踏車道。",
     imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/1b/Longtan_Lake_in_Taoyuan.jpg",
     hours: "24 小時開放",
     ticketInfo: "免門票，天鵝船等水上設施需額外付費"
  },
  {
     id: "ty-exact-14",
     name: "棒球名人堂",
     categories: ["親子", "歷史", "藝文"],
     contextTags: ["雨天備案", "網美打卡", "推車友善"],
     lat: 24.8398, lng: 121.1925,
     description: "世界最大的球形建築！內部結合了台灣棒球發展史與史努比主題展示。豐富的互動體驗場館讓沒有看棒球的人也能覺得非常生動有趣。",
     imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Taiwan_Baseball_Hall_of_Fame_in_Fame_Hall_Garden_Hotel_20210214.jpg/800px-Taiwan_Baseball_Hall_of_Fame_in_Fame_Hall_Garden_Hotel_20210214.jpg",
     hours: "09:00 - 21:00",
     ticketInfo: "免門票，小客車停車費200元、機車100元"
  },
  {
     id: "ty-exact-15",
     name: "桃園國際機場 (戶外觀景台)",
     categories: ["親子", "夜景", "約會"],
     contextTags: ["雨天備案", "推車友善", "情侶約會"],
     lat: 25.0777, lng: 121.2328,
     description: "沒有要出國也能來機場看壯觀的飛機！位於第二航廈的戶外觀景台可以超近距離無死角觀看各國龐大客機起降，震撼力十足，一旁還有熱門大王果肉商場與美食區。",
     imageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/87/Taoyuan_International_Airport_Terminal_1_Departure_Hall.jpg",
     hours: "06:30 - 22:30",
     ticketInfo: "免費參觀"
  },
  {
     id: "ty-exact-16",
     name: "埔心牧場",
     categories: ["親子", "踏青", "美食"],
     contextTags: ["推車友善", "近距離動物"],
     lat: 24.9126, lng: 121.1633,
     description: "北台灣經典動物農莊！可以親自體驗擠牛奶、餵食梅花鹿與超萌的水豚君，園區內有許多大草皮，適合親子家庭野餐與搭帳篷。",
     imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/%E5%9F%94%E5%BF%83%E7%89%A7%E5%A0%B4_Pushin_Ranch_-_panoramio.jpg/1200px-%E5%9F%94%E5%BF%83%E7%89%A7%E5%A0%B4_Pushin_Ranch_-_panoramio.jpg",
     hours: "09:00 - 17:00",
     ticketInfo: "全票300元、學生/優待票250元"
  }
];

async function reseed() {
  console.log("Wiping old mismatched data...");
  const qs = await getDocs(collection(db, 'attractions'));
  let deletedCount = 0;
  for (const docSnapshot of qs.docs) {
    await deleteDoc(doc(db, 'attractions', docSnapshot.id));
    deletedCount++;
  }
  console.log(`Deleted ${deletedCount} fake/mismatched spots.`);

  console.log("Inserting pristine matched data...");
  let insertedCount = 0;
  for (const item of exactSpots) {
    const { id, ...data } = item;
    await setDoc(doc(db, 'attractions', id), data);
    insertedCount++;
  }
  console.log(`Inserted ${insertedCount} perfect spots.`);
  process.exit(0);
}

reseed();
