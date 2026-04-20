import fetch from 'node-fetch';

const urls = [
  "https://upload.wikimedia.org/wikipedia/commons/0/0b/%E5%A4%A7%E6%BA%AA_%E5%92%8C%E5%B9%B3%E8%B7%AF%E8%80%81%E8%A1%97_Daxi_Old_Street_-_panoramio.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/a/ae/Gloria_Outlets_20230402.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/e/ea/Shimen_Reservoir_20201121_04.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/f/ff/Yongan_Fishing_Port_2022.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/c/c2/Taoyuan_Shinto_Shrine.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/3/3b/Lalashan_Nature_Protection_Zone.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/d/d4/Baishajia_Lighthouse.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/9/92/Bade_Pond_Ecology_Park.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/%E7%AB%B9%E5%9C%8D%E6%BC%81%E6%B8%AF%E5%A4%A7%E9%96%80_-_panoramio.jpg/1200px-%E7%AB%B9%E5%9C%8D%E6%BC%81%E6%B8%AF%E5%A4%A7%E9%96%80_-_panoramio.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/1/1a/Xiao_Wulai_Skywalk_in_Taoyuan_2.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/2/27/Jiaobanshan_Park.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/0/0a/Cihu_Mausoleum_2010.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/1/1b/Longtan_Lake_in_Taoyuan.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Taiwan_Baseball_Hall_of_Fame_in_Fame_Hall_Garden_Hotel_20210214.jpg/800px-Taiwan_Baseball_Hall_of_Fame_in_Fame_Hall_Garden_Hotel_20210214.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/8/87/Taoyuan_International_Airport_Terminal_1_Departure_Hall.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/%E5%9F%94%E5%BF%83%E7%89%A7%E5%A0%B4_Pushin_Ranch_-_panoramio.jpg/1200px-%E5%9F%94%E5%BF%83%E7%89%A7%E5%A0%B4_Pushin_Ranch_-_panoramio.jpg"
];

async function check() {
  for (const u of urls) {
     try {
       const res = await fetch(u, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' } });
       console.log(res.status, u.substring(0, 50));
     } catch (e) {
       console.log("FAIL", u.substring(0, 50));
     }
  }
}
check();
