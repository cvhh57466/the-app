import fetch from 'node-fetch';

async function testTdx() {
  try {
    const res = await fetch('https://tdx.transportdata.tw/api/basic/v2/Tourism/ScenicSpot/Taoyuan?$format=JSON');
    if (!res.ok) {
       console.log("TDX API failed:", res.status, res.statusText);
       return;
    }
    const data = await res.json() as any[];
    console.log(`Found ${data.length} spots in Taoyuan via TDX.`);
    
    // Count how many have images
    const withImages = data.filter(d => d.Picture && d.Picture.PictureUrl1);
    console.log(`Spots with images: ${withImages.length}`);
    
    if (withImages.length > 0) {
       console.log("Sample:", withImages[0].ScenicSpotName, withImages[0].Picture.PictureUrl1);
    }
  } catch (e: any) {
    console.log("Error:", e.message);
  }
}

testTdx();
