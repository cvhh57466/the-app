import fetch from 'node-fetch';

async function testTycg() {
  const url = 'https://travel.tycg.gov.tw/open-api/zh-tw/Travel/Attraction?page=1';
  try {
     const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
     const data = await res.json() as any;
     console.log('page 1 spots:', data.Infos?.Info?.length);
     if (data.Infos?.Info?.length > 0) {
        console.log('first image struct', JSON.stringify(data.Infos.Info[0].Images, null, 2));
     }
  } catch(e) {
     console.log('Error', e);
  }
}
testTycg();
