import fetch from 'node-fetch';

const places = [
  "大溪老街", "石門水庫", "永安漁港", "竹圍漁港", "角板山", "慈湖陵寢", "龍潭大池", "小烏來天空步道", 
  "拉拉山", "白沙岬燈塔", "八德埤塘自然生態公園", "華泰名品城", "Xpark", "埔心牧場", "桃園客家文化館",
  "桃園忠烈祠", "虎頭山公園", "桃園大廟", "大平紅橋", "三坑老街", "李騰芳古宅"
];

async function check() {
  for (const p of places) {
    const res = await fetch(`https://zh.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(p)}`);
    if (res.status === 200) {
      const data = await res.json() as any;
      if (data.thumbnail && data.thumbnail.source) {
        console.log(p, data.thumbnail.source);
      } else {
        console.log(p, "NO THUMBNAIL");
      }
    } else {
      console.log(p, "NOT FOUND", res.status);
    }
    await new Promise(r => setTimeout(r, 200));
  }
}

check();
